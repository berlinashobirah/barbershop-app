import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image + Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Interior Barbershop Mewah"
          className="w-full h-full object-cover opacity-60"
          data-alt="luxurious moody barbershop interior with vintage leather chairs, dark wood accents, and warm amber spotlighting creating a dramatic atmosphere"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ6G2wumyoNY4A76-JULHXvUE1EgCXw9e-S1WTT3wOVvbKnJ-xExXGV-hIHXB7cDmk6CdSsMxfLX2hYfUOh-Qfk_slVbDdAPbVeCXC7tDVbSv9zBsAWRywMWWTcPFV6qx9-eEhAj0u_Vmpc_NnDg6WiAkj7hd3NyqzcKAywaNYfB9KZ-l9TRervSDzQLajTSTuSDdAqry48w6kJaGFHpkcX6J3u24i8IWLSAymIZU_931qLkatGmtde5v5ogY1d9muk6ZXCqQ3TzQ"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl">
          <span className="text-primary font-label uppercase tracking-[0.3em] mb-4 block">
            Est. 2024
          </span>
          <h1 className="font-headline text-5xl md:text-7xl font-bold leading-tight mb-6 text-on-surface">
            Presisi dalam <br />
            <span className="italic font-normal text-primary">Setiap Potongan</span>
          </h1>
          <p className="text-secondary text-lg mb-10 max-w-lg leading-relaxed">
            Lebih dari sekadar potong rambut. Kami memberikan pengalaman perawatan pria yang
            memadukan teknik tradisional dengan gaya modern yang tajam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              id="btn-booking-hero"
              onClick={() => navigate('/konfirmasi-identitas')}
              className="gold-shimmer text-on-primary px-8 py-4 rounded-md font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Booking Sekarang
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
            <button className="border border-outline-variant/30 text-on-surface px-8 py-4 rounded-md font-bold text-lg hover:bg-surface-container-high transition-all">
              Lihat Menu Layanan
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
