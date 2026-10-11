import { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChats } from '../../hooks/useChats';
import { ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useChatStore } from '../../store/chatStore';
import { deleteMessageApi, editMessageApi } from '../../api/chats';

const ChatWindow = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { activeChat, setActiveChat, messages, fetchMessages, sendMessage, markAsRead } = useChats();
  const { removeMessage, updateMessage } = useChatStore();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const messagesEndRef = useRef(null);

  const { sendChatMessage, sendReadReceipt, sendTyping, readyState } = useWebSocket(activeChat?.id);

  // Tahrirlash holati
  const [editingMessage, setEditingMessage] = useState(null);

  // Chapdan o'ngga surish holatlari
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);

  // activeChat o'zgarganda xabarlarni yuklash va o'qilgan deb belgilash
  useEffect(() => {
    if (activeChat?.id) {
      fetchMessages(activeChat.id);
      markAsRead(activeChat.id);
      sendReadReceipt();
    }
    // Chat o'zgarganda tahrirlashni bekor qilish
    setEditingMessage(null);
  }, [activeChat?.id]);

  const chatMessages = messages[String(activeChat?.id)] || messages[activeChat?.id] || [];

  // Yangi xabar kelganda pastga siljitish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Hash URL sinxronlash
  useEffect(() => {
    if (activeChat) {
      const username = activeChat.name || activeChat.other_user?.username;
      if (username) {
        const expectedHash = `#${username}`;
        if (window.location.hash !== expectedHash) {
          window.history.replaceState(null, '', `/#${username}`);
        }
      }
    }
  }, [activeChat]);

  const handleBack = () => {
    setActiveChat(null);
    setSidebarOpen(true);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Touch swipe right
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;
    if (diffX > 0 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      touchDeltaX.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > 75) {
      handleBack();
    }
    touchDeltaX.current = 0;
  };

  // Mouse swipe right (desktop)
  const handleMouseDown = (e) => {
    if (e.target.closest('input, textarea, button')) return;
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diffX = e.clientX - mouseStartX.current;
    if (diffX > 100) {
      handleBack();
    }
  };

  // Xabar yuborish yoki tahrirlashni saqlash
  const handleSend = async (text) => {
    if (!text || !activeChat) return;
    try {
      if (editingMessage) {
        // Tahrirlash rejimi
        const updated = await editMessageApi(activeChat.id, editingMessage.id, text);
        updateMessage(activeChat.id, editingMessage.id, {
          content: text,
          text,
          edited_at: updated?.edited_at || new Date().toISOString(),
        });
        setEditingMessage(null);
      } else {
        // Yangi xabar
        if (readyState === 1) {
          sendChatMessage(text);
        } else {
          await sendMessage(activeChat.id, text);
        }
      }
    } catch (err) {
      console.error('Xabar yuborishda xatolik:', err);
    }
  };

  // Xabarni o'chirish
  const handleDeleteMessage = useCallback(async (message) => {
    if (!activeChat) return;
    try {
      await deleteMessageApi(activeChat.id, message.id);
      removeMessage(activeChat.id, message.id);
    } catch (err) {
      console.error('Xabarni o\'chirishda xatolik:', err);
    }
  }, [activeChat, removeMessage]);

  // Xabarni tahrirlashga o'tish
  const handleEditMessage = useCallback((message) => {
    setEditingMessage(message);
  }, []);

  // Tahrirlashni bekor qilish
  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  if (!activeChat) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-telegram-darker">
        <div className="bg-telegram-surface px-4 py-2 rounded-full text-sm text-gray-300 shadow">
          Xabar yozish uchun chatni tanlang yoki qidiring
        </div>
      </div>
    );
  }

  const displayName = activeChat.name || activeChat.other_user?.username || 'Chat';
  const avatarSrc = activeChat.avatar || activeChat.other_user?.avatar;
  const isOnline = Boolean(activeChat.is_online || activeChat.isOnline || activeChat.other_user?.is_online);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="flex-1 flex flex-col bg-telegram-darker h-full relative"
    >
      {/* Chat tepa paneli */}
      <div className="flex items-center justify-between p-3 bg-telegram-dark border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="lg:hidden text-gray-400 hover:text-white p-1">
            <ArrowLeft size={22} />
          </button>
          <Avatar alt={displayName} src={avatarSrc} online={isOnline} size="sm" />
          <div>
            <h2 className="text-white font-medium text-sm leading-tight">{displayName}</h2>
            <p className="text-telegram-blue text-xs" data-testid="chat-status">
              {isOnline ? 'online' : 'yaqinda online edi'}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-telegram-surface transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Xabarlar ro'yxati */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0E1621] custom-scrollbar flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="m-auto flex flex-col items-center justify-center text-center p-6 bg-telegram-surface/40 rounded-2xl max-w-xs border border-gray-800/60 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-telegram-surface flex items-center justify-center mb-2.5 text-telegram-blue">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-white font-medium text-sm">Hozircha xabarlar yo'q</h3>
            <p className="text-gray-400 text-xs mt-1">
              Birinchi bo'lib salom deb yozing va suhbatni boshlang!
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn =
              msg.sender?.id === currentUser?.id ||
              msg.sender_id === currentUser?.id ||
              msg.senderId === currentUser?.id ||
              msg.senderId === 'me' ||
              (msg.sender_username && msg.sender_username === currentUser?.username);

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={Boolean(isOwn)}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Xabar kiritish maydoni */}
      <MessageInput
        onSend={handleSend}
        onTyping={sendTyping}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default ChatWindow;