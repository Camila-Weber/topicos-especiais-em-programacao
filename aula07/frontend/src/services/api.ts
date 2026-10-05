import axios from 'axios';
import { useAuthStore } from '../stores/auth-store';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED') {
      useAuthStore.getState().clearSession();
      window.sessionStorage.setItem(
        'ditado.sessionMessage',
        'Sua sessao expirou por seguranca. Entre novamente.',
      );

      if (window.location.pathname !== '/entrar') {
        window.location.assign('/entrar');
      }
    }

    return Promise.reject(error);
  },
);
