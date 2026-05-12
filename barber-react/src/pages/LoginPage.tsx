import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import LoadingScreen from '../components/LoadingScreen'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        loginId,
        password
      })
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Beritahu Navbar agar langsung update (tanpa page reload)
      window.dispatchEvent(new Event('auth-change'))

      // Navigate to admin if role is admin, otherwise home/member dashboard
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please double-check your data.')
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
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary rounded-lg p-4 pr-12 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
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
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue Journey'}
                  {!loading && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
              </form>

              <p className="text-center text-sm text-secondary/60">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-semibold">Register here</Link>
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
