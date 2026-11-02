import apiClient from '../client';

export const adminApi = {
  getDashboardSummary: () => apiClient.get('/admin/dashboard'),
};

export default adminApi;

