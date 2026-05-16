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
  discount_unit: 'fixed' | 'percentage';
  min_transaction: string | number;
  max_discount: string | number;
  is_new_member_only: boolean;
  service?: { id: number, name: string };
}

const AdminPromotionsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'all_services',
    service_id: '',
    required_points: '0',
    discount_amount: '',
    discount_unit: 'fixed',
    min_transaction: '0',
    max_discount: '0',
    is_new_member_only: false,
    is_active: true,
    start_date: '',
    end_date: ''
  });
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({ isOpen: false, message: '', type: 'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }));

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    } catch (error) {
      console.error('Error fetching campaigns', error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/services`);
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
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/campaigns/${id}`, {
        is_active: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign status', error);
    }
  };

  const handleDelete = (id: number) => {
    setAlertConfig({
      isOpen: true,
      message: 'Are you sure you want to permanently delete this promo?',
      type: 'info',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Delay a bit after confirm callback processes to show success
      setTimeout(() => {
        setAlertConfig({ isOpen: true, message: 'Promo successfully deleted.', type: 'success' });
        fetchCampaigns();
      }, 100);
    } catch (error) {
      console.error('Error deleting campaign', error);
      setTimeout(() => {
        setAlertConfig({ isOpen: true, message: 'Failed to delete promo.', type: 'error' });
      }, 100);
    }
  };

  const handleEdit = (camp: Campaign) => {
    setEditingId(camp.id);
    setFormData({
      title: camp.title || '',
      description: camp.description || '',
      discount_type: camp.discount_type || 'all_services',
      service_id: camp.service_id ? camp.service_id.toString() : '',
      required_points: camp.required_points.toString(),
      discount_amount: camp.discount_amount.toString(),
      discount_unit: camp.discount_unit || 'fixed',
      min_transaction: camp.min_transaction ? camp.min_transaction.toString() : '0',
      max_discount: camp.max_discount ? camp.max_discount.toString() : '0',
      is_new_member_only: camp.is_new_member_only || false,
      is_active: camp.is_active,
      start_date: camp.start_date ? camp.start_date.split('T')[0] : '',
      end_date: camp.end_date ? camp.end_date.split('T')[0] : ''
    });
    // Scroll back up smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      discount_type: 'all_services',
      service_id: '',
      required_points: '0',
      discount_amount: '',
      discount_unit: 'fixed',
      min_transaction: '0',
      max_discount: '0',
      is_new_member_only: false,
      is_active: true,
      start_date: '',
      end_date: ''
    });
    setImageFile(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Use JSON payload if updating without a file, otherwise standard FormData approach 
      // Actually, Laravel sometimes is finicky with method spoofing for FormData PUT.
      // Easiest pattern is to just append _method PUT to FormData and always send via POST.
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('discount_type', formData.discount_type);
      submitData.append('discount_unit', formData.discount_unit);
      submitData.append('required_points', formData.required_points);
      submitData.append('discount_amount', formData.discount_amount);
      submitData.append('min_transaction', formData.min_transaction);
      submitData.append('max_discount', formData.max_discount);
      submitData.append('is_new_member_only', formData.is_new_member_only ? '1' : '0');
      submitData.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.service_id) submitData.append('service_id', formData.service_id);
      if (formData.start_date) submitData.append('start_date', formData.start_date);
      if (formData.end_date) submitData.append('end_date', formData.end_date);
      if (imageFile) submitData.append('image', imageFile);

      let url = `${import.meta.env.VITE_API_URL}/admin/campaigns`;
      if (editingId) {
        url += `/${editingId}`;
        // Append fake PUT verb spoof for Laravel to process file uploads on standard POST route
        submitData.append('_method', 'PUT'); 
      }

      await axios.post(url, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAlertConfig({ 
        isOpen: true, 
        message: editingId ? 'Promo successfully updated!' : 'Promo successfully created!', 
        type: 'success' 
      });
      
      fetchCampaigns();
      handleCancelEdit();
    } catch (error: any) {
      console.error('Error saving campaign', error);
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || 'Failed to save promo', type: 'error' });
    }
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatDate = (str: string | null) => {
    if (!str) return 'No Limit';
    const cleanStr = str.split('T')[0];
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return cleanStr;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Total Promos</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Creation Form */}
        <aside className="lg:col-span-4">
          <div className="sticky top-8">
            <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-primary transition-all">
              <h2 className="text-2xl font-headline font-bold mb-8 text-on-surface flex justify-between items-center">
                <span>{editingId ? 'Edit Discount' : 'Create New Discount'}</span>
                {editingId && (
                  <button onClick={handleCancelEdit} className="text-xs text-zinc-400 hover:text-white underline">Cancel</button>
                )}
              </h2>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Promotion Name</label>
                  <input 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant transition-all" 
                    placeholder="e.g. Diskon New Member" 
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
                    placeholder="Description promo..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Discount Unit</label>
                    <select 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md"
                      value={formData.discount_unit}
                      onChange={(e) => setFormData({...formData, discount_unit: e.target.value})}
                    >
                      <option value="fixed">Fixed (Rupiah)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                      Discount Val {formData.discount_unit === 'percentage' ? '(%)' : '(Rp)'}
                    </label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                      placeholder={formData.discount_unit === 'percentage' ? '20' : '20000'} 
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Min Trx (Rp)</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                      type="number"
                      value={formData.min_transaction}
                      onChange={(e) => setFormData({...formData, min_transaction: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Max Disc (Capping Rp)</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                      type="number"
                      placeholder="0 = No Limit"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                      disabled={formData.discount_unit === 'fixed'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-end pb-2">
                    <label className="flex items-center space-x-3 cursor-pointer bg-surface-container-highest w-full p-3.5 rounded-md">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-primary bg-surface rounded focus:ring-primary border-none"
                        checked={formData.is_new_member_only}
                        onChange={(e) => setFormData({...formData, is_new_member_only: e.target.checked})}
                      />
                      <span className="text-xs text-on-surface font-bold uppercase">New Member Only</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Type</label>
                  <select 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  >
                    <option value="all_services">All Services</option>
                    <option value="points_based">Redeem Points</option>
                    <option value="specific_service">Specific Services</option>
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
                      <option value="">-- Select Service --</option>
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
                <div className="flex gap-3 mt-4">
                  <button 
                    className="flex-grow py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm rounded-md hover:brightness-110 active:scale-[0.98] transition-all" 
                    type="button"
                    onClick={handleSave}
                  >
                    {editingId ? 'Update Campaign' : 'Launch Promotion'}
                  </button>
                  {editingId && (
                    <button 
                      className="w-14 py-4 bg-surface-container-highest text-on-surface-variant hover:text-white font-bold rounded-md flex items-center justify-center active:scale-[0.98] transition-all" 
                      type="button"
                      title="Cancel"
                      onClick={handleCancelEdit}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </aside>

        {/* Right Column: Grid of Active Promotions */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-on-surface">Active Campaigns</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="text-on-surface">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-on-surface-variant col-span-2">No promos available.</div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="bg-surface-container-low group overflow-hidden rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
                  <div className="h-32 bg-surface-container-highest relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10"></div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-20 ${camp.is_active ? 'bg-primary/10 text-primary' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {camp.is_active ? 'Running' : 'Paused'}
                    </div>
                    
                    {/* Action Buttons Floating */}
                    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                      <button 
                        onClick={() => handleDelete(camp.id)}
                        className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-1.5 rounded-lg transition-all backdrop-blur-sm"
                        title="Delete Promo"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <button 
                        onClick={() => handleEdit(camp)}
                        className="bg-primary/20 hover:bg-primary text-primary hover:text-on-primary p-1.5 rounded-lg transition-all backdrop-blur-sm"
                        title="Edit Promo"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
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
                          Diskon {camp.discount_unit === 'percentage' ? `${Number(camp.discount_amount)}%` : formatRupiah(camp.discount_amount)} 
                          {camp.discount_type === 'points_based' && ` (Tukar ${camp.required_points} Poin)`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Number(camp.min_transaction) > 0 && (
                            <span className="text-[9px] bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant/20">Min: {formatRupiah(camp.min_transaction)}</span>
                          )}
                          {camp.is_new_member_only && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">⭐ New Member</span>
                          )}
                        </div>
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
                        <span className="text-[10px] font-medium uppercase">
                          {camp.start_date ? formatDate(camp.start_date) : 'Now'} - {camp.end_date ? formatDate(camp.end_date) : 'Onwards'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant text-right max-w-[50%]">
                        <span className="material-symbols-outlined text-sm flex-shrink-0">loyalty</span>
                        <span className="truncate" title={camp.discount_type === 'specific_service' ? camp.service?.name : camp.discount_type}>
                          {camp.discount_type === 'specific_service' ? (camp.service?.name || 'Specific Service') : 
                           camp.discount_type === 'points_based' ? 'Redeem Points' : 'All Services'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onConfirm={alertConfig.onConfirm}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onClose={closeAlert} 
      />
    </div>
  );
};

export default AdminPromotionsPage;
