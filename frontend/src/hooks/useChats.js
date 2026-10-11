import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { getChatsApi, getMessagesApi, createChatApi, sendMessageApi, markReadApi } from '../api/chats';
import { useState, useCallback } from 'react';

export const useChats = () => {
  const currentUser = useAuthStore((state) => state.user);
  const {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    messages,
    setMessages,
    addChat,
    addMessage,
    markIncomingAsRead,
    markOutgoingAsRead
  } = useChatStore();
  const [loading, setLoading] = useState(false);

  // Barcha chatlarni yuklab olish
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatsApi();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, [setChats]);

  // Chatdagi xabarlarni o'qilgan deb belgilash (Backend ga so'rov yuborish)
  const markAsRead = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      // Backend ga so'rov yuboriladi
      const res = await markReadApi(chatId);
      // Faqat kelgan xabarlarni o'qilgan deb belgilaymiz (o'zimizniki o'zgarmaydi)
      markIncomingAsRead(chatId, currentUser?.id);
      return res;
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
  }, [markIncomingAsRead, currentUser?.id]);

  // Chat xabarlarini yuklab olish
  const fetchMessages = useCallback(async (chatId) => {
    try {
      const data = await getMessagesApi(chatId);
      setMessages(chatId, data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [setMessages]);

  // Foydalanuvchi bilan yangi chat boshlash (yoki mavjudini ochish)
  const startChatWithUser = useCallback(async (targetUser) => {
    try {
      const chat = await createChatApi({
        members: [targetUser.id],
        chat_type: 'private'
      });
      // Yangi chat obyektini saqlash va faollashtirish
      addChat(chat);
      setActiveChat(chat);
      return chat;
    } catch (error) {
      console.error('Failed to start chat with user:', error);
      throw error;
    }
  }, [addChat, setActiveChat]);

  // Xabar yuborish (REST API orqali bazaga saqlash va realtime broadcast qilish)
  const sendMessage = useCallback(async (chatId, text) => {
    try {
      const msg = await sendMessageApi(chatId, text);
      addMessage(chatId, msg);
      return msg;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [addMessage]);

  return {
    chats,
    activeChat,
    setActiveChat,
    messages,
    fetchChats,
    fetchMessages,
    markAsRead,
    startChatWithUser,
    sendMessage,
    loading
  };
};