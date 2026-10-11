import { create } from 'zustand';
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
);