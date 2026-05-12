import apiClient from '../../../lib/axios';

export const getServices = async () => {
  const response = await apiClient.get('/services');
  return response.data;
};
