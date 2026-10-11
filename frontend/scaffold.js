const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/abdul/OneDrive/Ishchi stol/messenger/frontend';
fs.mkdirSync(dir, { recursive: true });
process.chdir(dir);

const files = {
  'package.json': `{
  "name": "messenger-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-use-websocket": "^4.5.0",
    "zustand": "^4.4.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}`,
  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: '#2AABEE',
          dark: '#17212B',
          darker: '#0E1621',
          message: '#2B5278',
          surface: '#182533',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Messenger</title>
  </head>
  <body class="bg-telegram-darker text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'src/index.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* { font-family: 'Inter', sans-serif; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
`,
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
  'src/App.jsx': `import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './components/layout/PrivateRoute';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;`,
  'src/api/axios.js': `import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const res = await axios.post('http://localhost:8000/api/auth/refresh', { refresh: refreshToken });
        const { access } = res.data;
        useAuthStore.getState().setTokens(access, refreshToken);
        api.defaults.headers.common['Authorization'] = \`Bearer \${access}\`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;`,
  'src/api/auth.js': `import api from './axios';

export const loginApi = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const registerApi = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const getUserApi = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};`,
  'src/api/chats.js': `import api from './axios';

export const getChatsApi = async () => {
  const { data } = await api.get('/chats');
  return data;
};

export const getMessagesApi = async (chatId) => {
  const { data } = await api.get(\`/chats/\${chatId}/messages\`);
  return data;
};`,
  'src/store/authStore.js': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, access, refresh) => set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
      loadUser: () => {} 
    }),
    {
      name: 'auth-storage',
    }
  )
);`,
  'src/store/chatStore.js': `import { create } from 'zustand';

export const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (chatId, message) => set((state) => {
    const chatMsgs = state.messages[chatId] || [];
    return {
      messages: {
        ...state.messages,
        [chatId]: [...chatMsgs, message]
      }
    };
  }),
  setMessages: (chatId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: messages
    }
  })),
  updateMessage: (chatId, messageId, updates) => set((state) => {
    const chatMsgs = state.messages[chatId] || [];
    return {
      messages: {
        ...state.messages,
        [chatId]: chatMsgs.map((m) => m.id === messageId ? { ...m, ...updates } : m)
      }
    };
  })
}));`,
  'src/store/uiStore.js': `import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));`,
  'src/hooks/useAuth.js': `import { useAuthStore } from '../store/authStore';
import { loginApi, registerApi } from '../api/auth';
import { useState } from 'react';

export const useAuth = () => {
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      login(data.user, data.access, data.refresh);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerApi(userData);
      login(data.user, data.access, data.refresh);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { user, isAuthenticated, loading, error, login: handleLogin, register: handleRegister, logout };
};`,
  'src/hooks/useChats.js': `import { useChatStore } from '../store/chatStore';
import { getChatsApi, getMessagesApi } from '../api/chats';
import { useState, useCallback } from 'react';

export const useChats = () => {
  const { chats, setChats, activeChat, setActiveChat, messages, setMessages } = useChatStore();
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatsApi();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, [setChats]);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const data = await getMessagesApi(chatId);
      setMessages(chatId, data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [setMessages]);

  return { chats, activeChat, setActiveChat, messages, fetchChats, fetchMessages, loading };
};`,
  'src/hooks/useWebSocket.js': `import useWebSocketLib from 'react-use-websocket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useEffect } from 'react';

export const useWebSocket = (chatId) => {
  const token = useAuthStore((state) => state.accessToken);
  const addMessage = useChatStore((state) => state.addMessage);

  const { sendMessage, lastMessage, readyState } = useWebSocketLib(
    chatId && token ? \`ws://localhost:8000/ws/chat/\${chatId}/?token=\${token}\` : null,
    {
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'chat_message') {
          addMessage(chatId, data.message);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    }
  }, [lastMessage, chatId, addMessage]);

  const sendChatMessage = (text) => {
    sendMessage(JSON.stringify({ type: 'chat_message', message: text }));
  };

  const sendTyping = () => {
    sendMessage(JSON.stringify({ type: 'typing' }));
  };

  return { sendChatMessage, sendTyping, readyState };
};`,
  'src/utils/formatDate.js': `import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  
  return format(date, 'dd.MM.yyyy');
};`,
  'src/utils/constants.js': `export const API_URL = 'http://localhost:8000/api';
export const WS_URL = 'ws://localhost:8000/ws';`,
  'src/components/ui/Button.jsx': `import clsx from 'clsx';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className, disabled }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-telegram-blue text-white hover:bg-blue-600',
    secondary: 'bg-telegram-surface text-white hover:bg-telegram-message',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-white hover:bg-telegram-surface'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClasses, variants[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;`,
  'src/components/ui/Input.jsx': `import clsx from 'clsx';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Input = forwardRef(({ type = 'text', placeholder, value, onChange, className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          'w-full px-4 py-2 rounded-md bg-telegram-surface border focus:outline-none transition-colors text-white placeholder-gray-400',
          error ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-telegram-blue',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  error: PropTypes.string,
};

export default Input;`,
  'src/components/ui/Avatar.jsx': `import clsx from 'clsx';
import PropTypes from 'prop-types';

const Avatar = ({ src, alt, size = 'md', online, className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className={clsx('relative inline-block rounded-full', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-telegram-blue text-white rounded-full font-semibold">
          {getInitial(alt)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-telegram-dark rounded-full"></span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  online: PropTypes.bool,
  className: PropTypes.string,
};

export default Avatar;`,
  'src/components/ui/Badge.jsx': `import PropTypes from 'prop-types';

const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="bg-telegram-blue text-white text-xs font-bold px-2 py-1 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
};

Badge.propTypes = { count: PropTypes.number };
export default Badge;`,
  'src/components/ui/Modal.jsx': `import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-telegram-dark rounded-lg w-full max-w-md p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
export default Modal;`,
  'src/components/layout/Sidebar.jsx': `import { Search, Menu } from 'lucide-react';
import ChatList from '../chat/ChatList';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import clsx from 'clsx';
import { useUiStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const { isSidebarOpen } = useUiStore();
  const activeChat = useChatStore((state) => state.activeChat);

  return (
    <div className={clsx(
      'flex flex-col w-full lg:w-[340px] bg-telegram-dark h-full border-r border-gray-800 transition-all duration-300',
      !isSidebarOpen || (activeChat && 'hidden lg:flex') ? 'hidden lg:flex' : 'flex'
    )}>
      <div className="p-3 flex items-center gap-3">
        <button className="text-gray-400 hover:text-white p-2">
          <Menu size={24} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-telegram-surface text-white placeholder-gray-400 rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-telegram-blue transition-all"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChatList />
      </div>

      <div className="p-3 bg-telegram-surface flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors">
        <Avatar alt={user?.username || 'U'} size="sm" />
        <div className="flex-1 truncate">
          <h3 className="text-white font-medium truncate">{user?.username}</h3>
          <p className="text-gray-400 text-xs truncate">Online</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;`,
  'src/components/layout/Header.jsx': `import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="p-4 bg-telegram-dark border-b border-gray-800 flex justify-between items-center">
      <h1 className="text-xl font-bold">Messenger</h1>
      <div>{user?.username}</div>
    </header>
  );
};
export default Header;`,
  'src/components/layout/PrivateRoute.jsx': `import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = { children: PropTypes.node.isRequired };
export default PrivateRoute;`,
  'src/components/chat/ChatList.jsx': `import ChatItem from './ChatItem';
import { useChats } from '../../hooks/useChats';
import { useEffect } from 'react';

const ChatList = () => {
  const { chats, fetchChats, activeChat, setActiveChat } = useChats();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={activeChat?.id === chat.id}
            onClick={() => setActiveChat(chat)}
          />
        ))
      ) : (
        <p className="text-gray-400 text-center p-4">No chats yet</p>
      )}
    </div>
  );
};
export default ChatList;`,
  'src/components/chat/ChatItem.jsx': `import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatMessageTime } from '../../utils/formatDate';
import clsx from 'clsx';

const ChatItem = ({ chat, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        isActive ? 'bg-telegram-blue text-white' : 'hover:bg-telegram-surface'
      )}
    >
      <Avatar alt={chat.name} src={chat.avatar} online={chat.isOnline} size="md" />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-medium truncate text-white">{chat.name}</h3>
          <span className={clsx('text-xs', isActive ? 'text-blue-100' : 'text-gray-400')}>
            {formatMessageTime(chat.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className={clsx('text-sm truncate', isActive ? 'text-blue-100' : 'text-gray-400')}>
            {chat.lastMessage?.text || 'No messages'}
          </p>
          <Badge count={chat.unreadCount} />
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
export default ChatItem;`,
  'src/components/chat/ChatWindow.jsx': `import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChats } from '../../hooks/useChats';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useUiStore } from '../../store/uiStore';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatWindow = () => {
  const { activeChat, setActiveChat, messages, fetchMessages } = useChats();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const messagesEndRef = useRef(null);

  const { sendChatMessage, sendTyping } = useWebSocket(activeChat?.id);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat?.id]);

  const handleBack = () => {
    setActiveChat(null);
    setSidebarOpen(true);
  };

  if (!activeChat) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-telegram-darker">
        <div className="bg-telegram-surface px-4 py-1.5 rounded-full text-sm text-gray-300">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  const chatMessages = messages[activeChat.id] || [];

  return (
    <div className="flex-1 flex flex-col bg-telegram-darker h-full relative">
      <div className="flex items-center justify-between p-3 bg-telegram-dark border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="lg:hidden text-gray-400 hover:text-white p-1">
            <ArrowLeft size={24} />
          </button>
          <Avatar alt={activeChat.name} src={activeChat.avatar} size="sm" />
          <div>
            <h2 className="text-white font-medium">{activeChat.name}</h2>
            <p className="text-telegram-blue text-xs">{activeChat.isOnline ? 'Online' : 'Last seen recently'}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-2">
          <MoreVertical size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0E1621] custom-scrollbar">
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={sendChatMessage} onTyping={sendTyping} />
    </div>
  );
};
export default ChatWindow;`,
  'src/components/chat/MessageBubble.jsx': `import PropTypes from 'prop-types';
import clsx from 'clsx';
import { formatMessageTime } from '../../utils/formatDate';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={clsx('flex w-full animate-slide-in', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 relative',
          isOwn ? 'bg-telegram-message text-white rounded-br-none' : 'bg-telegram-surface text-white rounded-bl-none'
        )}
      >
        {message.replyTo && (
          <div className="border-l-2 border-telegram-blue pl-2 mb-1 bg-black bg-opacity-20 rounded p-1 text-sm">
            <span className="text-telegram-blue font-medium">{message.replyTo.sender}</span>
            <p className="text-gray-300 truncate">{message.replyTo.text}</p>
          </div>
        )}
        <p className="text-sm md:text-base leading-relaxed break-words">{message.text}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-gray-400 select-none">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className={clsx("text-[14px]", message.isRead ? "text-telegram-blue" : "text-gray-400")}>
              {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool.isRequired,
};
export default MessageBubble;`,
  'src/components/chat/MessageInput.jsx': `import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Smile, Paperclip, Send, Mic } from 'lucide-react';

const MessageInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

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
  };

  return (
    <div className="bg-telegram-dark p-3 flex items-end gap-2">
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
          placeholder="Message"
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
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
};
export default MessageInput;`,
  'src/components/chat/TypingIndicator.jsx': `const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 p-2">
      <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
export default TypingIndicator;`,
  'src/pages/LoginPage.jsx': `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-telegram-darker p-4">
      <div className="w-full max-w-md bg-telegram-dark p-8 rounded-2xl shadow-xl transform transition-all">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-telegram-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.88 1.2-5.32 3.53-.5.35-.95.52-1.36.51-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.72 3.91-1.7 6.53-2.83 7.84-3.38 3.74-1.56 4.51-1.83 5.01-1.84.11 0 .36.03.49.15.11.1.15.24.13.36z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Sign in to Messenger</h2>
          <p className="text-gray-400 mt-2">Please enter your credentials</p>
        </div>

        {error && <div className="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-telegram-blue hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;`,
  'src/pages/RegisterPage.jsx': `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const success = await register(formData);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-telegram-darker p-4">
      <div className="w-full max-w-md bg-telegram-dark p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>
        
        {error && <div className="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <Input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          
          <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-telegram-blue hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;`,
  'src/pages/ChatPage.jsx': `import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  return (
    <div className="h-screen w-full flex bg-telegram-darker overflow-hidden text-white">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};
export default ChatPage;`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(dir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
});
console.log('Project scaffolded successfully');
