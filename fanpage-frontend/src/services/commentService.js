import apiClient from './apiClient';

const commentService = {
  async getCommentsByPost(postId) {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data || [];
  },

  async createComment({ postId, content, parentId = null }) {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content, parentId });
    return response.data;
  }
};

export default commentService;
