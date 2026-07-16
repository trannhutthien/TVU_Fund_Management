import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

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

      checkTokenExpiry: () => {
        const { token, isAuthenticated } = get();
        if (isAuthenticated && isTokenExpired(token)) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('refreshToken');
          return true;
        }
        return false;
      },

      getUser: () => get().user,
      getToken: () => get().token,
      isAuth: () => get().isAuthenticated,
      getUserRole: () => get().user?.vaiTro || null,

      hasRole: (role) => {
        const userRole = get().user?.vaiTro;
        if (Array.isArray(role)) {
          return role.includes(userRole);
        }
        return userRole === role;
      },

      hasPermission: (permission) => {
        const user = get().user;
        return user?.permissions?.includes(permission) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
