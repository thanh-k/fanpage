import apiClient from './apiClient';

const normalizeMedia = (mediaList = []) => {
  const images = mediaList.filter((item) => item.type === 'IMAGE').map((item) => item.url);
  const videos = mediaList.filter((item) => item.type === 'VIDEO').map((item) => item.url);

  return {
    images,
    videos,
    mediaItems: mediaList.map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type === 'IMAGE' ? 'image' : 'video',
      sortOrder: item.sortOrder
    }))
  };
};

const normalizeComments = (comments = []) =>
  comments.map((comment) => ({
    ...comment,
    author: comment.author
  }));

export const normalizePost = (post) => {
  const normalizedMedia = normalizeMedia(post.media || []);

  return {
    ...post,
    userId: post.authorId || post.author?.id || null,
    author: post.author,
    displayAuthorName: post.authorDisplayName,
    likesCount: post.likesCount || 0,
    commentCount: post.commentCount || 0,
    isLikedByCurrentUser: post.likedByCurrentUser || false,
    currentReactionType: post.currentReactionType || null,
    reactionCounts: post.reactionCounts || {},
    comments: normalizeComments(post.comments || []),
    ...normalizedMedia
  };
};

const postService = {
  async getFeed({ page = 0, size = 8 } = {}) {
    const response = await apiClient.get(`/posts?page=${page}&size=${size}`);
    return {
      ...response.data,
      items: (response.data.items || []).map(normalizePost)
    };
  },

  async getPostById(postId) {
    const response = await apiClient.get(`/posts/${postId}`);
    return normalizePost(response.data);
  },

  async getMyPosts({ page = 0, size = 50 } = {}) {
    const response = await apiClient.get(`/posts/me?page=${page}&size=${size}`);
    return {
      ...response.data,
      items: (response.data.items || []).map(normalizePost)
    };
  },

  async getPublicPostsByUserId(userId, { page = 0, size = 50 } = {}) {
    const response = await apiClient.get(`/users/${userId}/posts/public?page=${page}&size=${size}`);
    return {
      ...response.data,
      items: (response.data.items || []).map(normalizePost)
    };
  },

  async createPost({ content, isAnonymous, images = [], videos = [] }) {
    const formData = new FormData();

    if (content) {
      formData.append('content', content);
    }

    formData.append('isAnonymous', isAnonymous ? 'true' : 'false');

    images.forEach((imageFile) => {
      formData.append('images', imageFile);
    });

    videos.forEach((videoFile) => {
      formData.append('videos', videoFile);
    });

    const response = await apiClient.postForm('/posts', formData);
    return normalizePost(response.data);
  },

  async toggleLike(postId, reactionType = 'LIKE') {
    const response = await apiClient.post(`/posts/${postId}/like-toggle`, { reactionType });
    return response.data;
  },

  async getReactionUsers(postId) {
    const response = await apiClient.get(`/posts/${postId}/reactions/users`);
    return response.data || [];
  },

  async updatePost(postId, { content, isAnonymous, images = [], videos = [], keepExistingMedia = true }) {
    if (images.length || videos.length || keepExistingMedia === false) {
      const formData = new FormData();
      formData.append('content', content || '');
      formData.append('isAnonymous', isAnonymous ? 'true' : 'false');
      formData.append('keepExistingMedia', keepExistingMedia ? 'true' : 'false');
      images.forEach((file) => formData.append('images', file));
      videos.forEach((file) => formData.append('videos', file));
      const response = await apiClient.patchForm(`/posts/${postId}`, formData);
      return normalizePost(response.data);
    }
    const response = await apiClient.patch(`/posts/${postId}`, { content, isAnonymous });
    return normalizePost(response.data);
  },

  async deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  }
};

export default postService;
