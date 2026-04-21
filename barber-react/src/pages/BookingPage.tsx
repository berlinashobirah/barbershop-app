import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

type TimeSlot = { time: string; label: string; status: 'available' | 'full' | 'selected' }

const services = [
  { id: 'signature', icon: 'content_cut', name: 'The Signature Cut', desc: 'Konsultasi gaya, cuci rambut premium, pemotongan presisi, dan styling akhir.', price: 'Rp 150k', amount: 150000 },
  { id: 'shave', icon: 'face_5', name: 'Traditional Shave', desc: 'Pencukuran jenggot tradisional dengan handuk panas dan pijat wajah ringan.', price: 'Rp 120k', amount: 120000 },
]

const barbers = [
  { id: 'andra', name: 'Andra Pratama', role: 'Master of Fades', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2_JlHcOviS9eM8qyGRtiBfT-bTGSrysiEjH-wekfyNlSNH0SCAr-15aDK3lIMsgYPh8Kw7_2oBUnKQsdAxiH_4CQLp_pQc6tnRaTRej3I9LFW_J_baCFJ1atJa73pgYlAwpdNQRK3qxTgsKMT4y4q7n9YADEHb-216SuaSmf5upQwzAR9QeIFkVnoe8BhVyG0Wo2oZV6yCRsfLilstrAGD5Ldu1mx6KdwgMh_CyNjQTpSXtX8a2-G7pSsUCJ-vhdqMnDZGrZCnMo' },
  { id: 'budi', name: 'Budi Santoso', role: 'Classic Shave Expert', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXU2x_Y8P_yU-7E6_XlWzJ9Q-vR7U39k_j1XqW9JvG6a_WkH_R-1-pS9Lq-Kz-I=s400' },
  { id: 'rizky', name: 'Rizky Alamsyah', role: 'Modern Styling Guru', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXU2x_Y8P_yU-7E6_XlWzJ9Q-vR7U39k_j1XqW9JvG6a_WkH_R-1-pS9Lq-Kz-I=s400' },
  { id: 'damar', name: 'Damar Jati', role: 'Beard Sculptor', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXU2x_Y8P_yU-7E6_XlWzJ9Q-vR7U39k_j1XqW9JvG6a_WkH_R-1-pS9Lq-Kz-I=s400' },
]

const timeSlots: TimeSlot[] = [
  { time: '10:00', label: '1 Slot Tersedia', status: 'available' },
  { time: '11:00', label: '2 Slot Tersedia', status: 'available' },
  { time: '12:00', label: 'Sudah Penuh', status: 'full' },
  { time: '13:00', label: '3 Slot Tersedia', status: 'available' },
  { time: '14:00', label: 'Terpilih', status: 'selected' },
  { time: '15:00', label: '1 Slot Tersedia', status: 'available' },
  { time: '16:00', label: 'Sudah Penuh', status: 'full' },
  { time: '17:00', label: '2 Slot Tersedia', status: 'available' },
]

const BookingPage = () => {
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState('signature')
  const [selectedBarber, setSelectedBarber] = useState('andra')
  const [selectedTime, setSelectedTime] = useState('14:00')

  const service = services.find((s) => s.id === selectedService)!
  const barber = barbers.find((b) => b.id === selectedBarber)!

  return (
    <div className="dark bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-md flex justify-between items-center px-8 h-20">
        <Link to="/" className="text-2xl font-headline italic text-primary">The Modern Artisan</Link>
        <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
          <Link to="/" className="text-secondary hover:text-primary transition-colors duration-300">Beranda</Link>
          <Link to="/" className="text-secondary hover:text-primary transition-colors duration-300">Layanan</Link>
          <span className="text-primary border-b-2 border-primary pb-1 cursor-default">Pesan Sesi</span>
        </div>
        <Link to="/login" className="bg-primary text-on-primary px-6 py-2 rounded-md font-bold hover:opacity-80 transition-all">Masuk</Link>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">Reservasi Sesi Presisi</h1>
          <p className="text-secondary max-w-2xl text-lg">Pilih layanan dan waktu yang sesuai dengan jadwal Anda. Setiap slot terbatas untuk 3 tamu guna menjaga eksklusivitas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Selection Flow */}
          <div className="lg:col-span-8 space-y-12">

            {/* Section 1: Layanan */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">01.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Pilih Layanan Utama</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`bg-surface-container-low p-6 rounded-lg border-l-4 transition-all cursor-pointer group ${selectedService === svc.id ? 'border-primary' : 'border-primary/30 hover:border-primary'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">{svc.icon}</span>
                      <span className="text-primary font-bold">{svc.price}</span>
                    </div>
                    <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">{svc.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{svc.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Kapster */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">02.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Pilih Kapster</h2>
              </div>
              <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                  {barbers.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBarber(b.id)}
                      className={`min-w-[200px] flex-shrink-0 bg-surface-container-low border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedBarber === b.id ? 'border-primary' : 'border-transparent hover:border-outline-variant'}`}
                    >
                      <div className="relative mb-4">
                        <img alt={b.name} className="w-full h-40 object-cover rounded grayscale" src={b.img} />
                        {selectedBarber === b.id && (
                          <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full p-1">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </div>
                        )}
                      </div>
                      <h3 className={`font-bold ${selectedBarber === b.id ? 'text-primary' : ''}`}>{b.name}</h3>
                      <p className="text-[10px] text-secondary uppercase tracking-widest mt-1">{b.role}</p>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none"></div>
              </div>
            </section>

            {/* Section 3: Waktu */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">03.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Atur Waktu Kedatangan</h2>
              </div>
              <div className="bg-surface-container-low p-8 rounded-lg space-y-8">
                {/* Calendar header */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline text-lg font-bold">Oktober 2024</h3>
                    <div className="flex gap-4">
                      <button className="p-2 hover:bg-surface-container-high rounded-md transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                      <button className="p-2 hover:bg-surface-container-high rounded-md transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                    {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[null, null, 1,2,3,4,5,6,7,8,9,10,11,12].map((d, i) => (
                      d === null ? <div key={i} className="h-12 flex items-center justify-center text-surface-container-highest">{ i === 0 ? 29 : 30 }</div>
                      : <div key={d} className={`h-12 flex items-center justify-center rounded-md cursor-pointer transition-all ${d === 4 ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container-high'}`}>{d}</div>
                    ))}
                  </div>
                </div>
                {/* Time slots */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline text-lg font-bold">Slot Jam Tersedia</h3>
                    <span className="text-xs text-secondary italic">* Maksimal 3 orang per slot</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time
                      const isFull = slot.status === 'full'
                      return (
                        <button
                          key={slot.time}
                          disabled={isFull}
                          onClick={() => !isFull && setSelectedTime(slot.time)}
                          className={`p-4 rounded-md text-center transition-all ${
                            isSelected
                              ? 'bg-primary text-on-primary border border-primary'
                              : isFull
                              ? 'bg-surface-container-lowest border border-transparent opacity-40 cursor-not-allowed'
                              : 'bg-surface-container-high border border-outline-variant hover:border-primary'
                          }`}
                        >
                          <div className="text-lg font-bold">{slot.time}</div>
                          <div className={`text-[10px] uppercase tracking-tighter ${isSelected ? 'text-on-primary/80' : isFull ? 'text-error' : 'text-primary'}`}>
                            {isSelected ? 'Terpilih' : slot.label}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface-container-low rounded-lg p-8 space-y-8 border-t-2 border-primary">
              <h3 className="font-headline text-xl font-bold tracking-tight">Ringkasan Sesi</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">Layanan</p>
                    <p className="font-bold">{service.name}</p>
                  </div>
                  <span className="text-primary font-bold">{service.price}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">Tanggal</p>
                    <p className="font-bold">Jumat, 4 Okt 2024</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">Jam</p>
                    <p className="font-bold">{selectedTime} WIB</p>
                  </div>
                </div>
                <div className="bg-surface-container-high p-4 rounded flex items-center gap-4">
                  <img alt={barber.name} className="w-12 h-12 rounded-full object-cover grayscale" src={barber.img} />
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-widest">Kapster Terpilih</p>
                    <p className="font-bold text-sm">{barber.name}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-lg font-bold">Total Pembayaran</p>
                  <p className="font-headline text-2xl font-bold text-primary italic">
                    Rp {service.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  id="btn-konfirmasi-jadwal"
                  onClick={() => navigate('/setelah-booking')}
                  className="w-full bg-primary text-on-primary py-4 rounded-md font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Konfirmasi Jadwal
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <p className="text-[10px] text-secondary text-center mt-4">Pilih 'Konfirmasi' untuk mendapatkan nomor antrean digital Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#131313] w-full py-12 flex flex-col items-center gap-6 border-t border-white/5">
        <div className="flex gap-8">
          {['Tentang Kami','Kebijakan Privasi','Syarat & Ketentuan','Hubungi Kami'].map(l => (
            <a key={l} href="#" className="text-secondary hover:text-white font-label text-xs uppercase tracking-widest transition-colors duration-300">{l}</a>
          ))}
        </div>
        <p className="text-secondary font-label text-xs uppercase tracking-widest">© 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.</p>
      </footer>
    </div>
  )
}

export default BookingPage
