import { useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import TelegramDrawer from '../components/layout/TelegramDrawer';
import BottomNavBar from '../components/layout/BottomNavBar';
import { useChats } from '../hooks/useChats';
import { useUiStore } from '../store/uiStore';
import { searchUsersApi } from '../api/chats';

const ChatPage = () => {
  const { chats, activeChat, setActiveChat, startChatWithUser } = useChats();
  const { setSidebarOpen, isDrawerOpen, setIsDrawerOpen } = useUiStore();

  // Linkdagi #username o'zgarganda yoki sahifa yuklanganda tegishli chatni ochish
  useEffect(() => {
    const syncFromHash = async () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const targetUsername = decodeURIComponent(hash.slice(1)).trim();
        if (!targetUsername) return;

        // 1. Avval mavjud yuklangan chatlardan qidiramiz
        const foundChat = chats.find(
          (c) =>
            c.name?.toLowerCase() === targetUsername.toLowerCase() ||
            c.other_user?.username?.toLowerCase() === targetUsername.toLowerCase()
        );

        if (foundChat) {
          if (!activeChat || activeChat.id !== foundChat.id) {
            setActiveChat(foundChat);
            setSidebarOpen(false);
          }
        } else if (chats.length > 0) {
          // 2. Agar mavjud chatlarda topilmasa, backenddan user qidirib chat ochamiz
          try {
            const results = await searchUsersApi(targetUsername);
            const matchingUser = results.find(
              (u) => u.username?.toLowerCase() === targetUsername.toLowerCase()
            );
            if (matchingUser) {
              await startChatWithUser(matchingUser);
              setSidebarOpen(false);
            }
          } catch (e) {
            console.error('URL dagi username bo‘yicha chat ochishda xatolik:', e);
          }
        }
      } else if (!hash && activeChat) {
        setActiveChat(null);
        setSidebarOpen(true);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [chats, activeChat, setActiveChat, setSidebarOpen, startChatWithUser]);

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-telegram-darker overflow-hidden text-white relative">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>

      {/* Telefon versiyasida pastki navigatsiya paneli (chat ochilmagan paytda) */}
      {!activeChat && <BottomNavBar />}

      {/* Uchta chiziqcha bosilganda ochiladigan Telegram Drawer menyusi */}
      <TelegramDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
export default ChatPage;