import useWebSocketLib from 'react-use-websocket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useEffect, useCallback } from 'react';

export const useWebSocket = (chatId) => {
  const token = useAuthStore((state) => state.accessToken);
  const addMessage = useChatStore((state) => state.addMessage);
  const markOutgoingAsRead = useChatStore((state) => state.markOutgoingAsRead);

  const { sendMessage, lastMessage, readyState } = useWebSocketLib(
    chatId && token ? `ws://localhost:8000/ws/chat/${chatId}/?token=${token}` : null,
    {
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        // Yangi xabar kelganda
        if (data.type === 'chat_message' || data.type === 'message') {
          const msgObj = data.message || data.data;
          if (msgObj) {
            addMessage(chatId, msgObj);
          }
        }

        // Xabarlar o'qilganda: FAQAT SUHBATDOSH o'qiganda bizning galichkalar 2 ta bo'ladi
        if (data.type === 'messages_read' || data.type === 'read') {
          const readerId = data.reader_id || data.user_id;
          const currentUserId = useAuthStore.getState().user?.id;
          if (readerId && currentUserId && readerId !== currentUserId) {
            markOutgoingAsRead(chatId);
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    }
  }, [lastMessage, chatId, addMessage, markOutgoingAsRead]);

  const sendChatMessage = useCallback((text) => {
    if (!text) return;
    sendMessage(JSON.stringify({ type: 'message', content: text, message: text }));
  }, [sendMessage]);

  const sendReadReceipt = useCallback((messageId = null) => {
    sendMessage(JSON.stringify({ type: 'read', message_id: messageId }));
  }, [sendMessage]);

  const sendTyping = useCallback((isTyping = true) => {
    sendMessage(JSON.stringify({ type: 'typing', is_typing: isTyping }));
  }, [sendMessage]);

  return { sendChatMessage, sendReadReceipt, sendTyping, readyState };
};