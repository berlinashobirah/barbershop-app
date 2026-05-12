import apiClient from '../../../lib/axios';

export const login = async (data: any) => {
  const response = await apiClient.post('/login', data);
  return response.data;
};

export const register = async (data: any) => {
  const response = await apiClient.post('/register', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/user');
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/forgot-password/request', { email });
  return response.data;
};

export const verifyPasswordResetCode = async (email: string, code: string) => {
  const response = await apiClient.post('/forgot-password/verify', { email, code });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await apiClient.post('/forgot-password/reset', data);
  return response.data;
};
