import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Smile, Paperclip, Send, Mic, X, Pencil } from 'lucide-react';

const MessageInput = ({ onSend, onTyping, editingMessage, onCancelEdit }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  // Edit rejimiga kirganda inputni to'ldirish
  useEffect(() => {
    if (editingMessage) {
      const content = editingMessage.content || editingMessage.text || '';
      setText(content);
      inputRef.current?.focus();
    } else {
      setText('');
    }
  }, [editingMessage]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping) onTyping();
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && editingMessage) {
      onCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setText('');
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="bg-telegram-dark flex flex-col">
      {/* Tahrirlash rejimi banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-telegram-surface border-t border-gray-700/60">
          <div className="flex items-center gap-2 min-w-0">
            <Pencil size={14} className="text-telegram-blue flex-shrink-0" />
            <span className="text-telegram-blue text-xs font-medium flex-shrink-0">Tahrirlash</span>
            <span className="text-gray-400 text-xs truncate">
              {editingMessage.content || editingMessage.text}
            </span>
          </div>
          <button
            onClick={handleCancelEdit}
            className="ml-2 p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input satri */}
      <div className="p-3 flex items-end gap-2">
        <button className="p-2 text-gray-400 hover:text-telegram-blue transition-colors">
          <Paperclip size={22} />
        </button>
        <div className="flex-1 bg-telegram-surface rounded-xl flex items-center px-2 py-1">
          <button className="p-2 text-gray-400 hover:text-telegram-blue transition-colors">
            <Smile size={22} />
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Tahrirlang...' : 'Xabar'}
            className="flex-1 bg-transparent text-white resize-none max-h-32 focus:outline-none p-2 custom-scrollbar"
            rows={1}
            style={{ minHeight: '40px' }}
          />
        </div>
        {text.trim() ? (
          <button
            onClick={handleSend}
            className="p-3 bg-telegram-blue text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg"
          >
            <Send size={22} className="ml-1" />
          </button>
        ) : (
          <button className="p-3 bg-telegram-surface text-gray-400 rounded-full hover:text-telegram-blue transition-colors">
            <Mic size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  editingMessage: PropTypes.object,
  onCancelEdit: PropTypes.func,
};

export default MessageInput;