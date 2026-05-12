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

export const getBookingPayment = async (bookingId: number | string, isGuest = false) => {
  const url = isGuest 
    ? `/bookings/${bookingId}/payment/guest` 
    : `/bookings/${bookingId}/payment`;
  const response = await apiClient.post(url);
  return response.data;
};

export const verifyBookingPayment = async (bookingId: number | string) => {
  const response = await apiClient.post(`/bookings/${bookingId}/verify-payment`);
  return response.data;
};

export const rescheduleBooking = async (bookingId: number | string, data: any) => {
  const response = await apiClient.post(`/bookings/${bookingId}/reschedule`, data);
  return response.data;
};

export const sendBookingWhatsapp = async (bookingId: number | string, phone: string) => {
  const response = await apiClient.post(`/bookings/${bookingId}/send-whatsapp`, { phone });
  return response.data;
};

export const sendBookingTicketEmail = async (bookingId: number | string) => {
  const response = await apiClient.post(`/bookings/${bookingId}/send-ticket-email`);
  return response.data;
};
