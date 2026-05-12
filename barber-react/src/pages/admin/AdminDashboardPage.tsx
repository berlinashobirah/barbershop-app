import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import AlertModal from '../../components/AlertModal'

const API_BASE = import.meta.env.VITE_API_URL

interface DashboardStats {
  total_today: number
  processing: number
  completed: number
  revenue_today: number
}

interface Booking {
  id: number
  unique_code: string
  customer_name: string
  customer_phone: string
  customer_type: 'Member' | 'Guest'
  barber_name: string
  service_name: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'arrived' | 'processing' | 'completed' | 'cancelled'
  payment_status: string
  total_amount: number
}

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}k`
  return `Rp ${amount}`
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:    { label: 'Waiting',  className: 'text-zinc-400 bg-zinc-800' },
    arrived:    { label: 'Arrived',     className: 'text-blue-400 bg-blue-400/10 border border-blue-400/20' },
    processing: { label: 'Processing', className: 'text-primary bg-primary/10 border border-primary/20' },
    completed:  { label: 'Completed',  className: 'text-green-400 bg-green-400/10 border border-green-400/20' },
    cancelled:  { label: 'Cancel',    className: 'text-red-400 bg-red-400/10' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
      {status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
      {s.label}
    </span>
  )
}

function StatCardSkeleton() {
  return (
    <div className="col-span-1 bg-surface-container-low p-6 rounded-xl animate-pulse">
      <div className="h-2 w-20 bg-surface-container-highest rounded mb-3" />
      <div className="h-10 w-16 bg-surface-container-highest rounded mb-2" />
      <div className="h-2 w-28 bg-surface-container-highest rounded" />
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [now, setNow] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' as 'success'|'error'|'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));
  
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  
  const getToken = () => localStorage.getItem('auth_token')

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
      })
      if (res.status === 401 || res.status === 403) { navigate('/login'); return }
      const json = await res.json()
      setStats(json.data)
    } catch {
      setError('Failed memuat statistik.')
    } finally {
      setLoadingStats(false)
    }
  }, [navigate])

  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true)
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/today`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
      })
      if (res.status === 401 || res.status === 403) { navigate('/login'); return }
      const json = await res.json()
      setBookings(json.data ?? [])
    } catch {
      setError('Failed to load data antrean.')
    } finally {
      setLoadingQueue(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchStats()
    fetchQueue()
  }, [fetchStats, fetchQueue])

  const updateStatus = async (id: number, newStatus: Booking['status']) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      // Refresh data setelah update
      await Promise.all([fetchStats(), fetchQueue()])
    } catch {
      setAlertConfig({ isOpen: true, message: 'Failed mengupdate status.', type: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  // 3. SEMBUNYIKAN STATUS 'CANCELLED' DARI TABEL FE
  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false // Automatically remove cancelled

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchCode = b.unique_code?.toLowerCase().includes(q)
      const matchName = b.customer_name?.toLowerCase().includes(q)
      if (!matchCode && !matchName) return false
    }

    if (filter === 'all') return true
    if (filter === 'pending') return b.status === 'pending' || b.status === 'arrived'
    if (filter === 'processing') return b.status === 'processing'
    return true
  })

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const currentBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  return (
    <>
      {(loadingStats || loadingQueue) && <LoadingScreen />}
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">Halo, Admin</h2>
          <p className="text-secondary text-sm">Welcome back to the Atelier Management.</p>

          <div className="text-left mt-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#eac249] font-bold block mb-1">
              Today's Status
            </span>
            <p className="text-on-surface font-mono font-medium capitalize">{dateStr} | {timeStr}</p>
          </div>
        </div>
        
        {/* Pencarian & User Profil */}
        <div className="flex items-center gap-6">


          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="bg-surface-container-highest border-none rounded-lg pl-12 pr-6 py-3 w-72 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
              placeholder="Search Unique Code or Name..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-10 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button onClick={() => { setError(null); fetchStats(); fetchQueue() }} className="ml-auto text-xs underline">Coba Lagi</button>
        </div>
      )}

      {/* Stats Grid */}
      <section className="px-10 grid grid-cols-4 gap-6 mb-10">
        {loadingStats ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="col-span-1 bg-surface-container-low p-6 rounded-xl border-l-2 border-primary">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Queue</p>
              <h3 className="text-4xl font-headline font-bold text-primary">{String(stats?.total_today ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">today</span>
                <span>Bookings today</span>
              </p>
            </div>

            <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">In Progress</p>
              <h3 className="text-4xl font-headline font-bold text-on-surface">{String(stats?.processing ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2">Being served by barber</p>
            </div>

            <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Completed Today</p>
              <h3 className="text-4xl font-headline font-bold text-on-surface">{String(stats?.completed ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2">Session is completed</p>
            </div>

            <div className="col-span-1 bg-primary text-on-primary p-6 rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Estimated Revenue</p>
                <h3 className="text-2xl font-headline font-bold">{formatRupiah(stats?.revenue_today ?? 0)}</h3>
              </div>
              <span className="material-symbols-outlined self-end" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
            </div>
          </>
        )}
      </section>

      {/* Queue Table */}
      <section className="px-10 mb-12">
        <div className="bg-surface-container-low rounded-2xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center">
            <h3 className="text-xl font-headline font-bold">Today's Queue Register</h3>
            <div className="flex gap-2">
              {(['all', 'pending', 'processing'] as const).map((f) => {
                const labels = { all: 'All', pending: 'Waiting', processing: 'Processing' }
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      filter === f
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-secondary hover:bg-primary hover:text-on-primary'
                    }`}
                  >
                    {labels[f]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 text-secondary text-[10px] uppercase tracking-widest">
                  <th className="px-8 py-4 font-bold">No. / Code</th>
                  <th className="px-8 py-4 font-bold">Customer Name</th>
                  <th className="px-8 py-4 font-bold">Service</th>
                  <th className="px-8 py-4 font-bold">Barber</th>
                  <th className="px-8 py-4 font-bold">Time</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingQueue ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6"><div className="h-4 w-20 bg-surface-container-highest rounded" /></td>
                      <td className="px-8 py-6"><div className="h-4 w-32 bg-surface-container-highest rounded" /></td>
                      <td className="px-8 py-6"><div className="h-4 w-28 bg-surface-container-highest rounded" /></td>
                      <td className="px-8 py-6"><div className="h-4 w-20 bg-surface-container-highest rounded" /></td>
                      <td className="px-8 py-6"><div className="h-4 w-14 bg-surface-container-highest rounded" /></td>
                      <td className="px-8 py-6"><div className="h-6 w-20 bg-surface-container-highest rounded-full" /></td>
                      <td className="px-8 py-6 text-right"><div className="h-8 w-20 bg-surface-container-highest rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-secondary text-sm">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-outline">event_available</span>
                      No queue found for this filter.
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking, idx) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className={`font-bold text-lg font-headline ${booking.status === 'processing' ? 'text-primary' : 'text-on-surface'}`}>
                          #{String((currentPage - 1) * itemsPerPage + idx + 1).padStart(3, '0')}
                        </span>
                        <p className="text-[10px] text-outline mt-1 font-mono uppercase">{booking.unique_code}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-on-surface">{booking.customer_name}</p>
                        <p className="text-xs text-secondary">{booking.customer_phone}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${booking.customer_type === 'Member' ? 'text-primary' : 'text-outline'}`}>
                          {booking.customer_type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs bg-surface-container-highest px-3 py-1 rounded">{booking.service_name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {booking.barber_name !== 'Unassigned'
                              ? booking.barber_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                              : '?'}
                          </div>
                          <span className="text-xs">{booking.barber_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-secondary">
                          {booking.booking_time?.slice(0, 5)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'arrived')}
                            disabled={updatingId === booking.id}
                            className="bg-blue-500/20 hover:bg-blue-500 border border-blue-500/30 text-blue-400 hover:text-white px-5 py-2 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Arrived'}
                          </button>
                        )}
                        {booking.status === 'arrived' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'processing')}
                            disabled={updatingId === booking.id}
                            className="bg-primary text-on-primary px-5 py-2 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Process'}
                          </button>
                        )}
                        {booking.status === 'processing' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="bg-green-500/20 hover:bg-green-500 border border-green-500/30 text-green-400 hover:text-white px-5 py-2 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Completed'}
                          </button>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <span className="text-[10px] text-outline italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container-lowest/50 flex justify-between items-center">
            <p className="text-xs text-secondary">
              Showing {currentBookings.length} of {filteredBookings.length} queues today
            </p>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-white hover:bg-surface-container-highest disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="text-xs font-bold text-primary px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-white hover:bg-surface-container-highest disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}

            <button
              onClick={() => { fetchStats(); fetchQueue() }}
              className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              Refresh
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 flex flex-col items-center gap-6 bg-[#131313] border-t border-white/5">
        <p className="font-body text-xs uppercase tracking-widest text-secondary text-center">
          © 2024 The Modern Artisan Barbershop. Precision in every cut.
        </p>
        <div className="flex gap-8">
          {['About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us'].map((link) => (
            <a key={link} href="#" className="font-body text-xs uppercase tracking-widest text-secondary hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
      <AlertModal isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} />
    </>
  )
}