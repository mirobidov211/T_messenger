import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.accounts.models import User
from apps.chats.models import Chat, ChatMember, Message
from rest_framework_simplejwt.tokens import AccessToken

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'
        await self.accept()

        # Check for token in WebSocket URL query string (e.g. ?token=...)
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        token = None
        if query_string:
            pairs = query_string.split('&')
            for pair in pairs:
                if '=' in pair:
                    k, v = pair.split('=', 1)
                    if k == 'token':
                        token = v
                        break

        if token:
            user = await self.get_user_from_token(token)
            if user:
                self.user = user
                is_member = await self.is_chat_member()
                if is_member:
                    await self.channel_layer.group_add(
                        self.room_group_name,
                        self.channel_name
                    )
                    await self.set_user_online()
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'online_status',
                            'user_id': self.user.id,
                            'status': True
                        }
                    )
                    await self.send_json({"type": "authenticated", "status": "ok"})
                else:
                    await self.close()
            else:
                await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            if hasattr(self, 'user') and self.user.is_authenticated:
                await self.set_user_offline()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'online_status',
                        'user_id': self.user.id,
                        'status': False
                    }
                )

    async def receive_json(self, content):
        if 'token' in content and not hasattr(self, 'user'):
            user = await self.get_user_from_token(content['token'])
            if user:
                self.user = user
                is_member = await self.is_chat_member()
                if is_member:
                    await self.channel_layer.group_add(
                        self.room_group_name,
                        self.channel_name
                    )
                    await self.set_user_online()
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'online_status',
                            'user_id': self.user.id,
                            'status': True
                        }
                    )
                    await self.send_json({"type": "authenticated", "status": "ok"})
                else:
                    await self.close()
            else:
                await self.close()
            return
            
        if not hasattr(self, 'user') or not self.user.is_authenticated:
            return

        msg_type = content.get('type', 'message')

        if msg_type in ['message', 'chat_message']:
            text = content.get('content') or content.get('message') or content.get('text', '')
            if text:
                msg = await self.save_message(text)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': msg.id,
                            'chat': int(self.chat_id),
                            'content': msg.content,
                            'text': msg.content,
                            'sender': {
                                'id': self.user.id,
                                'username': self.user.username,
                            },
                            'sender_id': self.user.id,
                            'sender_username': self.user.username,
                            'created_at': str(msg.created_at),
                            'is_read': False
                        }
                    }
                )
        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_status',
                    'user_id': self.user.id,
                    'is_typing': content.get('is_typing', True)
                }
            )
        elif msg_type == 'read':
            msg_id = content.get('message_id')
            if msg_id:
                await self.mark_message_read(msg_id)
            else:
                await self.mark_all_messages_read()

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'messages_read',
                    'chat_id': int(self.chat_id),
                    'message_id': msg_id,
                    'user_id': self.user.id,
                    'reader_id': self.user.id
                }
            )

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat_message',
            'data': event['message'],
            'message': event['message']
        })
        
    async def typing_status(self, event):
        await self.send_json({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        })
        
    async def online_status(self, event):
        await self.send_json({
            'type': 'online_status',
            'user_id': event['user_id'],
            'status': event['status']
        })

    async def message_read(self, event):
        await self.send_json({
            'type': 'read',
            'chat_id': int(self.chat_id),
            'message_id': event.get('message_id'),
            'user_id': event.get('user_id')
        })

    async def messages_read(self, event):
        await self.send_json({
            'type': 'messages_read',
            'chat_id': event.get('chat_id', int(self.chat_id)),
            'message_id': event.get('message_id'),
            'reader_id': event.get('reader_id') or event.get('user_id')
        })

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def is_chat_member(self):
        return ChatMember.objects.filter(chat_id=self.chat_id, user=self.user).exists()

    @database_sync_to_async
    def save_message(self, content):
        return Message.objects.create(
            chat_id=self.chat_id,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            msg = Message.objects.get(id=message_id, chat_id=self.chat_id)
            msg.is_read = True
            msg.save()
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def mark_all_messages_read(self):
        Message.objects.filter(chat_id=self.chat_id).exclude(sender=self.user).update(
            is_read=True
        )
            
    @database_sync_to_async
    def set_user_online(self):
        self.user.is_online = True
        self.user.save()
        
    @database_sync_to_async
    def set_user_offline(self):
        self.user.is_online = False
        self.user.save()
