import { MessageSquare, Settings, User } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';
import clsx from 'clsx';

const BottomNavBar = () => {
  const { currentView, setCurrentView, setIsEditingProfile } = useUiStore();
  const { activeChat, setActiveChat, chats } = useChatStore();

  // Umumiy o'qilmagan xabarlar soni
  const totalUnreadCount = chats?.reduce((acc, c) => acc + (c.unread_count || c.unreadCount || 0), 0) || 0;

  const handleSelectTab = (view) => {
    if (activeChat) {
      setActiveChat(null);
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    if (view === 'profile') {
      setIsEditingProfile(false);
    }
    setCurrentView(view);
  };

  return (
    <nav className="lg:hidden shrink-0 w-full bg-telegram-dark border-t border-gray-800/90 px-4 py-1.5 flex items-center justify-around z-30 select-none shadow-lg">
      {/* 1. Chatlar */}
      <button
        onClick={() => handleSelectTab('chats')}
        className={clsx(
          'flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative',
          currentView === 'chats' && !activeChat
            ? 'text-telegram-blue'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        <div className="relative">
          <MessageSquare size={22} strokeWidth={currentView === 'chats' && !activeChat ? 2.4 : 1.8} />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-2.5 bg-telegram-blue text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </div>
        <span
          className={clsx(
            'text-[11px] mt-1 font-medium transition-colors',
            currentView === 'chats' && !activeChat ? 'text-telegram-blue font-semibold' : 'text-gray-400'
          )}
        >
          Chatlar
        </span>
      </button>

      {/* 2. Sozlamalar */}
      <button
        onClick={() => handleSelectTab('settings')}
        className={clsx(
          'flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative',
          currentView === 'settings'
            ? 'text-telegram-blue'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        <Settings size={22} strokeWidth={currentView === 'settings' ? 2.4 : 1.8} />
        <span
          className={clsx(
            'text-[11px] mt-1 font-medium transition-colors',
            currentView === 'settings' ? 'text-telegram-blue font-semibold' : 'text-gray-400'
          )}
        >
          Sozlamalar
        </span>
      </button>

      {/* 3. Profil */}
      <button
        onClick={() => handleSelectTab('profile')}
        className={clsx(
          'flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative',
          currentView === 'profile'
            ? 'text-telegram-blue'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        <User size={22} strokeWidth={currentView === 'profile' ? 2.4 : 1.8} />
        <span
          className={clsx(
            'text-[11px] mt-1 font-medium transition-colors',
            currentView === 'profile' ? 'text-telegram-blue font-semibold' : 'text-gray-400'
          )}
        >
          Profil
        </span>
      </button>
    </nav>
  );
};

export default BottomNavBar;
