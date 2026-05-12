import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePublicSettings } from '../../hooks/usePublicSettings'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/antrian', icon: 'receipt_long', label: 'Manage Bookings' },
  { to: '/admin/jadwal', icon: 'calendar_month', label: 'Barber Schedule' },
  { to: '/admin/members', icon: 'group', label: 'Manage Members' },
  { to: '/admin/layanan', icon: 'content_cut', label: 'Manage Services' },
  { to: '/admin/barbers', icon: 'face', label: 'Manage Barbers' },
  { to: '/admin/promotions', icon: 'confirmation_number', label: 'Promotions & Diskon' },
  { to: '/admin/laporan', icon: 'analytics', label: 'Reports' },
  { to: '/admin/pengaturan', icon: 'settings', label: 'Settings' },
]

interface SimpleBooking {
  id: number
  unique_code: string
  customer_name: string
  service_name: string
  booking_time: string
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const settings = usePublicSettings()
  
  // Real-time Booking Notification States
  const knownIdsRef = useRef<number[]>([])
  const [newBooking, setNewBooking] = useState<SimpleBooking | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [recentBookings, setRecentBookings] = useState<SimpleBooking[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const getToken = () => localStorage.getItem('auth_token')

  useEffect(() => {
    let active = true

    const checkNewBookings = async (isFirstRun = false) => {
      const token = getToken()
      if (!token) return

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/bookings/all`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        if (!res.ok) return
        const json = await res.json()
        const bookings: SimpleBooking[] = json.data ?? []
        setRecentBookings(bookings)

        if (bookings.length === 0) return

        const currentIds = bookings.map(b => b.id)

        if (isFirstRun) {
          knownIdsRef.current = currentIds
        } else {
          // Find any booking ID that is not in knownIds
          const newOnes = bookings.filter(b => !knownIdsRef.current.includes(b.id))
          if (newOnes.length > 0) {
            const newest = newOnes[0]
            if (active) {
              setNewBooking(newest)
              setShowNotification(true)
              knownIdsRef.current = [...knownIdsRef.current, ...newOnes.map(b => b.id)]
              
              // Auto hide after 8 seconds
              setTimeout(() => {
                setShowNotification(false)
              }, 8000)
            }
          } else {
            // Update known IDs if new ones are found on page changes but not as new bookings
            knownIdsRef.current = currentIds
          }
        }
      } catch (err) {
        // fail silently
      }
    }

    // Initial load
    checkNewBookings(true)

    // Polling interval (10 seconds)
    const interval = setInterval(() => checkNewBookings(false), 10000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-zinc-800/50 bg-neutral-950 z-50 transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 py-8 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-[#eac249] font-headline italic">
              {settings?.shop_name || 'The Modern Artisan'}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-1">
              Admin Panel
            </p>
          </div>
          <button 
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-4 px-4 py-3 rounded-md text-[#eac249] border-r-2 border-[#eac249] bg-neutral-900/50 font-bold text-sm'
                  : 'flex items-center gap-4 px-4 py-3 rounded-md text-neutral-400 hover:bg-neutral-800/40 hover:text-white transition-colors duration-200 text-sm font-medium'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-zinc-800/30">
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-neutral-400 hover:bg-neutral-800/40 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-30 flex items-center justify-between px-4 lg:px-8 h-20 bg-neutral-950/80 backdrop-blur-xl shadow-xl shadow-black/20">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-sm">menu_open</span>
          </button>
          <div className="relative w-full max-w-xl group hidden sm:block">
            {/* Search container or logo can go here */}
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6 ml-auto">
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-[#eac249]/20 flex items-center justify-center text-[#eac249] relative z-[60] hover:bg-[#eac249]/30 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>notifications</span>
              {recentBookings.length > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#131313]"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-4 w-96 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#131313]">
                  <h4 className="font-headline font-bold text-[#eac249]">Notifikasi</h4>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Terbaru</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-[#1a1a1a]">
                  {recentBookings.slice(0, 5).map((booking, idx) => (
                    <div key={booking.id} className="px-6 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/5 flex gap-4 items-start relative">
                      {idx === 0 && <div className="w-2 h-2 rounded-full bg-[#eac249] absolute left-2 top-6 animate-pulse"></div>}
                      <div className="w-8 h-8 rounded-full bg-[#eac249]/10 flex items-center justify-center text-[#eac249] flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-200 leading-tight">
                          <span className="font-bold text-[#eac249]">New Queue:</span> {booking.customer_name} ({booking.service_name})
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                          Pukul: {booking.booking_time?.slice(0, 5)} | Code: #{booking.unique_code}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 text-xs">No notifications</div>
                  )}
                </div>
                <button 
                  onClick={() => { navigate('/admin/antrian'); setShowDropdown(false); }}
                  className="block w-full py-3 bg-surface-container-highest/30 text-center text-[10px] font-bold text-[#eac249] uppercase tracking-widest hover:bg-surface-container-highest transition-colors"
                >
                  Lihat All Antrean
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-zinc-800">
            <div className="text-right">
              <p className="text-xs font-bold text-white uppercase tracking-tighter">{settings?.shop_name || 'The Modern Artisan'}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-[#eac249]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#eac249] text-sm">manage_accounts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-20 min-h-screen">
        <Outlet />
      </main>

      {/* Real-time Notification Pop-up */}
      <div className={`fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 transform ${showNotification ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#131313]">
          <h4 className="font-headline font-bold text-[#eac249] text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eac249] animate-pulse"></span>
            Notifikasi Baru
          </h4>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Baru Saja</span>
        </div>
        
        <div className="px-6 py-5 flex gap-4 items-start relative bg-[#1a1a1a]">
          <div className="w-2 h-2 rounded-full bg-[#eac249] absolute left-2.5 top-7 animate-ping"></div>
          <div className="w-2 h-2 rounded-full bg-[#eac249] absolute left-2.5 top-7"></div>
          <div className="w-8 h-8 rounded-full bg-[#eac249]/10 flex items-center justify-center text-[#eac249] flex-shrink-0">
            <span className="material-symbols-outlined text-sm">person_add</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-200 leading-tight">
              <span className="font-bold text-[#eac249]">New Queue:</span> {newBooking?.customer_name} ({newBooking?.service_name})
            </p>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
              Time: {newBooking?.booking_time?.slice(0, 5)} | Code: #{newBooking?.unique_code}
            </p>
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => { navigate('/admin/antrian'); setShowNotification(false); }}
                className="bg-[#eac249] text-zinc-900 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Lihat Antrean
              </button>
              <button 
                onClick={() => setShowNotification(false)}
                className="border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
