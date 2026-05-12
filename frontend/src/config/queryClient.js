import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 * Cấu hình global cho data fetching, caching, và synchronization
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Thời gian cache data (5 phút)
      staleTime: 5 * 60 * 1000,
      
      // Thời gian giữ cache khi không sử dụng (10 phút)
      cacheTime: 10 * 60 * 1000,
      
      // Tự động refetch khi window focus
      refetchOnWindowFocus: false,
      
      // Tự động refetch khi reconnect
      refetchOnReconnect: true,
      
      // Số lần retry khi request fail
      retry: 1,
      
      // Delay giữa các lần retry (ms)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Số lần retry cho mutations
      retry: 0,
    },
  },
});

/**
 * Query Keys - Tổ chức keys cho React Query
 * Giúp dễ dàng invalidate và refetch data
 */
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
  },
  
  // Users
  users: {
    all: ['users'],
    list: (filters) => ['users', 'list', filters],
    detail: (id) => ['users', 'detail', id],
    byRole: (role) => ['users', 'role', role],
  },
  
  // Applications (Đơn yêu cầu)
  applications: {
    all: ['applications'],
    list: (filters) => ['applications', 'list', filters],
    detail: (id) => ['applications', 'detail', id],
    byStatus: (status) => ['applications', 'status', status],
    myApplications: ['applications', 'my'],
    pending: ['applications', 'pending'],
  },
  
  // Funds (Quỹ)
  funds: {
    all: ['funds'],
    list: (filters) => ['funds', 'list', filters],
    detail: (id) => ['funds', 'detail', id],
    active: ['funds', 'active'],
  },
  
  // Donations (Tài trợ)
  donations: {
    all: ['donations'],
    list: (filters) => ['donations', 'list', filters],
    detail: (id) => ['donations', 'detail', id],
    byFund: (fundId) => ['donations', 'fund', fundId],
  },
  
  // Donors (Nhà tài trợ)
  donors: {
    all: ['donors'],
    list: (filters) => ['donors', 'list', filters],
    detail: (id) => ['donors', 'detail', id],
  },
  
  // Transactions (Giao dịch)
  transactions: {
    all: ['transactions'],
    list: (filters) => ['transactions', 'list', filters],
    detail: (id) => ['transactions', 'detail', id],
    byUser: (userId) => ['transactions', 'user', userId],
  },
  
  // Roles
  roles: {
    all: ['roles'],
    list: ['roles', 'list'],
  },
  
  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'],
    charts: (type) => ['dashboard', 'charts', type],
  },
};
