import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Barber } from '../pages/LandingPage';

interface BarberModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
}

const BarberModal = ({ isOpen, onClose, barbers }: BarberModalProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

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

  const filteredBarbers = filter === 'All' 
    ? barbers 
    : barbers.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'Busy': return 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]';
      case 'On Break': return 'bg-secondary-container';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'Available': return 'border-primary/20';
      case 'Busy': return 'border-error/20';
      case 'On Break': return 'border-secondary/20';
      default: return 'border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.3s_ease-out]">
      <div 
        className="absolute inset-0 bg-[#131313]/90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-6xl h-full max-h-[850px] overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-8 border-b border-outline-variant/10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">Our Master Artisans</h2>
            <p className="text-on-surface-variant font-body mt-2 uppercase tracking-widest text-xs">Curated Precision & Elite Grooming</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors group"
          >
            <span className="material-symbols-outlined text-on-surface group-hover:rotate-90 transition-transform duration-300">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {['All', 'Available', 'Busy', 'On Break'].map(f => (
              <span 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide whitespace-nowrap cursor-pointer transition-colors ${
                  filter === f 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-medium'
                }`}
              >
                {f === 'All' ? 'All Artisans' : f}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBarbers.map((barber) => (
              <div key={barber.id} className="group relative bg-surface-container-low p-1 rounded-lg overflow-hidden transition-all duration-500 hover:bg-outline-variant/20 border border-outline-variant/5">
                <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                  <img 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                      barber.status === 'Busy' ? 'grayscale group-hover:grayscale-0' : ''
                    } ${barber.status === 'On Break' ? 'opacity-60' : ''}`}
                    src={barber.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXmIBy6-hD7vS0a1Y9H8T6R4N2z5fX3w9O1Y2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P'} 
                    alt={barber.name} 
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`flex items-center gap-2 px-3 py-1 bg-[#131313]/80 backdrop-blur-md rounded-full border ${getStatusBorder(barber.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(barber.status)}`}></span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface">
                        {barber.status}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3">
                  <h3 className="text-lg font-bold font-headline text-primary tracking-tight">{barber.name}</h3>
                  <p className="text-on-surface-variant text-[11px] mt-1 leading-tight">{barber.specialty || 'Master Barber'}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    {barber.status === 'Busy' ? (
                      <span className="text-[10px] text-on-surface-variant italic">Next: 30 mins</span>
                    ) : (
                      <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface hover:text-primary transition-colors flex items-center gap-1">
                        Portfolio <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredBarbers.length === 0 && (
              <div className="col-span-full py-12 text-center text-secondary">
                Tidak ada kapster dengan status {filter} saat ini.
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-surface-container-low border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <p className="text-on-surface-variant text-sm">All our barbers are certified master artisans with 5+ years experience.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-4 bg-surface-container-high border border-outline-variant/30 text-on-surface font-bold uppercase tracking-widest text-xs hover:bg-surface-container-highest transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('/booking');
              }}
              className="flex-1 md:flex-none px-10 py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/10"
            >
              Proceed to Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberModal;
