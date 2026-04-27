import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const token = localStorage.getItem('auth_token');
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number | string;
  image: string | null;
  description: string | null;
}

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

const BookingPage = () => {
  const navigate = useNavigate()
  
  // Data State
  const [services, setServices] = useState<Service[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  // Selection State
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null)

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Initial Fetch: Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/services');
        setServices(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedService(res.data.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch Slots when Date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setSelectedTime(null);
      setSelectedBarber(null);
      setAvailableBarbers([]);
      
      try {
        const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
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

  // --- Calendar Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Padding before day 1
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Don't allow going back past current month
    if (newMonth.getFullYear() < today.getFullYear() || (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() < today.getMonth())) {
      return;
    }
    setCurrentMonth(newMonth);
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  const service = services.find((s) => s.id === selectedService);
  const barber = availableBarbers.find((b) => b.id === selectedBarber);

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary">Memuat data...</div>;

  return (
    <div className="dark bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-md flex justify-between items-center px-8 h-20 border-b border-outline-variant/10">
        <Link to="/" className="text-2xl font-headline italic text-primary hover:opacity-80 transition-opacity">The Modern Artisan</Link>
        {!token ? (
          <Link
            to="/login"
            className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold tracking-wide uppercase transition-transform hover:scale-105 active:opacity-80"
          >
            Masuk
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-[#C5A028] font-bold text-sm hidden md:block">
              Halo, {user?.name?.split(' ')[0]}
            </span>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">Reservasi Sesi Presisi</h1>
          <p className="text-secondary max-w-2xl text-lg">Pilih layanan dan waktu yang sesuai dengan jadwal Anda. Kami memastikan pengalaman premium untuk setiap sesi.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Selection Flow */}
          <div className="lg:col-span-8 space-y-12">

            {/* Section 1: Layanan */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">01.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Pilih Layanan Utama</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`bg-surface-container-low p-6 rounded-lg border-l-4 transition-all cursor-pointer group ${selectedService === svc.id ? 'border-primary' : 'border-primary/30 hover:border-primary'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">content_cut</span>
                      <span className="text-primary font-bold">{formatRupiah(svc.price)}</span>
                    </div>
                    <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">{svc.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                      {svc.description || `${svc.duration_minutes} Menit`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Waktu */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">02.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Atur Waktu Kedatangan</h2>
              </div>
              <div className="bg-surface-container-low p-8 rounded-lg space-y-8 border border-outline-variant/10">
                {/* Calendar header */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline text-lg font-bold">
                      {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={prevMonth}
                        disabled={currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()}
                        className="p-2 hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-surface-container-high rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                    {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((d, i) => {
                      if (d === null) return <div key={`empty-${i}`} className="h-12"></div>;
                      
                      const isPast = d.getTime() < today.getTime();
                      const isSelected = selectedDate && d.getTime() === selectedDate.getTime();
                      
                      return (
                        <div 
                          key={d.getTime()} 
                          onClick={() => !isPast && setSelectedDate(d)}
                          className={`h-12 flex items-center justify-center rounded-md transition-all ${
                            isPast ? 'text-surface-container-highest cursor-not-allowed' : 
                            isSelected ? 'bg-primary text-on-primary font-bold cursor-pointer' : 
                            'hover:bg-surface-container-high cursor-pointer'
                          }`}
                        >
                          {d.getDate()}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline text-lg font-bold">Slot Jam Tersedia</h3>
                    <span className="text-xs text-secondary italic">Klik untuk melihat kapster</span>
                  </div>
                  
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={slot.is_full}
                            onClick={() => !slot.is_full && setSelectedTime(slot.time)}
                            className={`p-4 rounded-md text-center transition-all ${
                              isSelected
                                ? 'bg-primary text-on-primary border border-primary'
                                : slot.is_full
                                ? 'bg-surface-container-lowest border border-transparent opacity-40 cursor-not-allowed'
                                : 'bg-surface-container-high border border-outline-variant hover:border-primary'
                            }`}
                          >
                            <div className="text-lg font-bold">{slot.time}</div>
                            <div className={`text-[10px] uppercase tracking-tighter ${isSelected ? 'text-on-primary/80' : slot.is_full ? 'text-error' : 'text-primary'}`}>
                              {isSelected ? 'Terpilih' : slot.is_full ? 'Sudah Penuh' : `${slot.available_barbers} Kapster`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-secondary p-8 border border-dashed border-outline-variant rounded-lg">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                      <p>Silakan pilih tanggal untuk melihat slot waktu.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Kapster */}
            <section className={selectedTime ? 'opacity-100' : 'opacity-40 pointer-events-none transition-opacity duration-500'}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">03.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Pilih Kapster</h2>
              </div>
              
              {!selectedTime ? (
                <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 text-center text-secondary">
                  Silakan pilih slot waktu terlebih dahulu untuk melihat kapster yang tersedia.
                </div>
              ) : (
                <div className="relative group">
                  <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                    
                    {/* Option: Siapa Saja */}
                    <div
                      onClick={() => setSelectedBarber(null)}
                      className={`min-w-[180px] flex-shrink-0 bg-surface-container-low border-2 rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${selectedBarber === null ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline-variant/50'}`}
                    >
                      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-secondary">group</span>
                      </div>
                      <h3 className={`font-bold ${selectedBarber === null ? 'text-primary' : 'text-on-surface'}`}>Siapa Saja</h3>
                      <p className="text-[10px] text-secondary uppercase tracking-widest mt-1">Kapster Tersedia</p>
                    </div>

                    {availableBarbers.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBarber(b.id)}
                        className={`min-w-[180px] flex-shrink-0 bg-surface-container-low border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedBarber === b.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline-variant/50'}`}
                      >
                        <div className="relative mb-4">
                          <img alt={b.name} className="w-full h-32 object-cover rounded-md" src={b.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3nNqhizkaPi6M2lJfKDItfXGT973LcOxg6UC4QegYjRzRH2HiqmZ3wZ7rTEyvBeE8QS6cLMqOIpqXOMXVRPbB-dbUwjS1-g3dh8p1DgXQ_H_ic1DxlZS4l1IrQSpSM70vapeU06K-y2Y3amZj4cF6ViIGMgqX-ktywmpcRycdXxmRFo33dDd5nXWqeIK58Yw1bABTlMZOLz4CLrTlu7CxpRNlbSV3vCGaEq9xHkVxcg6RsF8aoc5y8oXDRmZpxNV9VP0n66GA4dw'} />
                          {selectedBarber === b.id && (
                            <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full p-1 shadow-lg">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                          )}
                        </div>
                        <h3 className={`font-bold text-sm line-clamp-1 ${selectedBarber === b.id ? 'text-primary' : 'text-on-surface'}`}>{b.name}</h3>
                        <p className="text-[10px] text-secondary uppercase tracking-widest mt-1 line-clamp-1">{b.specialty || 'Master Barber'}</p>
                      </div>
                    ))}
                    
                    {availableBarbers.length === 0 && (
                      <div className="min-w-[300px] flex items-center justify-center text-secondary text-sm">
                        Maaf, tidak ada kapster tersedia di waktu ini.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container p-8 rounded-lg sticky top-32 border border-outline-variant/10 shadow-2xl">
              <h3 className="font-headline text-2xl font-bold mb-6 pb-4 border-b border-white/10">Ringkasan Sesi</h3>
              
              <div className="space-y-6 mb-8">
                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Layanan</div>
                  <div className="font-bold text-lg">{service?.name || 'Belum dipilih'}</div>
                  <div className="text-primary font-bold mt-1">{service ? formatRupiah(service.price) : '-'}</div>
                </div>
                
                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Waktu Kedatangan</div>
                  <div className="font-bold">
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-primary font-bold mt-1 text-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">schedule</span>
                    {selectedTime || 'Pilih Jam'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Kapster</div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">face</span>
                    {selectedBarber === null ? 'Siapa Saja (Tersedia)' : barber?.name}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <div className="text-secondary font-bold">Total Estimaasi</div>
                  <div className="font-headline text-3xl font-bold text-white">{service ? formatRupiah(service.price) : 'Rp 0'}</div>
                </div>
              </div>

              {/* Booking Action */}
              <button
                disabled={!selectedService || !selectedTime}
                onClick={() => {
                  const data = {
                    serviceId: selectedService,
                    barberId: selectedBarber,
                    date: selectedDate.toLocaleDateString('en-CA'),
                    time: selectedTime,
                    total: service ? service.price : 0
                  };
                  localStorage.setItem('booking_data', JSON.stringify(data));
                  
                  if (!token) {
                    navigate('/konfirmasi-identitas');
                  } else {
                    // Langsung panggil API jika sudah login
                    const submitBooking = async () => {
                      try {
                        await axios.post('http://localhost:8000/api/member/bookings', {
                          booking_date: data.date,
                          booking_time: data.time,
                          barber_id: data.barberId,
                          service_id: data.serviceId
                        }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        navigate('/setelah-booking');
                      } catch (err: any) {
                        if (err.response?.status === 401 || err.response?.data?.message === 'Unauthenticated.') {
                          localStorage.removeItem('auth_token');
                          localStorage.removeItem('user');
                          alert('Sesi Anda telah berakhir. Silakan isi data Guest atau Login kembali.');
                          navigate('/konfirmasi-identitas');
                        } else {
                          alert(err.response?.data?.message || 'Terjadi kesalahan saat memproses booking.');
                        }
                      }
                    };
                    submitBooking();
                  }
                }}
                className="w-full bg-primary py-4 rounded-lg text-on-primary font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,40,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                Konfirmasi Jadwal
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookingPage
