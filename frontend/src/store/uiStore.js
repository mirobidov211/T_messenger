import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  currentView: 'chats', // 'chats' | 'profile' | 'settings'
  isDrawerOpen: false,
  isEditingProfile: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setCurrentView: (view) => set({ currentView: view }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setIsEditingProfile: (isEditing) => set({ isEditingProfile: isEditing }),
}));