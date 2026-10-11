from django.urls import path
from .views import ChatListCreateView, ChatDetailView, MessageListCreateView, MessageDetailView, MarkReadView

urlpatterns = [
    path('', ChatListCreateView.as_view(), name='chat-list-create'),
    path('<int:id>/', ChatDetailView.as_view(), name='chat-detail'),
    path('<int:id>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('<int:id>/messages/<int:msg_id>/', MessageDetailView.as_view(), name='message-detail'),
    path('<int:id>/read/', MarkReadView.as_view(), name='mark-read'),
]
