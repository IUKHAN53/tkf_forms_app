import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn('API error', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  },
);
