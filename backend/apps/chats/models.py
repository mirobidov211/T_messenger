from django.db import models
from apps.accounts.models import User

class Chat(models.Model):
    CHAT_TYPES = [('private', 'Private'), ('group', 'Group')]
    chat_type = models.CharField(max_length=10, choices=CHAT_TYPES, default='private')
    name = models.CharField(max_length=255, blank=True)
    members = models.ManyToManyField(User, through='ChatMember')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_chats', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.chat_type} - {self.id}"

class ChatMember(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)

class Message(models.Model):
    MESSAGE_TYPES = [('text', 'Text'), ('image', 'Image'), ('file', 'File')]
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    file = models.FileField(upload_to='messages/', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Msg {self.id} in Chat {self.chat_id}"
