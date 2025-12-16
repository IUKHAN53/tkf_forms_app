import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { parseApiError } from '../utils/errorDialogs';

// API URL is injected by EAS Build from environment variables
// For local development, falls back to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// Log the API URL in development for debugging
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    Accept: 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = parseApiError(error);
    
    // Log error details in development
    if (__DEV__) {
      console.warn('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        type: errorInfo.type,
        message: errorInfo.message,
      });
    }

    // Handle 401 - auto logout
    if (error.response?.status === 401) {
      const clearSession = useUserStore.getState().clearSession;
      clearSession();
    }

    return Promise.reject(error);
  },
);
