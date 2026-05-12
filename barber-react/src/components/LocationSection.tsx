import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

interface Settings {
  shop_name: string
  address: string
  phone: string
  operational_hours: string
  latitude: number | null
  longitude: number | null
}

const LocationSection = () => {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then(r => r.json())
      .then(json => {
        if (json?.data) {
          setSettings({
            shop_name: json.data.shop_name || 'The Modern Artisan',
            address: json.data.address || '',
            phone: json.data.phone || '',
            operational_hours: json.data.operational_hours || '',
            latitude: json.data.latitude ?? null,
            longitude: json.data.longitude ?? null,
          })
        }
      })
      .catch(() => {/* silent */})
  }, [])

  const lat = settings?.latitude ?? -6.2297
  const lng = settings?.longitude ?? 106.8178
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012},${lat - 0.012},${lng + 0.012},${lat + 0.012}&layer=mapnik&marker=${lat},${lng}`
  const mapLinkUrl  = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Info */}
          <div className="max-w-xl">
            <span className="text-primary font-label uppercase tracking-widest text-sm mb-4 block">
              Visit Us
            </span>
            <h2 className="font-headline text-4xl font-bold mb-8">Our Location</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                <div>
                  <h4 className="font-bold text-xl mb-2">
                    {settings?.shop_name || 'The Modern Artisan'}
                  </h4>
                  <p className="text-secondary leading-relaxed">
                    {settings?.address
                      ? settings.address.split(',').map((part, i) => (
                          <span key={i}>{part.trim()}{i < settings.address.split(',').length - 1 ? <><br /></> : null}</span>
                        ))
                      : <>Jl. Senopati No. 88, <br /> Kebayoran Baru, Jakarta Selatan <br /> 12110, Indonesia</>
                    }
                  </p>
                </div>
              </div>

              {settings?.phone && (
                <div className="flex gap-4 items-center">
                  <span className="material-symbols-outlined text-primary text-3xl">call</span>
                  <p className="text-on-surface font-bold">{settings.phone}</p>
                </div>
              )}

              {settings?.operational_hours && (
                <div className="flex gap-4 items-center">
                  <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">Operational Hours</p>
                    <p className="text-on-surface font-bold">{settings.operational_hours}</p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <a
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-primary text-primary px-8 py-3 rounded-md font-bold hover:bg-primary hover:text-on-primary transition-all"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[420px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-2xl">
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full"
              title="Lokasi Barbershop"
              loading="lazy"
              style={{ filter: 'brightness(0.9) contrast(1.05)' }}
            />
            {/* Gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/40 via-transparent to-transparent pointer-events-none" />
            {/* Info chip */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm">location_on</span>
              {settings?.shop_name || 'The Modern Artisan'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationSection
