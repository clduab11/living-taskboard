import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  getProfile: () =>
    api.get('/api/auth/profile'),

  updateProfile: (updates: any) =>
    api.patch('/api/auth/profile', updates),
};

export const boardAPI = {
  create: (data: any) =>
    api.post('/api/boards', data),

  getAll: () =>
    api.get('/api/boards'),

  getById: (id: string) =>
    api.get(`/api/boards/${id}`),

  update: (id: string, data: any) =>
    api.patch(`/api/boards/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/boards/${id}`),

  share: (id: string, email: string, role: string) =>
    api.post(`/api/boards/${id}/share`, { email, role }),
};

export const aiAPI = {
  generate: (prompt: string, type: string, context?: any) =>
    api.post('/api/ai/generate', { prompt, type, context }),
};
