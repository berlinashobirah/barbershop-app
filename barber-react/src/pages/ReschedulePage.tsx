import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import AlertModal from '../components/AlertModal';

interface Barber {
  id: number;
  name: string;
  specialty: string | null;
  status: string;
  image: string | null;
}

interface TimeSlot {
  time: string;
  available_barbers: number;
  is_full: boolean;
}

const ReschedulePage = () => {
  const { id } = useParams(); // unique_code
  const navigate = useNavigate();
  
  const [token] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' as 'success'|'error'|'info' });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch Slots when Date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setSelectedTime(null);
      setSelectedBarber(null);
      setAvailableBarbers([]);
      
      try {
        const dateStr = selectedDate.toLocaleDateString('en-CA');
        const res = await axios.get(`http://localhost:8000/api/slots/availability?date=${dateStr}`);
        setAvailableSlots(res.data.data);
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  // Fetch Barbers when Date and Time change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const fetchBarbers = async () => {
        setSelectedBarber(null);
        try {
          const dateStr = selectedDate.toLocaleDateString('en-CA');
          const res = await axios.get(`http://localhost:8000/api/barbers/available?date=${dateStr}&time=${selectedTime}`);
          setAvailableBarbers(res.data.data);
        } catch (error) {
          console.error('Error fetching barbers:', error);
        }
      };
      fetchBarbers();
    }
  }, [selectedDate, selectedTime]);

  const handleSubmit = async () => {
    if (!selectedTime) return;
    setSubmitting(true);
    try {
      const dateStr = selectedDate.toLocaleDateString('en-CA');
      const res = await axios.post(`http://localhost:8000/api/bookings/${id}/reschedule`, {
        booking_date: dateStr,
        booking_time: selectedTime,
        barber_id: selectedBarber
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAlertConfig({ isOpen: true, message: res.data.message || 'Jadwal berhasil diubah!', type: 'success' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || 'Gagal mengubah jadwal.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Calendar Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const getImageUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
  };

  if (loading || submitting) return <LoadingScreen />;

  return (
    <div className="dark bg-surface min-h-screen text-on-surface font-body">
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-md flex justify-between items-center px-8 h-20 border-b border-outline-variant/10">
        <Link to="/" className="text-2xl font-headline italic text-primary hover:opacity-80 transition-opacity">The Modern Artisan</Link>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary mb-4 tracking-tight">Reschedule Booking</h1>
          <p className="text-secondary">Kode Booking: <span className="font-bold text-white">{id}</span></p>
          <p className="text-secondary max-w-lg mx-auto mt-2">Pilih ulang tanggal, waktu, dan kapster. Anda tidak akan dikenakan biaya tambahan.</p>
        </header>

        <div className="space-y-12">
          {/* Section 1: Tanggal */}
          <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
            <h2 className="font-headline text-2xl font-bold mb-6">1. Pilih Tanggal Baru</h2>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold text-primary">
                {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 border border-outline-variant rounded-md hover:border-primary text-secondary hover:text-primary transition-all">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 border border-outline-variant rounded-md hover:border-primary text-secondary hover:text-primary transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-secondary uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                const isPast = date < today;
                const isSelected = selectedDate.getTime() === date.getTime();
                return (
                  <button
                    key={index}
                    disabled={isPast}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-full flex items-center justify-center font-bold transition-all text-sm ${isPast ? 'text-secondary/30 cursor-not-allowed' : isSelected ? 'bg-primary text-on-primary scale-110 shadow-[0_0_15px_rgba(197,160,40,0.4)]' : 'hover:bg-primary/20 text-on-surface hover:text-primary border border-transparent hover:border-primary/50'}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Waktu */}
          <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
            <h2 className="font-headline text-2xl font-bold mb-6">2. Pilih Jam</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {availableSlots.map((slot) => {
                const [hour, minute] = slot.time.split(':').map(Number);
                const slotTime = new Date(selectedDate);
                slotTime.setHours(hour, minute, 0, 0);
                const isPastToday = selectedDate.getTime() === today.getTime() && slotTime <= new Date();
                const disabled = slot.is_full || isPastToday;
                const isSelected = selectedTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    disabled={disabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 rounded-md font-bold text-sm transition-all border ${disabled ? 'opacity-30 cursor-not-allowed border-outline-variant bg-surface-container-highest' : isSelected ? 'border-primary bg-primary text-on-primary shadow-lg shadow-primary/20' : 'border-outline-variant hover:border-primary/50 text-on-surface'}`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Kapster */}
          {selectedTime && (
            <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 animate-fadeIn">
              <h2 className="font-headline text-2xl font-bold mb-6">3. Pilih Kapster</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedBarber(null)}
                  className={`bg-surface-container p-4 rounded-lg border transition-all cursor-pointer flex items-center gap-4 ${selectedBarber === null ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-outline-variant hover:border-primary/50'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant">
                    <span className="material-symbols-outlined text-secondary">shuffle</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Siapa Saja</h4>
                    <p className="text-xs text-secondary mt-1">Dipilih otomatis oleh sistem</p>
                  </div>
                </div>

                {availableBarbers.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBarber(b.id)}
                    className={`bg-surface-container p-4 rounded-lg border transition-all cursor-pointer flex items-center gap-4 ${selectedBarber === b.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-outline-variant hover:border-primary/50'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
                      {b.image ? (
                        <img src={getImageUrl(b.image)} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-secondary">face</span></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{b.name}</h4>
                      <p className="text-xs text-secondary mt-1">{b.specialty || 'General'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-6 border-t border-outline-variant/20">
            <button
              onClick={handleSubmit}
              disabled={!selectedTime}
              className="w-full bg-primary text-on-primary py-4 rounded-md font-bold uppercase tracking-widest disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">update</span>
              Konfirmasi Perubahan
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-4 bg-transparent border border-outline-variant text-secondary py-4 rounded-md font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all flex items-center justify-center gap-2"
            >
              Batal
            </button>
          </div>
        </div>
      </main>
      <AlertModal isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} />
    </div>
  );
};

export default ReschedulePage;
