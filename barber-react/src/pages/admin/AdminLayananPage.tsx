import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingScreen from '../../components/LoadingScreen';
import AlertModal from '../../components/AlertModal';

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  points_reward: number;
  is_addon: boolean;
  image: string | null;
}

const API_BASE = 'http://localhost:8000/api';
const API_URL = 'http://localhost:8000';

const AdminLayananPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({ isOpen: false, message: '', type: 'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }));
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    points_reward: 0,
    is_addon: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('auth_token');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data.data);
    } catch (error) {
      console.error('Failed to fetch services', error);
      setAlertConfig({ isOpen: true, message: 'Gagal mengambil data layanan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleResetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      price: 0,
      points_reward: 0,
      is_addon: false,
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (service: Service) => {
    setIsEditing(true);
    setEditId(service.id);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      points_reward: service.points_reward || 0,
      is_addon: service.is_addon || false,
    });
    setImageFile(null);
    setImagePreview(service.image ? `${API_URL}${service.image}` : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Scroll to form
    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    setAlertConfig({
      isOpen: true,
      message: 'Yakin ingin menghapus layanan ini?',
      type: 'info',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/admin/services/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchServices();
          if (editId === id) handleResetForm();
          setAlertConfig({ isOpen: true, message: 'Layanan berhasil dihapus.', type: 'success' });
        } catch (error) {
          console.error(error);
          setAlertConfig({ isOpen: true, message: 'Gagal menghapus layanan.', type: 'error' });
        }
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('duration_minutes', String(formData.duration_minutes));
      submitData.append('price', String(formData.price));
      submitData.append('points_reward', String(formData.points_reward));
      submitData.append('is_addon', formData.is_addon ? '1' : '0');
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (isEditing && editId) {
        submitData.append('_method', 'PUT'); // Laravel workaround for PUT with FormData
        await axios.post(`${API_BASE}/admin/services/${editId}`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAlertConfig({ isOpen: true, message: 'Layanan berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post(`${API_BASE}/admin/services`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAlertConfig({ isOpen: true, message: 'Layanan baru berhasil ditambahkan!', type: 'success' });
      }
      
      fetchServices();
      handleResetForm();
    } catch (error: any) {
      console.error(error);
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      {loading && <LoadingScreen />}
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-on-surface mb-2 tracking-tight font-headline">Kelola Layanan</h2>
          <p className="text-secondary font-body">Atur katalog layanan eksklusif Anda. Tambahkan, perbarui detail harga, poin reward, atau durasi perawatan untuk menjaga standar presisi atelier.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Service Listing */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
             <div className="text-center py-12">
               <div className="w-10 h-10 border-4 border-[#eac249] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-secondary">Memuat data...</p>
             </div>
          ) : currentServices.length === 0 ? (
            <div className="bg-surface-container-low p-10 rounded-xl text-center text-secondary border border-outline-variant/20">
              Belum ada layanan yang terdaftar di halaman ini.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentServices.map((service) => (
                  <div key={service.id} className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-highest transition-all group border border-transparent hover:border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">stars</span>
                      {service.points_reward} Pts
                    </span>
                    {service.is_addon && (
                      <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ml-2">
                        Add-On
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(service)} className="text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start mb-4">
                    {service.is_addon ? (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-2xl font-bold">add_circle</span>
                      </div>
                    ) : service.image ? (
                      <img src={`${API_URL}${service.image}`} alt={service.name} className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
                        <span className="material-symbols-outlined text-secondary opacity-50">image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-1 font-headline">{service.name}</h3>
                      <p className="text-xs text-secondary line-clamp-2">{service.description || 'Tidak ada deskripsi.'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2 text-outline">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="text-xs font-medium">{service.duration_minutes} Mins</span>
                    </div>
                    <span className="text-primary font-bold">{formatRupiah(service.price)}</span>
                  </div>
                </div>
              ))}
            </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 p-4 bg-surface-container-lowest/50 rounded-xl flex justify-between items-center border border-outline-variant/10">
                  <p className="text-xs text-secondary">
                    Menampilkan {currentServices.length} dari {services.length} layanan
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-white hover:bg-surface-container-highest disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="text-xs font-bold text-primary px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-white hover:bg-surface-container-highest disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Inline Editing Form */}
        <div className="space-y-6" id="service-form">
          <div className="bg-surface-container-low rounded-xl p-8 sticky top-28 border border-outline-variant/20">
            <h3 className="text-2xl font-bold mb-6 text-on-surface flex items-center gap-3 font-headline">
              <span className="w-1 h-8 bg-primary rounded-full"></span>
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Nama Layanan</label>
                <input 
                  required
                  className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none transition-all" 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Deskripsi Singkat</label>
                <textarea 
                  className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none transition-all resize-none h-20" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Durasi (Menit)</label>
                  <input 
                    required min="1"
                    className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none" 
                    type="number" 
                    value={formData.duration_minutes}
                    onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Poin Reward</label>
                  <input 
                    required min="0"
                    className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none" 
                    type="number" 
                    value={formData.points_reward}
                    onChange={e => setFormData({...formData, points_reward: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Harga (Rp)</label>
                  <input 
                    required min="0"
                    className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 font-bold text-primary outline-none" 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-highest"
                      checked={formData.is_addon}
                      onChange={e => {
                        setFormData({...formData, is_addon: e.target.checked});
                        if (e.target.checked) {
                          setImageFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                      }}
                    />
                    <span className="text-sm font-bold text-on-surface">Jadikan Add-On</span>
                  </label>
                  <p className="text-[10px] text-secondary mt-1 ml-8">Add-on dipilih setelah layanan utama</p>
                </div>
              </div>

              {!formData.is_addon && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Foto Layanan</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-32 bg-surface-container-highest rounded-lg overflow-hidden group cursor-pointer border border-dashed border-outline-variant hover:border-primary transition-all flex flex-col items-center justify-center"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-3xl">change_circle</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-outline text-3xl mb-2 group-hover:text-primary transition-colors">upload_file</span>
                        <span className="text-xs text-secondary font-medium">Klik untuk Unggah Gambar</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {isEditing && (
                  <button 
                    onClick={handleResetForm}
                    className="flex-1 border border-outline-variant text-secondary font-bold py-3 rounded-md text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-all" 
                    type="button"
                  >
                    Batal
                  </button>
                )}
                <button 
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-md text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50" 
                  type="submit"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={closeAlert} 
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
};

export default AdminLayananPage;
