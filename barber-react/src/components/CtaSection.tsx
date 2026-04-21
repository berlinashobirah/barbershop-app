import { useNavigate } from 'react-router-dom'

const CtaSection = () => {
  const navigate = useNavigate()
  return (
    <section className="py-24 bg-surface flex flex-col items-center text-center px-8 relative overflow-hidden">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="grid grid-cols-6 h-full">
          <div className="border-r border-on-surface"></div>
          <div className="border-r border-on-surface"></div>
          <div className="border-r border-on-surface"></div>
          <div className="border-r border-on-surface"></div>
          <div className="border-r border-on-surface"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
          Siap Untuk Tampilan Baru?
        </h2>
        <p className="text-secondary text-lg mb-10">
          Amankan slot Anda sekarang dan rasakan pengalaman potong rambut terbaik di kota ini.
          Antrean berjalan cepat, namun kualitas tetap utama.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Hours Badge */}
          <div className="bg-surface-container-low p-6 rounded-lg flex items-center gap-4 text-left border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
            <div>
              <p className="text-xs uppercase text-secondary font-bold tracking-widest">
                Jam Operasional
              </p>
              <p className="font-bold">10:00 - 21:00 WIB</p>
            </div>
          </div>

          {/* Book Button */}
          <button
            id="btn-booking-cta"
            onClick={() => navigate('/konfirmasi-identitas')}
            className="gold-shimmer text-on-primary px-12 py-6 rounded-md font-bold text-xl hover:scale-105 transition-all shadow-lg"
          >
            Booking Sekarang
          </button>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
