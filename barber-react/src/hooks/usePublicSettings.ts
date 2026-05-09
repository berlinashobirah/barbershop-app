import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8000/api'

interface PublicSettings {
  shop_name: string
  address: string
  phone: string
  operational_hours: string
  latitude: number | null
  longitude: number | null
}

let cached: PublicSettings | null = null

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(cached)

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${API_BASE}/settings`)
        .then(r => r.json())
        .then(json => {
          if (json?.data) {
            cached = {
              shop_name:         json.data.shop_name         || '',
              address:           json.data.address           || '',
              phone:             json.data.phone             || '',
              operational_hours: json.data.operational_hours || '',
              latitude:          json.data.latitude          ?? null,
              longitude:         json.data.longitude         ?? null,
            }
            setSettings(cached)
          }
        })
        .catch(() => {})
    }

    if (cached) {
      setSettings(cached)
    } else {
      fetchSettings()
    }

    const handleUpdate = () => {
      cached = null
      fetchSettings()
    }

    window.addEventListener('settings-update', handleUpdate)
    return () => {
      window.removeEventListener('settings-update', handleUpdate)
    }
  }, [])

  return settings
}

/** Call this after saving settings to bust the cache */
export function bustSettingsCache() {
  cached = null
}
