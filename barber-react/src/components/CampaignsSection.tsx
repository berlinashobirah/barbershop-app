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
  discount_unit?: 'fixed' | 'percentage';
  min_transaction?: string | number;
  is_new_member_only?: boolean;
  service?: { id: number, name: string };
}

interface CampaignsSectionProps {
  campaigns: Campaign[];
}

const CampaignsSection = ({ campaigns }: CampaignsSectionProps) => {
  if (campaigns.length === 0) return null;

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getFormattedDiscount = (c: Campaign) => {
    if (c.discount_unit === 'percentage') {
      return `${Number(c.discount_amount)}%`;
    }
    return formatRupiah(c.discount_amount);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Special Offers</span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Promo & Discounts</h2>
          <p className="text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            Get various attractive offers exclusively for loyal members of The Modern Artisan. Join now to enjoy discounts and collect points every time you visit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((camp) => (
            <div key={camp.id} className="group rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
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
                <div className="absolute top-4 right-4 bg-primary text-on-primary font-bold px-3 py-1 rounded-full text-sm shadow-lg z-10">
                  Diskon {getFormattedDiscount(camp)}
                </div>
                {camp.is_new_member_only && (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase shadow-lg z-10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">stars</span> New Member
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="font-headline text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{camp.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                  {camp.description}
                </p>
                
                {/* Subtext Terms & Conditions */}
                {(Number(camp.min_transaction) > 0 || camp.discount_type === 'points_based') && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Number(camp.min_transaction) > 0 && (
                      <div className="text-[10px] bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 px-2 py-1 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">shopping_basket</span>
                        Minimal: {formatRupiah(camp.min_transaction!)}
                      </div>
                    )}
                    {camp.discount_type === 'points_based' && (
                      <div className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">toll</span>
                        {camp.required_points} Poin
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div className="text-xs font-bold text-primary tracking-wider uppercase truncate max-w-[70%]" title={camp.discount_type === 'specific_service' ? camp.service?.name : undefined}>
                    {camp.discount_type === 'specific_service' 
                      ? `Service: ${camp.service?.name || 'Tertentu'}` 
                      : camp.discount_type === 'points_based' ? 'Redeem Points' : 'All Services'}
                  </div>
                  <Link to="/login" className="text-on-surface hover:text-primary text-sm font-bold flex items-center gap-1 transition-colors">
                    Claim <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/register" className="inline-block bg-primary text-on-primary px-8 py-4 rounded-lg font-bold tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,40,0.3)]">
            Register as Member Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
