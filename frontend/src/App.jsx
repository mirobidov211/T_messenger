import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './components/layout/PrivateRoute';
import { useAuthStore } from './store/authStore';
import { getUserApi } from './api/auth';
import { useEffect } from 'react';

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    loadUser();
    const token = useAuthStore.getState().accessToken;
    if (token) {
      getUserApi()
        .then((userData) => {
          if (userData) {
            useAuthStore.getState().updateUser(userData);
          }
        })
        .catch((e) => {
          console.warn("Could not load fresh user profile:", e);
        });
    }
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

export default App;