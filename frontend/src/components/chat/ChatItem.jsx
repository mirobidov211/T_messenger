import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatMessageTime } from '../../utils/formatDate';
import { useAuthStore } from '../../store/authStore';
import { Check, CheckCheck } from 'lucide-react';
import clsx from 'clsx';

const ChatItem = ({ chat, isActive, onClick }) => {
  const currentUser = useAuthStore((state) => state.user);
  const displayName = chat.name || chat.other_user?.username || 'Chat';
  const avatarSrc = chat.avatar || chat.other_user?.avatar;
  const isOnline = Boolean(chat.is_online || chat.isOnline || chat.other_user?.is_online);
  const lastMsg = chat.last_message || chat.lastMessage;
  const lastText = lastMsg?.content || lastMsg?.text;
  const lastTime = formatMessageTime(lastMsg?.created_at || lastMsg?.createdAt);
  const unread = isActive ? 0 : (chat.unread_count || chat.unreadCount || 0);

  const isOwnLastMsg =
    lastMsg &&
    (lastMsg.sender_id === currentUser?.id ||
      lastMsg.sender?.id === currentUser?.id ||
      lastMsg.senderId === currentUser?.id);

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors select-none',
        isActive ? 'bg-telegram-blue text-white' : 'hover:bg-telegram-surface'
      )}
    >
      <Avatar alt={displayName} src={avatarSrc} online={isOnline} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-medium truncate text-white text-sm">{displayName}</h3>
          {lastTime && (
            <span className={clsx('text-xs shrink-0 ml-2', isActive ? 'text-blue-100' : 'text-gray-400')}>
              {lastTime}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 min-w-0 mr-2">
            {isOwnLastMsg && (
              <span className={clsx('shrink-0', isActive ? 'text-blue-100' : lastMsg.is_read || lastMsg.isRead ? 'text-telegram-blue' : 'text-gray-400')}>
                {lastMsg.is_read || lastMsg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
              </span>
            )}
            <p className={clsx('text-xs truncate', isActive ? 'text-blue-100' : 'text-gray-400')}>
              {lastText || "Hozircha xabarlar yo'q"}
            </p>
          </div>
          {!isActive && unread > 0 && <Badge count={unread} />}
        </div>
      </div>
    </div>
  );
};

ChatItem.propTypes = {
  chat: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
export default ChatItem;