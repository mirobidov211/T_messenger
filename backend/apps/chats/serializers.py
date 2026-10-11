from rest_framework import serializers
from .models import Chat, ChatMember, Message
from apps.accounts.serializers import UserSerializer

class ChatMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChatMember
        fields = ('user', 'joined_at', 'is_admin')

class ChatSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = (
            'id', 'chat_type', 'name', 'avatar', 'is_online',
            'other_user', 'last_message', 'unread_count',
            'members', 'created_at', 'created_by'
        )

    def _get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            # Fallback if request is not available
            other_membership = ChatMember.objects.filter(chat=obj).exclude(user=obj.created_by).select_related('user').first()
            return other_membership.user if other_membership else None

        other_membership = ChatMember.objects.filter(chat=obj).exclude(user=request.user).select_related('user').first()
        return other_membership.user if other_membership else None

    def get_name(self, obj):
        if obj.chat_type == 'private':
            other = self._get_other_user(obj)
            if other:
                return other.username
        return obj.name or 'Chat'

    def get_avatar(self, obj):
        if obj.chat_type == 'private':
            other = self._get_other_user(obj)
            if other and other.avatar:
                return other.avatar.url
        return None

    def get_is_online(self, obj):
        if obj.chat_type == 'private':
            other = self._get_other_user(obj)
            if other:
                return other.is_online
        return False

    def get_other_user(self, obj):
        other = self._get_other_user(obj)
        if other:
            return UserSerializer(other).data
        return None

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'id': last.id,
                'content': last.content,
                'text': last.content,
                'created_at': last.created_at,
                'sender_id': last.sender_id,
                'sender_username': last.sender.username,
                'is_read': last.is_read
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_members(self, obj):
        memberships = ChatMember.objects.filter(chat=obj).select_related('user')
        return ChatMemberSerializer(memberships, many=True).data

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    text = serializers.CharField(source='content', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'is_read', 'read_at', 'created_at', 'edited_at')
