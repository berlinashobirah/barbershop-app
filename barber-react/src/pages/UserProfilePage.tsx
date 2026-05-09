import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import AlertModal from '../components/AlertModal';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  points: number;
  profile_photo: string | null;
}

interface BookingHistory {
  id: number;
  unique_code: string;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  service_name: string;
  barber_name: string;
  requires_reschedule: boolean;
  campaign_title?: string;
  discount_amount?: string | number;
}

const API_BASE = 'http://localhost:8000/api';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({ isOpen: false, message: '', type: 'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }));

  const getToken = () => localStorage.getItem('auth_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch User Profile
        const userRes = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        if (userRes.status === 401) {
          localStorage.removeItem('auth_token');
          navigate('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: ''
        });
        setPhotoPreview(userData.profile_photo ? `http://localhost:8000${userData.profile_photo}` : null);

        // Fetch History
        const historyRes = await fetch(`${API_BASE}/member/history`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        const historyData = await historyRes.json();
        setHistory(historyData.data || []);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      if (formData.password) payload.append('password', formData.password);
      if (profilePhoto) payload.append('profile_photo', profilePhoto);
      payload.append('_method', 'PUT');

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json'
        },
        body: payload
      });
      const data = await res.json();
      if (res.ok) {
        setAlertConfig({ isOpen: true, message: 'Profil berhasil diperbarui!', type: 'success' });
        setUser(data.user);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.user.name, profile_photo: data.user.profile_photo }));
        window.dispatchEvent(new Event('auth-change'));
        setFormData(prev => ({ ...prev, password: '' })); 
        setProfilePhoto(null);
      } else {
        setAlertConfig({ isOpen: true, message: `Gagal: ${data.message || 'Periksa kembali data Anda'}`, type: 'error' });
      }
    } catch (error) {
      setAlertConfig({ isOpen: true, message: 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = (id: number) => {
    setAlertConfig({
      isOpen: true,
      message: 'Yakin ingin membatalkan pesanan ini?',
      type: 'info',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/member/bookings/${id}/cancel`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${getToken()}`,
              Accept: 'application/json'
            }
          });
          const data = await res.json();
          if (res.ok) {
            setAlertConfig({ isOpen: true, message: 'Booking berhasil dibatalkan.', type: 'success' });
            // Refresh history
            const historyRes = await fetch(`${API_BASE}/member/history`, {
              headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
            });
            const historyData = await historyRes.json();
            setHistory(historyData.data || []);
          } else {
            setAlertConfig({ isOpen: true, message: data.message || 'Gagal membatalkan.', type: 'error' });
          }
        } catch (error) {
          setAlertConfig({ isOpen: true, message: 'Terjadi kesalahan.', type: 'error' });
        }
      }
    });
  };

  const upcomingBookings = history.filter(b => ['pending', 'arrived', 'processing'].includes(b.status));
  const pastBookings = history.filter(b => ['completed', 'cancelled'].includes(b.status));

  const filteredHistory = useMemo(() => {
    let result = history;
    if (filterDate) {
      result = result.filter(b => b.booking_date === filterDate);
    }
    return result;
  }, [history, filterDate]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentData = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canReschedule = (booking: BookingHistory) => {
    if (booking.status !== 'pending' && booking.status !== 'arrived') return false;
    if (booking.requires_reschedule) return true;
    
    const now = new Date();
    const bookingTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    if (isNaN(bookingTime.getTime())) return false;
    
    const diffMinutes = (now.getTime() - bookingTime.getTime()) / (1000 * 60);
    return diffMinutes >= 30 && diffMinutes < 60;
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen pb-24 md:pb-0 font-body">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="bg-[#1c1b1b] p-8 rounded-lg text-center lg:text-left">
            <div className="relative w-24 h-24 mx-auto lg:mx-0 mb-6 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-highest">
              {user?.profile_photo ? (
                <img src={`http://localhost:8000${user.profile_photo}`} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-[#eac249]">person</span>
                </div>
              )}
            </div>
            
            <h2 className="font-headline text-2xl font-bold text-[#e5e2e1] tracking-tight">
              {loading ? 'Memuat...' : user?.name}
            </h2>
            <p className="text-[#c8c6c5] text-sm font-body tracking-wider mt-1">
              {loading ? '...' : `${user?.points ?? 0} Poin`} | Member
            </p>
            
            <div className="mt-8 pt-8 border-t border-[#4d4635]/20 space-y-4">
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-4 w-full transition-colors font-headline italic text-lg group ${activeTab === 'history' ? 'text-[#eac249]' : 'text-[#c8c6c5] hover:text-[#eac249]'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}>history</span>
                <span>Riwayat Booking</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-4 w-full transition-colors font-headline italic text-lg group ${activeTab === 'settings' ? 'text-[#eac249]' : 'text-[#c8c6c5] hover:text-[#eac249]'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
                <span>Pengaturan Akun</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 w-full text-[#ffb4ab]/70 hover:text-[#ffb4ab] transition-colors font-headline italic text-lg mt-12"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9 space-y-12">
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              {activeTab === 'history' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                      <h3 className="font-headline text-3xl font-bold text-[#e5e2e1]">Riwayat Booking</h3>
                      <p className="text-[#eac249] text-sm font-body uppercase tracking-[0.2em] hidden md:block">Upcoming & Past</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input 
                          type="date"
                          value={filterDate}
                          onChange={(e) => {
                            setFilterDate(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-[#2a2a2a] border border-[#4d4635]/20 text-[#e5e2e1] px-4 py-2 rounded-md focus:outline-none focus:border-[#eac249] text-sm font-body"
                        />
                      </div>
                      {filterDate && (
                        <button 
                          onClick={() => { setFilterDate(''); setCurrentPage(1); }}
                          className="text-[#ffb4ab] text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-lg bg-[#1c1b1b] border border-[#4d4635]/10">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#2a2a2a]">
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium">Layanan</th>
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium">Kapster</th>
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium">Waktu</th>
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium">Harga</th>
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium text-center">Status</th>
                          <th className="p-6 font-headline italic text-[#d0c5af] font-medium text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#4d4635]/10">
                        {currentData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-[#c8c6c5] italic">
                              {filterDate ? 'Tidak ada riwayat booking pada tanggal tersebut.' : 'Belum ada riwayat booking.'}
                            </td>
                          </tr>
                        ) : (
                          currentData.map((booking) => (
                            <tr key={booking.id} className="hover:bg-[#353534]/30 transition-colors">
                              <td className="p-6">
                                <p className="font-body font-bold text-[#e5e2e1]">{booking.service_name}</p>
                                <p className="text-xs text-[#c8c6c5]/60 mt-1 uppercase tracking-widest">{booking.unique_code}</p>
                                <p className="text-xs text-[#c8c6c5]/60 mt-1 uppercase tracking-widest">{booking.barber_name}</p>
                              </td>
                              <td className="p-6 font-body text-[#c8c6c5]">{booking.barber_name}</td>
                              <td className="p-6 font-body text-[#c8c6c5]">
                                {booking.booking_date} <br/> {booking.booking_time.slice(0,5)}
                              </td>
                              <td className="p-6 font-body">
                                <span className="text-[#eac249] font-bold">Rp {Number(booking.total_amount).toLocaleString('id-ID')}</span>
                                {booking.discount_amount && Number(booking.discount_amount) > 0 && (
                                  <div className="mt-1 text-[10px] text-error font-bold uppercase tracking-widest bg-error/10 border border-error/20 inline-block px-2 py-0.5 rounded-full">
                                    Diskon {booking.campaign_title ? `(${booking.campaign_title})` : ''} Rp {Number(booking.discount_amount).toLocaleString('id-ID')}
                                  </div>
                                )}
                              </td>
                              <td className="p-6 text-center">
                                {booking.payment_status === 'expired' ? (
                                  <span className="inline-block px-3 py-1 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Booking Gagal
                                  </span>
                                ) : booking.payment_status === 'unpaid' && booking.status !== 'cancelled' ? (
                                  <span className="inline-block px-3 py-1 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Belum Bayar
                                  </span>
                                ) : booking.status === 'completed' ? (
                                  <span className="inline-block px-3 py-1 bg-[#353534] text-[#c8c6c5]/60 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Selesai
                                  </span>
                                ) : booking.status === 'cancelled' ? (
                                  <span className="inline-block px-3 py-1 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Batal
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-1 bg-[#eac249]/10 border border-[#eac249]/20 text-[#eac249] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    {booking.status === 'pending' ? 'Menunggu Kedatangan' : booking.status === 'arrived' ? 'Hadir' : 'Proses'}
                                  </span>
                                )}
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex flex-col items-end gap-2">
                                  {booking.payment_status === 'unpaid' && booking.status !== 'cancelled' ? (
                                    <div className="flex flex-col gap-2 w-full items-end">
                                      <button 
                                        onClick={() => {
                                          localStorage.setItem('last_booking', JSON.stringify(booking));
                                          navigate('/setelah-booking');
                                        }}
                                        className="text-[10px] w-full max-w-[100px] bg-[#eac249] text-[#3d2f00] px-4 py-2 rounded-md font-bold uppercase tracking-widest hover:brightness-110 transition-all text-center"
                                      >
                                        Bayar
                                      </button>
                                      {booking.status === 'pending' && (
                                        <button 
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="text-[10px] w-full max-w-[100px] bg-error/10 text-error px-4 py-2 rounded-md font-bold uppercase tracking-widest hover:bg-error/20 transition-all border border-error/20 text-center"
                                        >
                                          Batalkan
                                        </button>
                                      )}
                                    </div>
                                  ) : booking.payment_status === 'paid' ? (
                                    <button 
                                      onClick={() => {
                                        localStorage.setItem('last_booking', JSON.stringify(booking));
                                        navigate('/setelah-booking');
                                      }}
                                      className="text-[10px] border border-[#eac249] text-[#eac249] px-4 py-2 rounded-md font-bold uppercase tracking-widest hover:bg-[#eac249]/10 transition-all"
                                    >
                                      Lihat Detail
                                    </button>
                                  ) : (
                                    <span className="text-secondary/50 text-xs italic">-</span>
                                  )}

                                  {canReschedule(booking) && (
                                    <button 
                                      onClick={() => navigate(`/reschedule/${booking.unique_code}`)}
                                      className="text-[10px] border border-secondary text-secondary px-4 py-2 rounded-md font-bold uppercase tracking-widest hover:bg-secondary/10 hover:text-primary transition-all"
                                    >
                                      Ubah Jadwal
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-[#2a2a2a] text-[#e5e2e1] rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#353534] transition-colors text-sm font-bold uppercase tracking-widest"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-[#c8c6c5] text-sm font-body tracking-widest">
                        Hal {currentPage} dari {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-[#2a2a2a] text-[#e5e2e1] rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#353534] transition-colors text-sm font-bold uppercase tracking-widest"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="font-headline text-3xl font-bold text-[#e5e2e1]">Pengaturan Akun</h3>
                  <div className="bg-[#1c1b1b] p-8 rounded-lg">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <label className="text-[#c8c6c5] text-xs uppercase tracking-[0.2em] font-bold block mb-2">Foto Profil</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#353534] border border-[#4d4635]/20 flex-shrink-0">
                              {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-[#c8c6c5]">person</span>
                              )}
                            </div>
                            <input 
                              type="file" 
                              accept="image/*"
                              id="profile_photo_input"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProfilePhoto(e.target.files[0]);
                                  setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                                }
                              }}
                            />
                            <div className="flex flex-col gap-2">
                              <label htmlFor="profile_photo_input" className="text-sm text-[#3d2f00] py-2 px-4 rounded-full border-0 font-bold bg-[#eac249] hover:bg-[#eac249]/80 transition-all font-body cursor-pointer text-center inline-block">
                                Pilih Foto
                              </label>
                              {profilePhoto && (
                                <button type="button" onClick={() => {
                                  setProfilePhoto(null);
                                  setPhotoPreview(user?.profile_photo ? `http://localhost:8000${user.profile_photo}` : null);
                                }} className="text-xs text-error font-bold uppercase tracking-widest hover:underline">
                                  Batal Ganti
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[#c8c6c5] text-xs uppercase tracking-[0.2em] font-bold">Nama Lengkap</label>
                          <input 
                            className="w-full bg-[#353534] border-none focus:ring-1 focus:ring-[#eac249] text-[#e5e2e1] font-body p-4 rounded-md outline-none" 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[#c8c6c5] text-xs uppercase tracking-[0.2em] font-bold">Email</label>
                          <input 
                            className="w-full bg-[#353534] border-none focus:ring-1 focus:ring-[#eac249] text-[#e5e2e1] font-body p-4 rounded-md outline-none" 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[#c8c6c5] text-xs uppercase tracking-[0.2em] font-bold">Nomor Telepon</label>
                          <input 
                            className="w-full bg-[#353534] border-none focus:ring-1 focus:ring-[#eac249] text-[#e5e2e1] font-body p-4 rounded-md outline-none" 
                            type="tel" 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[#c8c6c5] text-xs uppercase tracking-[0.2em] font-bold">Ubah Kata Sandi (Opsional)</label>
                          <div className="relative">
                            <input 
                              className="w-full bg-[#353534] border-none focus:ring-1 focus:ring-[#eac249] text-[#e5e2e1] font-body p-4 pr-12 rounded-md outline-none" 
                              placeholder="Biarkan kosong jika tidak ingin diubah" 
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-[#eac249] transition-colors focus:outline-none"
                            >
                              <span className="material-symbols-outlined select-none text-xl">
                                {showPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 flex flex-col md:flex-row gap-4 items-center justify-end border-t border-[#4d4635]/10">
                        <button 
                          disabled={updating}
                          className="bg-[#eac249] hover:opacity-90 transition-all text-[#3d2f00] font-body font-bold px-10 py-4 rounded-md uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(234,194,73,0.2)] disabled:opacity-50 w-full md:w-auto" 
                          type="submit"
                        >
                          {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
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

export default UserProfilePage;
