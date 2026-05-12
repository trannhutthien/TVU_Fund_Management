import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store - Quản lý authentication state
 * Sử dụng Zustand với persist middleware để lưu vào localStorage
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      isAuth: () => get().isAuthenticated,
      getUserRole: () => get().user?.VaiTro || null,
      
      // Check permissions
      hasRole: (role) => {
        const userRole = get().user?.VaiTro;
        if (Array.isArray(role)) {
          return role.includes(userRole);
        }
        return userRole === role;
      },
      
      hasPermission: (permission) => {
        const user = get().user;
        // Implement permission logic based on your needs
        return user?.permissions?.includes(permission) || false;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Chỉ persist những field này
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
