import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  Pencil,
  Camera,
  Check,
  Save,
  Loader2,
  AtSign,
  Info,
  User as UserIcon,
  Mail,
  Copy,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { updateProfileApi } from '../../api/auth';
import Avatar from '../ui/Avatar';
import clsx from 'clsx';

const ProfileView = ({ onBack }) => {
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { setCurrentView, isEditingProfile, setIsEditingProfile } = useUiStore();

  const [isEditing, setIsEditing] = useState(isEditingProfile || false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const fileInputRef = useRef(null);

  // Initial qiymatlarni o'rnatish
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.first_name || '');
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [currentUser]);

  // isEditingProfile o'zgarganda sinxronlash
  useEffect(() => {
    if (isEditingProfile !== isEditing) {
      setIsEditing(isEditingProfile);
    }
  }, [isEditingProfile]);

  // Nusxalash funksiyasi
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Yangi rasm tanlanganda preview yaratish
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Rasm hajmi 5MB dan oshmasligi kerak!");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrorMsg('');
    }
  };

  // Tahrirlashni bekor qilish
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsEditingProfile(false);
    setErrorMsg('');
    if (currentUser) {
      setName(currentUser.name || currentUser.first_name || '');
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  // Profilni saqlash funksiyasi
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUsername = username.trim().replace(/^@/, '');
    if (!trimmedUsername) {
      setErrorMsg("Username bo'sh bo'lishi mumkin emas!");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('username', trimmedUsername);
      formData.append('name', name.trim());
      formData.append('first_name', name.trim());
      formData.append('bio', bio.trim());

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedUser = await updateProfileApi(formData);
      updateUser(updatedUser);

      setSuccessMsg("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
      setIsEditing(false);
      setIsEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview(null);

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      console.error('Profilni saqlashda xatolik:', err);
      const responseErrors = err?.response?.data;
      if (typeof responseErrors === 'object') {
        const firstKey = Object.keys(responseErrors)[0];
        const val = responseErrors[firstKey];
        setErrorMsg(`${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`);
      } else {
        setErrorMsg("Profilni saqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Ortga qaytish: agar tahrirlashda bo'lsa ko'rish rejimiga, aks holda chatga
  const handleBack = () => {
    if (isEditing) {
      handleCancelEdit();
    } else if (onBack) {
      onBack();
    } else {
      setCurrentView('chats');
    }
  };

  const displayName = currentUser?.name || currentUser?.first_name || currentUser?.username || 'Foydalanuvchi';
  const displayAvatar = avatarPreview || currentUser?.avatar;

  return (
    <div className="w-full h-full flex flex-col bg-telegram-dark select-none overflow-hidden animate-in fade-in duration-150">
      {/* 1. Yuqori Panel (Header) */}
      <div className="h-14 px-4 bg-telegram-surface border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Ortga"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-white font-semibold text-base">
            {isEditing ? 'Profilni tahrirlash' : 'Profil'}
          </h2>
        </div>

        {/* O'ng tomon: Tahrirlash yoki Saqlash iconi */}
        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 text-telegram-blue hover:text-blue-400 disabled:opacity-50 rounded-full hover:bg-white/10 transition-colors"
              title="Saqlash"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={22} />}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setIsEditingProfile(true);
              }}
              className="p-2 text-gray-300 hover:text-telegram-blue rounded-full hover:bg-white/10 transition-colors"
              title="Profilni tahrirlash"
            >
              <Pencil size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Xabarlar (Error / Success to'plamlari) */}
      {errorMsg && (
        <div className="px-4 py-2.5 bg-red-500/20 border-b border-red-500/30 flex items-center gap-2 text-red-300 text-xs shrink-0 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="px-4 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs shrink-0 animate-in fade-in">
          <CheckCheck size={16} className="shrink-0" />
          <span className="flex-1">{successMsg}</span>
        </div>
      )}

      {/* 2. Asosiy Qism (Scrollable Body) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Ko'rish rejimi (View Mode) */}
        {!isEditing ? (
          <div className="flex flex-col items-center">
            {/* Profil rasmi (Avatar) */}
            <div className="relative mt-2 mb-4 group">
              <Avatar
                alt={displayName}
                src={currentUser?.avatar}
                size="2xl"
                online={true}
                className="ring-4 ring-telegram-surface shadow-2xl"
              />
            </div>

            {/* Ism (Name) */}
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
              {displayName}
            </h1>

            {/* Username */}
            <p className="text-telegram-blue text-sm font-medium mt-1">
              @{currentUser?.username || 'username'}
            </p>

            {/* Bio (Agar mavjud bo'lsa) */}
            {currentUser?.bio && (
              <p className="text-gray-300 text-sm text-center mt-3 px-6 italic leading-relaxed">
                "{currentUser.bio}"
              </p>
            )}

            {/* Ma'lumot kartalari (Telegram-style Info Cards) */}
            <div className="w-full mt-6 bg-telegram-surface/70 border border-gray-800/80 rounded-2xl overflow-hidden divide-y divide-gray-800/60 shadow-lg">
              {/* Username Card */}
              <div
                onClick={() => handleCopy(`@${currentUser?.username}`, 'username')}
                className="p-3.5 flex items-center justify-between hover:bg-telegram-surface cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-telegram-blue">
                    <AtSign size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-normal">Foydalanuvchi nomi</span>
                    <span className="text-sm font-medium text-white group-hover:text-telegram-blue transition-colors">
                      @{currentUser?.username}
                    </span>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  {copiedField === 'username' ? (
                    <span className="text-xs text-emerald-400 font-medium">Nusxalandi!</span>
                  ) : (
                    <Copy size={16} />
                  )}
                </div>
              </div>

              {/* Bio Card */}
              <div className="p-3.5 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Info size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400 block font-normal">Bio (Ma'lumot)</span>
                  <span className="text-sm text-gray-200 block break-words mt-0.5">
                    {currentUser?.bio || "Bio kiritilmagan"}
                  </span>
                </div>
              </div>

              {/* Ism Card */}
              <div className="p-3.5 flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <UserIcon size={18} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-normal">Ism</span>
                  <span className="text-sm font-medium text-white">
                    {displayName}
                  </span>
                </div>
              </div>

              {/* Email Card (agar bo'lsa) */}
              {currentUser?.email && (
                <div
                  onClick={() => handleCopy(currentUser.email, 'email')}
                  className="p-3.5 flex items-center justify-between hover:bg-telegram-surface cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-normal">Email</span>
                      <span className="text-sm font-medium text-white group-hover:text-telegram-blue transition-colors">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-white transition-colors">
                    {copiedField === 'email' ? (
                      <span className="text-xs text-emerald-400 font-medium">Nusxalandi!</span>
                    ) : (
                      <Copy size={16} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profilni tahrirlash tugmasi (Asosiy button) */}
            <button
              onClick={() => {
                setIsEditing(true);
                setIsEditingProfile(true);
              }}
              className="w-full mt-6 py-3 px-4 bg-telegram-surface hover:bg-gray-800 text-telegram-blue border border-telegram-blue/30 hover:border-telegram-blue font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Pencil size={18} />
              <span>Profilni tahrirlash</span>
            </button>
          </div>
        ) : (
          /* Tahrirlash rejimi (Edit Mode) */
          <form onSubmit={handleSave} className="space-y-5">
            {/* Profil rasmini o'zgartirish (Avatar Upload) */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar
                  alt={displayName}
                  src={displayAvatar}
                  size="2xl"
                  className="ring-4 ring-telegram-surface shadow-2xl opacity-90 group-hover:opacity-75 transition-opacity"
                />
                {/* Rasm ustidagi kamera iconi */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-telegram-blue text-white rounded-full shadow-lg ring-2 ring-telegram-dark transform group-hover:scale-110 transition-transform">
                    <Camera size={22} />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs text-telegram-blue hover:underline font-medium"
              >
                Profil rasmini yangilash
              </button>

              {avatarFile && (
                <span className="text-[11px] text-emerald-400 mt-1">
                  Yangi rasm tanlandi: {avatarFile.name}
                </span>
              )}
            </div>

            {/* 1. Ism (Name) maydoni */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 block px-1">
                Ism
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  maxLength={64}
                  className="w-full bg-telegram-surface border border-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-telegram-blue focus:ring-1 focus:ring-telegram-blue transition-all"
                />
              </div>
            </div>

            {/* 2. Username maydoni */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 block px-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-telegram-blue font-semibold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  maxLength={32}
                  className="w-full bg-telegram-surface border border-gray-800 text-white placeholder-gray-500 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-telegram-blue focus:ring-1 focus:ring-telegram-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 px-1">
                Boshqa foydalanuvchilar sizni ushbu username orqali qidirib topishlari mumkin.
              </p>
            </div>

            {/* 3. Bio maydoni */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium text-gray-400">
                  Bio (O'zingiz haqingizda)
                </label>
                <span className="text-[10px] text-gray-500">
                  {bio.length}/500
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="O'zingiz haqingizda bir oz ma'lumot yozing..."
                rows={3}
                maxLength={500}
                className="w-full bg-telegram-surface border border-gray-800 text-white placeholder-gray-500 rounded-xl p-3 text-sm focus:outline-none focus:border-telegram-blue focus:ring-1 focus:ring-telegram-blue transition-all resize-none"
              />
            </div>

            {/* 4. Saqlash (Save) Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-telegram-blue hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-telegram-blue/20 transition-all active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Saqlash</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="w-full mt-2 py-2 px-4 text-gray-400 hover:text-white text-xs font-medium rounded-xl hover:bg-telegram-surface transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

ProfileView.propTypes = {
  onBack: PropTypes.func,
};

export default ProfileView;
