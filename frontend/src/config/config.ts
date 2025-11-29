// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: 'http://localhost:8000',

  // API Endpoints
  ENDPOINTS: {
    REGISTER: '/register',
    LOGIN: '/login',
  },

  // Request timeout in milliseconds
  TIMEOUT: 10000,
} as const;

// Environment check
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
