import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ConfirmationIdentitasPage from './pages/KonfirmasiIdentitasPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import SetelahBookingPage from './pages/SetelahBookingPage'
import UserProfilePage from './pages/UserProfilePage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminQueuePage from './pages/admin/AdminAntrianPage'
import AdminSchedulePage from './pages/admin/AdminJadwalPage'
import AdminReportsPage from './pages/admin/AdminLaporanPage'
import AdminSettingsPage from './pages/admin/AdminPengaturanPage'
import AdminMemberPage from './pages/admin/AdminMemberPage'
import AdminPromotionsPage from './pages/admin/AdminPromosiPage'
import AdminServicePage from './pages/admin/AdminLayananPage'
import AdminBarberPage from './pages/admin/AdminBarberPage'
import ReschedulePage from './pages/ReschedulePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Page Konsumen ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/konfirmasi-identitas" element={<ConfirmationIdentitasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/setelah-booking" element={<SetelahBookingPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/reschedule/:id" element={<ReschedulePage />} />

        {/* ===== Page Admin ===== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="antrian" element={<AdminQueuePage />} />
          <Route path="jadwal" element={<AdminSchedulePage />} />
          <Route path="members" element={<AdminMemberPage />} />
          <Route path="layanan" element={<AdminServicePage />} />
          <Route path="barbers" element={<AdminBarberPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="laporan" element={<AdminReportsPage />} />
          <Route path="pengaturan" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
