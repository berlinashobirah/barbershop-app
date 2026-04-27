import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        loginId,
        password
      })
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Navigate to admin if role is admin, otherwise home/member dashboard
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login gagal. Silakan periksa kembali data Anda.')
    }
  }

  return (
    <div className="dark bg-surface text-on-surface font-body min-h-screen selection:bg-primary selection:text-on-primary">
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl min-h-[700px]">

          {/* Left Side: Visual/Branding */}
          <div className="hidden lg:relative lg:flex flex-col justify-end p-12 overflow-hidden group">
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Interior of a luxury barbershop with leather chairs, dark wood cabinetry, and warm vintage lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEZ9JRCUjMJgSM82pEY_Z6OrkYImLC6XH6oh7HHhrw3yHNF_x3OiBy9Rze9NhpPLa9gr4oD1awSfs3XNY-g7O8tFbVsqHcb9E6i3ADThSpZd0TXviqZ99yqPp9wyIzFUJ4T2H6q2UEqkNNsiJbtNn-CU8-Wo7nLJFGJqfrHHtDhiM4jkQRp4GvPHO6f5Fqvy3GCiRkRn84yzrJFMzjkfR9LK5bfMiHgdKJvzxHBV31MSTp2gmvzAef8tUlwsBt1wV6eEKIxyKwjI0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
            <div className="relative z-10 space-y-4">
              <span className="text-primary font-headline italic text-lg">Since 2012</span>
              <h1 className="text-5xl font-headline font-bold text-on-surface leading-tight">
                Precision in Every Cut, Luxury in Every Detail.
              </h1>
              <p className="text-secondary max-w-md font-body leading-relaxed">
                Join our exclusive circle of gentlemen. Experience the pinnacle of grooming where tradition meets contemporary artistry.
              </p>
            </div>
          </div>

          {/* Right Side: Auth Forms */}
          <div className="flex flex-col justify-center p-8 md:p-16 bg-surface-container-low">
            <div className="w-full max-w-md mx-auto space-y-8">

              {/* Tabs Header */}
              <div className="flex items-center justify-start gap-8 mb-4">
                <button className="text-2xl font-headline font-bold text-primary border-b-2 border-primary pb-2">
                  Log In
                </button>
                <Link
                  to="/register"
                  className="text-2xl font-headline font-bold text-secondary/40 hover:text-secondary transition-colors pb-2"
                >
                  Create Account
                </Link>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-on-surface-variant font-label tracking-wide uppercase"
                  >
                    Email / WhatsApp
                  </label>
                  <input
                    id="login-email"
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                    placeholder="email / 0812..."
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-on-surface-variant font-label tracking-wide uppercase"
                    >
                      Password
                    </label>
                    <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot Password?</a>
                  </div>
                  <input
                    id="login-password"
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10"
                >
                  Continue Journey
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative py-4 flex items-center">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-xs font-label text-outline-variant uppercase tracking-[0.2em]">Or access with</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="btn-google-login"
                  type="button"
                  className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-colors font-label text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                  </svg>
                  Google
                </button>
                <button
                  id="btn-apple-login"
                  type="button"
                  className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-colors font-label text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75 1.18-.02 2.31-.93 3.57-.84 1.51.1 2.65.65 3.33 1.58-3.25 1.88-2.69 6.28.58 7.58-.69 1.68-1.57 3.31-2.56 3.9M12.03 7.25c-.02-2.23 1.83-4.07 4.08-4.25.26 2.56-2.14 4.41-4.08 4.25" fill="currentColor"/>
                  </svg>
                  Apple
                </button>
              </div>

              {/* Footnote */}
              <p className="text-center text-xs text-secondary/60 font-body">
                By continuing, you agree to The Modern Artisan's <br />
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>

              <p className="text-center text-sm text-secondary/60">
                Belum punya akun?{' '}
                <Link to="/register" className="text-primary hover:underline font-semibold">Daftar di sini</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Member Badge Toast */}
      <div className="fixed bottom-8 right-8 bg-surface-container-high border border-primary/20 px-6 py-4 rounded-lg hidden md:flex items-center gap-4 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">verified</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Member Exclusive</p>
          <p className="text-xs text-secondary">Log in to unlock priority booking.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
