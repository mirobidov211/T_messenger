import { useState } from 'react';
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
export default LoginPage;