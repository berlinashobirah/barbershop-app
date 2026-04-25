export default function AdminJadwalPage() {
  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Roster Mingguan</h2>
          <p className="text-secondary mt-1 font-medium">Manajemen jadwal kapster &amp; ketersediaan kursi</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            <button className="px-4 py-1.5 text-xs font-bold bg-[#eac249] text-on-primary rounded-md shadow-lg">
              DAILY
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-secondary hover:text-on-surface transition-colors">
              WEEKLY
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-surface-container-high border-outline-variant/20 border text-on-surface rounded-md text-sm font-semibold hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Roster Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Barber Summary Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">content_cut</span>
            </div>
            <h3 className="text-lg font-headline font-bold mb-4 text-[#eac249]">Status Tim Saat Ini</h3>
            <div className="space-y-4">
              {/* Barber 1 */}
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-zinc-400">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Marco 'The Blade'</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Available</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary cursor-pointer">more_vert</span>
              </div>

              {/* Barber 2 */}
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-zinc-400">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Julian Rossi</p>
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">On-Break</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary cursor-pointer">more_vert</span>
              </div>

              {/* Barber 3 */}
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-zinc-400">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Antonio V.</p>
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Full (7 Bookings)</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary cursor-pointer">more_vert</span>
              </div>
            </div>
          </div>

          {/* Quick Slot */}
          <div className="bg-[#eac249] p-6 rounded-xl">
            <h3 className="text-on-primary font-headline font-bold text-lg mb-2">Assign Quick Slot</h3>
            <p className="text-on-primary/70 text-xs mb-4">
              Masukan nama pelanggan untuk slot tercepat hari ini.
            </p>
            <input
              className="w-full bg-on-primary/10 border-none placeholder:text-on-primary/50 text-on-primary text-sm rounded-md mb-3 p-3 outline-none focus:ring-0"
              placeholder="Customer Name..."
              type="text"
            />
            <button className="w-full py-2 bg-on-primary text-primary font-bold text-xs uppercase tracking-widest rounded-md">
              Confirm Slot
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="font-bold text-sm">Senin, 24 Mei 2024</span>
              <button className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] uppercase font-bold text-secondary">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] uppercase font-bold text-secondary">Booked</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary w-24">WAKTU</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">MARCO</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">JULIAN</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">ANTONIO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {/* 09:00 */}
                <tr>
                  <td className="p-4 text-xs font-bold text-secondary">09:00</td>
                  <td className="p-2">
                    <div className="h-12 bg-green-500/10 border border-green-500/20 rounded-md flex items-center justify-center cursor-pointer group hover:bg-green-500/20 transition-all">
                      <span className="text-[10px] font-bold text-green-500 group-hover:scale-110 transition-transform">EMPTY</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Erik Ten Hag</p>
                      <p className="text-[8px] text-secondary">Signature Cut</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Pep G.</p>
                      <p className="text-[8px] text-secondary">Beard Trim</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                </tr>

                {/* 10:00 */}
                <tr>
                  <td className="p-4 text-xs font-bold text-secondary">10:00</td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Marcus R.</p>
                      <p className="text-[8px] text-secondary">Hot Shave</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                  <td className="p-2" rowSpan={2}>
                    <div className="h-full min-h-[112px] bg-orange-500/10 border border-orange-500/20 rounded-md flex flex-col items-center justify-center opacity-70">
                      <span className="material-symbols-outlined text-orange-500 mb-1">coffee</span>
                      <span className="text-[10px] font-bold text-orange-500">ON BREAK</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Kevin De B.</p>
                      <p className="text-[8px] text-secondary">Wash &amp; Cut</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                </tr>

                {/* 11:00 */}
                <tr>
                  <td className="p-4 text-xs font-bold text-secondary">11:00</td>
                  <td className="p-2">
                    <div className="h-12 bg-green-500/10 border border-green-500/20 rounded-md flex items-center justify-center cursor-pointer group">
                      <span className="text-[10px] font-bold text-green-500">EMPTY</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Erling H.</p>
                      <p className="text-[8px] text-secondary">Deluxe Pack</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                </tr>

                {/* 12:00 Lunch */}
                <tr className="bg-surface-container-low">
                  <td className="p-4 text-xs font-bold text-secondary">12:00</td>
                  <td className="p-2" colSpan={3}>
                    <div className="h-8 border-y border-dashed border-outline-variant/20 flex items-center justify-center">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-600">
                        Lunch Break Period
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 13:00 */}
                <tr>
                  <td className="p-4 text-xs font-bold text-secondary">13:00</td>
                  <td className="p-2">
                    <div className="h-12 bg-green-500/10 border border-green-500/20 rounded-md flex items-center justify-center cursor-pointer group">
                      <span className="text-[10px] font-bold text-green-500">EMPTY</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-green-500/10 border border-green-500/20 rounded-md flex items-center justify-center cursor-pointer group">
                      <span className="text-[10px] font-bold text-green-500">EMPTY</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="h-12 bg-surface-container-highest border border-outline-variant/10 rounded-md p-2 relative">
                      <p className="text-[10px] font-bold">Jack G.</p>
                      <p className="text-[8px] text-secondary">Styling</p>
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline-variant/5 text-right">
            <button className="text-xs font-bold text-primary hover:underline">Download Daily Roster PDF</button>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Total Bookings Today</p>
          <p className="text-3xl font-headline font-bold text-on-surface">24 Sessions</p>
          <div className="mt-4 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-green-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Open Slots Remaining</p>
          <p className="text-3xl font-headline font-bold text-on-surface">08 Slots</p>
          <p className="mt-2 text-xs text-secondary italic">Peak hours: 16:00 - 19:00</p>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-neutral-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Active Kapster</p>
          <p className="text-3xl font-headline font-bold text-on-surface">4 / 5 Staff</p>
          <p className="mt-2 text-xs text-secondary italic">1 Staff on Sick Leave (Yusuf)</p>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#eac249] rounded-full shadow-[0_10px_40px_rgba(234,194,73,0.3)] flex items-center justify-center text-on-primary hover:scale-110 transition-transform z-50">
        <span className="material-symbols-outlined scale-150">add</span>
      </button>
    </div>
  )
}
