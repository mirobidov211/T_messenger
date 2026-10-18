import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  Bell,
  Lock,
  Globe,
  Moon,
  LogOut,
  User,
  ChevronRight,
  Shield,
  Palette,
  Volume2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import Avatar from '../ui/Avatar';

const SettingsView = ({ onBack }) => {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { setCurrentView, setIsEditingProfile } = useUiStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("O'zbekcha");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const displayName = currentUser?.name || currentUser?.first_name || currentUser?.username || 'Foydalanuvchi';
  const username = currentUser?.username ? `@${currentUser.username}` : '';

  const handleGoToProfile = (isEdit = false) => {
    setIsEditingProfile(isEdit);
    setCurrentView('profile');
  };

  const handleLogout = () => {
    if (window.confirm('Haqiqatan ham hisobdan chiqmoqchimisiz?')) {
      logout();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentView('chats');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-telegram-dark select-none overflow-hidden animate-in fade-in duration-150">
      {/* Yuqori Panel (Header) */}
      <div className="h-14 px-4 bg-telegram-surface border-b border-gray-800 flex items-center gap-3 shrink-0">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Ortga"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-white font-semibold text-base">Sozlamalar</h2>
      </div>

      {/* Asosiy Sozlamalar Ro'yxati */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {/* Foydalanuvchi qisqacha ma'lumoti */}
        <div
          onClick={() => handleGoToProfile(false)}
          className="p-4 bg-telegram-surface/80 hover:bg-telegram-surface border border-gray-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition-all group shadow-md"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar
              alt={displayName}
              src={currentUser?.avatar}
              size="lg"
              online={true}
              className="ring-2 ring-telegram-blue/40 group-hover:ring-telegram-blue transition-all shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-base truncate group-hover:text-telegram-blue transition-colors">
                {displayName}
              </h3>
              <p className="text-gray-400 text-xs truncate mt-0.5">
                {username || currentUser?.email || 'Profilni ko‘rish'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
        </div>

        {/* 1-Bo'lim: Hisob va Profil */}
        <div className="bg-telegram-surface/60 border border-gray-800/70 rounded-2xl overflow-hidden divide-y divide-gray-800/60 shadow-md">
          <div className="px-4 py-2.5 text-[11px] font-semibold text-telegram-blue uppercase tracking-wider">
            Hisob
          </div>

          <button
            onClick={() => handleGoToProfile(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-telegram-surface transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-telegram-blue">
                <User size={18} />
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                Profilni tahrirlash
              </span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>

        {/* 2-Bo'lim: Bildirishnomalar va Ovozlar */}
        <div className="bg-telegram-surface/60 border border-gray-800/70 rounded-2xl overflow-hidden divide-y divide-gray-800/60 shadow-md">
          <div className="px-4 py-2.5 text-[11px] font-semibold text-telegram-blue uppercase tracking-wider">
            Bildirishnomalar
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-telegram-surface transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Bell size={18} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-200 block">Xabarlar bildirishnomasi</span>
                <span className="text-xs text-gray-400">Yangi xabarlarni ko'rsatish</span>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-telegram-blue' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-telegram-surface transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-200 block">Xabar ovozlari</span>
                <span className="text-xs text-gray-400">Yangi xabar kelganda ovoz chiqarish</span>
              </div>
            </div>
            <button
              onClick={() => setSoundsEnabled(!soundsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundsEnabled ? 'bg-telegram-blue' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3-Bo'lim: Umumiy sozlamalar (Til va Xavfsizlik) */}
        <div className="bg-telegram-surface/60 border border-gray-800/70 rounded-2xl overflow-hidden divide-y divide-gray-800/60 shadow-md">
          <div className="px-4 py-2.5 text-[11px] font-semibold text-telegram-blue uppercase tracking-wider">
            Umumiy
          </div>

          <div
            onClick={() => setShowLanguageModal(!showLanguageModal)}
            className="p-3.5 flex items-center justify-between hover:bg-telegram-surface cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Globe size={18} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-200 block">Til</span>
                <span className="text-xs text-telegram-blue">{selectedLanguage}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-telegram-surface cursor-pointer transition-colors group">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <Shield size={18} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-200 block">Maxfiylik va Xavfsizlik</span>
                <span className="text-xs text-gray-400">Faol seanslar, bloklanganlar</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        </div>

        {/* Chiqish tugmasi */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl flex items-center justify-center gap-2 border border-red-500/20 transition-all active:scale-[0.99]"
          >
            <LogOut size={18} />
            <span>Hisobdan chiqish</span>
          </button>
        </div>
      </div>

      {/* Til tanlash modali */}
      {showLanguageModal && (
        <div
          onClick={() => setShowLanguageModal(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-telegram-surface border border-gray-800 rounded-2xl p-4 shadow-2xl space-y-2 animate-in zoom-in-95 duration-150"
          >
            <h3 className="text-white font-semibold text-sm mb-3">Tilni tanlang</h3>
            {["O'zbekcha", 'Русский', 'English'].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setShowLanguageModal(false);
                }}
                className={`w-full py-2 px-3 rounded-xl text-left text-sm flex items-center justify-between transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-telegram-blue text-white font-medium'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{lang}</span>
                {selectedLanguage === lang && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SettingsView.propTypes = {
  onBack: PropTypes.func,
};

export default SettingsView;
