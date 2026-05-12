import apiClient from '../../../lib/axios';

// Laporan
export const getLaporan = async (params: any) => {
  const response = await apiClient.get('/admin/reports', { params });
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

// Members
export const getMembers = async () => {
  const response = await apiClient.get('/admin/members');
  return response.data;
};

// Bookings / Antrian
export const getAllBookings = async () => {
  const response = await apiClient.get('/admin/bookings/all');
  return response.data;
};

export const updateBookingStatus = async (id: number | string, status: string) => {
  const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
  return response.data;
};

// Campaigns
export const getAdminCampaigns = async (query = '') => {
  const response = await apiClient.get(`/admin/campaigns${query}`);
  return response.data;
};

export const createAdminCampaign = async (data: FormData | any) => {
  const response = await apiClient.post('/admin/campaigns', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return response.data;
};

export const updateAdminCampaign = async (id: number | string, data: any) => {
  const response = await apiClient.put(`/admin/campaigns/${id}`, data);
  return response.data;
};

export const deleteAdminCampaign = async (id: number | string) => {
  const response = await apiClient.delete(`/admin/campaigns/${id}`);
  return response.data;
};

// Services
export const getAdminServices = async () => {
  const response = await apiClient.get('/admin/services');
  return response.data;
};

// Profile/Settings
export const getShopSettings = async () => {
  const response = await apiClient.get('/admin/settings');
  return response.data;
};

export const updateShopSettings = async (data: any) => {
  const response = await apiClient.post('/admin/settings', data);
  return response.data;
};
