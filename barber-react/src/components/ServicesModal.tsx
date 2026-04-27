import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../pages/LandingPage';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

const ServicesModal = ({ isOpen, onClose, services }: ServicesModalProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeService = services.length > 0 ? services[activeIndex] : null;

  const handleMouseEnter = (index: number) => {
    if (activeIndex !== index) {
      setActiveIndex(index);
      setFadeKey((prev) => prev + 1);
    }
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 backdrop-blur-md bg-[#131313]/85" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-6xl bg-surface-container-low rounded-2xl overflow-hidden border border-white/5 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row h-full max-h-[850px] animate-[fadeIn_0.3s_ease-out]">
        
        <button 
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors z-20 bg-black/40 p-2 rounded-full backdrop-blur-md"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="hidden md:block relative w-3/5 overflow-hidden group">
          {activeService && (
            <>
              <img 
                key={fadeKey}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 animate-[fadeIn_0.4s_ease-out]" 
                src={activeService.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywWSecRTU-zWURMEOBlqZmNpgH_AU_V8T29ahiPyIr4fNjUNWR0fdyu686LNTXt2yM5txksdc1DmR_272PhrDKWVtlGwnXriW7XqJ0ug9ZeY7g6XX3QIR8PMbVfnv6LdvGuQHV9d9b-4hvPLXdBHGQDmTW2GpsDz6JusKiJ9N1bmxJO2YlvKswVGuIp17lfPOEIIj-rBO60N6HHxUSghWRyijcxiqnSsFx61eNE9uZSUGHbooLMIILNoMOBlVbJXcE_2WDE9F9KA'} 
                alt={activeService.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30"></div>
              <div className="absolute bottom-12 left-12 z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[1px] w-12 bg-primary"></div>
                  <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">
                    Menu of Excellence
                  </span>
                </div>
                <h2 className="font-headline text-5xl font-bold text-white tracking-tight">
                  {activeService.name}
                </h2>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 bg-surface-container-low flex flex-col h-full border-l border-white/5">
          <div className="p-8 md:p-12 pb-6">
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-2">Our Signature Styles</h3>
            <p className="text-secondary text-sm mb-6">Expertly crafted grooming experiences</p>
            <div className="w-full h-[1px] bg-outline-variant/20 mb-8"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 space-y-3 custom-scrollbar">
            {services.map((service, idx) => (
              <button 
                key={service.id}
                onMouseEnter={() => handleMouseEnter(idx)}
                className={`w-full text-left group flex justify-between items-center p-5 rounded-xl border transition-all cursor-pointer ${
                  activeIndex === idx 
                    ? 'bg-[#2a2a2a] border-primary' 
                    : 'border-transparent hover:border-primary/30'
                }`}
              >
                <div className="flex-1 pr-6">
                  <h4 className={`font-headline text-lg font-bold mb-1 transition-colors ${
                    activeIndex === idx ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                  }`}>
                    {service.name}
                  </h4>
                  <p className="text-secondary/70 text-sm line-clamp-1 italic">
                    {service.description || `${service.duration_minutes} Minutes Session`}
                  </p>
                </div>
                <span className={`font-headline text-lg font-semibold transition-colors whitespace-nowrap ml-4 ${
                  activeIndex === idx ? 'text-primary' : 'text-on-surface/80 group-hover:text-primary'
                }`}>
                  {formatRupiah(service.price)}
                </span>
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-secondary text-center py-8">Belum ada layanan tersedia.</p>
            )}
          </div>
          
          <div className="p-8 border-t border-white/5 bg-surface-container-lowest">
            <button 
              onClick={() => {
                onClose();
                navigate('/booking');
              }}
              className="w-full bg-primary py-4 rounded-lg text-on-primary font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Book This Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
