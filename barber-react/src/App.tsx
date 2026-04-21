import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import KonfirmasiIdentitasPage from './pages/KonfirmasiIdentitasPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import SetelahBookingPage from './pages/SetelahBookingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/konfirmasi-identitas" element={<KonfirmasiIdentitasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/setelah-booking" element={<SetelahBookingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
