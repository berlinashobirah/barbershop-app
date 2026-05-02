import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000/api'

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
    pending:    { label: 'Menunggu',  className: 'text-zinc-400 bg-zinc-800' },
    arrived:    { label: 'Hadir',     className: 'text-blue-400 bg-blue-400/10 border border-blue-400/20' },
    processing: { label: 'Diproses', className: 'text-primary bg-primary/10 border border-primary/20' },
    completed:  { label: 'Selesai',  className: 'text-green-400 bg-green-400/10 border border-green-400/20' },
    cancelled:  { label: 'Batal',    className: 'text-red-400 bg-red-400/10' },
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
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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
      setError('Gagal memuat statistik.')
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
      setError('Gagal memuat data antrean.')
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
      alert('Gagal mengupdate status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true
    if (filter === 'pending') return b.status === 'pending' || b.status === 'arrived'
    if (filter === 'processing') return b.status === 'processing'
    return true
  })

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">Halo, Admin</h2>
          <p className="text-secondary text-sm">Selamat datang kembali di Atelier Manajemen.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="bg-surface-container-highest border-none rounded-lg pl-12 pr-6 py-3 w-72 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
              placeholder="Cari Kode Unik..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-on-surface">Admin Utama</p>
              <p className="text-[10px] text-primary uppercase tracking-tighter">Manajemen Atelier</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">manage_accounts</span>
            </div>
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
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Antrean</p>
              <h3 className="text-4xl font-headline font-bold text-primary">{String(stats?.total_today ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">today</span>
                <span>Booking hari ini</span>
              </p>
            </div>

            <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Sedang Proses</p>
              <h3 className="text-4xl font-headline font-bold text-on-surface">{String(stats?.processing ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2">Sedang dilayani kapster</p>
            </div>

            <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Selesai Hari Ini</p>
              <h3 className="text-4xl font-headline font-bold text-on-surface">{String(stats?.completed ?? 0).padStart(2, '0')}</h3>
              <p className="text-[10px] text-on-surface-variant mt-2">Sesi telah selesai</p>
            </div>

            <div className="col-span-1 bg-primary text-on-primary p-6 rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Estimasi Pendapatan</p>
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
            <h3 className="text-xl font-headline font-bold">Daftar Antrean Hari Ini</h3>
            <div className="flex gap-2">
              {(['all', 'pending', 'processing'] as const).map((f) => {
                const labels = { all: 'Semua', pending: 'Menunggu', processing: 'Diproses' }
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
                  <th className="px-8 py-4 font-bold">No. / Kode</th>
                  <th className="px-8 py-4 font-bold">Nama Pelanggan</th>
                  <th className="px-8 py-4 font-bold">Layanan</th>
                  <th className="px-8 py-4 font-bold">Kapster</th>
                  <th className="px-8 py-4 font-bold">Jam</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold text-right">Aksi</th>
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
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-secondary text-sm">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-outline">event_available</span>
                      Tidak ada antrean untuk filter ini hari ini.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, idx) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className={`font-bold text-lg font-headline ${booking.status === 'processing' ? 'text-primary' : 'text-on-surface'}`}>
                          #{String(idx + 1).padStart(3, '0')}
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
                            {booking.barber_name !== 'Belum ditentukan'
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
                            {updatingId === booking.id ? '...' : 'Hadir'}
                          </button>
                        )}
                        {booking.status === 'arrived' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'processing')}
                            disabled={updatingId === booking.id}
                            className="bg-primary text-on-primary px-5 py-2 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Proses'}
                          </button>
                        )}
                        {booking.status === 'processing' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="bg-green-500/20 hover:bg-green-500 border border-green-500/30 text-green-400 hover:text-white px-5 py-2 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Selesai'}
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
              Menampilkan {filteredBookings.length} dari {bookings.length} antrean hari ini
            </p>
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
          © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
        </p>
        <div className="flex gap-8">
          {['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Hubungi Kami'].map((link) => (
            <a key={link} href="#" className="font-body text-xs uppercase tracking-widest text-secondary hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}
