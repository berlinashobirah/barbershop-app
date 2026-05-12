import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import LoadingScreen from '../../components/LoadingScreen'

const API_BASE = import.meta.env.VITE_API_URL
const IMAGE_BASE = import.meta.env.VITE_BASE_URL

interface Stats { total_booking: number; completed: number; revenue: number; total_members: number }
interface ChartDay { day: number; label: string; revenue: number; bookings: number }
interface PopularService { id: number; name: string; total_booked: number; total_revenue: number; percentage: number }
interface BarberPerf { id: number; name: string; image: string | null; total_sessions: number; total_revenue: number }
interface BookingRow {
  id: number; unique_code: string; customer_name: string; customer_type: 'Member' | 'Guest'
  barber_name: string; service_name: string; booking_date: string; booking_time: string
  status: string; payment_status: string; total_amount: number
}

const fmt = (n: number) => n >= 1e6 ? `Rp ${(n/1e6).toFixed(1).replace('.0','')}jt` : n >= 1e3 ? `Rp ${(n/1e3).toFixed(0)}k` : `Rp ${n}`
const fmtFull = (n: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)

const SC: Record<string,string> = {
  completed:'bg-emerald-500/20 text-emerald-400', processing:'bg-sky-500/20 text-sky-400',
  arrived:'bg-blue-500/20 text-blue-400', pending:'bg-amber-500/20 text-amber-400', cancelled:'bg-red-500/20 text-red-400',
}
const SL: Record<string,string> = { all:'All', completed:'Completed', processing:'Processing', arrived:'Arrived', pending:'Pending', cancelled:'Cancelled' }

export default function AdminReportsPage() {
  const navigate = useNavigate()
  const settings = usePublicSettings()
  const todayDay = new Date().getDate()

  // ── Filter state (draft) ──────────────────────────────────────────────────
  const [draftMonth, setDraftMonth]   = useState('')
  const [draftStart, setDraftStart]   = useState('')
  const [draftEnd, setDraftEnd]       = useState('')
  const [draftStatus, setDraftStatus] = useState('all')

  // ── Applied filter (used for all fetches) ────────────────────────────────
  const [appliedMonth, setAppliedMonth]   = useState('')
  const [appliedStart, setAppliedStart]   = useState('')
  const [appliedEnd, setAppliedEnd]       = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [page, setPage] = useState(1)

  // ── Data ─────────────────────────────────────────────────────────────────
  const [stats, setStats]       = useState<Stats|null>(null)
  const [chart, setChart]       = useState<ChartDay[]>([])
  const [chartMode, setChartMode] = useState<'daily'|'monthly'>('monthly')
  const [services, setServices] = useState<PopularService[]>([])
  const [barbers, setBarbers]   = useState<BarberPerf[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [lastPage, setLastPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [printBookings, setPrintBookings] = useState<BookingRow[]>([])

  // ── Loading ───────────────────────────────────────────────────────────────
  const [loadingMain, setLoadingMain] = useState(true)
  const [loadingTable, setLoadingTable] = useState(true)
  const [loadingPrint, setLoadingPrint] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const token = () => localStorage.getItem('auth_token')
  const get = useCallback(async (url: string) => {
    const r = await fetch(`${API_BASE}${url}`, { headers: { Authorization:`Bearer ${token()}`, Accept:'application/json' } })
    if (r.status === 401 || r.status === 403) { navigate('/login'); return null }
    const j = await r.json()
    if (!r.ok) throw new Error(j.message)
    return j
  }, [navigate])

  // ── Fetch all top sections (stats, chart, services, barbers) ─────────────
  const fetchMain = useCallback(async () => {
    setLoadingMain(true); setError(null)
    
    const sp = new URLSearchParams()
    if (appliedStart && appliedEnd) {
      sp.set('start_date', appliedStart)
      sp.set('end_date', appliedEnd)
    } else if (appliedMonth) {
      sp.set('month', appliedMonth)
    }
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    try {
      const [s, c, sv, b] = await Promise.all([
        get(`/admin/laporan/stats${qs}`),
        get(`/admin/laporan/revenue-chart${qs}`),
        get(`/admin/laporan/popular-services${qs}`),
        get(`/admin/laporan/barber-performance${qs}`),
      ])
      if (s)  setStats(s.data)
      if (c)  { setChart(c.data); setChartMode(c.mode) }
      if (sv) setServices(sv.data)
      if (b)  setBarbers(b.data)
    } catch { setError('Failed to load report.') }
    finally { setLoadingMain(false) }
  }, [get, appliedMonth, appliedStart, appliedEnd])

  // ── Fetch transaction table ───────────────────────────────────────────────
  const fetchTable = useCallback(async () => {
    setLoadingTable(true)
    const qs = new URLSearchParams()
    if (appliedStart && appliedEnd) {
      qs.set('start_date', appliedStart)
      qs.set('end_date', appliedEnd)
    } else if (appliedMonth) {
      qs.set('month', appliedMonth)
    }
    if (appliedStatus !== 'all') qs.set('status', appliedStatus)
    qs.set('page', String(page))
    try {
      const d = await get(`/admin/laporan/bookings?${qs}`)
      if (d) { setBookings(d.data); setLastPage(d.last_page); setTotalRows(d.total) }
    } catch { setError('Failed to load transactions.') }
    finally { setLoadingTable(false) }
  }, [get, appliedMonth, appliedStart, appliedEnd, appliedStatus, page])

  useEffect(() => { fetchMain() }, [fetchMain])
  useEffect(() => { fetchTable() }, [fetchTable])

  const handleExportPDF = async () => {
    setLoadingPrint(true)
    try {
      const qs = new URLSearchParams()
      if (appliedStart && appliedEnd) {
        qs.set('start_date', appliedStart); qs.set('end_date', appliedEnd)
      } else if (appliedMonth) {
        qs.set('month', appliedMonth)
      }
      if (appliedStatus !== 'all') qs.set('status', appliedStatus)
      qs.set('limit', 'all') // Trigger non-paginated complete set on backend

      const d = await get(`/admin/laporan/bookings?${qs}`)
      if (d) {
        setPrintBookings(d.data)
        // Allow time for component to re-render the full row mapping before opening native print UI
        setTimeout(() => {
          window.print()
          setLoadingPrint(false)
        }, 500)
      } else {
        setLoadingPrint(false)
      }
    } catch (e) {
      console.error(e)
      setLoadingPrint(false)
      alert('Failed to prepare print data.')
    }
  }

  const applyFilter = () => { 
    setAppliedMonth(draftMonth); 
    setAppliedStart(draftStart); 
    setAppliedEnd(draftEnd); 
    setAppliedStatus(draftStatus); 
    setPage(1); 
  }
  
  const resetFilter = () => { 
    setDraftMonth(''); setDraftStart(''); setDraftEnd(''); setDraftStatus('all'); 
    setAppliedMonth(''); setAppliedStart(''); setAppliedEnd(''); setAppliedStatus('all'); 
    setPage(1); 
  }

  const isDirty = draftMonth !== appliedMonth || draftStart !== appliedStart || draftEnd !== appliedEnd || draftStatus !== appliedStatus
  const isFiltered = appliedMonth !== '' || (appliedStart !== '' && appliedEnd !== '') || appliedStatus !== 'all'

  const maxRev = Math.max(...chart.map(d => d.revenue), 1)

  return (
    <>
      <style>{`
        @media print {
          /* Hide all regular screen elements */
          body * { visibility: hidden !important; }
          .np { display: none !important; }
          
          /* Display only the beautiful print area */
          #print-laporan, #print-laporan * { visibility: visible !important; display: block !important; }
          #print-laporan {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background-color: #ffffff !important;
            color: #1a1a1a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Manrope', sans-serif !important;
          }

          /* ENSURE EXPLICIT BLACK FOR ALMOST EVERYTHING TO BE SAFE */
          #print-laporan * {
            color: #000000 !important;
          }

          #print-laporan .text-secondary,
          #print-laporan .text-on-surface-variant {
            color: #444444 !important;
          }

          /* Handle box background colors for print */
          #print-laporan .bg-surface-container-low {
            background-color: #fafafa !important;
            border: 1px solid #eee !important;
          }
          #print-laporan .bg-surface-container-highest,
          #print-laporan .bg-surface-container-highest\/50 {
            background-color: #f1f1f1 !important;
          }
          
          /* Ensure lines and dividers are visible */
          #print-laporan .border-outline-variant\/5,
          #print-laporan .divide-outline-variant\/10 > * + * {
            border-color: #e5e5e5 !important;
          }
          
          /* Maintain primary color (gold) across print elements */
          #print-laporan .text-primary, 
          #print-laporan .text-primary-container,
          #print-laporan h1.text-primary {
            color: #b78b29 !important; /* Slightly darkened gold for better printing contrast */
          }
          #print-laporan .bg-primary {
            background-color: #cba340 !important;
          }
          
          /* Restore proper table layouts */
          #print-laporan table { display: table !important; width: 100% !important; border-collapse: collapse !important; }
          #print-laporan thead { display: table-header-group !important; }
          #print-laporan tbody { display: table-row-group !important; }
          #print-laporan tr { display: table-row !important; }
          #print-laporan th, #print-laporan td { display: table-cell !important; border-bottom: 1px solid #f0f0f0 !important; }
          #print-laporan .flex { display: flex !important; }
          #print-laporan .grid { display: grid !important; }
          @page { margin: 1cm; size: portrait; }
        }
      `}</style>

      <div className="pt-8 px-8 pb-12 min-h-screen">
        {loadingMain && <LoadingScreen />}
        {loadingPrint && (
          <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center text-on-surface space-y-4 animate-fadeIn">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold tracking-widest uppercase text-primary">Preparing Full Report...</p>
            <p className="text-xs text-secondary">Loading all transaction data ({totalRows} rows)</p>
          </div>
        )}
        {/* Header */}
        <div className="mb-8 np">
          <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Executive Insights</span>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-headline font-bold text-on-surface">Performance Report</h2>
              <p className="text-sm text-secondary mt-1">Summary of metrics and revenue. By default displays all data.</p>
            </div>
            <button onClick={handleExportPDF} disabled={loadingPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">download</span>
              {loadingPrint ? 'Loading...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="mb-8 bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 np">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Filter Reports</p>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Specific Range */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date"
                  className="bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg outline-none border border-outline-variant/30 text-sm focus:ring-1 focus:ring-primary w-36"
                  value={draftStart}
                  onChange={e => { setDraftStart(e.target.value); if(e.target.value) setDraftMonth(''); }} />
                <span className="text-secondary text-xs">-</span>
                <input type="date"
                  className="bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg outline-none border border-outline-variant/30 text-sm focus:ring-1 focus:ring-primary w-36"
                  value={draftEnd}
                  onChange={e => { setDraftEnd(e.target.value); if(e.target.value) setDraftMonth(''); }} />
              </div>
            </div>

            <div className="h-10 w-px bg-outline-variant/20 self-end mb-1"></div>

            {/* Month */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Month/Year </label>
              <input type="month"
                className="bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg outline-none border border-outline-variant/30 text-sm focus:ring-1 focus:ring-primary"
                value={draftMonth}
                onChange={e => { setDraftMonth(e.target.value); if(e.target.value) { setDraftStart(''); setDraftEnd(''); } }} />
            </div>
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Transaction Status</label>
              <div className="flex flex-wrap gap-1.5">
                {['all','completed','pending','processing','arrived','cancelled'].map(s => (
                  <button key={s} onClick={() => setDraftStatus(s)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
                      draftStatus === s ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-secondary hover:border-primary hover:text-primary'
                    }`}>
                    {SL[s]}
                  </button>
                ))}
              </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-2 pb-0.5">
              <button onClick={applyFilter} disabled={!isDirty}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-on-primary hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Apply Filter
              </button>
              {isFiltered && (
                <button onClick={resetFilter}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-outline-variant/30 text-secondary hover:border-primary hover:text-primary transition-colors">
                  Reset
                </button>
              )}
            </div>
          </div>
          {isFiltered && (
            <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
              {appliedMonth && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">📅 {appliedMonth}</span>}
              {appliedStatus !== 'all' && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">🔖 {SL[appliedStatus]}</span>}
            </div>
          )}
        </div>

        {error && <div className="mb-5 rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2 np"><span className="material-symbols-outlined text-base">error</span>{error}</div>}

        <div id="lp-area">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { icon:'payments', label:'Total Revenue', badge:'Revenue', value: loadingMain?'...':fmt(stats?.revenue??0), color:'text-emerald-400', bg:'bg-emerald-500/10' },
              { icon:'calendar_month', label:'Total Bookings', badge:'Booking', value: loadingMain?'...':String(stats?.total_booking??0), color:'text-sky-400', bg:'bg-sky-500/10' },
              { icon:'check_circle', label:'Booking Completed', badge:'Completed', value: loadingMain?'...':String(stats?.completed??0), color:'text-primary', bg:'bg-primary/10' },
              { icon:'group', label:'Total Member', badge:'Member', value: loadingMain?'...':String(stats?.total_members??0), color:'text-violet-400', bg:'bg-violet-500/10' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-low p-6 rounded-xl">
                <div className="flex justify-between items-start mb-5">
                  <div className={`p-2.5 ${c.bg} rounded-lg`}><span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span></div>
                  <span className={`text-[10px] font-bold ${c.color} ${c.bg} px-2 py-1 rounded`}>{c.badge}</span>
                </div>
                <p className="text-xs text-secondary font-medium mb-1">{c.label}</p>
                <h3 className="text-2xl font-headline font-bold text-white">{c.value}</h3>
              </div>
            ))}
          </div>

          {/* ── Chart + Services ── */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
              <div className="mb-6">
                <h4 className="text-lg font-headline font-bold text-white">
                  {chartMode === 'daily' ? 'Daily Revenue' : 'Monthly Revenue'}
                </h4>
                <p className="text-xs text-neutral-500">
                  {chartMode === 'daily' ? 'Today is highlighted in yellow.' : 'All time — select month for daily view.'}
                </p>
              </div>
              {loadingMain ? (
                <div className="h-56 flex items-center justify-center text-secondary text-sm">
                  <span className="material-symbols-outlined animate-spin mr-2">sync</span>Loading chart...
                </div>
              ) : chart.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-neutral-500 text-sm">No data available.</div>
              ) : (
                <>
                  <div className="relative h-52 w-full flex items-end gap-0.5 px-1">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0,1,2,3].map(i => <div key={i} className="border-t border-outline-variant/10 w-full h-px" />)}
                    </div>
                    {chart.map((day, idx) => {
                      const h = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0
                      const currentMonth = new Date().getMonth() + 1
                      const isToday = (chartMode === 'daily' && day.day === todayDay) || (chartMode === 'monthly' && day.day === currentMonth)
                      return (
                        <div key={idx} className="flex-1 group relative cursor-pointer" style={{ height:`${Math.max(h, day.revenue>0?4:0)}%` }}>
                          <div className={`w-full h-full rounded-t transition-colors ${
                            day.revenue === 0 ? 'bg-transparent' : isToday ? 'bg-yellow-400' : 'bg-surface-container-highest group-hover:bg-primary/70'
                          }`} />
                          {day.revenue > 0 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              {fmt(day.revenue)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-2 px-1 overflow-hidden">
                    {chart.filter((_,i) => chart.length <= 14 || i % Math.ceil(chart.length/14) === 0 || i === chart.length-1).map((d,i) => {
                      const currentMonth = new Date().getMonth() + 1
                      const isHighlight = (chartMode === 'daily' && d.day === todayDay) || (chartMode === 'monthly' && d.day === currentMonth)
                      return (
                        <span key={i} className={`text-[9px] font-bold truncate ${isHighlight ? 'text-yellow-400' : 'text-neutral-500'}`}>{d.label}</span>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-3 text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-yellow-400 inline-block"/>
                      {chartMode === 'daily' ? 'Today' : 'This Month'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-surface-container-highest inline-block"/>
                      Others
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
              <h4 className="text-lg font-headline font-bold text-white mb-6">Popular Services</h4>
              {loadingMain ? (
                <div className="flex items-center justify-center h-40 text-secondary text-sm"><span className="material-symbols-outlined animate-spin mr-2">sync</span>Loading...</div>
              ) : services.length === 0 ? (
                <p className="text-neutral-500 text-sm mt-4">No services data.</p>
              ) : (
                <div className="space-y-5">
                  {services.map((s,i) => (
                    <div key={s.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-secondary font-bold truncate max-w-[70%]">{s.name}</span>
                        <span className="text-white font-bold">{s.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${s.percentage}%`,background:`hsl(${220-i*30},80%,60%)`}} />
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{s.total_booked}x · {fmt(s.total_revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Barber Performance ── */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden mb-8">
            <div className="px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center">
              <h4 className="text-lg font-headline font-bold text-white">Barber Performance</h4>
              <div className="flex items-center gap-2 text-xs text-secondary font-medium"><span className="w-2 h-2 rounded-full bg-primary"/>Top Performer</div>
            </div>
            {loadingMain ? (
              <div className="py-12 text-center text-secondary text-sm"><span className="material-symbols-outlined animate-spin mr-2">sync</span>Loading...</div>
            ) : barbers.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-sm">No barber performance data.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface-container-high/50 text-neutral-500 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4 font-bold">Barber</th>
                    <th className="px-8 py-4 font-bold">Sessions</th>
                    <th className="px-8 py-4 font-bold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant/10">
                  {barbers.map((b,idx) => (
                    <tr key={b.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {idx===0 && <span className="material-symbols-outlined text-sm text-amber-400" style={{fontVariationSettings:"'FILL' 1"}}>emoji_events</span>}
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center bg-surface-container-highest flex-shrink-0">
                            {b.image ? <img src={b.image.startsWith('http')?b.image:`${IMAGE_BASE}/storage/${b.image}`} alt={b.name} className="w-full h-full object-cover"/> : <span className="material-symbols-outlined text-xs text-primary">person</span>}
                          </div>
                          <span className="font-bold text-white">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-neutral-400">{b.total_sessions} sessions</td>
                      <td className="px-8 py-4 text-right font-bold text-white">{fmtFull(b.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Register Transaksi ── */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            <div className="px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-headline font-bold text-white">Transaction Register</h4>
                {totalRows > 0 && <p className="text-xs text-neutral-500 mt-0.5">{totalRows} transactions</p>}
              </div>
              {isFiltered && (
                <div className="flex flex-wrap gap-1">
                  {appliedMonth && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">📅 {appliedMonth}</span>}
                  {appliedStatus !== 'all' && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">🔖 {SL[appliedStatus]}</span>}
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high/50 text-neutral-500 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-bold">Code</th>
                    <th className="px-6 py-4 font-bold">Customer</th>
                    <th className="px-6 py-4 font-bold">Barber</th>
                    <th className="px-6 py-4 font-bold">Service</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant/10">
                  {loadingTable ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-secondary text-sm"><span className="material-symbols-outlined animate-spin mr-2">sync</span>Loading...</td></tr>
                  ) : bookings.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-500 text-sm">No transactions{isFiltered?' for this filter':' right now'}.</td></tr>
                  ) : bookings.map(b => (
                    <tr key={b.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-4"><span className="font-mono text-xs text-primary">{b.unique_code}</span></td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-xs">{b.customer_name}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${b.customer_type==='Member'?'bg-primary/20 text-primary':'bg-neutral-700 text-neutral-400'}`}>{b.customer_type}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-400 text-xs">{b.barber_name}</td>
                      <td className="px-6 py-4 text-neutral-400 text-xs">{b.service_name}</td>
                      <td className="px-6 py-4 text-neutral-400 text-xs">{b.booking_date} <span className="text-neutral-600">{b.booking_time.slice(0,5)}</span></td>
                      <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded ${SC[b.status]??'bg-neutral-700 text-neutral-400'}`}>{SL[b.status]??b.status}</span></td>
                      <td className="px-6 py-4 text-right font-bold text-white text-xs">{fmtFull(b.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lastPage > 1 && (
              <div className="px-8 py-4 border-t border-outline-variant/10 flex items-center justify-between np">
                <p className="text-xs text-neutral-500">Page {page} of {lastPage}</p>
                <div className="flex gap-2">
                  <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 text-xs rounded border border-outline-variant/30 text-secondary hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
                  <button disabled={page>=lastPage} onClick={()=>setPage(p=>Math.min(lastPage,p+1))} className="px-3 py-1 text-xs rounded border border-outline-variant/30 text-secondary hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
                </div>
              </div>
            )}
          </div>

        </div>{/* end #lp-area */}
      </div>

      {/* ── Beautiful Print-only Template (pdflaporan.html Style) ── */}
      <div id="print-laporan" className="hidden">
        {/* Document Header Decor */}
        <div className="h-2 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
        
        {/* Top Bar Content */}
        <header className="px-16 pt-16 pb-12 flex justify-between items-end border-b border-outline-variant/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-sm">
                <span className="material-symbols-outlined text-surface text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>content_cut</span>
              </div>
              <div>
                <h1 className="text-primary font-serif font-black uppercase tracking-widest text-2xl">{settings?.shop_name || 'The Modern Artisan'}</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold opacity-70">Premium Grooming Atelier</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-on-surface font-serif text-3xl font-light italic">Performance Report</h2>
            <p className="text-secondary font-medium tracking-tight mt-1">
              Period: {appliedStart && appliedEnd ? `${appliedStart} to ${appliedEnd}` : appliedMonth || 'All Time'}
            </p>
          </div>
        </header>

        <main className="px-16 py-12 flex-grow">
          {/* Executive Summary Section */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-8 bg-primary"></span>
              <h3 className="font-serif text-xl font-bold tracking-tight uppercase text-primary">Executive Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {/* Revenue Highlight */}
              <div className="col-span-3 lg:col-span-1 bg-surface-container-low p-8 border-l-2 border-primary">
                <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">Total Revenue</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-primary-container font-serif text-4xl font-black">{fmt(stats?.revenue ?? 0)}</span>
                </div>
              </div>
              {/* Sessions Highlight */}
              <div className="col-span-3 lg:col-span-1 bg-surface-container-low p-8">
                <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">Total Sessions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-on-surface font-serif text-4xl font-black">{stats?.total_booking ?? 0}</span>
                </div>
              </div>
              {/* Rating Highlight */}
              <div className="col-span-3 lg:col-span-1 bg-surface-container-low p-8">
                <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">Total Members</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-on-surface font-serif text-4xl font-black">{stats?.total_members ?? 0}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-8 bg-primary"></span>
              <h3 className="font-serif text-xl font-bold tracking-tight uppercase text-primary">Recent Transactions</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50">
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-secondary font-black">Code</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-secondary font-black">Service</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-secondary font-black">Barber</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-secondary font-black">Customer</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-secondary font-black text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {(printBookings.length > 0 ? printBookings : bookings).map((b) => (
                  <tr key={b.id} className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5 text-sm font-mono text-primary">{b.unique_code}</td>
                    <td className="px-6 py-5 text-sm font-bold text-on-surface">{b.service_name}</td>
                    <td className="px-6 py-5 text-sm text-secondary">{b.barber_name}</td>
                    <td className="px-6 py-5 text-sm text-on-surface/80">{b.customer_name}</td>
                    <td className="px-6 py-5 text-sm font-bold text-primary text-right">{fmtFull(b.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-primary/20">
                <tr className="bg-surface-container-low">
                  <td colSpan={4} className="px-6 py-4 text-right font-bold text-secondary uppercase tracking-widest text-xs">Total Revenue</td>
                  <td className="px-6 py-4 text-right font-black text-primary text-lg">
                    {fmtFull((printBookings.length > 0 ? printBookings : bookings).reduce((sum, b) => sum + Number(b.total_amount || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Visual Insight */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="bg-surface-container-low p-8">
              <p className="text-secondary text-[11px] uppercase tracking-widest mb-6">Popular Services</p>
              <div className="space-y-4">
                {services.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-xs text-secondary font-bold">{s.name}</span>
                    <span className="text-xs text-primary font-bold">{s.percentage}% ({s.total_booked}x)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-low p-8">
              <p className="text-secondary text-[11px] uppercase tracking-widest mb-6">Performa Barber</p>
              <div className="space-y-4">
                {barbers.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-xs text-secondary font-bold">{b.name}</span>
                    <span className="text-xs text-white font-bold">{b.total_sessions} Sesi ({fmt(b.total_revenue)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
