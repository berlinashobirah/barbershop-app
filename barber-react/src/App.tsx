import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import KonfirmasiIdentitasPage from './pages/KonfirmasiIdentitasPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import SetelahBookingPage from './pages/SetelahBookingPage'
import UserProfilePage from './pages/UserProfilePage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminAntrianPage from './pages/admin/AdminAntrianPage'
import AdminJadwalPage from './pages/admin/AdminJadwalPage'
import AdminLaporanPage from './pages/admin/AdminLaporanPage'
import AdminPengaturanPage from './pages/admin/AdminPengaturanPage'
import AdminMemberPage from './pages/admin/AdminMemberPage'
import AdminPromosiPage from './pages/admin/AdminPromosiPage'
import AdminLayananPage from './pages/admin/AdminLayananPage'
import AdminBarberPage from './pages/admin/AdminBarberPage'
import ReschedulePage from './pages/ReschedulePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Halaman Konsumen ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/konfirmasi-identitas" element={<KonfirmasiIdentitasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/setelah-booking" element={<SetelahBookingPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/reschedule/:id" element={<ReschedulePage />} />

        {/* ===== Halaman Admin ===== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="antrian" element={<AdminAntrianPage />} />
          <Route path="jadwal" element={<AdminJadwalPage />} />
          <Route path="members" element={<AdminMemberPage />} />
          <Route path="layanan" element={<AdminLayananPage />} />
          <Route path="barbers" element={<AdminBarberPage />} />
          <Route path="promotions" element={<AdminPromosiPage />} />
          <Route path="laporan" element={<AdminLaporanPage />} />
          <Route path="pengaturan" element={<AdminPengaturanPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
