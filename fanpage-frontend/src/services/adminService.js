import apiClient from './apiClient';

const unwrap = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response?.data ?? response;
};

const toItems = (data) => Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
const pageQuery = (page = 0, size = 1000) => `?page=${page}&size=${size}`;

const adminService = {
  async getStats() { return unwrap(await apiClient.get('/admin/dashboard/stats')); },
  async getUsers(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/users${pageQuery(page, size)}`))); },
  async getStaff(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/staff${pageQuery(page, size)}`))); },
  async getPermissions() { return unwrap(await apiClient.get('/admin/permissions')); },
  async getRoles(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/roles${pageQuery(page, size)}`))); },
  async createRole(payload) { return unwrap(await apiClient.post('/admin/roles', payload)); },
  async updateRole(roleId, payload) { return unwrap(await apiClient.put(`/admin/roles/${roleId}`, payload)); },
  async deleteRole(roleId) { return unwrap(await apiClient.delete(`/admin/roles/${roleId}`)); },
  async assignStaffRole(userId, roleId) { return unwrap(await apiClient.patch(`/admin/staff/${userId}/staff-role`, { roleId })); },
  async removeStaff(userId) { return unwrap(await apiClient.delete(`/admin/staff/${userId}`)); },
  async changeUserRole(userId, role) { return unwrap(await apiClient.patch(`/admin/users/${userId}/role`, { role })); },
  async lockUser(userId, payload) { return unwrap(await apiClient.patch(`/admin/users/${userId}/lock`, payload)); },
  async unlockUser(userId) { return unwrap(await apiClient.patch(`/admin/users/${userId}/unlock`, {})); },
  async getAccountDeletionRequests(status = 'ALL', page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/account-deletion-requests${pageQuery(page, size)}&status=${encodeURIComponent(status)}`))); },
  async approveAccountDeletionRequest(requestId) { return unwrap(await apiClient.patch(`/admin/account-deletion-requests/${requestId}/approve`, {})); },
  async rejectAccountDeletionRequest(requestId, adminNote = '') { return unwrap(await apiClient.patch(`/admin/account-deletion-requests/${requestId}/reject`, { adminNote })); },
  async getPosts(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/posts${pageQuery(page, size)}`))); },
  async updatePostStatus(postId, status) { return unwrap(await apiClient.patch(`/admin/posts/${postId}/status`, { status })); },
  async deletePost(postId, reason = '') { return unwrap(await apiClient.delete(`/admin/posts/${postId}`, { reason })); },
  async getComments(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/comments${pageQuery(page, size)}`))); },
  async deleteComment(commentId) { return unwrap(await apiClient.delete(`/admin/comments/${commentId}`)); },
  async getReports(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/reports${pageQuery(page, size)}`))); },
  async resolveReport(reportId, payload) { return unwrap(await apiClient.patch(`/admin/reports/${reportId}`, payload)); },
  async getBannedWords(page = 0, size = 1000) { return toItems(unwrap(await apiClient.get(`/admin/banned-words${pageQuery(page, size)}`))); },
  async addBannedWord(payload) { return unwrap(await apiClient.post('/admin/banned-words', payload)); },
  async deleteBannedWord(id) { return unwrap(await apiClient.delete(`/admin/banned-words/${id}`)); }
};

export default adminService;
