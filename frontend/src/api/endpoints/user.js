import apiClient from '../client';

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getMyOrders: () => apiClient.get('/user/orders'),
  getMyOrderDetail: (id) => apiClient.get(`/user/orders/${id}`),
  getOrderTracking: (id) => apiClient.get(`/user/orders/${id}/tracking`),
};

export default userApi;

