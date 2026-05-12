import apiClient from '../../../lib/axios';

export const getBarbers = async () => {
  const response = await apiClient.get('/barbers');
  return response.data;
};

export const getAvailableBarbers = async (date: string, time: string) => {
  const response = await apiClient.get(`/barbers/available?date=${date}&time=${time}`);
  return response.data;
};
