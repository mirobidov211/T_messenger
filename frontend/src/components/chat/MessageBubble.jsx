import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { formatMessageTime } from '../../utils/formatDate';
import { Check, CheckCheck, Pencil, Trash2, X } from 'lucide-react';

const MessageBubble = ({ message, isOwn, onEdit, onDelete }) => {
  const [menu, setMenu] = useState(null); // { x, y } yoki null
  const menuRef = useRef(null);
  const longPressTimer = useRef(null);
  const bubbleRef = useRef(null);

  // Menyuni yopish
  const closeMenu = useCallback(() => setMenu(null), []);

  // Tashqariga bosganda menyuni yopish
  useEffect(() => {
    if (!menu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu, closeMenu]);

  // Desktop: o'ng tugma bosilganda (right-click)
  const handleContextMenu = (e) => {
    if (!isOwn) return; // faqat o'z xabarlarimizga
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    setMenu({ x, y });
  };

  // Mobile: uzoq bosish (long-press)
  const handleTouchStart = (e) => {
    if (!isOwn) return;
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      const rect = bubbleRef.current?.getBoundingClientRect();
      setMenu({
        x: rect ? rect.left : touch.clientX,
        y: rect ? rect.bottom + 4 : touch.clientY,
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEdit = () => {
    closeMenu();
    onEdit(message);
  };

  const handleDelete = () => {
    closeMenu();
    onDelete(message);
  };

  const isEdited = Boolean(message.edited_at);
  const text = message.content || message.text || '';

  return (
    <>
      <div
        className={clsx('flex w-full animate-slide-in', isOwn ? 'justify-end' : 'justify-start')}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <div
          ref={bubbleRef}
          className={clsx(
            'max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 relative select-none',
            isOwn
              ? 'bg-telegram-message text-white rounded-br-none'
              : 'bg-telegram-surface text-white rounded-bl-none'
          )}
        >
          {/* Reply */}
          {message.replyTo && (
            <div className="border-l-2 border-telegram-blue pl-2 mb-1 bg-black bg-opacity-20 rounded p-1 text-sm">
              <span className="text-telegram-blue font-medium">{message.replyTo.sender}</span>
              <p className="text-gray-300 truncate">{message.replyTo.text}</p>
            </div>
          )}

          {/* Matn */}
          <p className="text-sm md:text-base leading-relaxed break-words select-text">{text}</p>

          {/* Vaqt + o'qildi belgisi + tahrirlangan */}
          <div className="flex items-center justify-end gap-1 mt-1 flex-wrap">
            {isEdited && (
              <span className="text-[10px] text-gray-400 italic mr-1">tahrirlangan</span>
            )}
            <span className="text-[11px] text-gray-400 select-none">
              {formatMessageTime(message.created_at || message.createdAt)}
            </span>
            {isOwn && (
              <span
                className={clsx(
                  'text-[14px]',
                  message.is_read || message.isRead ? 'text-telegram-blue' : 'text-gray-400'
                )}
              >
                {message.is_read || message.isRead ? (
                  <CheckCheck size={14} />
                ) : (
                  <Check size={14} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {menu && isOwn && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-[#1e2c3a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[150px]"
          style={{
            top: Math.min(menu.y, window.innerHeight - 110),
            left: Math.min(menu.x, window.innerWidth - 170),
          }}
        >
          <button
            onClick={handleEdit}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-white hover:bg-telegram-surface transition-colors"
          >
            <Pencil size={15} className="text-telegram-blue" />
            Tahrirlash
          </button>
          <div className="h-px bg-gray-700/60" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:bg-telegram-surface transition-colors"
          >
            <Trash2 size={15} />
            O'chirish
          </button>
          <div className="h-px bg-gray-700/60" />
          <button
            onClick={closeMenu}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-gray-400 hover:bg-telegram-surface transition-colors"
          >
            <X size={13} />
            Bekor qilish
          </button>
        </div>
      )}
    </>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default MessageBubble;