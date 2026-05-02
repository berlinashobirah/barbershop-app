import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Deklarasi global window.snap dari Midtrans Snap.js
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const SetelahBookingPage = () => {
  const navigate = useNavigate()
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [paymentPending, setPaymentPending] = useState(false)

  // Baca data booking dari localStorage
  const bookingStr = localStorage.getItem('last_booking')
  const booking = bookingStr ? JSON.parse(bookingStr) : null

  const token = localStorage.getItem('auth_token')

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handlePayment = async () => {
    if (!booking) return
    setPaymentLoading(true)

    try {
      let res;
      if (token) {
        res = await axios.post(
          `http://localhost:8000/api/bookings/${booking.id}/payment`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        // Guest: gunakan endpoint berbeda (tanpa auth, hanya butuh booking id)
        res = await axios.post(`http://localhost:8000/api/bookings/${booking.id}/payment/guest`, {})
      }

      const snapToken = res.data.snap_token

      // Helper: sinkron status pembayaran dari Midtrans ke database
      // Penting untuk development localhost karena webhook Midtrans tidak bisa reach localhost
      const syncPaymentStatus = async () => {
        try {
          await axios.post(`http://localhost:8000/api/bookings/${booking.id}/verify-payment`)
        } catch (_) {
          // Abaikan error sinkronisasi — webhook production akan handle ini
        }
      }

      // Trigger Midtrans Snap pop-up
      window.snap.pay(snapToken, {
        onSuccess: async (_result) => {
          await syncPaymentStatus()      // Update DB → 'paid'
          localStorage.removeItem('last_booking')
          setPaymentDone(true)
          setPaymentLoading(false)
        },
        onPending: async (_result) => {
          await syncPaymentStatus()      // Update DB → 'unpaid' (menunggu konfirmasi)
          setPaymentPending(true)
          setPaymentLoading(false)
        },
        onError: async (_result) => {
          await syncPaymentStatus()      // Update DB → 'failed'
          alert('Pembayaran gagal. Silakan coba lagi.')
          setPaymentLoading(false)
        },
        onClose: () => {
          // User tutup popup tanpa bayar — tidak perlu sinkron, status tetap unpaid
          setPaymentLoading(false)
        }
      })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran.')
      setPaymentLoading(false)
    }
  }

  // Tampilan jika booking tidak ada (akses langsung)
  if (!booking) {
    return (
      <div className="dark bg-surface text-on-surface font-body min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <span className="material-symbols-outlined text-6xl text-secondary opacity-50">receipt_long</span>
          <h1 className="font-headline text-3xl font-bold">Tidak Ada Booking</h1>
          <p className="text-secondary">Anda belum memiliki booking aktif. Silakan buat reservasi terlebih dahulu.</p>
          <button
            onClick={() => navigate('/booking')}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold tracking-widest uppercase hover:brightness-110 transition-all"
          >
            Buat Booking
          </button>
        </div>
      </div>
    )
  }

  // Tampilan SUKSES setelah pembayaran
  if (paymentDone) {
    return (
      <div className="dark bg-surface text-on-surface font-body min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-xl w-full">
          {/* Animasi sukses */}
          <div className="w-24 h-24 bg-primary/10 flex items-center justify-center rounded-full mx-auto animate-pulse">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-headline text-4xl font-bold italic text-primary">Booking Berhasil!</h1>
          <p className="text-secondary max-w-md mx-auto">
            Pembayaran dikonfirmasi. Sesi Anda telah dijadwalkan. Simpan kode booking ini.
          </p>
          <div className="bg-surface-container-high px-10 py-6 rounded-xl border border-primary/20 inline-block mx-auto">
            <p className="text-xs text-secondary uppercase tracking-[0.3em] mb-2">Kode Booking Anda</p>
            <p className="font-headline text-3xl font-bold tracking-widest text-primary">{booking.unique_code}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-4">
            {[
              { icon: 'directions_run', title: 'Datang Tepat Waktu', desc: 'Hadir 10 menit sebelum jadwal untuk konsultasi awal.' },
              { icon: 'qr_code_2', title: 'Tunjukkan Kode', desc: 'Simpan tangkapan layar halaman ini dan tunjukkan ke resepsionis.' },
              { icon: 'map', title: 'Lokasi Kami', desc: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan.' },
            ].map(item => (
              <div key={item.icon} className="flex items-start gap-3 bg-surface-container-low p-4 rounded-lg">
                <span className="material-symbols-outlined text-primary mt-0.5">{item.icon}</span>
                <div>
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold tracking-widest uppercase hover:brightness-110 transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  // Tampilan utama — Ringkasan booking + tombol bayar
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
              <span className="font-label text-sm tracking-widest uppercase">Pesan Lagi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Booking Summary */}
            <div className="lg:col-span-3 space-y-6">
              <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
                <h1 className="font-headline text-3xl font-bold italic text-primary mb-6">Ringkasan Pesanan</h1>

                {/* Service Item */}
                <div className="flex items-center gap-6 p-4 bg-surface-container-high rounded-md mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">content_cut</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-headline text-lg font-bold">{booking.service_name || 'Layanan Barbershop'}</h3>
                    <p className="text-sm text-secondary">Premium Barbershop Service</p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-bold">{formatRupiah(booking.total_amount)}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: 'calendar_today', label: 'Tanggal', value: formatDate(booking.booking_date) },
                    { icon: 'schedule', label: 'Waktu', value: booking.booking_time?.slice(0, 5) + ' WIB' },
                    { icon: 'person', label: 'Kapster', value: booking.barber_name || 'Kapster Tersedia' },
                    { icon: 'confirmation_number', label: 'Kode Booking', value: booking.unique_code },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface-container-high p-4 rounded-md">
                      <span className="material-symbols-outlined text-primary mb-2 block text-lg">{item.icon}</span>
                      <p className="text-xs text-secondary uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-bold mt-1 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Status Badge */}
                {paymentPending && (
                  <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 text-yellow-400 p-3 rounded-md text-sm">
                    <span className="material-symbols-outlined text-base">pending</span>
                    Pembayaran Anda sedang diproses. Harap selesaikan sesuai instruksi.
                  </div>
                )}
              </section>
            </div>

            {/* Right: Payment */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-low p-8 rounded-lg flex flex-col border border-outline-variant/10 shadow-xl">
                <h2 className="font-headline text-xl font-bold mb-6">Detail Pembayaran</h2>

                {/* Payment Status */}
                <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                  <span className="material-symbols-outlined text-yellow-400 text-base">hourglass_empty</span>
                  <div>
                    <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Status Pembayaran</p>
                    <p className="text-sm text-yellow-400/80 font-semibold">Menunggu Pembayaran</p>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex justify-between text-sm text-secondary">
                    <span>{booking.service_name || 'Layanan'}</span>
                    <span>{formatRupiah(booking.total_amount)}</span>
                  </div>
                  <div className="h-px bg-outline-variant/20 my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Tagihan</span>
                    <span className="text-primary">{formatRupiah(booking.total_amount)}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    id="btn-konfirmasi-booking"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="w-full text-on-primary font-bold py-4 rounded-md tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(to right, #eac249, #c5a028)' }}
                  >
                    {paymentLoading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">payment</span>
                        Bayar Sekarang
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/120px-Stripe_Logo%2C_revised_2016.svg.png" alt="midtrans" className="h-3 opacity-40 hidden" />
                    <p className="text-[10px] text-center text-secondary/50 leading-relaxed">
                      Pembayaran aman melalui <span className="font-bold">Midtrans</span>. Kami mendukung GoPay, OVO, DANA, QRIS, Transfer Bank, dan Kartu Kredit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#131313] w-full py-8 flex flex-col items-center gap-4 border-t border-white/5">
        <div className="flex flex-wrap justify-center gap-6 px-6">
          {['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Hubungi Kami'].map(l => (
            <a key={l} href="#" className="font-label text-xs uppercase tracking-widest text-secondary hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-secondary font-label text-[10px] uppercase tracking-widest opacity-50">
          © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
        </div>
      </footer>
    </div>
  )
}

export default SetelahBookingPage
