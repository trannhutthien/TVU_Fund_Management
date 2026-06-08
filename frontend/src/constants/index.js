export * from './roles'
export * from './applicationStatus'
export * from './fundStatus'

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  UPDATE_PASSWORD: '/auth/update-password',

  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,

  // Applications
  APPLICATIONS: '/applications',
  APPLICATION_BY_ID: (id) => `/applications/${id}`,
  MY_APPLICATIONS: '/applications/my-applications',
  AI_SUGGEST: '/applications/ai-suggest',
  APPROVE_LEVEL_1: (id) => `/applications/${id}/approve-level-1`,
  REJECT_LEVEL_1: (id) => `/applications/${id}/reject-level-1`,
  APPROVE_LEVEL_2: (id) => `/applications/${id}/approve-level-2`,
  REJECT_LEVEL_2: (id) => `/applications/${id}/reject-level-2`,
  APPROVE_LEVEL_3: (id) => `/applications/${id}/approve-level-3`,
  REJECT_LEVEL_3: (id) => `/applications/${id}/reject-level-3`,

  // Funds
  FUNDS: '/funds',
  FUND_BY_ID: (id) => `/funds/${id}`,

  // Donations
  DONATIONS: '/donations',
  DONATION_BY_ID: (id) => `/donations/${id}`,

  // Donors
  DONORS: '/donors',
  DONOR_BY_ID: (id) => `/donors/${id}`,

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id) => `/transactions/${id}`,

  // Roles
  ROLES: '/roles',
}
