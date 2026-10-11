from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Chat, ChatMember, Message
from .serializers import ChatSerializer, MessageSerializer
from django.utils import timezone
from apps.accounts.models import User
from django.shortcuts import get_object_or_404

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Chat.objects.filter(members=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        chat_type = request.data.get('chat_type', 'private')
        name = request.data.get('name', '')
        members_ids = request.data.get('members', [])
        
        # Check if private chat already exists with target user
        if chat_type == 'private' and members_ids:
            target_user_id = members_ids[0]
            existing_chat = Chat.objects.filter(
                chat_type='private',
                members=request.user
            ).filter(
                members__id=target_user_id
            ).distinct().first()
            
            if existing_chat:
                serializer = self.get_serializer(existing_chat)
                return Response(serializer.data, status=status.HTTP_200_OK)

        chat = Chat.objects.create(chat_type=chat_type, name=name, created_by=request.user)
        ChatMember.objects.create(chat=chat, user=request.user, is_admin=True)
        
        for user_id in members_ids:
            try:
                u = User.objects.get(id=user_id)
                ChatMember.objects.get_or_create(chat=chat, user=u)
            except User.DoesNotExist:
                pass
                
        serializer = self.get_serializer(chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChatDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Chat.objects.filter(members=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        chat_id = self.kwargs['id']
        chat = get_object_or_404(Chat, id=chat_id, members=self.request.user)
        return Message.objects.filter(chat=chat).order_by('created_at')

    def perform_create(self, serializer):
        chat_id = self.kwargs['id']
        chat = get_object_or_404(Chat, id=chat_id, members=self.request.user)
        message = serializer.save(sender=self.request.user, chat=chat)

        # Broadcast newly created message to WebSocket subscribers
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{chat_id}',
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': message.id,
                            'chat': chat_id,
                            'content': message.content,
                            'text': message.content,
                            'sender': {
                                'id': self.request.user.id,
                                'username': self.request.user.username,
                            },
                            'sender_id': self.request.user.id,
                            'sender_username': self.request.user.username,
                            'created_at': str(message.created_at),
                            'is_read': False
                        }
                    }
                )
        except Exception as e:
            # Channel layer might be in-memory or redis
            pass

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_url_kwarg = 'msg_id'

    def get_queryset(self):
        chat_id = self.kwargs['id']
        return Message.objects.filter(chat_id=chat_id, sender=self.request.user)

    def perform_update(self, serializer):
        serializer.save(edited_at=timezone.now())


class MarkReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, id):
        chat = get_object_or_404(Chat, id=id, members=request.user)
        Message.objects.filter(chat=chat).exclude(sender=request.user).update(
            is_read=True, read_at=timezone.now()
        )

        # Xabarlar o'qilganligi haqida WebSocket orqali xabar berish
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{id}',
                    {
                        'type': 'messages_read',
                        'chat_id': id,
                        'reader_id': request.user.id
                    }
                )
        except Exception:
            pass

        return Response({'status': 'ok', 'chat_id': id})
