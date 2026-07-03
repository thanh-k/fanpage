import apiClient from './apiClient';
import localStorageService from './localStorageService';
import { STORAGE_KEYS } from '../utils/storageKeys';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:8080';

const normalizeAuthUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    avatar: user.avatar || null,
    name: user.name || 'Người dùng',
    gender: user.gender || 'PRIVATE'
  };
};

const saveAuth = (authData) => {
  const normalizedUser = normalizeAuthUser(authData.user);
  localStorageService.set(STORAGE_KEYS.AUTH_TOKEN, authData.token);
  localStorageService.set(STORAGE_KEYS.AUTH_USER, normalizedUser);
};

const authService = {
  async login(payload) {
    const response = await apiClient.post('/auth/login', payload);
    saveAuth(response.data);
    return normalizeAuthUser(response.data.user);
  },

  async requestRegisterOtp(payload) {
    const response = await apiClient.post('/auth/register/request', payload);
    return response.data;
  },

  async verifyRegisterOtp(payload) {
    const response = await apiClient.post('/auth/register/verify', payload);
    saveAuth(response.data);
    return normalizeAuthUser(response.data.user);
  },

  async requestPasswordResetOtp(payload) {
    const response = await apiClient.post('/auth/password-reset/request', payload);
    return response.data;
  },

  async confirmPasswordReset(payload) {
    const response = await apiClient.post('/auth/password-reset/confirm', payload);
    return response.data;
  },

  async loginWithGoogleToken(token) {
    localStorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);

    try {
      const user = await this.getCurrentUserFromServer();
      return user;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  getGoogleLoginUrl() {
    return `${SERVER_BASE_URL}/oauth2/authorization/google`;
  },

  async getCurrentUserFromServer() {
    const response = await apiClient.get('/auth/me');
    const normalizedUser = normalizeAuthUser(response.data);
    localStorageService.set(STORAGE_KEYS.AUTH_USER, normalizedUser);
    return normalizedUser;
  },

  getCurrentUser() {
    return normalizeAuthUser(localStorageService.get(STORAGE_KEYS.AUTH_USER, null));
  },

  getToken() {
    return localStorageService.get(STORAGE_KEYS.AUTH_TOKEN, null);
  },

  logout() {
    localStorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    localStorageService.remove(STORAGE_KEYS.AUTH_USER);
  }
};

export default authService;
