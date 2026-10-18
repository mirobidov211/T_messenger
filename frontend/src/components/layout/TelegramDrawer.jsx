import PropTypes from 'prop-types';
import { User, Settings, Moon, Sun, LogOut, X, Bookmark, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import Avatar from '../ui/Avatar';
import { useState, useEffect } from 'react';

const TelegramDrawer = ({ isOpen, onClose }) => {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { setCurrentView, setIsEditingProfile } = useUiStore();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Esc bosilganda drawerni yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = currentUser?.name || currentUser?.first_name || currentUser?.username || 'Foydalanuvchi';
  const username = currentUser?.username ? `@${currentUser.username}` : '';

  const handleNavigateToProfile = () => {
    setIsEditingProfile(false);
    setCurrentView('profile');
    onClose();
  };

  const handleNavigateToSettings = () => {
    setCurrentView('settings');
    onClose();
  };

  const handleLogout = () => {
    if (window.confirm('Haqiqatan ham hisobdan chiqmoqchimisiz?')) {
      onClose();
      logout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Orqa fon (Backdrop) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer paneli */}
      <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] h-full bg-telegram-dark border-r border-gray-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Yuqori Profil Banneri */}
        <div
          onClick={handleNavigateToProfile}
          className="p-5 bg-gradient-to-b from-telegram-surface to-telegram-dark border-b border-gray-800/80 cursor-pointer hover:bg-telegram-surface/70 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <Avatar
              alt={displayName}
              src={currentUser?.avatar}
              size="lg"
              online={true}
              className="ring-2 ring-telegram-blue/40 group-hover:ring-telegram-blue transition-all"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Yopish"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="font-semibold text-white text-base truncate group-hover:text-telegram-blue transition-colors">
            {displayName}
          </h3>
          <p className="text-gray-400 text-xs truncate mt-0.5">
            {username || currentUser?.email || 'Profilni ko‘rish'}
          </p>
        </div>

        {/* Menyu elementlari ro'yxati */}
        <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {/* Profil tugmasi */}
          <button
            onClick={handleNavigateToProfile}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-gray-200 hover:text-white hover:bg-telegram-surface transition-all group text-left"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-telegram-blue group-hover:bg-telegram-blue group-hover:text-white transition-colors">
              <User size={19} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Profil</span>
            </div>
          </button>

          {/* Sozlamalar tugmasi */}
          <button
            onClick={handleNavigateToSettings}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-gray-200 hover:text-white hover:bg-telegram-surface transition-all group text-left"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Settings size={19} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Sozlamalar</span>
            </div>
          </button>

          {/* Saqlangan xabarlar */}
          <button
            onClick={() => {
              setCurrentView('chats');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-gray-200 hover:text-white hover:bg-telegram-surface transition-all group text-left"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Bookmark size={19} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Chatlar</span>
            </div>
          </button>

          {/* Tungi rejim tugmasi */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-200 hover:text-white hover:bg-telegram-surface transition-all group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                {isDarkMode ? <Moon size={19} /> : <Sun size={19} />}
              </div>
              <span className="text-sm font-medium">Tungi rejim</span>
            </div>
            <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-telegram-blue transition-colors">
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Pastki qism: Chiqish tugmasi */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
          >
            <LogOut size={19} />
            <span className="text-sm font-medium">Hisobdan chiqish</span>
          </button>
          <div className="mt-2 text-center text-[11px] text-gray-500">
            Telegram Web v2.0
          </div>
        </div>
      </div>
    </div>
  );
};

TelegramDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TelegramDrawer;
