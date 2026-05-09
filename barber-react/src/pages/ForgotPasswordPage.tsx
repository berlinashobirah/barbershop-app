import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import LoadingScreen from '../components/LoadingScreen'
import AlertModal from '../components/AlertModal'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean
    message: string
    type: 'success' | 'error' | 'info'
    onClose?: () => void
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  })

  const showAlert = (message: string, type: 'success' | 'error' | 'info', onClose?: () => void) => {
    setAlertConfig({ isOpen: true, message, type, onClose })
  }

  const closeAlert = () => {
    const cb = alertConfig.onClose
    setAlertConfig({ ...alertConfig, isOpen: false })
    if (cb) cb()
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showAlert('Silakan masukkan alamat email Anda.', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password/request', { email })
      showAlert(response.data.message || 'Kode verifikasi telah berhasil dikirim ke email Anda.', 'success', () => {
        setStep(2)
      })
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Gagal memproses permintaan. Pastikan email terdaftar.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      showAlert('Silakan masukkan kode verifikasi 6 digit dengan benar.', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password/verify', { email, code })
      showAlert(response.data.message || 'Kode verifikasi cocok.', 'success', () => {
        setStep(3)
      })
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Kode verifikasi salah atau sudah kadaluarsa.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      showAlert('Kata sandi minimal harus terdiri dari 6 karakter.', 'error')
      return
    }
    if (password !== passwordConfirmation) {
      showAlert('Konfirmasi kata sandi tidak cocok.', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password/reset', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation
      })
      showAlert(response.data.message || 'Kata sandi Anda telah berhasil diperbarui.', 'success', () => {
        navigate('/login')
      })
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Gagal memperbarui kata sandi. Silakan coba kembali.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark bg-surface text-on-surface font-body min-h-screen selection:bg-primary selection:text-on-primary">
      {loading && <LoadingScreen />}
      
      {/* TopAppBar */}
      <header className="bg-[#131313]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <nav className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto w-full">
          <Link to="/" className="text-xl font-headline italic tracking-wide text-primary">
            The Modern Artisan
          </Link>
          <div className="hidden md:flex items-center gap-x-8">
            <Link to="/" className="text-secondary hover:text-primary transition-colors font-label">Home</Link>
            <Link to="/" className="text-secondary hover:text-primary transition-colors font-label">Services</Link>
            <Link to="/" className="text-secondary hover:text-primary transition-colors font-label">Gallery</Link>
          </div>
          <Link
            to="/booking"
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm tracking-wider uppercase hover:opacity-80 transition-opacity active:scale-95 duration-200"
          >
            Book Now
          </Link>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-88px)] flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl min-h-[600px]">

          {/* Left Side: Visual/Branding */}
          <div className="hidden lg:relative lg:flex flex-col justify-end p-12 overflow-hidden group">
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
              alt="Interior of a luxury barbershop"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEZ9JRCUjMJgSM82pEY_Z6OrkYImLC6XH6oh7HHhrw3yHNF_x3OiBy9Rze9NhpPLa9gr4oD1awSfs3XNY-g7O8tFbVsqHcb9E6i3ADThSpZd0TXviqZ99yqPp9wyIzFUJ4T2H6q2UEqkNNsiJbtNn-CU8-Wo7nLJFGJqfrHHtDhiM4jkQRp4GvPHO6f5Fqvy3GCiRkRn84yzrJFMzjkfR9LK5bfMiHgdKJvzxHBV31MSTp2gmvzAef8tUlwsBt1wV6eEKIxyKwjI0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
            <div className="relative z-10 space-y-4">
              <span className="text-primary font-headline italic text-lg">Since 2012</span>
              <h1 className="text-4xl font-headline font-bold text-on-surface leading-tight">
                Secure Your Journey, Re-Access Elegance.
              </h1>
              <p className="text-secondary max-w-md font-body leading-relaxed text-sm">
                Keamanan adalah prioritas kami. Ikuti langkah sederhana untuk memulihkan akses lengkap ke profil grooming premium Anda.
              </p>
            </div>
          </div>

          {/* Right Side: Step Forms */}
          <div className="flex flex-col justify-center p-8 md:p-16 bg-surface-container-low">
            <div className="w-full max-w-md mx-auto space-y-8">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary text-xs uppercase tracking-widest font-bold">Langkah {step} dari 3</span>
                <div className="flex gap-2">
                  <span className={`w-3 h-1.5 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-container-highest'}`} />
                  <span className={`w-3 h-1.5 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container-highest'}`} />
                  <span className={`w-3 h-1.5 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-container-highest'}`} />
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Lupa Kata Sandi</h2>
                    <p className="text-secondary text-sm leading-relaxed">
                      Masukkan alamat email terdaftar Anda di bawah ini. Kami akan mengirimkan 6 digit kode verifikasi untuk memvalidasi identitas Anda.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleRequestReset}>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-outline">
                        Alamat Email Anda
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline-variant transition-all outline-none text-sm"
                        placeholder="contoh@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-[#3d2f00] font-bold rounded-lg tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      Kirim Kode Verifikasi
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => setStep(1)} className="text-primary hover:underline flex items-center text-xs">
                        <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Kembali ke Email
                      </button>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Verifikasi Email Anda</h2>
                    <p className="text-secondary text-sm leading-relaxed">
                      Kami telah mengirimkan 6 digit kode verifikasi ke email <strong className="text-on-surface">{email}</strong>. Silakan masukkan kode tersebut di bawah ini.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleVerifyCode}>
                    <div className="space-y-2">
                      <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-outline">
                        Kode Verifikasi 6-Digit
                      </label>
                      <input
                        id="code"
                        type="text"
                        maxLength={6}
                        className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 text-center tracking-[1em] text-lg font-mono text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-[#3d2f00] font-bold rounded-lg tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      Verifikasi Kode
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">check_circle</span>
                    </button>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Atur Ulang Kata Sandi</h2>
                    <p className="text-secondary text-sm leading-relaxed">
                      Identitas Anda berhasil diverifikasi. Masukkan kata sandi baru Anda di bawah ini untuk mereset akun Anda.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleResetPassword}>
                    <div className="space-y-2">
                      <label htmlFor="pw" className="block text-xs font-semibold uppercase tracking-wider text-outline">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <input
                          id="pw"
                          type={showPassword ? 'text' : 'password'}
                          className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 pr-12 text-on-surface placeholder:text-outline-variant transition-all outline-none text-sm"
                          placeholder="Minimal 6 karakter"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                        >
                          <span className="material-symbols-outlined select-none text-xl">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="pw_conf" className="block text-xs font-semibold uppercase tracking-wider text-outline">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <input
                          id="pw_conf"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 pr-12 text-on-surface placeholder:text-outline-variant transition-all outline-none text-sm"
                          placeholder="Ulangi kata sandi baru"
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                        >
                          <span className="material-symbols-outlined select-none text-xl">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-[#3d2f00] font-bold rounded-lg tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      Simpan Kata Sandi Baru
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">lock_reset</span>
                    </button>
                  </form>
                </div>
              )}

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-outline hover:text-primary transition-colors">
                  Kembali ke halaman Login
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      <AlertModal
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </div>
  )
}

export default ForgotPasswordPage
