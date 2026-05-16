import apiClient from '../../../lib/axios';

export const getAvailability = async (dateStr: string) => {
  const response = await apiClient.get(`/slots/availability?date=${dateStr}`);
  return response.data;
};

export const createGuestBooking = async (bookingData: any) => {
  const response = await apiClient.post('/guest/bookings', bookingData);
  return response.data;
};

export const createMemberBooking = async (bookingData: any) => {
  const response = await apiClient.post('/member/bookings', bookingData);
  return response.data;
};

export const getBookingPayment = async (uniqueCode: number | string, isGuest = false) => {
  const url = isGuest 
    ? `/bookings/${uniqueCode}/payment/guest` 
    : `/bookings/${uniqueCode}/payment`;
  const response = await apiClient.post(url);
  return response.data;
};

export const verifyBookingPayment = async (uniqueCode: number | string) => {
  const response = await apiClient.post(`/bookings/${uniqueCode}/verify-payment`);
  return response.data;
};

export const rescheduleBooking = async (uniqueCode: number | string, data: any) => {
  const response = await apiClient.post(`/bookings/${uniqueCode}/reschedule`, data);
  return response.data;
};

export const sendBookingWhatsapp = async (uniqueCode: number | string, phone: string) => {
  const response = await apiClient.post(`/bookings/${uniqueCode}/send-whatsapp`, { phone });
  return response.data;
};

export const sendBookingTicketEmail = async (uniqueCode: number | string) => {
  const response = await apiClient.post(`/bookings/${uniqueCode}/send-ticket-email`);
  return response.data;
};
