import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  return { user, token, isAuthenticated, login, logout };
}
