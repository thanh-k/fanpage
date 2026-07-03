import apiClient from './apiClient';

const reportService = {
  async createReport(payload) {
    const response = await apiClient.post('/reports', payload);
    return response.data;
  }
};

export default reportService;
