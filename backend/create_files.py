import os

base_dir = r"C:\Users\abdul\OneDrive\Ishchi stol\messenger\backend"

files = {
    "requirements.txt": """Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
channels==4.0.0
daphne==4.0.0
djangochannels-redis==4.2.0
redis==5.0.1
psycopg2-binary==2.9.9
djangorestframework-simplejwt==5.3.1
Pillow==10.1.0
python-decouple==3.8
channels[daphne]==4.0.0
""",
    ".env.example": """SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=messenger_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
""",
    "manage.py": """#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
""",
    "config/__init__.py": "",
    "config/asgi.py": """import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

import apps.chats.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                apps.chats.routing.websocket_urlpatterns
            )
        )
    ),
})
""",
    "config/wsgi.py": """import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
""",
    "config/urls.py": """from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/chats/', include('apps.chats.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
""",
    "config/settings.py": """import os
from pathlib import Path
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-secret')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    
    'apps.accounts',
    'apps.chats',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='messenger_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'accounts.User'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
""",
    "apps/__init__.py": "",
    "apps/accounts/__init__.py": "",
    "apps/accounts/apps.py": """from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
""",
    "apps/accounts/models.py": """from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username
""",
    "apps/accounts/admin.py": """from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

admin.site.register(User, UserAdmin)
""",
    "apps/accounts/serializers.py": """from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'bio', 'is_online', 'last_seen', 'phone')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
""",
    "apps/accounts/views.py": """from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from django.db.models import Q

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        if q:
            return User.objects.filter(Q(username__icontains=q) | Q(email__icontains=q)).exclude(id=self.request.user.id)
        return User.objects.none()

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
""",
    "apps/accounts/urls.py": """from django.urls import path
from .views import RegisterView, LoginView, MeView, UserSearchView, ProfileUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/', ProfileUpdateView.as_view(), name='profile'),
    path('../users/search/', UserSearchView.as_view(), name='user-search'),
]
""",
    "apps/chats/__init__.py": "",
    "apps/chats/apps.py": """from django.apps import AppConfig

class ChatsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.chats'
""",
    "apps/chats/models.py": """from django.db import models
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
""",
    "apps/chats/admin.py": """from django.contrib import admin
from .models import Chat, ChatMember, Message

admin.site.register(Chat)
admin.site.register(ChatMember)
admin.site.register(Message)
""",
    "apps/chats/serializers.py": """from rest_framework import serializers
from .models import Chat, ChatMember, Message
from apps.accounts.serializers import UserSerializer

class ChatMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChatMember
        fields = ('user', 'joined_at', 'is_admin')

class ChatSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    class Meta:
        model = Chat
        fields = ('id', 'chat_type', 'name', 'members', 'created_at', 'created_by')

    def get_members(self, obj):
        memberships = ChatMember.objects.filter(chat=obj)
        return ChatMemberSerializer(memberships, many=True).data

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'is_read', 'read_at', 'created_at', 'edited_at')
""",
    "apps/chats/views.py": """from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Chat, ChatMember, Message
from .serializers import ChatSerializer, MessageSerializer
from django.utils import timezone
from apps.accounts.models import User
from django.shortcuts import get_object_or_404

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Chat.objects.filter(members=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        chat_type = request.data.get('chat_type', 'private')
        name = request.data.get('name', '')
        members_ids = request.data.get('members', [])
        
        chat = Chat.objects.create(chat_type=chat_type, name=name, created_by=request.user)
        ChatMember.objects.create(chat=chat, user=request.user, is_admin=True)
        
        for user_id in members_ids:
            try:
                u = User.objects.get(id=user_id)
                ChatMember.objects.create(chat=chat, user=u)
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
        serializer.save(sender=self.request.user, chat=chat)

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_url_kwarg = 'msg_id'

    def get_queryset(self):
        chat_id = self.kwargs['id']
        return Message.objects.filter(chat_id=chat_id, sender=self.request.user)

class MarkReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, id):
        chat = get_object_or_404(Chat, id=id, members=request.user)
        Message.objects.filter(chat=chat).exclude(sender=request.user).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({'status': 'ok'})
""",
    "apps/chats/urls.py": """from django.urls import path
from .views import ChatListCreateView, ChatDetailView, MessageListCreateView, MessageDetailView, MarkReadView

urlpatterns = [
    path('', ChatListCreateView.as_view(), name='chat-list-create'),
    path('<int:id>/', ChatDetailView.as_view(), name='chat-detail'),
    path('<int:id>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('<int:id>/messages/<int:msg_id>/', MessageDetailView.as_view(), name='message-detail'),
    path('<int:id>/read/', MarkReadView.as_view(), name='mark-read'),
]
""",
    "apps/chats/routing.py": """from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<int:chat_id>/', consumers.ChatConsumer.as_asgi()),
]
""",
    "apps/chats/consumers.py": """import json
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
                    await self.send_json({"status": "authenticated"})
                else:
                    await self.close()
            else:
                await self.close()
            return
            
        if not hasattr(self, 'user') or not self.user.is_authenticated:
            return

        msg_type = content.get('type', 'message')

        if msg_type == 'message':
            text = content.get('content', '')
            msg = await self.save_message(text)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': msg.id,
                        'content': msg.content,
                        'sender_id': self.user.id,
                        'sender_username': self.user.username,
                        'created_at': str(msg.created_at)
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
            await self.mark_message_read(msg_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': msg_id,
                    'user_id': self.user.id
                }
            )

    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'data': event['message']
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
            'message_id': event['message_id'],
            'user_id': event['user_id']
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
    def set_user_online(self):
        self.user.is_online = True
        self.user.save()
        
    @database_sync_to_async
    def set_user_offline(self):
        self.user.is_online = False
        self.user.save()
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("All files created successfully.")
