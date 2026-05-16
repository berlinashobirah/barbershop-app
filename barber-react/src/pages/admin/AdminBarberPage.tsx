import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingScreen from '../../components/LoadingScreen';
import AlertModal from '../../components/AlertModal';

interface Barber {
  id: number;
  name: string;
  specialty: string | null;
  status: 'Available' | 'Busy' | 'Absent';
  image: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.VITE_BASE_URL;

const AdminBarberPage = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
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
    specialty: '',
    status: 'Available',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('auth_token');

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/barbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBarbers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch barbers', error);
      setAlertConfig({ isOpen: true, message: 'Failed to fetch barber data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleResetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      specialty: '',
      status: 'Available',
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (barber: Barber) => {
    setIsEditing(true);
    setEditId(barber.id);
    setFormData({
      name: barber.name,
      specialty: barber.specialty || '',
      status: barber.status,
    });
    setImageFile(null);
    setImagePreview(barber.image ? `${API_URL}${barber.image}` : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Scroll to form
    document.getElementById('barber-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    setAlertConfig({
      isOpen: true,
      message: 'Are you sure you want to delete this barber?',
      type: 'info',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/admin/barbers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchBarbers();
          if (editId === id) handleResetForm();
          setAlertConfig({ isOpen: true, message: 'Barber successfully deleted.', type: 'success' });
        } catch (error: any) {
          console.error(error);
          const errorMsg = error.response?.data?.message || 'Failed to delete barber. Connection error.';
          setAlertConfig({ isOpen: true, message: errorMsg, type: 'error' });
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
      submitData.append('specialty', formData.specialty);
      submitData.append('status', formData.status);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (isEditing && editId) {
        submitData.append('_method', 'PUT'); // Laravel workaround for PUT with FormData
        await axios.post(`${API_BASE}/admin/barbers/${editId}`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAlertConfig({ isOpen: true, message: 'Barber data successfully updated!', type: 'success' });
      } else {
        await axios.post(`${API_BASE}/admin/barbers`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAlertConfig({ isOpen: true, message: 'New barber successfully added!', type: 'success' });
      }
      
      fetchBarbers();
      handleResetForm();
    } catch (error: any) {
      console.error(error);
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || 'An error occurred while saving.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Available':
        return <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">Available</span>;
      case 'Busy':
        return <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Busy</span>;
      case 'Absent':
        return <span className="bg-error/10 text-error text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-error/20">Logged Out</span>;
      default:
        return <span className="bg-surface-container-highest text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{status}</span>;
    }
  };

  const totalPages = Math.ceil(barbers.length / itemsPerPage);
  const currentBarbers = barbers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      {loading && <LoadingScreen />}
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-on-surface mb-2 tracking-tight font-headline">Manage Barbers</h2>
          <p className="text-secondary font-body">Management of The Modern Artisan artist team. Add new staff, update specializations, or set their attendance status.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Barber Listing */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
             <div className="text-center py-12">
               <div className="w-10 h-10 border-4 border-[#eac249] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-secondary">Memuat data...</p>
             </div>
          ) : currentBarbers.length === 0 ? (
            <div className="bg-surface-container-low p-10 rounded-xl text-center text-secondary border border-outline-variant/20">
              No barbers available on this page.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBarbers.map((barber) => (
                  <div key={barber.id} className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-highest transition-all group border border-transparent hover:border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(barber.status)}
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(barber)} className="text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(barber.id)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start mb-4">
                    {barber.image ? (
                      <img src={`${API_URL}${barber.image}`} alt={barber.name} className="w-16 h-16 rounded-full object-cover border border-outline-variant/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
                        <span className="material-symbols-outlined text-secondary opacity-50">face</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-1 font-headline">{barber.name}</h3>
                      <p className="text-xs text-secondary">{barber.specialty || 'Generalist'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 p-4 bg-surface-container-lowest/50 rounded-xl flex justify-between items-center border border-outline-variant/10">
                  <p className="text-xs text-secondary">
                    Showing {currentBarbers.length} of {barbers.length} barbers
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
        <div className="space-y-6" id="barber-form">
          <div className="bg-surface-container-low rounded-xl p-8 sticky top-28 border border-outline-variant/20">
            <h3 className="text-2xl font-bold mb-6 text-on-surface flex items-center gap-3 font-headline">
              <span className="w-1 h-8 bg-primary rounded-full"></span>
              {isEditing ? 'Edit Barber' : 'Add New Barber'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Full Name</label>
                <input 
                  required
                  className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none transition-all" 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Specialization</label>
                <input 
                  className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none transition-all" 
                  type="text" 
                  placeholder="e.g., Fade Expert, Classic Trim"
                  value={formData.specialty}
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Initial Status</label>
                <select 
                  className="w-full bg-surface-container-highest border-none border-b border-outline-variant text-on-surface rounded-md focus:ring-1 focus:ring-primary px-4 py-3 outline-none appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Absent">Logged Out (Absent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Profile Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 mx-auto bg-surface-container-highest rounded-full overflow-hidden group cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary transition-all flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-xl">edit</span>
                      </div>
                    </>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-3xl group-hover:text-primary transition-colors">add_a_photo</span>
                  )}
                </div>
                <p className="text-center text-[10px] text-secondary mt-2">Format: JPG/PNG, Max: 2MB</p>
              </div>

              <div className="pt-4 flex gap-3">
                {isEditing && (
                  <button 
                    onClick={handleResetForm}
                    className="flex-1 border border-outline-variant text-secondary font-bold py-3 rounded-md text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-all" 
                    type="button"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-md text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50" 
                  type="submit"
                >
                  {submitting ? 'Saving...' : 'Save Barber'}
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

export default AdminBarberPage;
