export default function AdminPengaturanPage() {
  return (
    <div className="pt-6 min-h-screen px-12 pb-12 bg-surface">
      {/* Hero Branding Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <span className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-4 block">
            Workspace Control
          </span>
          <h1 className="text-5xl font-headline font-bold mb-6 text-on-surface leading-tight">
            Pengaturan Ateliers
          </h1>
          <p className="text-secondary text-lg font-light max-w-md">
            Konfigurasi setiap detail dari pengalaman Artisan Anda. Dari jam operasional hingga katalog layanan eksklusif.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-md hover:brightness-110 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">save</span>
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Bento Grid Settings */}
      <div className="grid grid-cols-12 gap-8">
        {/* Information & Address Section */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-10 rounded-xl">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h2 className="text-2xl font-headline font-bold tracking-tight">Informasi &amp; Lokasi</h2>
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Nama Barbershop
                </label>
                <input
                  className="w-full bg-surface-container-highest border-none p-4 rounded text-sm focus:ring-1 focus:ring-primary outline-none"
                  type="text"
                  defaultValue="The Modern Artisan - Flagship"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Email Bisnis
                </label>
                <input
                  className="w-full bg-surface-container-highest border-none p-4 rounded text-sm focus:ring-1 focus:ring-primary outline-none"
                  type="email"
                  defaultValue="artisan@luxury.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Alamat Fisik
              </label>
              <textarea
                className="w-full bg-surface-container-highest border-none p-4 rounded text-sm focus:ring-1 focus:ring-primary outline-none h-24 resize-none"
                defaultValue="Jalan Senopati No. 45, Kebayoran Baru, Jakarta Selatan, 12190"
              />
            </div>
            <div className="relative h-64 w-full rounded-lg overflow-hidden group bg-surface-container-highest">
              <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">map</span>
                  Update di Peta
                </button>
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-neutral-700">map</span>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-10 rounded-xl">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <h2 className="text-2xl font-headline font-bold tracking-tight">Jam Operasional</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded transition-colors hover:bg-surface-container-high">
              <span className="font-bold text-sm">Senin - Jumat</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-secondary">09:00 - 21:00</span>
                <span className="material-symbols-outlined text-primary text-lg cursor-pointer">edit</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded transition-colors hover:bg-surface-container-high">
              <span className="font-bold text-sm">Sabtu</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-secondary">10:00 - 22:00</span>
                <span className="material-symbols-outlined text-primary text-lg cursor-pointer">edit</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-error-container/20 rounded border border-error/10">
              <span className="font-bold text-sm text-error">Minggu</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-error/80 uppercase font-bold">Tutup</span>
                <span className="material-symbols-outlined text-error text-lg cursor-pointer">toggle_off</span>
              </div>
            </div>
          </div>
          <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary leading-relaxed">
              <span className="font-bold block mb-2">Catatan Operasional:</span>
              Jam operasional ini akan tampil secara publik di portal pemesanan pelanggan. Perubahan akan segera diaplikasikan secara real-time.
            </p>
          </div>
        </div>

        {/* Services and Pricing */}
        <div className="col-span-12 bg-surface-container-low p-10 rounded-xl">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">content_cut</span>
              <h2 className="text-2xl font-headline font-bold tracking-tight">Layanan &amp; Harga</h2>
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-2 hover:underline">
              <span className="material-symbols-outlined">add_circle</span>
              Tambah Layanan Baru
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'content_cut', price: 'Rp 250k', name: 'The Executive Cut', desc: 'Gunting rambut premium, cuci rambut, pijat relaksasi kepala, dan styling pomade eksklusif.' },
              { icon: 'face', price: 'Rp 150k', name: 'Artisan Shave', desc: 'Pencukuran janggut dengan handuk hangat, krim busa premium, dan aftershave artisan.' },
              { icon: 'palette', price: 'Rp 400k', name: 'The Signature Dye', desc: 'Pewarnaan rambut profesional menggunakan produk organik terpilih untuk hasil yang natural.' },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-surface-container-highest p-8 rounded border-b-2 border-transparent hover:border-primary transition-all group"
              >
                <div className="flex justify-between mb-6">
                  <div className="w-12 h-12 bg-surface rounded flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{service.icon}</span>
                  </div>
                  <span className="text-primary font-bold text-lg">{service.price}</span>
                </div>
                <h3 className="text-xl font-headline font-bold mb-2">{service.name}</h3>
                <p className="text-secondary text-sm mb-6 leading-relaxed">{service.desc}</p>
                <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                  <button className="text-[10px] font-bold text-on-surface-variant uppercase hover:text-white">
                    Sunting
                  </button>
                  <button className="text-[10px] font-bold text-error uppercase hover:brightness-110">
                    Nonaktifkan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-low p-10 rounded-xl">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary">notifications_active</span>
            <h2 className="text-2xl font-headline font-bold tracking-tight">Preferensi Notifikasi</h2>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Notifikasi Booking Baru', desc: 'Dapatkan pemberitahuan instan via Dashboard & Email.', active: true },
              { label: 'Laporan Harian Otomatis', desc: 'Kirim ringkasan transaksi ke email owner setiap jam 22:00.', active: true },
              { label: 'SMS Reminder Pelanggan', desc: 'Kirim SMS pengingat 1 jam sebelum jadwal (Biaya tambahan).', active: false },
            ].map((notif) => (
              <div key={notif.label} className={`flex items-start justify-between ${!notif.active ? 'opacity-50' : ''}`}>
                <div>
                  <p className="font-bold text-sm">{notif.label}</p>
                  <p className="text-xs text-secondary mt-1">{notif.desc}</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative cursor-pointer ${
                    notif.active ? 'bg-primary-container' : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full ${
                      notif.active ? 'right-1 bg-white' : 'left-1 bg-neutral-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-low p-10 rounded-xl">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary">security</span>
            <h2 className="text-2xl font-headline font-bold tracking-tight">Keamanan Sistem</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-surface-container-highest rounded flex items-center justify-between group hover:bg-primary transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary">key</span>
                <span className="text-sm font-bold group-hover:text-on-primary">Ubah Password Admin</span>
              </div>
              <span className="material-symbols-outlined text-neutral-500 group-hover:text-on-primary">chevron_right</span>
            </button>
            <button className="w-full text-left p-4 bg-surface-container-highest rounded flex items-center justify-between group hover:bg-primary transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary">authenticator</span>
                <span className="text-sm font-bold group-hover:text-on-primary">Otentikasi Dua Faktor</span>
              </div>
              <span className="material-symbols-outlined text-neutral-500 group-hover:text-on-primary">chevron_right</span>
            </button>
            <button className="w-full text-left p-4 bg-surface-container-highest rounded flex items-center justify-between group hover:bg-error transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error group-hover:text-white">delete_forever</span>
                <span className="text-sm font-bold group-hover:text-white">Reset Database Transaksi</span>
              </div>
              <span className="material-symbols-outlined text-neutral-500 group-hover:text-white">warning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-12 border-t border-outline-variant/10 flex justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600 font-bold">
        <p>© 2024 The Modern Artisan Digital Atelier</p>
        <div className="flex gap-8">
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="hover:text-primary transition-colors" href="#">Support API</a>
          <a className="hover:text-primary transition-colors" href="#">v2.4.1-stable</a>
        </div>
      </footer>
    </div>
  )
}
