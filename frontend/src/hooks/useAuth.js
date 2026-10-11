import { useAuthStore } from '../store/authStore';
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
      const errData = err.response?.data;
      setError(errData?.message || errData?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerApi({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.confirmPassword,
      });
      login(data.user, data.access, data.refresh);
      return true;
    } catch (err) {
      const errData = err.response?.data;
      const message =
        errData?.message ||
        errData?.error ||
        (errData && typeof errData === 'object'
          ? Object.values(errData).flat()[0]
          : null) ||
        'Registration failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { user, isAuthenticated, loading, error, login: handleLogin, register: handleRegister, logout };
};