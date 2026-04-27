import { Service } from '../pages/LandingPage';

interface ServicesSectionProps {
  onOpenServicesModal: () => void;
  services: Service[];
}

const ServicesSection = ({ onOpenServicesModal, services }: ServicesSectionProps) => {
  const mainService = services.length > 0 ? services[0] : null;
  const sideServices = services.length > 1 ? services.slice(1, 3) : [];

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  return (
    <section id="services" className="py-24 bg-surface">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="max-w-xl">
            <h2 className="font-headline text-4xl font-bold mb-4">Layanan Unggulan</h2>
            <div className="h-1 w-20 bg-primary mb-6"></div>
            <p className="text-secondary">
              Kurasi perawatan pria terbaik untuk menonjolkan karakter dan kepercayaan diri Anda.
            </p>
          </div>
          <div className="text-primary font-headline italic text-xl">
            Crafting Confidence Since Day One.
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:min-h-[600px]">
          {/* Main Service */}
          {mainService && (
            <div className="md:col-span-7 bg-surface-container-low relative group overflow-hidden rounded-lg flex flex-col justify-end p-8 border border-outline-variant/10 min-h-[400px] md:min-h-0">
              <img
                alt={mainService.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                src={mainService.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB8RO3g5-q8_nb8IGDbs_2_t6l0WPdX4IwRW0Z57iTFdBAp-lVVdMyAS_vN9YUZ_huOXGWqf_lZdFs03bKzMGwrOrQ_20nFHQujw5gS_oEFDzdzIX7dM0ypwUjK1CNPefwat_7w8Secn5Sm5nQBZpUkRxQ4qRxJ1BUKfmgLa3Lr3Yuk8u_Rp1iYXd-gjpZwqfqCt9BcOf_I4So6a8FCDP51-7Kpd0EnJx9IuFICe7l8HjfKtOhDiTJZ1K3jQtKS6FrlywXd8j0zzc'}
              />
              <div className="relative z-10">
                <span className="text-primary font-label text-sm uppercase mb-2 block tracking-widest">
                  Signature
                </span>
                <h3 className="font-headline text-3xl font-bold mb-2 text-white">
                  {mainService.name}
                </h3>
                <p className="text-on-surface-variant max-w-md mb-6">
                  {mainService.description || `${mainService.duration_minutes} Minutes Session`}
                </p>
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-primary font-bold text-xl">{formatRupiah(mainService.price)}</span>
                </div>
                <button 
                  onClick={onOpenServicesModal}
                  className="bg-primary/10 text-primary border border-primary/30 px-6 py-3 rounded-md font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 w-fit"
                >
                  Lihat Semua Layanan
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Side Services */}
          <div className="md:col-span-5 grid grid-rows-2 gap-6">
            {sideServices.map((service, idx) => (
              <div key={service.id} className={`${idx === 0 ? 'bg-surface-container-high' : 'bg-surface-container-highest'} p-8 rounded-lg flex flex-col justify-between border border-outline-variant/10 group relative overflow-hidden`}>
                {idx === 1 && (
                  <div className="absolute right-[-20px] top-[-20px] opacity-10">
                    <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>face</span>
                  </div>
                )}
                <div className="flex justify-between items-start relative z-10">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {idx === 0 ? 'content_cut' : 'spa'}
                  </span>
                  <span className="text-primary font-bold">{formatRupiah(service.price)}</span>
                </div>
                <div className="relative z-10 mt-8">
                  <h3 className="font-headline text-2xl font-bold mb-2">{service.name}</h3>
                  <p className="text-secondary text-sm">
                    {service.description || `${service.duration_minutes} Minutes Session`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
