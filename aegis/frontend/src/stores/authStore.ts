import { create } from 'zustand';
import api from '../services/api';

interface User {
  user_id: string;
  username: string;
  role: 'operator' | 'supervisor' | 'admin';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('aegis_token'),
  isAuthenticated: !!localStorage.getItem('aegis_token'),

  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    const { access_token, user } = data;
    localStorage.setItem('aegis_token', access_token);
    set({ token: access_token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('aegis_token');
    set({ token: null, user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));
