import apiClient from '../../../lib/axios';

export const getUserProfile = async () => {
  const response = await apiClient.get('/user');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await apiClient.post('/user/profile', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return response.data;
};
