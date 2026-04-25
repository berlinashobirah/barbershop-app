export default function AdminAntrianPage() {
  return (
    <div className="p-10 min-h-screen">
      {/* Page Header & Hero Stat Bento */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-headline text-4xl font-black text-on-surface leading-tight">
              Kelola Antrean
            </h2>
            <p className="text-zinc-500 font-medium tracking-wide mt-2 italic">
              Kendali presisi untuk pengalaman pelanggan yang tak terlupakan.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#eac249] font-bold block mb-1">
              Status Hari Ini
            </span>
            <p className="text-on-surface font-mono font-medium">14 Oktober 2023 | 14:45 WIB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-zinc-600 mb-4 block">groups</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Antrean</h4>
              <p className="font-headline text-5xl font-black text-on-surface">32</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <span className="material-symbols-outlined text-[140px]">groups</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#eac249] mb-4 block">pending_actions</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Sedang Diproses</h4>
              <p className="font-headline text-5xl font-black text-[#eac249]">04</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#eac249]">
              <span className="material-symbols-outlined text-[140px]">pending_actions</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group border-l border-[#eac249]/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-green-500 mb-4 block">task_alt</span>
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Selesai Hari Ini</h4>
              <p className="font-headline text-5xl font-black text-on-surface">24</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <span className="material-symbols-outlined text-[140px]">task_alt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Queue Management Controls */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/40">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/30">
          <div className="flex items-center gap-2">
            <button className="px-6 py-2 rounded-full bg-[#eac249] text-[#3d2f00] text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#eac249]/10">
              Semua
            </button>
            <button className="px-6 py-2 rounded-full bg-surface-container-high text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              Menunggu
            </button>
            <button className="px-6 py-2 rounded-full bg-surface-container-high text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              Diproses
            </button>
            <button className="px-6 py-2 rounded-full bg-surface-container-high text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              Selesai
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-zinc-500 font-medium">Urutkan Berdasarkan:</p>
            <select className="bg-zinc-900 border-none text-xs text-zinc-300 rounded-lg py-2 pl-4 pr-10 focus:ring-1 focus:ring-[#eac249]/30 outline-none">
              <option>Waktu Terlama</option>
              <option>Nomor Antrean</option>
              <option>Prioritas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-5 border-b border-zinc-800/30">No. Antrean</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Nama Pelanggan</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Layanan</th>
                <th className="px-8 py-5 border-b border-zinc-800/30">Kapster</th>
                <th className="px-8 py-5 border-b border-zinc-800/30 text-center">Status</th>
                <th className="px-8 py-5 border-b border-zinc-800/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {/* Row 1 Diproses */}
              <tr className="hover:bg-zinc-900/20 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-headline text-xl font-bold text-[#eac249]">A-012</span>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">BRB-902-XLT</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Ahmad Faisal</p>
                      <p className="text-xs text-zinc-500">Premium Member</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-surface-container-highest text-zinc-300 text-[10px] font-bold rounded uppercase tracking-wider">
                    The Royal Cut
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-zinc-400 italic">Bambang S.</td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tighter border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Diproses
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="bg-[#eac249] text-[#3d2f00] px-5 py-2 rounded font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Selesai
                  </button>
                </td>
              </tr>

              {/* Row 2 Menunggu */}
              <tr className="hover:bg-zinc-900/20 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-headline text-xl font-bold text-zinc-400">A-013</span>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">BRB-112-LMN</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Reza Mahardika</p>
                      <p className="text-xs text-zinc-500">Regular Guest</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-surface-container-highest text-zinc-300 text-[10px] font-bold rounded uppercase tracking-wider">
                    Classic Taper
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-zinc-400 italic">Anto Wijaya</td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-tighter">
                    Menunggu
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="border border-[#eac249]/30 text-[#eac249] px-5 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#eac249]/5 transition-colors">
                    Proses
                  </button>
                </td>
              </tr>

              {/* Row 3 Menunggu */}
              <tr className="hover:bg-zinc-900/20 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-headline text-xl font-bold text-zinc-400">A-014</span>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">BRB-443-OPQ</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Dimas Aditya</p>
                      <p className="text-xs text-zinc-500">Regular Guest</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-surface-container-highest text-zinc-300 text-[10px] font-bold rounded uppercase tracking-wider">
                    Beard Grooming
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-zinc-400 italic">Bambang S.</td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-tighter">
                    Menunggu
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="border border-[#eac249]/30 text-[#eac249] px-5 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#eac249]/5 transition-colors">
                    Proses
                  </button>
                </td>
              </tr>

              {/* Row 4 Diproses */}
              <tr className="hover:bg-zinc-900/20 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-headline text-xl font-bold text-[#eac249]">A-015</span>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">BRB-222-ZZZ</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Julian Pratama</p>
                      <p className="text-xs text-zinc-500">Elite Member</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-surface-container-highest text-zinc-300 text-[10px] font-bold rounded uppercase tracking-wider">
                    Hot Towel Shave
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-zinc-400 italic">Kevin Hart</td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tighter border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Diproses
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="bg-[#eac249] text-[#3d2f00] px-5 py-2 rounded font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Selesai
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 flex items-center justify-between bg-zinc-900/20">
          <p className="text-xs text-zinc-500">Menampilkan 4 dari 32 antrean</p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high text-[#eac249] font-bold text-xs">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-surface-container-high text-xs">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-surface-container-high text-xs">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Action Grid */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800/30 flex items-center justify-between group hover:border-[#eac249]/30 transition-all cursor-pointer">
          <div>
            <h3 className="font-headline text-xl font-bold text-white mb-1">Cetak Laporan Harian</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Format PDF &amp; CSV • Terakhir 10:00 AM</p>
          </div>
          <div className="bg-surface-container-high p-4 rounded-lg group-hover:bg-[#eac249] group-hover:text-[#3d2f00] transition-all">
            <span className="material-symbols-outlined">print</span>
          </div>
        </div>

        <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800/30 flex items-center justify-between group hover:border-[#eac249]/30 transition-all cursor-pointer">
          <div>
            <h3 className="font-headline text-xl font-bold text-white mb-1">Panggil Nomor Selanjutnya</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Sistem Voice Announcement Aktif</p>
          </div>
          <div className="bg-surface-container-high p-4 rounded-lg group-hover:bg-[#eac249] group-hover:text-[#3d2f00] transition-all">
            <span className="material-symbols-outlined">volume_up</span>
          </div>
        </div>
      </section>
    </div>
  )
}
