import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../../components/LoadingScreen';
import AlertModal from '../../components/AlertModal';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string | null;
  discount_type: string;
  service_id: number | null;
  required_points: number;
  discount_amount: string | number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

const AdminPromosiPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'all_services',
    service_id: '',
    required_points: '0',
    discount_amount: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' as 'success'|'error'|'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('http://localhost:8000/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    } catch (error) {
      console.error('Error fetching campaigns', error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/services');
      setServices(res.data.data);
    } catch (error) {
      console.error('Error fetching services', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCampaigns(), fetchServices()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`http://localhost:8000/api/admin/campaigns/${id}`, {
        is_active: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign status', error);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('discount_type', formData.discount_type);
      submitData.append('required_points', formData.required_points);
      submitData.append('discount_amount', formData.discount_amount);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.service_id) submitData.append('service_id', formData.service_id);
      if (formData.start_date) submitData.append('start_date', formData.start_date);
      if (formData.end_date) submitData.append('end_date', formData.end_date);
      if (imageFile) submitData.append('image', imageFile);

      await axios.post('http://localhost:8000/api/admin/campaigns', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAlertConfig({ isOpen: true, message: 'Promo berhasil dibuat!', type: 'success' });
      fetchCampaigns();
      setFormData({
        title: '',
        description: '',
        discount_type: 'all_services',
        service_id: '',
        required_points: '0',
        discount_amount: '',
        is_active: true,
        start_date: '',
        end_date: ''
      });
      setImageFile(null);
    } catch (error: any) {
      console.error('Error creating campaign', error);
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || 'Gagal membuat promo', type: 'error' });
    }
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      {loading && <LoadingScreen />}
      {/* Dashboard Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-primary font-body tracking-[0.2em] uppercase text-xs mb-3 block">Promotion Engine</span>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">Promotions &amp; Discounts</h1>
          <p className="text-on-surface-variant text-lg font-body leading-relaxed">
            Craft exclusive offers for your elite clientele. Manage active campaigns and seasonal incentives with artisanal precision.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-center min-w-[140px]">
            <div className="text-primary text-2xl font-bold">{campaigns.filter(c => c.is_active).length}</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Active Deals</div>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-center min-w-[140px]">
            <div className="text-on-surface text-2xl font-bold">{campaigns.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Total Promo</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Creation Form */}
        <aside className="lg:col-span-4">
          <div className="sticky top-8">
            <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-primary">
              <h2 className="text-2xl font-headline font-bold mb-8 text-on-surface">Create New Discount</h2>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Promotion Name</label>
                  <input 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant transition-all" 
                    placeholder="e.g. Diskon Member Baru" 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Promotion Image</label>
                  <input 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-3 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-on-primary hover:file:bg-primary/90 transition-all cursor-pointer" 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Description</label>
                  <textarea 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant transition-all h-24" 
                    placeholder="Deskripsi promo..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Discount Amount (Rp)</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                      placeholder="20000" 
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Points Required</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                      type="number"
                      value={formData.required_points}
                      onChange={(e) => setFormData({...formData, required_points: e.target.value})}
                      disabled={formData.discount_type !== 'points_based'}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Type</label>
                  <select 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  >
                    <option value="all_services">Semua Layanan</option>
                    <option value="points_based">Tukar Poin</option>
                    <option value="specific_service">Layanan Tertentu</option>
                  </select>
                </div>
                {formData.discount_type === 'specific_service' && (
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Select Service</label>
                    <select 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md"
                      value={formData.service_id}
                      onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                    >
                      <option value="">-- Pilih Layanan --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Start Date</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md" 
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">End Date</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md" 
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm rounded-md hover:brightness-110 active:scale-[0.98] transition-all mt-4" 
                  type="button"
                  onClick={handleCreate}
                >
                  Launch Promotion
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Right Column: Grid of Active Promotions */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-on-surface">Active Campaigns</h2>
            <div className="flex gap-2">
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="text-on-surface">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-on-surface-variant col-span-2">Belum ada promo.</div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="bg-surface-container-low group overflow-hidden rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
                  <div className="h-32 bg-surface-container-highest relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10"></div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-20 ${camp.is_active ? 'bg-primary/10 text-primary' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {camp.is_active ? 'Running' : 'Paused'}
                    </div>
                    <img 
                      className={`w-full h-full object-cover transition-all duration-700 ${!camp.is_active ? 'opacity-20 grayscale group-hover:opacity-40' : 'opacity-40 grayscale group-hover:grayscale-0'}`} 
                      alt={camp.title} 
                      src={getImageUrl(camp.image)}
                    />
                  </div>
                  <div className="p-6 relative z-20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-xl font-headline font-bold transition-colors ${camp.is_active ? 'text-on-surface group-hover:text-primary' : 'text-on-surface-variant'}`}>{camp.title}</h3>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                          Diskon {formatRupiah(camp.discount_amount)} 
                          {camp.discount_type === 'points_based' && ` (Tukar ${camp.required_points} Poin)`}
                        </p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={camp.is_active}
                          onChange={() => handleToggleActive(camp.id, camp.is_active)}
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>{camp.end_date ? `Sampai ${camp.end_date}` : 'Tanpa Batas'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">loyalty</span>
                        <span>{camp.discount_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <AlertModal isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} />
    </div>
  );
};

export default AdminPromosiPage;
