import apiClient from '../../../lib/axios';

export const getCampaigns = async () => {
  const response = await apiClient.get('/campaigns');
  return response.data;
};
