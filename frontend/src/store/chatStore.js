import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},

  setChats: (chats) => set({ chats }),

  setActiveChat: (chat) => set({ activeChat: chat }),

  // Joriy foydalanuvchi kelgan xabarlarni o'qiganda (faqat suhbatdoshning xabarlari o'qiladi, o'zimizning xabarlar galichkasi o'zgarmaydi)
  markIncomingAsRead: (chatId, currentUserId) => set((state) => {
    const idKey = String(chatId);
    const currentMsgs = state.messages[idKey] || [];

    const updatedMsgs = currentMsgs.map((m) => {
      const senderId = m.sender_id || m.sender?.id || m.senderId;
      const isOwn = currentUserId && senderId === currentUserId;
      // Agar o'zimizning xabarimiz bo'lsa, statusini tegmeymiz (suhbatdosh o'qigandagina 2 ta bo'ladi)
      if (isOwn) {
        return m;
      }
      return { ...m, is_read: true, isRead: true };
    });

    const updatedChats = state.chats.map((c) => {
      if (String(c.id) === idKey) {
        return {
          ...c,
          unread_count: 0,
          unreadCount: 0
        };
      }
      return c;
    });

    return {
      messages: {
        ...state.messages,
        [idKey]: updatedMsgs
      },
      chats: updatedChats
    };
  }),

  // Suhbatdosh bizning xabarlarimizni o'qiganda (faqat shu payt galichkalar 2 ta bo'ladi!)
  markOutgoingAsRead: (chatId) => set((state) => {
    const idKey = String(chatId);
    const currentMsgs = state.messages[idKey] || [];

    const updatedMsgs = currentMsgs.map((m) => ({
      ...m,
      is_read: true,
      isRead: true
    }));

    const updatedChats = state.chats.map((c) => {
      if (String(c.id) === idKey) {
        return {
          ...c,
          last_message: c.last_message
            ? { ...c.last_message, is_read: true, isRead: true }
            : c.last_message
        };
      }
      return c;
    });

    return {
      messages: {
        ...state.messages,
        [idKey]: updatedMsgs
      },
      chats: updatedChats
    };
  }),

  // Umumiy markChatAsRead (markIncomingAsRead ga yo'naltiriladi)
  markChatAsRead: (chatId, currentUserId) => {
    get().markIncomingAsRead(chatId, currentUserId);
  },

  // Yangi chat qo'shish yoki mavjud chatni ro'yxat tepasiga ko'tarish
  addChat: (chat) => set((state) => {
    if (!chat) return state;
    const exists = state.chats.find((c) => c.id === chat.id);
    const otherChats = state.chats.filter((c) => c.id !== chat.id);
    const updatedChat = exists ? { ...exists, ...chat } : chat;
    return {
      chats: [updatedChat, ...otherChats]
    };
  }),

  // Chatga yangi xabar qo'shish va ro'yxatda chatni birinchi o'ringa olib chiqish
  addMessage: (chatId, message) => set((state) => {
    const idKey = String(chatId);
    const chatMsgs = state.messages[idKey] || [];

    // Takroriy xabarlarning oldini olish
    if (chatMsgs.some((m) => m.id === message.id)) {
      return state;
    }

    const updatedMsgs = [...chatMsgs, message];

    // Chat ro'yxatida oxirgi xabarni yangilash va chatni tepaga chiqarish
    const targetChat = state.chats.find((c) => String(c.id) === idKey);
    const otherChats = state.chats.filter((c) => String(c.id) !== idKey);

    let updatedChats = state.chats;
    if (targetChat) {
      const refreshedChat = {
        ...targetChat,
        last_message: {
          id: message.id,
          content: message.content || message.text,
          text: message.content || message.text,
          created_at: message.created_at || message.createdAt,
          sender_id: message.sender_id || message.sender?.id,
          sender_username: message.sender_username || message.sender?.username
        }
      };
      updatedChats = [refreshedChat, ...otherChats];
    }

    return {
      messages: {
        ...state.messages,
        [idKey]: updatedMsgs
      },
      chats: updatedChats
    };
  }),

  setMessages: (chatId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [String(chatId)]: messages
    }
  })),

  updateMessage: (chatId, messageId, updates) => set((state) => {
    const idKey = String(chatId);
    const chatMsgs = state.messages[idKey] || [];
    return {
      messages: {
        ...state.messages,
        [idKey]: chatMsgs.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      }
    };
  }),

  // Xabarni o'chirish
  removeMessage: (chatId, messageId) => set((state) => {
    const idKey = String(chatId);
    const chatMsgs = state.messages[idKey] || [];
    return {
      messages: {
        ...state.messages,
        [idKey]: chatMsgs.filter((m) => m.id !== messageId)
      }
    };
  })
}));