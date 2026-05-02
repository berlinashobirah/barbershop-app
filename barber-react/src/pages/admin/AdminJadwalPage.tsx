import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000/api'

interface SlotBooking {
  booking_id: number
  unique_code: string
  customer_name: string
  service_name: string
  status: 'pending' | 'arrived' | 'processing'
}

interface BarberSchedule {
  id: number
  name: string
  specialty: string
  status: string
  slots: Record<string, SlotBooking | null>
}

interface ScheduleResponse {
  date: string
  slots: string[]
  barbers: BarberSchedule[]
  summary: {
    total_bookings: number
    completed: number
    total_barbers: number
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().split('T')[0]
}

function getTodayStr(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().split('T')[0]
}

const STATUS_SLOT_STYLE: Record<string, string> = {
  processing: 'bg-amber-500/10 border border-amber-500/30',
  arrived:    'bg-blue-500/10 border border-blue-500/20',
  pending:    'bg-surface-container-highest border border-outline-variant/10',
}

const STATUS_DOT: Record<string, string> = {
  processing: 'bg-amber-500 animate-pulse',
  arrived:    'bg-blue-400',
  pending:    'bg-zinc-500',
}

export default function AdminJadwalPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ScheduleResponse | null>(null)
  const [date, setDate] = useState(getTodayStr())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingBarberId, setUpdatingBarberId] = useState<number | null>(null)

  const getToken = () => localStorage.getItem('auth_token')

  const fetchSchedule = useCallback(
    async (d: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/admin/schedule?date=${d}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: 'application/json',
          },
        })
        if (res.status === 401 || res.status === 403) {
          navigate('/login')
          return
        }
        if (!res.ok) throw new Error('Server error')
        const json: ScheduleResponse = await res.json()
        setData(json)
      } catch {
        setError('Gagal memuat jadwal dari server.')
      } finally {
        setLoading(false)
      }
    },
    [navigate]
  )

  useEffect(() => {
    fetchSchedule(date)
  }, [date, fetchSchedule])

  const toggleBarberStatus = async (barberId: number, currentStatus: string) => {
    setUpdatingBarberId(barberId)
    try {
      const newStatus = currentStatus === 'Absent' ? 'Available' : 'Absent'
      const res = await fetch(`${API_BASE}/admin/barbers/${barberId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      // Update local state without fetching all
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          barbers: prev.barbers.map(b => 
            b.id === barberId ? { ...b, status: newStatus } : b
          )
        }
      })
    } catch (e) {
      alert('Gagal mengupdate status kapster.')
    } finally {
      setUpdatingBarberId(null)
    }
  }

  const goDate = (delta: number) => setDate((d) => addDays(d, delta))

  const isToday = date === getTodayStr()

  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">
            Roster Harian
          </h2>
          <p className="text-secondary mt-1 font-medium">
            Manajemen jadwal kapster &amp; ketersediaan kursi
          </p>
        </div>
        <button
          onClick={() => fetchSchedule(date)}
          className="flex items-center gap-2 px-6 py-2 bg-surface-container-high border border-outline-variant/20 text-on-surface rounded-md text-sm font-semibold hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button onClick={() => fetchSchedule(date)} className="ml-auto text-xs underline">
            Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Barber Status */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">content_cut</span>
            </div>
            <h3 className="text-lg font-headline font-bold mb-4 text-[#eac249]">
              Tim Kapster ({data?.summary.total_barbers ?? '—'})
            </h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700" />
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-700 rounded w-24 mb-1.5" />
                      <div className="h-2 bg-zinc-800 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.barbers.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">Belum ada kapster di database.</p>
            ) : (
              <div className="space-y-3">
                {data?.barbers.map((barber) => {
                  const bookedCount = Object.values(barber.slots).filter(Boolean).length
                  const isActive = bookedCount > 0
                  return (
                    <div
                      key={barber.id}
                      className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                          <span className="text-xs font-bold text-[#eac249]">
                            {getInitials(barber.name)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-on-surface">{barber.name}</p>
                          <p className="text-[10px] text-zinc-500">{barber.specialty}</p>
                          {barber.status === 'Absent' ? (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold uppercase rounded">
                              Tidak Masuk
                            </span>
                          ) : (
                            <p
                              className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                                isActive ? 'text-green-400' : 'text-zinc-600'
                              }`}
                            >
                              {isActive ? `${bookedCount} Booking` : 'Kosong'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleBarberStatus(barber.id, barber.status)}
                        disabled={updatingBarberId === barber.id}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          barber.status === 'Absent' ? 'bg-red-500' : 'bg-surface-container-highest'
                        } ${updatingBarberId === barber.id ? 'opacity-50' : ''}`}
                        title={barber.status === 'Absent' ? 'Tandai Masuk' : 'Tandai Tidak Masuk'}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            barber.status === 'Absent' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-headline font-bold text-secondary uppercase tracking-widest">
              Ringkasan Hari Ini
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Booking</span>
              <span className="text-lg font-headline font-bold text-on-surface">
                {loading ? '—' : data?.summary.total_bookings ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Selesai</span>
              <span className="text-lg font-headline font-bold text-green-400">
                {loading ? '—' : data?.summary.completed ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Kapster</span>
              <span className="text-lg font-headline font-bold text-[#eac249]">
                {loading ? '—' : data?.summary.total_barbers ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-9 bg-surface-container-low rounded-xl overflow-hidden">
          {/* Date Navigator */}
          <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => goDate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="text-center">
                <p className="font-bold text-sm text-on-surface capitalize">{formatDateID(date)}</p>
                {isToday && (
                  <span className="text-[10px] text-[#eac249] font-bold uppercase tracking-widest">
                    Hari Ini
                  </span>
                )}
              </div>
              <button
                onClick={() => goDate(1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              {!isToday && (
                <button
                  onClick={() => setDate(getTodayStr())}
                  className="text-[10px] text-[#eac249] font-bold uppercase tracking-widest hover:underline"
                >
                  Hari Ini
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] uppercase font-bold text-secondary">Kosong</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] uppercase font-bold text-secondary">Diproses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-[10px] uppercase font-bold text-secondary">Booked</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col gap-3 p-6 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-14 bg-zinc-800 rounded" />
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex-1 h-14 bg-zinc-800/50 rounded" />
                    ))}
                  </div>
                ))}
              </div>
            ) : !data || data.barbers.length === 0 ? (
              <div className="p-16 text-center text-zinc-500">
                <span className="material-symbols-outlined text-5xl block mb-3 text-zinc-700">
                  person_off
                </span>
                Belum ada kapster di database.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary w-20 sticky left-0 bg-surface-container-high/80 backdrop-blur-sm z-10">
                      WAKTU
                    </th>
                    {data.barbers.map((barber) => (
                      <th
                        key={barber.id}
                        className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary min-w-[160px]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-[#eac249] shrink-0">
                            {getInitials(barber.name)}
                          </div>
                          <span className="truncate">{barber.name.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {data.slots.map((time) => {
                    const isLunch = time === '12:00'
                    return (
                      <tr key={time} className={isLunch ? 'bg-surface-container-low' : ''}>
                        <td className="p-4 text-xs font-bold text-secondary sticky left-0 bg-surface-container-low/80 backdrop-blur-sm z-10">
                          {time}
                        </td>
                        {isLunch ? (
                          <td colSpan={data.barbers.length} className="p-2">
                            <div className="h-8 border-y border-dashed border-outline-variant/20 flex items-center justify-center">
                              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-600">
                                Istirahat Siang
                              </span>
                            </div>
                          </td>
                        ) : (
                          data.barbers.map((barber) => {
                            const slot = barber.slots[time]
                            return (
                              <td key={barber.id} className="p-2">
                                {slot ? (
                                  <div
                                    className={`h-14 rounded-md p-2 relative ${
                                      STATUS_SLOT_STYLE[slot.status] ?? STATUS_SLOT_STYLE.pending
                                    }`}
                                  >
                                    <p className="text-[10px] font-bold text-on-surface truncate pr-4">
                                      {slot.customer_name}
                                    </p>
                                    <p className="text-[9px] text-secondary truncate">
                                      {slot.service_name}
                                    </p>
                                    <div
                                      className={`absolute right-2 top-2 w-1.5 h-1.5 rounded-full ${
                                        STATUS_DOT[slot.status] ?? STATUS_DOT.pending
                                      }`}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-14 bg-green-500/5 border border-green-500/15 rounded-md flex items-center justify-center cursor-pointer group hover:bg-green-500/10 transition-all">
                                    <span className="text-[10px] font-bold text-green-600 group-hover:text-green-400 transition-colors">
                                      KOSONG
                                    </span>
                                  </div>
                                )}
                              </td>
                            )
                          })
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline-variant/5 text-right">
            <button className="text-xs font-bold text-primary hover:underline">
              Download Daily Roster PDF
            </button>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Total Booking Hari Ini
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.total_bookings ?? 0} Sesi`}
          </p>
          {!loading && data && (
            <div className="mt-4 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    ((data.summary.total_bookings /
                      Math.max(1, data.summary.total_barbers * data.slots.length)) *
                      100)
                  )}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-green-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Selesai Hari Ini
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.completed ?? 0} Sesi`}
          </p>
          <p className="mt-2 text-xs text-secondary italic">Berhasil dilayani hari ini</p>
        </div>

        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-[#eac249]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Total Kapster Aktif
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.total_barbers ?? 0} Kapster`}
          </p>
          <p className="mt-2 text-xs text-secondary italic">Terdaftar di database</p>
        </div>
      </div>
    </div>
  )
}
