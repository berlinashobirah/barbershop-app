import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/antrian', icon: 'receipt_long', label: 'Kelola Antrean' },
  { to: '/admin/jadwal', icon: 'calendar_month', label: 'Jadwal Kapster' },
  { to: '/admin/laporan', icon: 'analytics', label: 'Laporan' },
  { to: '/admin/pengaturan', icon: 'settings', label: 'Pengaturan' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-zinc-800/50 bg-neutral-950 z-40">
        <div className="px-8 py-8 mb-4">
          <h1 className="text-xl font-bold tracking-tighter text-[#eac249] font-headline italic">
            The Modern Artisan
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-4 px-4 py-3 rounded-md text-[#eac249] border-r-2 border-[#eac249] bg-neutral-900/50 font-bold text-sm'
                  : 'flex items-center gap-4 px-4 py-3 rounded-md text-neutral-400 hover:bg-neutral-800/40 hover:text-white transition-colors duration-200 text-sm font-medium'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-zinc-800/30">
          <div className="bg-neutral-900 p-4 rounded-xl flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-[#eac249]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#eac249] text-sm">person</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Admin Utama</p>
              <p className="text-[10px] text-neutral-500">Manajemen Atelier</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-neutral-400 hover:bg-neutral-800/40 hover:text-white transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-30 flex items-center justify-between px-8 h-20 bg-neutral-950/80 backdrop-blur-xl shadow-xl shadow-black/20">
        <div className="relative w-full max-w-xl group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#eac249] transition-colors">
            search
          </span>
          <input
            className="w-full bg-zinc-900/60 border-none rounded-full py-3 pl-12 pr-6 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-1 focus:ring-[#eac249]/30 tracking-wide transition-all outline-none"
            placeholder="Cari kode unik (misal: BRB-001-XYZ)..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-6 ml-8">
          <button className="relative text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#eac249] rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-zinc-800">
            <div className="text-right">
              <p className="text-xs font-bold text-white uppercase tracking-tighter">The Modern Artisan</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-[#eac249]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#eac249] text-sm">manage_accounts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 pt-20 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
