import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import LoadingScreen from '../components/LoadingScreen'


interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number | string;
  image: string | null;
  description: string | null;
  is_addon?: boolean;
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

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string | null;
  discount_type: string;
  service_id: number | null;
  required_points: number;
  discount_amount: string | number;
  discount_unit?: 'fixed' | 'percentage';
  min_transaction?: string | number;
  max_discount?: string | number;
  is_new_member_only?: boolean;
  service?: { name: string };
}

const BookingPage = () => {
  const navigate = useNavigate()
  
  // Auth State — dibaca of localStorage di dalam komponen agar reaktif
  const [token] = useState(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState(() => {
    const str = localStorage.getItem('user')
    return str ? JSON.parse(str) : null
  })

  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      }).catch((err) => console.error('Error fetching user', err))
    }
  }, [token])

  // Data State
  const [services, setServices] = useState<Service[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // Selection State
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<number[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)

  const mainServices = services.filter(s => Number(s.is_addon) !== 1)
  const addonServices = services.filter(s => Number(s.is_addon) === 1)

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Initial Fetch: Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [resServices, resCampaigns] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/services`),
          axios.get(`${import.meta.env.VITE_API_URL}/campaigns`)
        ]);
        setServices(resServices.data.data);
        const mains = resServices.data.data.filter((s: Service) => Number(s.is_addon) !== 1);
        if (mains.length > 0) {
          setSelectedService(mains[0].id);
        }
        setCampaigns(resCampaigns.data);
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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/slots/availability?date=${dateStr}`);
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
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/barbers/available?date=${dateStr}&time=${selectedTime}`);
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const service = services.find((s) => s.id === selectedService);
  const barber = availableBarbers.find((b) => b.id === selectedBarber);

  const computeDiscount = (camp: Campaign, rawSubtotal: number) => {
    if (Number(camp.min_transaction) > 0 && rawSubtotal < Number(camp.min_transaction)) {
      return 0;
    }
    let val = 0;
    if (camp.discount_unit === 'percentage') {
      val = (rawSubtotal * Number(camp.discount_amount)) / 100;
      if (Number(camp.max_discount) > 0 && val > Number(camp.max_discount)) {
        val = Number(camp.max_discount);
      }
    } else {
      val = Number(camp.discount_amount);
    }
    return val;
  };

  const currentSubtotal = useMemo(() => {
    const m = service ? Number(service.price) : 0;
    const a = selectedAddons.reduce((s, id) => s + Number(services.find(item => item.id === id)?.price || 0), 0);
    return m + a;
  }, [service, selectedAddons, services]);

  const currentDiscountObj = campaigns.find(c => c.id === selectedCampaign);
  const currentDiscountVal = currentDiscountObj ? computeDiscount(currentDiscountObj, currentSubtotal) : 0;

  // Auto-clear campaign selection if conditions no longer match (e.g., user removes an addon and drops below min spend)
  useEffect(() => {
    if (selectedCampaign && campaigns.length > 0) {
      const camp = campaigns.find(c => c.id === selectedCampaign);
      if (camp) {
        const isPointsBased = camp.discount_type === 'points_based';
        const hasEnoughPoints = user && user.points >= camp.required_points;
        const isApplicableService = camp.discount_type !== 'specific_service' || camp.service_id === selectedService;
        const meetsMinTrans = Number(camp.min_transaction || 0) <= 0 || currentSubtotal >= Number(camp.min_transaction);
        const isNewMemberEligible = !camp.is_new_member_only || !(user && user.has_booking);
        
        if ((isPointsBased && !hasEnoughPoints) || !isApplicableService || !meetsMinTrans || !isNewMemberEligible) {
          setSelectedCampaign(null);
        }
      }
    }
  }, [selectedCampaign, campaigns, selectedService, currentSubtotal, user]);

  if (loading) return <LoadingScreen />;

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
            Log In
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
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">Precision Session Reservation</h1>
          <p className="text-secondary max-w-2xl text-lg">Select service and time that suits your schedule. We ensure a premium experience for every session.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Selection Flow */}
          <div className="lg:col-span-8 space-y-12">

            {/* Section 1: Service */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">01.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Select Main Service</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainServices.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`bg-surface-container-low p-6 rounded-lg border-l-4 transition-all cursor-pointer group ${selectedService === svc.id ? 'border-primary' : 'border-primary/30 hover:border-primary'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {svc.image ? (
                        <img src={getImageUrl(svc.image)} alt={svc.name} className="w-12 h-12 object-cover rounded-md" />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-3xl">content_cut</span>
                      )}
                      <span className="text-primary font-bold">{formatRupiah(svc.price)}</span>
                    </div>
                    <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">{svc.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                      {svc.description || `${svc.duration_minutes} Minutes`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 1.5: Add-Ons */}
            {addonServices.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-primary font-headline text-2xl italic">+</span>
                  <h2 className="font-headline text-2xl font-bold tracking-tight">Add Add-Ons (Optional)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addonServices.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                          } else {
                            setSelectedAddons([...selectedAddons, addon.id]);
                          }
                        }}
                        className={`bg-surface-container-low p-4 rounded-lg border-l-4 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant text-transparent'}`}>
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-on-surface">{addon.name}</h4>
                          <span className="text-sm text-primary font-semibold">+{formatRupiah(addon.price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 2: Time */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">02.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Set Arrival Time</h2>
              </div>
              <div className="bg-surface-container-low p-8 rounded-lg space-y-8 border border-outline-variant/10">
                {/* Calendar header */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline text-lg font-bold">
                      {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
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
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
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
                    <h3 className="font-headline text-lg font-bold">Available Time Slots</h3>
                    <span className="text-xs text-secondary italic">Click to view barber</span>
                  </div>
                  
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        const isToday = selectedDate.toDateString() === new Date().toDateString();
                        let isPastTime = false;
                        if (isToday) {
                          const [slotHour, slotMinute] = slot.time.split(':').map(Number);
                          const now = new Date();
                          const nowHour = now.getHours();
                          const nowMinute = now.getMinutes();
                          if (slotHour < nowHour || (slotHour === nowHour && slotMinute <= nowMinute)) {
                            isPastTime = true;
                          }
                        }

                        return (
                          <button
                            key={slot.time}
                            disabled={slot.is_full || isPastTime}
                            onClick={() => !slot.is_full && !isPastTime && setSelectedTime(slot.time)}
                            className={`p-4 rounded-md text-center transition-all ${
                              isSelected
                                ? 'bg-primary text-on-primary border border-primary'
                                : (slot.is_full || isPastTime)
                                ? 'bg-surface-container-lowest border border-transparent opacity-40 cursor-not-allowed'
                                : 'bg-surface-container-high border border-outline-variant hover:border-primary'
                            }`}
                          >
                            <div className="text-lg font-bold">{slot.time}</div>
                            <div className={`text-[10px] uppercase tracking-tighter ${isSelected ? 'text-on-primary/80' : (slot.is_full || isPastTime) ? 'text-error' : 'text-primary'}`}>
                              {isSelected ? 'Terpilih' : isPastTime ? 'Passed' : slot.is_full ? 'Sudah Penuh' : `${slot.available_barbers} Barber`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-secondary p-8 border border-dashed border-outline-variant rounded-lg">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                      <p>Please select a date to view time slots.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Barber */}
            <section className={selectedTime ? 'opacity-100' : 'opacity-40 pointer-events-none transition-opacity duration-500'}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-headline text-2xl italic">03.</span>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Select Barber</h2>
              </div>
              
              {!selectedTime ? (
                <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 text-center text-secondary">
                  Please select a time slot first to view available barbers.
                </div>
              ) : !token ? (
                /* GUEST: tidak bisa pilih kapster — akan di-random otomatis */
                <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl">shuffle</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">Barber Acak Tersedia</h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      As a guest, the best available barber will be automatically selected for you.
                    </p>
                    <p className="text-[11px] text-primary/70 mt-3 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-xs align-middle mr-1">login</span>
                      <Link to="/login" className="hover:underline font-semibold">Log In as member</Link> to choose your favorite barber
                    </p>
                  </div>
                </div>
              ) : (
                /* MEMBER: bisa pilih kapster spesifik */
                <div className="relative group">
                  <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                    
                    {/* Option: Anyone */}
                    <div
                      onClick={() => setSelectedBarber(null)}
                      className={`min-w-[180px] flex-shrink-0 bg-surface-container-low border-2 rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${selectedBarber === null ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline-variant/50'}`}
                    >
                      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-secondary">group</span>
                      </div>
                      <h3 className={`font-bold ${selectedBarber === null ? 'text-primary' : 'text-on-surface'}`}>Anyone</h3>
                      <p className="text-[10px] text-secondary uppercase tracking-widest mt-1">Barber Tersedia</p>
                    </div>

                    {availableBarbers.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBarber(b.id)}
                        className={`min-w-[180px] flex-shrink-0 bg-surface-container-low border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedBarber === b.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline-variant/50'}`}
                      >
                        <div className="relative mb-4">
                          <img alt={b.name} className="w-full h-32 object-cover rounded-md" src={getImageUrl(b.image) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3nNqhizkaPi6M2lJfKDItfXGT973LcOxg6UC4QegYjRzRH2HiqmZ3wZ7rTEyvBeE8QS6cLMqOIpqXOMXVRPbB-dbUwjS1-g3dh8p1DgXQ_H_ic1DxlZS4l1IrQSpSM70vapeU06K-y2Y3amZj4cF6ViIGMgqX-ktywmpcRycdXxmRFo33dDd5nXWqeIK58Yw1bABTlMZOLz4CLrTlu7CxpRNlbSV3vCGaEq9xHkVxcg6RsF8aoc5y8oXDRmZpxNV9VP0n66GA4dw'} />
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

            {/* Section 4: Promo & Discounts (Hanya Member) */}
            {token && campaigns.length > 0 && (
              <section className={selectedTime ? 'opacity-100' : 'opacity-40 pointer-events-none transition-opacity duration-500'}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-primary font-headline text-2xl italic">04.</span>
                  <h2 className="font-headline text-2xl font-bold tracking-tight">Promo & Discounts</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedCampaign(null)}
                    className={`bg-surface-container-low p-6 rounded-lg border-l-4 transition-all cursor-pointer group ${selectedCampaign === null ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary'}`}
                  >
                    <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors">No Promo</h3>
                    <p className="text-sm text-secondary leading-relaxed mt-2">
                      Continue without using a promo or discount.
                    </p>
                  </div>

                  {campaigns.map((camp) => {
                    const isPointsBased = camp.discount_type === 'points_based';
                    const userPoints = Number(user?.points || 0);
                    const requiredPoints = Number(camp.required_points || 0);
                    const hasEnoughPoints = userPoints >= requiredPoints;
                    
                    const isApplicableService = camp.discount_type !== 'specific_service' || Number(camp.service_id) === Number(selectedService);
                    const meetsMinTrans = Number(camp.min_transaction || 0) <= 0 || currentSubtotal >= Number(camp.min_transaction);
                    const isNewMemberEligible = Number(camp.is_new_member_only) !== 1 || !(user && user.has_booking);
                    const isEligible = (!isPointsBased || hasEnoughPoints) && isApplicableService && meetsMinTrans && isNewMemberEligible;

                    if (!isEligible) return null;

                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedCampaign(camp.id)}
                        className={`bg-surface-container-low p-6 rounded-lg border-l-4 transition-all group cursor-pointer ${
                          selectedCampaign === camp.id ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          {camp.image ? (
                            <img src={getImageUrl(camp.image)} alt={camp.title} className="w-12 h-12 object-cover rounded-md" />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-3xl">loyalty</span>
                          )}
                          <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">
                            {camp.discount_unit === 'percentage' ? `${Number(camp.discount_amount)}%` : formatRupiah(camp.discount_amount)}
                          </span>
                        </div>
                        <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">{camp.title}</h3>
                        <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                          {camp.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Number(camp.min_transaction) > 0 && (
                             <div className="text-[10px] text-on-surface-variant bg-surface-container-highest border border-outline-variant/30 px-2 py-0.5 rounded">Min: {formatRupiah(camp.min_transaction!)}</div>
                          )}
                          {camp.is_new_member_only && (
                             <div className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">⭐ New Member</div>
                          )}
                        </div>
                        {isPointsBased && (
                          <div className={`mt-3 text-xs font-bold ${hasEnoughPoints ? 'text-primary' : 'text-error'}`}>
                            Required: {camp.required_points} Poin (Your Points: {user?.points || 0})
                          </div>
                        )}
                        {camp.discount_type === 'specific_service' && (
                          <div className="mt-3 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                            Specific: {camp.service?.name || 'Specific Services'}
                          </div>
                        )}
                        {/* End of campaign metadata */}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container p-8 rounded-lg sticky top-32 border border-outline-variant/10 shadow-2xl">
              <h3 className="font-headline text-2xl font-bold mb-6 pb-4 border-b border-white/10">Session Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Service</div>
                  <div className="font-bold text-lg">{service?.name || 'Not selected'}</div>
                  <div className="text-primary font-bold mt-1">{service ? formatRupiah(service.price) : '-'}</div>
                </div>

                {selectedAddons.length > 0 && (
                  <div>
                    <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Add-Ons</div>
                    <ul className="space-y-1">
                      {selectedAddons.map(id => {
                        const addon = services.find(s => s.id === id);
                        if (!addon) return null;
                        return (
                          <li key={id} className="flex justify-between text-sm font-semibold">
                            <span>+ {addon.name}</span>
                            <span className="text-primary">{formatRupiah(addon.price)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Arrival Time</div>
                  <div className="font-bold">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-primary font-bold mt-1 text-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">schedule</span>
                    {selectedTime || 'Select Time'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">Barber</div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">face</span>
                    {!token
                      ? <span className="text-secondary italic text-sm">Auto Random (Guest)</span>
                      : selectedBarber === null
                      ? 'Anyone (Available)'
                      : barber?.name
                    }
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-8">
                {selectedCampaign && (
                  <div className="flex justify-between items-end mb-2 text-primary">
                    <div className="font-bold">Diskon Promo</div>
                    <div className="font-bold">- {formatRupiah(currentDiscountVal)}</div>
                  </div>
                )}
                <div className="flex justify-between items-end">
                  <div className="text-secondary font-bold">Total Estimated</div>
                  <div className="font-headline text-3xl font-bold text-white">
                    {formatRupiah(Math.max(0, currentSubtotal - currentDiscountVal))}
                  </div>
                </div>
              </div>

              {/* Booking Action */}
              <button
                disabled={!selectedService || !selectedTime}
                onClick={() => {
                  const total = Math.max(0, currentSubtotal - currentDiscountVal);

                  const data = {
                    serviceId: selectedService,
                    addonIds: selectedAddons,
                    barberId: selectedBarber,
                    date: selectedDate.toLocaleDateString('en-CA'),
                    time: selectedTime,
                    total: total,
                    campaign_id: selectedCampaign
                  };
                  localStorage.setItem('booking_data', JSON.stringify(data));
                  navigate('/konfirmasi-identitas');
                }}
                className="w-full bg-primary py-4 rounded-lg text-on-primary font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,40,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                Confirm Schedule
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
