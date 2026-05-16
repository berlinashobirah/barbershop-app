import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import AlertModal from '../../components/AlertModal'

const API_BASE = import.meta.env.VITE_API_URL

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
  return d.toLocaleDateString('en-US', {
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

export default function AdminSchedulePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ScheduleResponse | null>(null)
  const [date, setDate] = useState(getTodayStr())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingBarberId, setUpdatingBarberId] = useState<number | null>(null)
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' as 'success'|'error'|'info' })
  const [settings, setSettings] = useState<any>(null)

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
  
  const handlePrint = () => {
    const printElement = document.getElementById('print-roster')
    if (!printElement) return

    // 1. Create hidden iframe
    const frame = document.createElement('iframe')
    frame.style.position = 'fixed'
    frame.style.right = '0'
    frame.style.bottom = '0'
    frame.style.width = '0'
    frame.style.height = '0'
    frame.style.border = '0'
    document.body.appendChild(frame)

    // 2. Fetch relevant content html
    const html = printElement.innerHTML
    
    // 3. Construct separate standalone print doc
    const doc = frame.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${settings?.shop_name || 'The Modern Artisan'} Roster</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet">
        <style>
          @page { margin: 1cm; size: landscape; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Manrope', sans-serif;
            color: #000;
            background: #fff;
            font-size: 12px;
          }
          header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #e5e7eb; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
          h1 { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; }
          h2 { font-size: 20px; font-weight: 300; margin: 0; font-style: italic; }
          p { margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
          .bg-stat { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 1rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 10px; text-align: center; }
          th { background-color: #f3f4f6; font-weight: bold; text-transform: uppercase; }
          td:first-child, th:first-child { text-align: left; font-weight: bold; width: 80px; }
          .h-lunch { background-color: #f9fafb; font-style: italic; color: #6b7280; text-align: center; letter-spacing: 0.1em; font-size: 9px; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-800 { color: #1f2937; }
          .text-black { color: #000; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .uppercase { text-transform: uppercase; }
          .text-2xl { font-size: 24px; }
          .text-[9px] { font-size: 9px; }
          .text-[8px] { font-size: 8px; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-10 { margin-top: 2.5rem; }
          .pt-6 { padding-top: 1.5rem; }
          .border-t { border-top: 1px solid #d1d5db; }
          .border-dashed { border-style: dashed; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `)
    doc.close()

    // 4. Trigger and cleanup
    frame.contentWindow?.focus()
    // Give minor delay to guarantee assets load inside frame
    setTimeout(() => {
      frame.contentWindow?.print()
      setTimeout(() => document.body.removeChild(frame), 500)
    }, 500)
  }

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
        setError('Failed to load schedule from server.')
      } finally {
        setLoading(false)
      }
    },
    [navigate]
  )

  const fetchSettings = async () => {
    try {
      const r = await fetch(`${API_BASE}/admin/settings`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (r.ok) {
        const j = await r.json()
        setSettings(j.data)
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchSchedule(date)
  }, [date, fetchSchedule])

  useEffect(() => {
    fetchSettings()
  }, [])

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
      setAlertConfig({ isOpen: true, message: 'Failed to update barber status.', type: 'error' })
    } finally {
      setUpdatingBarberId(null)
    }
  }

  const goDate = (delta: number) => setDate((d) => addDays(d, delta))

  const isToday = date === getTodayStr()

  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      {loading && <LoadingScreen />}
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">
            Daily Roster
          </h2>
          <p className="text-secondary mt-1 font-medium">
            Barber Schedule Management & Seat Availability
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
            Try Again
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
              Barber Team ({data?.summary.total_barbers ?? '—'})
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
              <p className="text-zinc-500 text-sm italic">No barbers in database.</p>
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
                              Logged Out
                            </span>
                          ) : (
                            <p
                              className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                                isActive ? 'text-green-400' : 'text-zinc-600'
                              }`}
                            >
                              {isActive ? `${bookedCount} Booking` : 'Empty'}
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
                        title={barber.status === 'Absent' ? 'Mark as Logged In' : 'Mark as Logged Out'}
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
              Today's Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Bookings</span>
              <span className="text-lg font-headline font-bold text-on-surface">
                {loading ? '—' : data?.summary.total_bookings ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Completed</span>
              <span className="text-lg font-headline font-bold text-green-400">
                {loading ? '—' : data?.summary.completed ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Barbers</span>
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
                    Today
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
                  Today
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] uppercase font-bold text-secondary">Empty</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] uppercase font-bold text-secondary">Processing</span>
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
                No barbers in database.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary w-20 sticky left-0 bg-surface-container-high/80 backdrop-blur-sm z-10">
                      TIME
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
                    return (
                      <tr key={time}>
                        <td className="p-4 text-xs font-bold text-secondary sticky left-0 bg-surface-container-low/80 backdrop-blur-sm z-10">
                          {time}
                        </td>
                        {data.barbers.map((barber) => {
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
                                    AVAILABLE
                                  </span>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline-variant/5 text-right">
            <button onClick={handlePrint} className="text-xs font-bold text-primary hover:underline">
              Download Daily Roster PDF
            </button>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Total Bookings Today
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.total_bookings ?? 0} Sessions`}
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
            Completed Today
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.completed ?? 0} Sessions`}
          </p>
          <p className="mt-2 text-xs text-secondary italic">Successfully served today</p>
        </div>

        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-[#eac249]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Total Active Barbers
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">
            {loading ? '—' : `${data?.summary.total_barbers ?? 0} Barbers`}
          </p>
          <p className="mt-2 text-xs text-secondary italic">Registered in database</p>
        </div>
      </div>
      <AlertModal isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} />

      {/* The template stays rendered hidden. We only grab its innerHTML when printing. */}
      <div id="print-roster" style={{ display: 'none' }}>
         <header className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
            <div>
               <h1 className="text-2xl font-bold text-black uppercase">{settings?.shop_name || 'The Modern Artisan'}</h1>
               <p className="text-xs text-gray-600 tracking-widest">Daily Operation Roster</p>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-light text-black italic">Schedule Report</h2>
               <p className="text-sm text-gray-800 font-bold mt-1">{formatDateID(date)}</p>
            </div>
         </header>

         <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-stat p-4">
               <p className="text-gray-500 text-[9px] font-bold uppercase">Total Bookings</p>
               <p className="text-black text-2xl font-bold">{data?.summary.total_bookings ?? 0}</p>
            </div>
            <div className="bg-stat p-4">
               <p className="text-gray-500 text-[9px] font-bold uppercase">Completed</p>
               <p className="text-black text-2xl font-bold">{data?.summary.completed ?? 0}</p>
            </div>
            <div className="bg-stat p-4">
               <p className="text-gray-500 text-[9px] font-bold uppercase">Total Barbers</p>
               <p className="text-black text-2xl font-bold">{data?.summary.total_barbers ?? 0}</p>
            </div>
         </div>

         <table className="w-full">
            <thead>
               <tr>
                  <th className="uppercase text-[10px] w-24">Time Slot</th>
                  {data?.barbers.map(b => (
                     <th key={b.id} className="uppercase text-[10px]">{b.name}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {data?.slots.map(time => {
                  return (
                     <tr key={time}>
                        <td className="font-bold text-xs">{time}</td>
                        {data.barbers.map(b => {
                           const s = b.slots[time]
                           return (
                              <td key={b.id} className="text-[10px]">
                                 {s ? (
                                    <div>
                                       <div className="font-bold">{s.customer_name}</div>
                                       <div className="text-gray-500 text-[8px] italic">{s.service_name}</div>
                                       <div className="text-[8px] uppercase font-medium text-gray-600 mt-0.5 border border-gray-200 inline-block px-1">{s.status}</div>
                                    </div>
                                 ) : (
                                    <span className="text-gray-300">—</span>
                                 )}
                              </td>
                           )
                        })}
                     </tr>
                  )
               })}
            </tbody>
         </table>
         <div className="mt-10 pt-6 border-t border-dashed border-gray-300 flex justify-between text-[9px] text-gray-500">
            <p>Generated on {new Date().toLocaleString()}</p>
            <p>{settings?.shop_name || 'The Modern Artisan'} System Reporting</p>
         </div>
      </div>
    </div>
  )
}
