import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import { bustSettingsCache } from '../../hooks/usePublicSettings'

const API_BASE = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsData {
  shop_name: string
  shop_email: string
  address: string
  latitude: string
  longitude: string
  phone: string
  operational_hours: string
  notes: string
}

const defaultSettings: SettingsData = {
  shop_name: '',
  shop_email: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  operational_hours: '',
  notes: '',
}

// ─── Simple Leaflet Map Picker ────────────────────────────────────────────────
function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number, address?: string) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Use OpenStreetMap with a click overlay approach via iframe message
  const centerLat = lat ?? -6.2297
  const centerLng = lng ?? 106.8178
  const zoom = 15

  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.01},${centerLat - 0.01},${centerLng + 0.01},${centerLat + 0.01}&layer=mapnik&marker=${centerLat},${centerLng}`

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-outline-variant/20 relative h-56" ref={mapRef}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full"
          title="Map Preview"
          loading="lazy"
        />
        {/* Overlay to show the pin is clickable note */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
          📌 Location preview. Set coordinates below.
        </div>
      </div>

      {/* Manual coordinate input */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Latitude
          </label>
          <input
            className="w-full bg-surface-container-highest border border-outline-variant/20 p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
            type="number"
            step="0.0001"
            placeholder="-6.2297"
            value={lat ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(v, lng ?? 106.8178)
            }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Longitude
          </label>
          <input
            className="w-full bg-surface-container-highest border border-outline-variant/20 p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
            type="number"
            step="0.0001"
            placeholder="106.8178"
            value={lng ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(lat ?? -6.2297, v)
            }}
          />
        </div>
      </div>

      <a
        href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=${zoom}/${centerLat}/${centerLng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[11px] text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-sm">open_in_new</span>
        Open in OpenStreetMap to find coordinates
      </a>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings]   = useState<SettingsData>(defaultSettings)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [message, setMessage]     = useState<string | null>(null)

  // Password change state
  const [showPwForm, setShowPwForm]       = useState(false)
  const [pwCurrent, setPwCurrent]         = useState('')
  const [pwNew, setPwNew]                 = useState('')
  const [pwConfirm, setPwConfirm]         = useState('')
  const [pwError, setPwError]             = useState<string | null>(null)
  const [pwSuccess, setPwSuccess]         = useState<string | null>(null)
  const [pwSaving, setPwSaving]           = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw]         = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const getToken = () => localStorage.getItem('auth_token')

  // ── Load settings ──────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
      })
      if (res.status === 401 || res.status === 403) { navigate('/login'); return }
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to load settings')
      setSettings({
        shop_name:         json.data.shop_name         || '',
        shop_email:        json.data.shop_email        || '',
        address:           json.data.address           || '',
        latitude:          json.data.latitude          != null ? String(json.data.latitude)  : '',
        longitude:         json.data.longitude         != null ? String(json.data.longitude) : '',
        phone:             json.data.phone             || '',
        operational_hours: json.data.operational_hours || '',
        notes:             json.data.notes             || '',
      })
    } catch {
      setError('Failed to fetch settings data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { loadSettings() }, [loadSettings])

  // ── Save settings ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const payload = {
        ...settings,
        latitude:  settings.latitude  !== '' ? parseFloat(settings.latitude)  : null,
        longitude: settings.longitude !== '' ? parseFloat(settings.longitude) : null,
      }
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed menyimpan pengaturan')
      setMessage('Settings berhasil disimpan.')
      bustSettingsCache()
      setSettings({
        shop_name:         json.data.shop_name         || settings.shop_name,
        shop_email:        json.data.shop_email        || settings.shop_email,
        address:           json.data.address           || settings.address,
        latitude:          json.data.latitude          != null ? String(json.data.latitude)  : settings.latitude,
        longitude:         json.data.longitude         != null ? String(json.data.longitude) : settings.longitude,
        phone:             json.data.phone             || settings.phone,
        operational_hours: json.data.operational_hours || settings.operational_hours,
        notes:             json.data.notes             || settings.notes,
      })
      // Trigger a custom event to notify other mounted components to reload settings if they listen to it
      window.dispatchEvent(new Event('settings-update'))
    } catch {
      setError('Failed to save settings. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError(null)
    setPwSuccess(null)

    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('All password fields must be filled.')
      return
    }
    if (pwNew.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('Password confirmation does not match.')
      return
    }

    setPwSaving(true)
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: pwCurrent,
          password: pwNew,
          password_confirmation: pwConfirm,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || json.errors?.password?.[0] || 'Failed to change password.')
      setPwSuccess('Password successfully changed.')
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const lat = settings.latitude  !== '' ? parseFloat(settings.latitude)  : null
  const lng = settings.longitude !== '' ? parseFloat(settings.longitude) : null

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pt-6 min-h-screen px-8 pb-12 bg-surface">
      {loading && <LoadingScreen />}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="max-w-xl">
          <span className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-3 block">
            Workspace Control
          </span>
          <h1 className="text-4xl font-headline font-bold mb-2 text-on-surface leading-tight">
            System Settings
          </h1>
          {settings.shop_name && (
            <p className="text-primary text-base font-semibold mb-1">{settings.shop_name}</p>
          )}
          <p className="text-secondary text-sm font-light max-w-md">
            Configure barbershop information, map location, operational hours, and admin account security.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || saving}
          className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}
      {message && (
        <div className="mb-5 rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-secondary">
          <span className="material-symbols-outlined animate-spin mr-3">sync</span>
          Memuat pengaturan...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* ── Left Column ── */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Info Barbershop */}
            <div className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">store</span>
                </div>
                <h2 className="text-xl font-headline font-bold tracking-tight">Barbershop Information</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Barbershop Name
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border border-outline-variant/20 p-3.5 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="text"
                      placeholder="Your shop name..."
                      value={settings.shop_name}
                      onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Business Email
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border border-outline-variant/20 p-3.5 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="email"
                      placeholder="email@domain.com"
                      value={settings.shop_email}
                      onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Phone Number
                  </label>
                  <input
                    className="w-full bg-surface-container-highest border border-outline-variant/20 p-3.5 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="text"
                    placeholder="+62 21 555 1234"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Complete Address
                  </label>
                  <textarea
                    className="w-full bg-surface-container-highest border border-outline-variant/20 p-3.5 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none h-20 resize-none transition-all"
                    placeholder="Jalan, Kelurahan, Kota..."
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>


              </div>
            </div>

            {/* Map Picker */}
            <div className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <h2 className="text-xl font-headline font-bold tracking-tight">Location on Map</h2>
                  <p className="text-xs text-secondary mt-0.5">Coordinates displayed on the landing page</p>
                </div>
              </div>
              <MapPicker
                lat={lat}
                lng={lng}
                onChange={(la, lo) =>
                  setSettings((s) => ({ ...s, latitude: String(la), longitude: String(lo) }))
                }
              />
            </div>
          </div>

          {/* ── Right Column: Preview + Security ── */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Preview card */}
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">preview</span>
                </div>
                <h2 className="text-xl font-headline font-bold tracking-tight">Preview</h2>
              </div>
              <div className="space-y-4">
                <InfoRow icon="storefront"  label="Name"            value={settings.shop_name || '–'} />
                <InfoRow icon="mail"        label="Email"           value={settings.shop_email || '–'} />
                <InfoRow icon="call"        label="Phone"         value={settings.phone || '–'} />
                <InfoRow icon="location_on" label="Address"          value={settings.address || '–'} />
                {(lat != null && lng != null) && (
                  <InfoRow icon="pin_drop"  label="Coordinates"       value={`${lat?.toFixed(4)}, ${lng?.toFixed(4)}`} />
                )}

              </div>
            </div>

            {/* Security */}
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <h2 className="text-xl font-headline font-bold tracking-tight">Account Security</h2>
              </div>

              <button
                onClick={() => { setShowPwForm(v => !v); setPwError(null); setPwSuccess(null) }}
                className="w-full text-left p-4 bg-surface-container-highest rounded-lg flex items-center justify-between group hover:bg-primary/10 transition-colors border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-base">key</span>
                  <span className="text-sm font-bold">Edit Admin Password</span>
                </div>
                <span className="material-symbols-outlined text-neutral-500 transition-transform group-hover:translate-x-0.5">
                  {showPwForm ? 'expand_less' : 'chevron_right'}
                </span>
              </button>

              {showPwForm && (
                <div className="mt-4 space-y-4">
                  {pwError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">error</span>{pwError}
                    </div>
                  )}
                  {pwSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>{pwSuccess}
                    </div>
                  )}

                  <PasswordInput
                    label="Current Password"
                    value={pwCurrent}
                    onChange={setPwCurrent}
                    show={showCurrentPw}
                    onToggle={() => setShowCurrentPw(v => !v)}
                  />
                  <PasswordInput
                    label="New Password (min. 6 characters)"
                    value={pwNew}
                    onChange={setPwNew}
                    show={showNewPw}
                    onToggle={() => setShowNewPw(v => !v)}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    value={pwConfirm}
                    onChange={setPwConfirm}
                    show={showConfirmPw}
                    onToggle={() => setShowConfirmPw(v => !v)}
                  />

                  <button
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                    className="w-full px-4 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    {pwSaving ? 'Saving...' : 'Save New Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  )
}

function PasswordInput({
  label, value, onChange, show, onToggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="w-full bg-surface-container-highest border border-outline-variant/20 p-3 pr-10 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">{show ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
    </div>
  )
}
