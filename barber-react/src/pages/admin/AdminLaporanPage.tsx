export default function AdminLaporanPage() {
  return (
    <div className="pt-8 px-8 pb-12 min-h-screen">
      {/* Editorial Header */}
      <div className="mb-12">
        <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2 block">
          Executive Insights
        </span>
        <h2 className="text-4xl font-headline font-bold text-on-surface">Laporan Performa</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-surface-container-low px-4 py-2 rounded flex items-center gap-2 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-sm">event</span>
            <span className="text-xs font-medium text-secondary">Oct 1, 2023 - Oct 31, 2023</span>
          </div>
          <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Metric 1: Revenue */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container-highest rounded-lg">
              <span className="material-symbols-outlined text-primary">payments</span>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+12.5%</span>
          </div>
          <p className="text-sm font-medium text-secondary mb-1">Total Revenue</p>
          <h3 className="text-3xl font-headline font-bold text-white">Rp 42.850.000</h3>
          <div className="mt-6 h-1 w-full bg-surface-container-highest overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Metric 2: Customers */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container-highest rounded-lg">
              <span className="material-symbols-outlined text-primary">groups</span>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+8.2%</span>
          </div>
          <p className="text-sm font-medium text-secondary mb-1">Daily Customers</p>
          <h3 className="text-3xl font-headline font-bold text-white">1,248</h3>
          <p className="text-[10px] text-neutral-500 mt-4 italic">Target: 1,500 active visitors</p>
        </div>

        {/* Metric 3: Avg Session */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container-highest rounded-lg">
              <span className="material-symbols-outlined text-primary">avg_time</span>
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">-2.1%</span>
          </div>
          <p className="text-sm font-medium text-secondary mb-1">Avg. Session Time</p>
          <h3 className="text-3xl font-headline font-bold text-white">
            45 <span className="text-sm font-body font-normal text-neutral-500">mins</span>
          </h3>
          <div className="flex gap-1 mt-6">
            <div className="h-8 flex-1 bg-primary/20"></div>
            <div className="h-10 flex-1 bg-primary/40"></div>
            <div className="h-6 flex-1 bg-primary/10"></div>
            <div className="h-12 flex-1 bg-primary"></div>
            <div className="h-9 flex-1 bg-primary/60"></div>
          </div>
        </div>
      </div>

      {/* Main Data Visualization */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Growth Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-lg font-headline font-bold text-white">Revenue Analysis</h4>
              <p className="text-xs text-neutral-500">Monthly revenue trends across all services</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold border border-primary text-primary rounded-full">
                Weekly
              </button>
              <button className="px-3 py-1 text-[10px] font-bold text-neutral-500 hover:text-white transition-colors">
                Monthly
              </button>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="relative h-64 w-full flex items-end gap-4 px-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-outline-variant/10 w-full h-px"></div>
              <div className="border-t border-outline-variant/10 w-full h-px"></div>
              <div className="border-t border-outline-variant/10 w-full h-px"></div>
              <div className="border-t border-outline-variant/10 w-full h-px"></div>
            </div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '40%' }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Rp4M
              </div>
            </div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '55%' }}></div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '45%' }}></div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '70%' }}></div>
            <div className="flex-1 bg-primary/80 group relative cursor-pointer" style={{ height: '85%' }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded">
                Rp8.5M
              </div>
            </div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '60%' }}></div>
            <div className="flex-1 bg-surface-container-highest group relative cursor-pointer" style={{ height: '50%' }}></div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] text-neutral-500 font-bold">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>
        </div>

        {/* Popular Services */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
          <h4 className="text-lg font-headline font-bold text-white mb-6">Popular Services</h4>
          <div className="space-y-6">
            {[
              { name: 'Artisan Haircut', pct: '42%', width: '42%', opacity: 'bg-primary' },
              { name: 'Hot Towel Shave', pct: '28%', width: '28%', opacity: 'bg-primary/60' },
              { name: 'Beard Sculpting', pct: '18%', width: '18%', opacity: 'bg-primary/40' },
              { name: 'Full Package', pct: '12%', width: '12%', opacity: 'bg-primary/20' },
            ].map((s) => (
              <div key={s.name} className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-secondary font-bold">{s.name}</span>
                  <span className="text-white">{s.pct}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full ${s.opacity} transition-all duration-1000`} style={{ width: s.width }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">star</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Trend Alert</p>
                <p className="text-[10px] text-neutral-500">Beard Sculpting up by 15% this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barber Performance Leaderboard */}
      <div className="mt-8 bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h4 className="text-lg font-headline font-bold text-white">Barber Performance</h4>
          <div className="flex items-center gap-2 text-xs text-secondary font-medium">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Top Performer
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-high/50 text-neutral-500 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4 font-bold">Name</th>
              <th className="px-8 py-4 font-bold">Sessions</th>
              <th className="px-8 py-4 font-bold">Avg. Rating</th>
              <th className="px-8 py-4 font-bold">Revenue Generated</th>
              <th className="px-8 py-4 font-bold text-right">Loyalty Rate</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-outline-variant/10">
            {[
              { name: 'Ahmad Fauzi', sessions: '142 sessions', rating: '4.9', revenue: 'Rp 8.240.000', loyalty: '88%', loyaltyColor: 'text-emerald-500' },
              { name: 'Rizky Ramadhan', sessions: '118 sessions', rating: '4.8', revenue: 'Rp 6.850.000', loyalty: '75%', loyaltyColor: 'text-emerald-500/80' },
              { name: 'Budi Santoso', sessions: '95 sessions', rating: '4.7', revenue: 'Rp 5.200.000', loyalty: '62%', loyaltyColor: 'text-secondary' },
            ].map((barber) => (
              <tr key={barber.name} className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs text-primary">person</span>
                    </div>
                    <span className="font-bold text-white">{barber.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-neutral-400">{barber.sessions}</td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="font-bold">{barber.rating}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-white font-medium">{barber.revenue}</td>
                <td className={`px-8 py-4 text-right font-bold ${barber.loyaltyColor}`}>{barber.loyalty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
