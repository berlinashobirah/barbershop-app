import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000/api'

type BookingStatus = 'pending' | 'arrived' | 'processing' | 'completed' | 'cancelled'
type FilterType = 'all' | 'pending' | 'arrived' | 'processing' | 'completed'

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
  status: BookingStatus
  payment_status: string
  total_amount: number
}

interface BookingsResponse {
  data: Booking[]
  total: number
  current_page: number
  last_page: number
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:    { label: 'Menunggu',  className: 'bg-zinc-700 text-zinc-400' },
    arrived:    { label: 'Hadir',     className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    processing: { label: 'Diproses', className: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' },
    completed:  { label: 'Selesai',  className: 'bg-green-500/10 text-green-400 border border-green-500/20' },
    cancelled:  { label: 'Batal',    className: 'bg-red-500/10 text-red-400' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${s.className}`}>
      {status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-8 py-6">
          <div className="h-4 bg-zinc-800 rounded w-24" />
        </td>
      ))}
    </tr>
  )
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',        label: 'Semua' },
  { key: 'pending',    label: 'Menunggu' },
  { key: 'arrived',    label: 'Hadir' },
  { key: 'processing', label: 'Diproses' },
  { key: 'completed',  label: 'Selesai' },
]

export default function AdminAntrianPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Live date & time
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const getToken = () => localStorage.getItem('auth_token')

  const fetchBookings = useCallback(async (f: FilterType, p: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (f !== 'all') params.set('status', f)
      const res = await fetch(`${API_BASE}/admin/bookings/all?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
      })
      if (res.status === 401 || res.status === 403) { navigate('/login'); return }
      if (!res.ok) throw new Error('Server error')
      const json: BookingsResponse = await res.json()
      setBookings(json.data ?? [])
      setTotal(json.total ?? 0)
      setLastPage(json.last_page ?? 1)
      setPage(json.current_page ?? 1)
    } catch {
      setError('Gagal memuat data antrean dari server.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchBookings(filter, 1)
  }, [filter, fetchBookings])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) return
    fetchBookings(filter, newPage)
  }

  const updateStatus = async (id: number, newStatus: BookingStatus) => {
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
      fetchBookings(filter, page)
    } catch {
      alert('Gagal mengupdate status. Coba lagi.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Count stats from current data (for filter = all only)
  const stats = {
    total:      total,
    processing: bookings.filter((b) => b.status === 'processing').length,
    completed:  bookings.filter((b) => b.status === 'completed').length,
  }

  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

  return (
    <div className="p-10 min-h-screen">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-headline text-4xl font-black text-on-surface leading-tight">Kelola Antrean</h2>
            <p className="text-zinc-500 font-medium tracking-wide mt-2 italic">
              Kendali presisi untuk pengalaman pelanggan yang tak terlupakan.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#eac249] font-bold block mb-1">
              Status Hari Ini
            </span>
            <p className="text-on-surface font-mono font-medium capitalize">{dateStr} | {timeStr}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-zinc-600 mb-4 block">groups</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Antrean</h4>
              <p className="font-headline text-5xl font-black text-on-surface">
                {loading ? <span className="animate-pulse text-zinc-700">--</span> : String(total).padStart(2, '0')}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <span className="material-symbols-outlined text-[140px]">groups</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#eac249] mb-4 block">pending_actions</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Sedang Diproses</h4>
              <p className="font-headline text-5xl font-black text-[#eac249]">
                {loading ? <span className="animate-pulse text-zinc-700">--</span> : String(stats.processing).padStart(2, '0')}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#eac249]">
              <span className="material-symbols-outlined text-[140px]">pending_actions</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-green-500 mb-4 block">task_alt</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Selesai (Halaman Ini)</h4>
              <p className="font-headline text-5xl font-black text-on-surface">
                {loading ? <span className="animate-pulse text-zinc-700">--</span> : String(stats.completed).padStart(2, '0')}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <span className="material-symbols-outlined text-[140px]">task_alt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button onClick={() => fetchBookings(filter, page)} className="ml-auto text-xs underline">Coba Lagi</button>
        </div>
      )}

      {/* Queue Table */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Controls */}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/30">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setPage(1) }}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === key
                    ? 'bg-[#eac249] text-[#3d2f00] shadow-lg shadow-[#eac249]/10'
                    : 'bg-surface-container-high text-zinc-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchBookings(filter, page)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-5 border-b border-zinc-800/30">No. / Kode</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Nama Pelanggan</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Layanan</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Kapster</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Tgl / Jam</th>
                <th className="px-8 py-5 border-b border-zinc-800/30 text-center">Status</th>
                <th className="px-8 py-5 border-b border-zinc-800/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-zinc-500 text-sm">
                    <span className="material-symbols-outlined text-5xl block mb-3 text-zinc-700">inbox</span>
                    Tidak ada data antrean untuk filter "{FILTERS.find((f) => f.key === filter)?.label}".
                  </td>
                </tr>
              ) : (
                bookings.map((booking, idx) => (
                  <tr key={booking.id} className="hover:bg-zinc-900/20 transition-colors group">
                    <td className="px-8 py-6">
                      <span className={`font-headline text-xl font-bold ${booking.status === 'processing' ? 'text-[#eac249]' : 'text-zinc-400'}`}>
                        #{String((page - 1) * 15 + idx + 1).padStart(3, '0')}
                      </span>
                      <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider font-mono">{booking.unique_code}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                          <span className="text-xs font-bold text-zinc-400">
                            {booking.customer_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{booking.customer_name}</p>
                          <p className="text-xs text-zinc-500">{booking.customer_phone}</p>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${booking.customer_type === 'Member' ? 'text-[#eac249]' : 'text-zinc-600'}`}>
                            {booking.customer_type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-surface-container-highest text-zinc-300 text-[10px] font-bold rounded uppercase tracking-wider">
                        {booking.service_name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-400 italic">{booking.barber_name}</td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-zinc-300">{booking.booking_date}</p>
                      <p className="text-xs text-zinc-600 font-mono mt-0.5">{booking.booking_time?.slice(0, 5)}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-2 justify-end">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'arrived')}
                            disabled={updatingId === booking.id}
                            className="border border-blue-500/30 text-blue-400 px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Hadir'}
                          </button>
                        )}
                        {booking.status === 'arrived' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'processing')}
                            disabled={updatingId === booking.id}
                            className="border border-[#eac249]/30 text-[#eac249] px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#eac249]/5 transition-colors disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Proses'}
                          </button>
                        )}
                        {booking.status === 'processing' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="bg-[#eac249] text-[#3d2f00] px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Selesai'}
                          </button>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <span className="text-[10px] text-zinc-700 italic">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 flex items-center justify-between bg-zinc-900/20">
          <p className="text-xs text-zinc-500">
            {loading ? 'Memuat...' : `Menampilkan ${bookings.length} dari ${total} booking`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="text-zinc-600 text-xs px-1">…</span>
                  )}
                  <button
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      p === page
                        ? 'bg-surface-container-high text-[#eac249]'
                        : 'text-zinc-500 hover:bg-surface-container-high hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= lastPage || loading}
              className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Grid */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800/30 flex items-center justify-between group hover:border-[#eac249]/30 transition-all cursor-pointer">
          <div>
            <h3 className="font-headline text-xl font-bold text-white mb-1">Cetak Laporan Harian</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Format PDF & CSV</p>
          </div>
          <div className="bg-surface-container-high p-4 rounded-lg group-hover:bg-[#eac249] group-hover:text-[#3d2f00] transition-all">
            <span className="material-symbols-outlined">print</span>
          </div>
        </div>
        <div
          onClick={() => fetchBookings(filter, page)}
          className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800/30 flex items-center justify-between group hover:border-[#eac249]/30 transition-all cursor-pointer"
        >
          <div>
            <h3 className="font-headline text-xl font-bold text-white mb-1">Refresh Data Antrean</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Sinkronisasi data terbaru dari server</p>
          </div>
          <div className="bg-surface-container-high p-4 rounded-lg group-hover:bg-[#eac249] group-hover:text-[#3d2f00] transition-all">
            <span className="material-symbols-outlined">sync</span>
          </div>
        </div>
      </section>
    </div>
  )
}
