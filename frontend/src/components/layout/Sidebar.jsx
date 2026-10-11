import { useState, useEffect, useCallback } from 'react';
import { Search, Menu, X, Loader2, User } from 'lucide-react';
import ChatList from '../chat/ChatList';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import clsx from 'clsx';
import { useUiStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';
import { useChats } from '../../hooks/useChats';
import { searchUsersApi } from '../../api/chats';

const Sidebar = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { isSidebarOpen } = useUiStore();
  const activeChat = useChatStore((state) => state.activeChat);
  const { startChatWithUser } = useChats();

  // Qidiruv holatlari (Search states)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Foydalanuvchilarni qidirish (Debounce bilan)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsersApi(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.error('Qidiruvda xatolik:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Qidiruvdan foydalanuvchini tanlaganda chat ochish
  const handleSelectUser = async (targetUser) => {
    try {
      setIsStartingChat(true);
      await startChatWithUser(targetUser);
      // Qidiruv maydonini tozalash
      setSearchQuery('');
      setSearchResults([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Chat ochishda xatolik:', err);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Qidiruvni tozalash
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div
      className={clsx(
        'flex flex-col w-full lg:w-[340px] bg-telegram-dark h-full border-r border-gray-800 transition-all duration-300',
        !isSidebarOpen || (activeChat && 'hidden lg:flex') ? 'hidden lg:flex' : 'flex'
      )}
    >
      {/* Yuqori qism: Menu va Qidiruv (Search Bar) */}
      <div className="p-3 flex items-center gap-2">
        <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-telegram-surface transition-colors">
          <Menu size={22} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-telegram-surface text-white placeholder-gray-400 rounded-full py-1.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-telegram-blue transition-all"
          />
          <Search size={17} className="absolute left-3 top-2.5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Asosiy ro'yxat qismi (Chatlar yoki Qidiruv natijalari) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {searchQuery.trim() ? (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold uppercase text-telegram-blue tracking-wider">
              Global Search
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center p-8 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin text-telegram-blue" />
                <span className="text-sm">Qidirilmoqda...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-0.5">
                {searchResults.map((searchedUser) => (
                  <div
                    key={searchedUser.id}
                    onClick={() => handleSelectUser(searchedUser)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-telegram-surface transition-colors',
                      isStartingChat && 'opacity-60 pointer-events-none'
                    )}
                  >
                    <Avatar
                      alt={searchedUser.username}
                      src={searchedUser.avatar}
                      online={searchedUser.is_online}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        {searchedUser.username}
                      </h4>
                      <p className="text-gray-400 text-xs truncate">
                        {searchedUser.is_online
                          ? 'online'
                          : searchedUser.bio || `@${searchedUser.username}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <User size={32} className="text-gray-500 mb-2" />
                <p className="text-sm font-medium text-gray-300">Foydalanuvchi topilmadi</p>
                <p className="text-xs text-gray-500 mt-1">Boshqa username kiriting</p>
              </div>
            )}
          </div>
        ) : (
          <ChatList />
        )}
      </div>

      {/* Pastki qism: Joriy foydalanuvchi profili */}
      <div className="p-3 bg-telegram-surface/50 border-t border-gray-800/50 flex items-center gap-3 cursor-pointer hover:bg-telegram-surface transition-colors">
        <Avatar alt={currentUser?.username || 'U'} src={currentUser?.avatar} size="sm" />
        <div className="flex-1 truncate">
          <h3 className="text-white text-sm font-medium truncate">{currentUser?.username}</h3>
          <p className="text-telegram-blue text-xs truncate">Online</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;