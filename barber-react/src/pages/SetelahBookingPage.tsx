import { useNavigate, Link } from 'react-router-dom'

const SetelahBookingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="dark bg-surface text-on-surface font-body min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full">

          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/booking')}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label text-sm tracking-widest uppercase">Kembali ke Layanan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Booking Summary */}
            <div className="lg:col-span-3 space-y-6">
              <section className="bg-surface-container-low p-8 rounded-lg">
                <h1 className="font-headline text-3xl font-bold italic text-primary mb-6">Ringkasan Pesanan</h1>
                <div className="space-y-6">
                  {/* Service Item */}
                  <div className="flex items-center gap-6 p-4 bg-surface-container-high rounded-md">
                    <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt="Barber tools"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuByCbCPKfJ_QRJfZI3srBTqR1dISPwkS3eS6YRQms5Q1qPPanRfpWHK-s6ewZhFVz432j4JweyirKfXlUOBeNmytKYVAxrraam8c-ztZWpZglGCSER4WCycdBoEmdjzrixcIufBK-g5kwFU9HRS96f6eFBPwZhveWBrJKZ3z1SzCieoEN8PFyTkZ_xvhwQPWVRI_8Lwr8IVNZE_REsFmPHcv91_UcIxW997el9ujA_ELeCI3pLbHUb_qokTTROeybA_P1Zex2lhc-U"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline text-lg font-bold text-on-surface">The Signature Cut</h3>
                      <p className="text-sm text-on-surface-variant">Konsultasi, Cuci, Potong, &amp; Styling</p>
                    </div>
                    <div className="text-right">
                      <span className="text-primary font-bold">IDR 150k</span>
                    </div>
                  </div>

                  {/* Details Bento */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: 'calendar_today', label: 'Tanggal', value: '24 Oktober 2024' },
                      { icon: 'schedule', label: 'Waktu', value: '14:00 WIB' },
                      { icon: 'person', label: 'Kapster', value: 'Andra Pratama' },
                      { icon: 'location_on', label: 'Lokasi', value: 'Senopati Atelier' },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface-container-high p-5 rounded-md">
                        <span className="material-symbols-outlined text-primary mb-2 block">{item.icon}</span>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Payment & Confirmation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-low p-8 rounded-lg flex flex-col h-full border border-white/5">
                <h2 className="font-headline text-xl font-bold mb-6">Detail Pembayaran</h2>
                <div className="space-y-4 flex-grow">
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Layanan Utama</span>
                    <span>IDR 150.000</span>
                  </div>
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Biaya Layanan</span>
                    <span>IDR 5.000</span>
                  </div>
                  <div className="h-px bg-outline-variant/20 my-4"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Tagihan</span>
                    <span className="text-primary">IDR 155.000</span>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <button
                    id="btn-konfirmasi-booking"
                    onClick={() => navigate('/booking-berhasil')}
                    className="w-full text-on-primary font-bold py-4 rounded-md tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all"
                    style={{ background: 'linear-gradient(to right, #eac249, #c5a028)' }}
                  >
                    Konfirmasi Booking
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
                    Dengan mengonfirmasi, Anda menyetujui syarat &amp; ketentuan layanan The Modern Artisan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success State: Booking Berhasil */}
          <div className="mt-16 bg-surface-container-lowest p-12 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 className="font-headline text-4xl font-bold italic mb-2">Booking Berhasil</h1>
              <p className="text-secondary max-w-md mx-auto mb-10">
                Sesi Anda telah dijadwalkan. Silakan simpan kode booking di bawah ini untuk ditunjukkan kepada resepsionis.
              </p>
              <div className="bg-surface-container-high px-10 py-6 rounded-md mb-10 border border-primary/20">
                <p className="text-xs text-on-surface-variant uppercase tracking-[0.3em] mb-2">Kode Unik Anda</p>
                <p className="font-headline text-3xl font-bold tracking-widest text-primary">BRB-001-XYZ</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                {[
                  { icon: 'directions_run', title: 'Datang Tepat Waktu', desc: 'Mohon hadir 10 menit sebelum jadwal untuk konsultasi awal.' },
                  { icon: 'qr_code_2', title: 'Tunjukkan Kode', desc: 'Simpan tangkapan layar halaman ini atau cek email konfirmasi Anda.' },
                  { icon: 'map', title: 'Lokasi Kami', desc: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan.' },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                      <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex gap-4">
                <button
                  id="btn-unduh-tiket"
                  className="px-8 py-3 bg-surface-container-highest text-white font-bold rounded-md hover:bg-surface-bright transition-colors text-xs uppercase tracking-widest"
                >
                  Unduh Tiket
                </button>
                <button
                  id="btn-kembali-beranda"
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-primary text-on-primary font-bold rounded-md hover:opacity-90 transition-opacity text-xs uppercase tracking-widest"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#131313] w-full py-12 flex flex-col items-center gap-6 border-t border-white/5">
        <div className="flex flex-wrap justify-center gap-8 px-6">
          {['Tentang Kami','Kebijakan Privasi','Syarat & Ketentuan','Hubungi Kami'].map(l => (
            <a key={l} href="#" className="font-label text-xs uppercase tracking-widest text-secondary hover:text-white transition-colors duration-300">{l}</a>
          ))}
        </div>
        <div className="text-secondary font-label text-[10px] uppercase tracking-widest opacity-60">
          © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
        </div>
      </footer>
    </div>
  )
}

export default SetelahBookingPage
