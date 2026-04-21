import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <div className="dark bg-surface text-on-surface font-body min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-[#131313] to-transparent">
        <div className="flex justify-between items-center px-6 py-6 w-full max-w-7xl mx-auto">
          <Link to="/" className="font-headline text-primary font-bold tracking-tighter text-2xl">The Modern Artisan</Link>
          <Link to="/" className="text-secondary hover:text-primary transition-colors text-sm font-label tracking-widest uppercase">Explore</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 md:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-2xl bg-surface-container-low">

          {/* Left: Benefits */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-end p-12 overflow-hidden min-h-[600px]">
            <div className="absolute inset-0 z-0">
              <img
                alt="Luxury barbershop interior"
                className="w-full h-full object-cover opacity-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtvBY9YFbSCXObSYk9P4OZbkLMkfHCoMW0VZKW_5zYgdd6jYCE2vt7opIebCB_FTWudZmVF2T6_BAZrhBa5FvNNBCnkigIypFXhpffhW2laXqOk7pPy4Nqr6YmH3s7arT93ZgW8pndDnVxxrjQTOEjksutpFHM6tmoAGCs1Tg4ElaTFMuydrAIxepAaOUK_MdJImVd3Dm8b-MbcWri9VOF4-5iVljx-QjjcpDrCl-g99rjvXYzWkmitGvRhzBh0vFhEOgQTN4yvIY"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-4xl text-primary mb-8 leading-tight">Elevate Your Grooming Standard</h2>
              <div className="space-y-6">
                {[
                  { icon: 'stars', title: 'Loyalty Points', desc: 'Earn rewards with every visit and redeem for premium treatments.' },
                  { icon: 'redeem', title: 'Exclusive Offers', desc: 'Early access to seasonal grooming packages and private atelier events.' },
                  { icon: 'event_available', title: 'Priority Booking', desc: "Skip the queue with our members-only digital concierge." },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-on-surface font-semibold text-lg">{item.title}</h4>
                      <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 bg-surface-container p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                <h1 className="font-headline text-3xl text-on-surface mb-2">Create Your Profile</h1>
                <p className="text-secondary font-label">Enter the sanctuary of refined grooming.</p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label htmlFor="reg-fullname" className="text-xs uppercase tracking-widest text-primary font-bold">Full Name</label>
                  <input id="reg-fullname" className="w-full bg-surface-container-highest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/30 py-4 px-0 transition-all outline-none" placeholder="Arthur Morgan" type="text" required />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs uppercase tracking-widest text-primary font-bold">Email Address</label>
                  <input id="reg-email" className="w-full bg-surface-container-highest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/30 py-4 px-0 transition-all outline-none" placeholder="artisan@luxury.com" type="email" required />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-whatsapp" className="text-xs uppercase tracking-widest text-primary font-bold">WhatsApp Number</label>
                  <div className="flex items-center gap-2 border-b-2 border-outline-variant focus-within:border-primary transition-all">
                    <span className="text-secondary/50 font-label px-2">+62</span>
                    <input id="reg-whatsapp" className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-secondary/30 py-4 px-0 outline-none" placeholder="812 3456 7890" type="tel" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="text-xs uppercase tracking-widest text-primary font-bold">Password</label>
                  <div className="relative">
                    <input id="reg-password" className="w-full bg-surface-container-highest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/30 py-4 px-0 transition-all outline-none" placeholder="••••••••" type={showPassword ? 'text' : 'password'} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <button id="btn-register-submit" type="submit" className="w-full py-4 rounded-lg text-on-primary font-bold tracking-widest uppercase text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #eac249 0%, #c5a028 100%)' }}>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </form>
              <div className="mt-10 pt-8 border-t border-outline-variant/30 text-center">
                <p className="text-secondary text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/10 pt-8">
          <div className="text-secondary/40 text-xs font-label uppercase tracking-widest">© 2024 The Modern Artisan. Established for Excellence.</div>
          <div className="flex gap-6">
            <a href="#" className="text-secondary/60 hover:text-primary transition-colors text-xs font-label uppercase tracking-tighter">Terms of Service</a>
            <a href="#" className="text-secondary/60 hover:text-primary transition-colors text-xs font-label uppercase tracking-tighter">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RegisterPage
