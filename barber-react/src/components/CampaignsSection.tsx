import { Link } from 'react-router-dom';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string | null;
  discount_type: string;
  service_id: number | null;
  required_points: number;
  discount_amount: string | number;
}

interface CampaignsSectionProps {
  campaigns: Campaign[];
}

const CampaignsSection = ({ campaigns }: CampaignsSectionProps) => {
  if (campaigns.length === 0) return null;

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Penawaran Spesial</span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Promo & Diskon</h2>
          <p className="text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            Dapatkan berbagai penawaran menarik khusus untuk member setia The Modern Artisan. Bergabunglah sekarang untuk menikmati potongan harga dan kumpulkan poin setiap kali Anda berkunjung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((camp) => (
            <div key={camp.id} className="group rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 hover:border-primary/50 transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                {camp.image ? (
                  <img 
                    src={getImageUrl(camp.image)} 
                    alt={camp.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-6xl text-primary/30">loyalty</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-primary text-on-primary font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                  Diskon {formatRupiah(camp.discount_amount)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{camp.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                  {camp.description}
                </p>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div className="text-xs font-bold text-primary tracking-wider uppercase">
                    {camp.discount_type === 'points_based' ? `Tukar ${camp.required_points} Poin` : camp.discount_type === 'new_haircut' ? 'Layanan Baru' : 'Semua Layanan'}
                  </div>
                  <Link to="/login" className="text-on-surface hover:text-primary text-sm font-bold flex items-center gap-1 transition-colors">
                    Klaim <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/register" className="inline-block bg-primary text-on-primary px-8 py-4 rounded-lg font-bold tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,40,0.3)]">
            Daftar Member Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
