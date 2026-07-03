import apiClient from './apiClient';
import { getFallbackAvatar } from '../utils/media';

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    avatar: user.avatar || null,
    emailMasked: user.emailMasked || null,
    name: user.name || user.fullName || 'Người dùng',
    bio: user.bio || '',
    location: user.location || '',
    gender: user.gender || 'PRIVATE'
  };
};

const userService = {
  async getMyProfile() {
    const response = await apiClient.get('/users/me');
    return normalizeUser(response.data);
  },

  async getPublicUserProfile(userId) {
    const response = await apiClient.get(`/users/${userId}/public`);
    return normalizeUser(response.data);
  },

  async searchUsers(keyword) {
    const response = await apiClient.get(`/users/search?keyword=${encodeURIComponent(keyword || '')}`);
    return (response.data || []).map(normalizeUser);
  },

  async requestAccountDeletion(reason) {
    const response = await apiClient.post('/users/me/account-deletion-request', { reason });
    return response?.data ?? response;
  },

  async updateMyProfile(payload) {
    const formData = new FormData();
    formData.append('name', payload.name || '');
    formData.append('email', payload.email || '');
    formData.append('bio', payload.bio || '');
    formData.append('location', payload.location || '');
    formData.append('gender', payload.gender || 'PRIVATE');

    if (payload.avatarFile) {
      formData.append('avatarFile', payload.avatarFile);
    }

    const response = await apiClient.putForm('/users/me', formData);
    return normalizeUser(response.data);
  },

  getFallbackAvatar
};

export default userService;
