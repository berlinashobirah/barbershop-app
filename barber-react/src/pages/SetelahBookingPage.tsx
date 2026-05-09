import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import html2canvas from 'html2canvas'
import TicketTemplate from '../components/TicketTemplate'
import LoadingScreen from '../components/LoadingScreen'
import AlertModal from '../components/AlertModal'

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
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' as 'success'|'error'|'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // Baca data booking dari localStorage
  const [booking] = useState(() => {
    const bookingStr = localStorage.getItem('last_booking')
    return bookingStr ? JSON.parse(bookingStr) : null
  })

  const [paymentDone, setPaymentDone] = useState(() => {
    return booking ? booking.payment_status === 'paid' : false
  })

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

      // Jika total tagihan 0 (FREE), lewati midtrans
      if (snapToken === 'FREE') {
        localStorage.removeItem('last_booking')
        setPaymentMethod('Promo / Gratis')
        setPaymentDone(true)
        setPaymentLoading(false)
        
        // Generate PNG and send to WA
        setTimeout(async () => {
          const ticketElement = document.getElementById('ticket-template');
          if (ticketElement) {
            try {
              const canvas = await html2canvas(ticketElement, { backgroundColor: '#1a1a1a', scale: 2 });
              const base64Image = canvas.toDataURL('image/png');
              
              await axios.post(`http://localhost:8000/api/bookings/${booking.id}/send-whatsapp`, {
                ticket_image: base64Image
              });
              try {
                await axios.post(`http://localhost:8000/api/bookings/${booking.id}/send-ticket-email`);
              } catch (emailErr) {
                console.error("Failed to send email", emailErr);
              }
              console.log("Pesan WA & Email berhasil diproses!");
            } catch (e) {
              console.error("Failed to generate and send ticket PNG", e);
            }
          }
        }, 1000);
        return;
      }

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
        onSuccess: async (result) => {
          await syncPaymentStatus()      // Update DB → 'paid'
          localStorage.removeItem('last_booking')
          
          let method = 'Midtrans Online';
          if (result && result.payment_type) {
             if (result.payment_type === 'bank_transfer' && result.va_numbers && result.va_numbers.length > 0) {
                 method = result.va_numbers[0].bank.toUpperCase() + ' VA';
             } else if (result.payment_type === 'qris') {
                 method = 'QRIS';
             } else if (result.payment_type === 'echannel') {
                 method = 'Mandiri Bill';
             } else if (result.payment_type === 'gopay' || result.payment_type === 'shopeepay') {
                 method = result.payment_type.charAt(0).toUpperCase() + result.payment_type.slice(1);
             } else {
                 method = result.payment_type.replace('_', ' ').toUpperCase();
             }
          }
          setPaymentMethod(method);
          setPaymentDone(true)
          setPaymentLoading(false)
          
 // Generate PNG and send to WA
          setTimeout(async () => {
            const ticketElement = document.getElementById('ticket-template');
            if (ticketElement) {
              try {
                const canvas = await html2canvas(ticketElement, { backgroundColor: '#1a1a1a', scale: 2 });
                const base64Image = canvas.toDataURL('image/png');
                
                await axios.post(`http://localhost:8000/api/bookings/${booking.id}/send-whatsapp`, {
                  ticket_image: base64Image
                });
                try {
                  await axios.post(`http://localhost:8000/api/bookings/${booking.id}/send-ticket-email`);
                } catch (emailErr) {
                  console.error("Failed to send email", emailErr);
                }
                console.log("Pesan WA & Email berhasil diproses!");
              } catch (e) {
                console.error("Failed to generate and send ticket PNG", e);
              }
            }
          }, 1000); // Tunggu sebentar agar render selesai
        },
        onPending: async (_result) => {
          await syncPaymentStatus()      // Update DB → 'unpaid' (menunggu konfirmasi)
          setPaymentPending(true)
          setPaymentLoading(false)
        },
        onError: async (_result) => {
          await syncPaymentStatus()      // Update DB → 'failed'
          setAlertConfig({ isOpen: true, message: 'Pembayaran gagal. Silakan coba lagi.', type: 'error' })
          setPaymentLoading(false)
        },
        onClose: () => {
          // User tutup popup tanpa bayar — tidak perlu sinkron, status tetap unpaid
          setPaymentLoading(false)
        }
      })
    } catch (err: any) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || 'Gagal memproses pembayaran.', type: 'error' })
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

  // Removed separate success screen, now integrated below

  // Tampilan utama — Ringkasan booking + tombol bayar
  return (
    <>
      <TicketTemplate 
        uniqueCode={booking.unique_code} 
        serviceName={booking.service_name || 'ARTISAN HAIRCUT'} 
        date={formatDate(booking.booking_date)} 
        time={booking.booking_time?.slice(0, 5) + ' WIB'} 
      />
      
      <div className="dark bg-surface text-on-surface font-body min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
        {paymentLoading && <LoadingScreen />}
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full">

          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label text-sm tracking-widest uppercase">Kembali ke Beranda</span>
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

                {/* Promo Badge */}
                {booking.campaign_title && (
                  <div className="mt-4 flex items-center gap-2 bg-primary/10 text-primary p-3 rounded-md text-sm border border-primary/20">
                    <span className="material-symbols-outlined text-base">loyalty</span>
                    <span className="font-bold">Promo Dipakai:</span> {booking.campaign_title}
                  </div>
                )}

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

                {/* Payment Status (Only when not paid) */}
                {!paymentDone && (
                  <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                    <span className="material-symbols-outlined text-yellow-400 text-base">hourglass_empty</span>
                    <div>
                      <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Status Pembayaran</p>
                      <p className="text-sm text-yellow-400/80 font-semibold">Menunggu Pembayaran</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 flex-grow">
                  <div className="flex justify-between text-sm text-secondary">
                    <span>{booking.service_name || 'Layanan Utama'}</span>
                    <span>{formatRupiah((Number(booking.total_amount) || 0) + (Number(booking.discount_amount) || 0))}</span>
                  </div>
                  
                  {booking.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-primary font-bold">
                      <span>Promo Diskon</span>
                      <span>-{formatRupiah(booking.discount_amount)}</span>
                    </div>
                  )}

                  {booking.points_deducted > 0 && (
                    <div className="flex justify-between text-xs text-error font-semibold bg-error/10 p-2 rounded">
                      <span>Poin Ditukar</span>
                      <span>-{booking.points_deducted} Poin</span>
                    </div>
                  )}

                  {paymentDone && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Metode Pembayaran</span>
                      <span className="uppercase">{paymentMethod || 'Midtrans Online'}</span>
                    </div>
                  )}
                  <div className="h-px bg-outline-variant/20 my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Tagihan</span>
                    <span className="text-primary">{formatRupiah(booking.total_amount)}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {paymentDone ? (
                    <button
                      onClick={() => document.getElementById('success-block')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-md tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Lihat Detail
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Success Block (Only shows after payment is done) */}
          {paymentDone && (
            <div id="success-block" className="mt-16 bg-surface-container-lowest p-12 rounded-lg relative overflow-hidden group animate-fadeIn">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="text-4xl font-bold italic mb-2">Booking Berhasil</h1>
                <p className="text-secondary max-w-md mx-auto mb-10">Sesi Anda telah dijadwalkan. Silakan simpan kode booking di bawah ini untuk ditunjukkan kepada resepsionis.</p>
                <div className="bg-surface-container-high px-10 py-6 rounded-md mb-10 border border-primary/20">
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.3em] mb-2">Kode Unik Anda</p>
                  <p className="text-3xl font-bold tracking-widest text-primary">{booking.unique_code}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">directions_run</span>
                    <div>
                      <h4 className="text-sm font-bold mb-1">Datang Tepat Waktu</h4>
                      <p className="text-xs text-secondary leading-relaxed">Mohon hadir 10 menit sebelum jadwal untuk konsultasi awal.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">qr_code_2</span>
                    <div>
                      <h4 className="text-sm font-bold mb-1">Tunjukkan Kode</h4>
                      <p className="text-xs text-secondary leading-relaxed">Simpan tangkapan layar ini dan tunjukkan ke resepsionis kami.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">map</span>
                    <div>
                      <h4 className="text-sm font-bold mb-1">Lokasi Kami</h4>
                      <p className="text-xs text-secondary leading-relaxed">Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
      <AlertModal isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} />
    </div>
    </>
  )
}

export default SetelahBookingPage
