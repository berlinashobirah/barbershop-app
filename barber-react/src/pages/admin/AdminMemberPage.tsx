import React, { useState, useEffect } from 'react';

interface MemberData {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  points: number;
  total_visits: number;
  created_at: string;
}

interface SummaryData {
  total_members: number;
  today_visits: number;
}

const AdminMemberPage = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ total_members: 0, today_visits: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/admin/members', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      
      const json = await res.json();
      setMembers(json.data || []);
      if (json.summary) setSummary(json.summary);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    (m.name && m.name.toLowerCase().includes(search.toLowerCase())) || 
    (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
    (m.phone && m.phone.includes(search))
  );

  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">Kelola Member</h1>
          <p className="text-secondary max-w-md text-sm leading-relaxed">
            Direktori komprehensif pelanggan setia The Modern Artisan. Kelola poin loyalitas dan pantau frekuensi kunjungan secara real-time.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              className="w-full bg-surface-container-highest border-none text-sm px-10 py-3 rounded-lg focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50" 
              placeholder="Cari nama atau no. HP..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchMembers} className="bg-surface-container-high border border-outline-variant/30 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-xs font-bold uppercase tracking-widest">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">stars</span>
          </div>
          <p className="text-secondary text-xs uppercase tracking-tighter mb-1">Total Membership</p>
          <p className="text-2xl font-headline font-bold">{loading ? '...' : summary.total_members}</p>
        </div>
        
        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary bg-surface-container-high p-2 rounded-lg">event_available</span>
          </div>
          <p className="text-secondary text-xs uppercase tracking-tighter mb-1">Kunjungan Selesai Hari Ini</p>
          <p className="text-2xl font-headline font-bold">{loading ? '...' : summary.today_visits}</p>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/5">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Member Name</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Contact Info</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Total Visits</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Loyalty Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-secondary">
                    Memuat data member...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-secondary">
                    Tidak ada member ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-high transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20 bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{member.name}</p>
                          <p className="text-[11px] text-on-surface-variant/60">Bergabung: {new Date(member.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-sm text-on-surface-variant">{member.email || '-'}</p>
                        <p className="text-xs text-on-surface-variant/50">{member.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-bold text-on-surface">{member.total_visits}</span>
                        <span className="text-[10px] text-on-surface-variant/40 italic">kunjungan</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest">
                        {member.points.toLocaleString('id-ID')} PTS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredMembers.length > 0 && (
          <div className="p-6 bg-surface-container-high/30 border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-on-surface-variant">Menampilkan {filteredMembers.length} member</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMemberPage;
