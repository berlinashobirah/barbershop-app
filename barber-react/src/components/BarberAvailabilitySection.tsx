import { Barber } from '../pages/LandingPage';

interface BarberAvailabilitySectionProps {
  onOpenBarberModal: () => void;
  barbers: Barber[];
}

const BarberAvailabilitySection = ({ onOpenBarberModal, barbers }: BarberAvailabilitySectionProps) => {
  // Hanya tampilkan 4 kapster pertama untuk section utama
  const displayBarbers = barbers.slice(0, 4);

  return (
    <section id="barbers" className="py-24 bg-surface-container-lowest border-y border-outline-variant/10">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-label uppercase tracking-widest text-sm mb-4 block">
            Status Antrean
          </span>
          <h2 className="font-headline text-4xl font-bold mb-4">Ketersediaan Kapster</h2>
          <div className="h-1 w-16 bg-primary mx-auto mb-6"></div>
          <p className="text-secondary max-w-2xl mx-auto">
            Pantau ketersediaan seniman rambut kami secara real-time untuk kunjungan yang lebih terencana.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {displayBarbers.map((barber) => {
            const isAvailable = barber.status === 'Available';
            const isBusy = barber.status === 'Busy';
            const isOnBreak = barber.status === 'On Break';

            return (
              <div key={barber.id} className="bg-surface-container p-6 rounded-lg border border-outline-variant/10 flex flex-col items-center text-center group hover:border-primary/30 transition-colors">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 p-1">
                    <img
                      alt={barber.name}
                      className={`w-full h-full object-cover rounded-full transition-all duration-500 ${!isAvailable ? 'grayscale group-hover:grayscale-0' : ''}`}
                      src={barber.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3nNqhizkaPi6M2lJfKDItfXGT973LcOxg6UC4QegYjRzRH2HiqmZ3wZ7rTEyvBeE8QS6cLMqOIpqXOMXVRPbB-dbUwjS1-g3dh8p1DgXQ_H_ic1DxlZS4l1IrQSpSM70vapeU06K-y2Y3amZj4cF6ViIGMgqX-ktywmpcRycdXxmRFo33dDd5nXWqeIK58Yw1bABTlMZOLz4CLrTlu7CxpRNlbSV3vCGaEq9xHkVxcg6RsF8aoc5y8oXDRmZpxNV9VP0n66GA4dw'}
                    />
                  </div>
                  <div
                    className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-surface-container rounded-full ${
                      isAvailable ? 'bg-green-500' : isBusy ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    title={barber.status}
                  ></div>
                </div>
                <h3 className="font-headline text-xl font-bold mb-1">{barber.name}</h3>
                <p className="text-secondary text-sm mb-4 font-label">{barber.specialty || 'Master Barber'}</p>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  isAvailable ? 'bg-green-500/10 text-green-500' : 
                  isBusy ? 'bg-red-500/10 text-red-500' : 
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {barber.status}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onOpenBarberModal}
            className="flex items-center gap-2 text-primary hover:text-primary-fixed transition-colors font-bold group"
          >
            <span>Lihat Semua Kapster</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BarberAvailabilitySection;
