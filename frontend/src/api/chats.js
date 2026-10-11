import api from './axios';

// Foydalanuvchining barcha chatlarini olish
export const getChatsApi = async () => {
  const { data } = await api.get('/chats/');
  return data;
};

// Chatdagi barcha xabarlarni olish
export const getMessagesApi = async (chatId) => {
  const { data } = await api.get(`/chats/${chatId}/messages/`);
  return data;
};

// Yangi chat yaratish (yoki mavjud private chatni olish)
export const createChatApi = async ({ members, chat_type = 'private', name = '' }) => {
  const { data } = await api.post('/chats/', { members, chat_type, name });
  return data;
};

// Chatga yangi xabar yuborish
export const sendMessageApi = async (chatId, content) => {
  const { data } = await api.post(`/chats/${chatId}/messages/`, { content });
  return data;
};

// Username bo'yicha foydalanuvchilarni qidirish
export const searchUsersApi = async (query) => {
  const { data } = await api.get(`/users/search/?q=${encodeURIComponent(query)}`);
  return data;
};

// Chatdagi xabarlarni o'qilgan deb belgilash
export const markReadApi = async (chatId) => {
  const { data } = await api.post(`/chats/${chatId}/read/`);
  return data;
};

// Xabarni o'chirish
export const deleteMessageApi = async (chatId, msgId) => {
  await api.delete(`/chats/${chatId}/messages/${msgId}/`);
};

// Xabarni tahrirlash
export const editMessageApi = async (chatId, msgId, content) => {
  const { data } = await api.patch(`/chats/${chatId}/messages/${msgId}/`, { content });
  return data;
};