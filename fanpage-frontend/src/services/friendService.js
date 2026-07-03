import apiClient from './apiClient';

const normalizeUser = (user) => ({
  ...user,
  avatar: user?.avatar || null,
  name: user?.name || user?.fullName || 'Người dùng',
  bio: user?.bio || '',
  friendshipStatus: user?.friendshipStatus || 'NONE'
});

const normalizeRequest = (request) => ({
  ...request,
  requester: normalizeUser(request.requester),
  addressee: normalizeUser(request.addressee)
});

const friendService = {
  async getFriends() {
    const response = await apiClient.get('/friends');
    return (response.data || []).map(normalizeUser);
  },

  async getReceivedRequests() {
    const response = await apiClient.get('/friends/requests/received');
    return (response.data || []).map(normalizeRequest);
  },

  async getSentRequests() {
    const response = await apiClient.get('/friends/requests/sent');
    return (response.data || []).map(normalizeRequest);
  },

  async sendRequest(userId) {
    const response = await apiClient.post(`/friends/requests/${userId}`, {});
    return normalizeRequest(response.data);
  },

  async acceptRequest(requestId) {
    const response = await apiClient.post(`/friends/requests/${requestId}/accept`, {});
    return normalizeRequest(response.data);
  },

  async rejectRequest(requestId) {
    return apiClient.post(`/friends/requests/${requestId}/reject`, {});
  },

  async removeFriend(userId) {
    return apiClient.delete(`/friends/${userId}`);
  }
};

export default friendService;
