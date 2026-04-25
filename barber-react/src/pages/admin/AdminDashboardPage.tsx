export default function AdminDashboardPage() {
  return (
    <>
      {/* Top Section / Header Area */}
      <header className="flex justify-between items-center px-10 py-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">Halo, Admin Kasir</h2>
          <p className="text-secondary text-sm">Selamat datang kembali di Atelier Manajemen.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="bg-surface-container-highest border-none rounded-lg pl-12 pr-6 py-3 w-72 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
              placeholder="Cari Kode Unik..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-on-surface">Admin Utama</p>
              <p className="text-[10px] text-primary uppercase tracking-tighter">Manajemen Atelier</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">manage_accounts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid (Bento Style) */}
      <section className="px-10 grid grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 bg-surface-container-low p-6 rounded-xl border-l-2 border-primary">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Antrean</p>
          <h3 className="text-4xl font-headline font-bold text-primary">24</h3>
          <p className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>12% dari kemarin</span>
          </p>
        </div>

        <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Sedang Proses</p>
          <h3 className="text-4xl font-headline font-bold text-on-surface">03</h3>
          <p className="text-[10px] text-on-surface-variant mt-2">Kapasitas Kursi: 5</p>
        </div>

        <div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Selesai Hari Ini</p>
          <h3 className="text-4xl font-headline font-bold text-on-surface">18</h3>
          <p className="text-[10px] text-on-surface-variant mt-2">Target Sesi: 30</p>
        </div>

        <div className="col-span-1 bg-primary text-on-primary p-6 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Estimasi Pendapatan</p>
            <h3 className="text-2xl font-headline font-bold">Rp 2.450k</h3>
          </div>
          <span
            className="material-symbols-outlined self-end"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            payments
          </span>
        </div>
      </section>

      {/* Queue Table Section */}
      <section className="px-10 mb-12">
        <div className="bg-surface-container-low rounded-2xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center">
            <h3 className="text-xl font-headline font-bold">Daftar Antrean Hari Ini</h3>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                Semua
              </span>
              <span className="px-4 py-1.5 bg-surface-container-high text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-on-primary transition-all">
                Menunggu
              </span>
              <span className="px-4 py-1.5 bg-surface-container-high text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-on-primary transition-all">
                Diproses
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 text-secondary text-[10px] uppercase tracking-widest">
                  <th className="px-8 py-4 font-bold">No. Antrean</th>
                  <th className="px-8 py-4 font-bold">Nama Pelanggan</th>
                  <th className="px-8 py-4 font-bold">Layanan</th>
                  <th className="px-8 py-4 font-bold">Kapster</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Row 1: Active */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-primary font-bold text-lg font-headline">#021</span>
                    <p className="text-[10px] text-outline mt-1 font-mono uppercase">ID: ART-9923</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-on-surface">Bambang Wijaya</p>
                    <p className="text-xs text-secondary">0812-xxxx-9901</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs bg-surface-container-highest px-3 py-1 rounded">Executive Cut</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        RM
                      </div>
                      <span className="text-xs">Rama</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Diproses
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface px-6 py-2 rounded-md text-xs font-bold transition-all active:scale-95">
                      Selesai
                    </button>
                  </td>
                </tr>

                {/* Row 2: Waiting */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-on-surface font-bold text-lg font-headline">#022</span>
                    <p className="text-[10px] text-outline mt-1 font-mono uppercase">ID: ART-9924</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-on-surface">Adrian Prasetyo</p>
                    <p className="text-xs text-secondary">0878-xxxx-1244</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs bg-surface-container-highest px-3 py-1 rounded">Signature Shave</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-secondary">
                        SY
                      </div>
                      <span className="text-xs">Surya</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-1.5 text-secondary text-[10px] font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary/40"></span>
                      Menunggu
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-primary text-on-primary px-6 py-2 rounded-md text-xs font-bold transition-all active:scale-95">
                      Proses
                    </button>
                  </td>
                </tr>

                {/* Row 3: Waiting */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-on-surface font-bold text-lg font-headline">#023</span>
                    <p className="text-[10px] text-outline mt-1 font-mono uppercase">ID: ART-9925</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-on-surface">Dimas Setiawan</p>
                    <p className="text-xs text-secondary">0856-xxxx-3321</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs bg-surface-container-highest px-3 py-1 rounded">Artisan Beard Trim</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-outline italic">Belum ditentukan</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-1.5 text-secondary text-[10px] font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary/40"></span>
                      Menunggu
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-primary text-on-primary px-6 py-2 rounded-md text-xs font-bold transition-all active:scale-95">
                      Proses
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container-lowest/50 flex justify-center">
            <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
              Lihat Semua Antrean
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 flex flex-col items-center gap-6 bg-[#131313] border-t border-white/5">
        <p className="font-body text-xs uppercase tracking-widest text-secondary text-center">
          © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
        </p>
        <div className="flex gap-8">
          {['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Hubungi Kami'].map((link) => (
            <a
              key={link}
              href="#"
              className="font-body text-xs uppercase tracking-widest text-secondary hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}
