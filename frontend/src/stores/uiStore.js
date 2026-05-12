import { create } from 'zustand';

/**
 * UI Store - Quản lý UI state
 * Sidebar, theme, loading, modals, etc.
 */
const useUIStore = create((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Theme
  theme: 'light', // 'light' | 'dark'
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  // Global loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  // Modal state
  modals: {},
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  isModalOpen: (modalName) => (state) => state.modals[modalName] || false,
  
  // Breadcrumb
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  // Page title
  pageTitle: '',
  setPageTitle: (title) => set({ pageTitle: title }),
}));

export default useUIStore;
