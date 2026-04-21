const LocationSection = () => {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Location Info */}
          <div className="max-w-xl">
            <span className="text-primary font-label uppercase tracking-widest text-sm mb-4 block">
              Kunjungi Kami
            </span>
            <h2 className="font-headline text-4xl font-bold mb-8">Lokasi Kami</h2>
            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                <div>
                  <h4 className="font-bold text-xl mb-2">The Modern Artisan Jakarta</h4>
                  <p className="text-secondary leading-relaxed">
                    Jl. Senopati No. 88, <br />
                    Kebayoran Baru, Jakarta Selatan <br />
                    12110, Indonesia
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-center">
                <span className="material-symbols-outlined text-primary text-3xl">call</span>
                <p className="text-on-surface font-bold">+62 21 555 1234</p>
              </div>

              {/* Direction Button */}
              <div className="pt-8">
                <button className="border border-primary text-primary px-8 py-3 rounded-md font-bold hover:bg-primary hover:text-on-primary transition-all">
                  Petunjuk Arah
                </button>
              </div>
            </div>
          </div>

          {/* Map Visual */}
          <div className="relative h-[400px] rounded-lg overflow-hidden border border-outline-variant/20 shadow-2xl map-texture">
            {/* Pin Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 bg-primary rounded-full animate-ping absolute -inset-0 opacity-20"></div>
                <span
                  className="material-symbols-outlined text-primary text-6xl relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  location_on
                </span>
              </div>
            </div>

            {/* Decorative Map Lines */}
            <div className="absolute top-10 right-10 w-32 h-[2px] bg-outline-variant/30 rotate-45"></div>
            <div className="absolute bottom-20 left-10 w-48 h-[2px] bg-outline-variant/30 -rotate-12"></div>
            <div className="absolute top-1/2 right-1/4 w-[2px] h-32 bg-outline-variant/30"></div>

            {/* Bottom Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationSection
