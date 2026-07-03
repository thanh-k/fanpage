import apiClient from './apiClient';
import { normalizePost } from './postService';

const searchService = {
  async globalSearch(keyword) {
    const response = await apiClient.get(`/search?q=${encodeURIComponent(keyword)}`);
    return {
      users: response.data?.users || [],
      posts: (response.data?.posts || []).map(normalizePost)
    };
  }
};
export default searchService;
