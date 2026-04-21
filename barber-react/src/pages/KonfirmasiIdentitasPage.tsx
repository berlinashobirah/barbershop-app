import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const KonfirmasiIdentitasPage = () => {
  const [activeTab, setActiveTab] = useState<'guest' | 'member'>('guest')
  const navigate = useNavigate()

  return (
    <div className="dark bg-surface text-on-surface font-body antialiased overflow-x-hidden min-h-screen">
      <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">

        {/* Left Section: Branding & Identity Form */}
        <section className="relative flex flex-col justify-center items-center px-8 md:px-16 py-12 bg-surface-container-lowest overflow-hidden border-r border-outline-variant/10">

          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img
              alt="barber tools and vintage atmosphere"
              className="w-full h-full object-cover grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvd4gVszCojGY2NbWHXfae7j_1H3zjv1A7mX-v7KdxopuYXoeQvJ5pMkhyRE16z7ovVVz8KZbfL62f4G5wIVgurY4JSjABFGjzPfZoW0xek9nL5HCWEiroMoh5KvDFnDMju4fRzFqFPJ6UOYtLidcguISHPdDwCXBZtWRsQA_rGeINkchwRZlOUBnrOpbeobCHNtnf3E1msQNIry1Q8TUC4ZRo5bjucEVaI5-eZ2U35cUBwY2Wjb_sysjGdcBEgNW4lyyCD_7rCEk"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
          </div>

          {/* Back Button */}
          <div className="z-10 w-full max-w-md mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Kembali
            </button>
          </div>

          <div className="z-10 w-full max-w-md space-y-12">
            <div className="space-y-4">
              <span className="text-2xl font-headline italic text-primary font-bold tracking-tighter">
                The Modern Artisan
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">
                Konfirmasi Identitas
              </h1>
              <p className="text-secondary font-body text-sm max-w-xs leading-relaxed">
                Lengkapi detail Anda untuk melanjutkan pemesanan layanan grooming terbaik.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-outline-variant/30">
              <button
                id="tab-lanjut-cepat"
                onClick={() => setActiveTab('guest')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                  activeTab === 'guest'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary/40 hover:text-secondary'
                }`}
              >
                Lanjutkan Cepat
              </button>
              <button
                id="tab-masuk-member"
                onClick={() => setActiveTab('member')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                  activeTab === 'member'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary/40 hover:text-secondary'
                }`}
              >
                Masuk Member
              </button>
            </div>

            <div className="space-y-8">
              {activeTab === 'guest' ? (
                /* Guest / Direct Form */
                <form id="form-lanjut-cepat" className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/booking') }}>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="nama-lengkap"
                      className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id="nama-lengkap"
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-secondary/30 transition-all text-lg outline-none"
                      placeholder="Contoh: Raden Wijaya"
                      type="text"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="nomor-whatsapp"
                      className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    >
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary/50 font-bold text-lg">
                        +62
                      </span>
                      <input
                        id="nomor-whatsapp"
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary pl-10 py-3 text-on-surface placeholder:text-secondary/30 transition-all text-lg outline-none"
                        placeholder="812 3456 7890"
                        type="tel"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      id="btn-lanjut-pembayaran"
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-md shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>LANJUT KE PEMBAYARAN</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Member Login Form */
                <form id="form-masuk-member" className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/booking') }}>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email-member"
                      className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    >
                      Email / Nomor HP
                    </label>
                    <input
                      id="email-member"
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-secondary/30 transition-all text-lg outline-none"
                      placeholder="contoh@email.com"
                      type="email"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password-member"
                      className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <input
                      id="password-member"
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-secondary/30 transition-all text-lg outline-none"
                      placeholder="••••••••"
                      type="password"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      id="btn-masuk-member"
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-md shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>MASUK & LANJUTKAN</span>
                      <span className="material-symbols-outlined text-lg">login</span>
                    </button>
                  </div>
                  <p className="text-center text-xs text-secondary/40">
                    Belum punya akun?{' '}
                    <button
                      id="btn-daftar-member"
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-primary hover:underline font-semibold"
                    >
                      Daftar sekarang
                    </button>
                  </p>
                </form>
              )}

              {/* Security Note */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-secondary/60">
                  <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                  <p className="text-[11px] leading-relaxed uppercase tracking-wider">
                    Data Anda aman dan hanya digunakan untuk konfirmasi jadwal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Benefits / Visuals */}
        <section className="hidden md:flex flex-col justify-center items-center px-8 md:px-16 py-12 bg-surface overflow-hidden relative">
          <div className="w-full max-w-md space-y-12">
            <div className="space-y-2">
              <span className="text-secondary/60 font-label text-xs uppercase tracking-[0.3em]">
                Mengapa Member?
              </span>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                Dapatkan Keuntungan Lebih
              </h2>
            </div>

            <div className="grid gap-6">
              {/* Card 1 */}
              <div className="p-8 bg-surface-container-low rounded-xl space-y-4 group hover:bg-surface-container-high transition-all border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                    loyalty
                  </span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest">
                    Poin Loyalitas
                  </h3>
                </div>
                <p className="text-xs text-secondary/70 leading-relaxed">
                  Kumpulkan poin di setiap kunjungan dan tukarkan dengan layanan gratis atau produk eksklusif.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 bg-surface-container-low rounded-xl space-y-4 group hover:bg-surface-container-high transition-all border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                    history
                  </span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest">
                    Riwayat Presisi
                  </h3>
                </div>
                <p className="text-xs text-secondary/70 leading-relaxed">
                  Kami mencatat detail potongan rambut Anda untuk memastikan hasil yang konsisten setiap kali datang.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 bg-surface-container-low rounded-xl space-y-4 group hover:bg-surface-container-high transition-all border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                    schedule
                  </span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest">
                    Prioritas Antrean
                  </h3>
                </div>
                <p className="text-xs text-secondary/70 leading-relaxed">
                  Member mendapatkan slot waktu prioritas dan kemudahan untuk reschedule kapan saja.
                </p>
              </div>
            </div>

            {/* Member Login Trigger */}
            <div className="text-center pt-4">
              <p className="text-[10px] text-secondary/40 uppercase tracking-[0.2em] mb-4">
                Sudah punya akun member?
              </p>
              <button
                id="btn-masuk-akun-member"
                onClick={() => setActiveTab('member')}
                className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Masuk ke Akun Member Anda
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
            </div>
          </div>

          {/* Footer Small */}
          <div className="absolute bottom-10 text-[10px] text-secondary/30 uppercase tracking-[0.4em] font-medium">
            Presisi • Estetika • Tradisi
          </div>
        </section>

      </main>
    </div>
  )
}

export default KonfirmasiIdentitasPage
