import apiClient from './apiClient';

const authProvidersService = {
  async getProviders() {
    const response = await apiClient.get('/auth/providers');
    return response.data;
  }
};

export default authProvidersService;
