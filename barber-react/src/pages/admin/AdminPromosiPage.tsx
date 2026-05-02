import React from 'react';

const AdminPromosiPage = () => {
  return (
    <div className="pt-6 p-8 min-h-screen bg-surface">
      {/* Dashboard Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-primary font-body tracking-[0.2em] uppercase text-xs mb-3 block">Promotion Engine</span>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">Promotions &amp; Discounts</h1>
          <p className="text-on-surface-variant text-lg font-body leading-relaxed">
            Craft exclusive offers for your elite clientele. Manage active campaigns and seasonal incentives with artisanal precision.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-center min-w-[140px]">
            <div className="text-primary text-2xl font-bold">12</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Active Deals</div>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-center min-w-[140px]">
            <div className="text-on-surface text-2xl font-bold">24%</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Avg. Conversion</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Creation Form */}
        <aside className="lg:col-span-4">
          <div className="sticky top-8">
            <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-primary">
              <h2 className="text-2xl font-headline font-bold mb-8 text-on-surface">Create New Discount</h2>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Promotion Name</label>
                  <input 
                    className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant transition-all" 
                    placeholder="e.g. Summer Gentlemen's Special" 
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Percentage</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md placeholder:text-outline-variant" 
                        placeholder="20" 
                        type="number"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Expiry Date</label>
                    <input 
                      className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md" 
                      type="date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Eligibility</label>
                  <select className="w-full bg-surface-container-highest border-none focus:ring-1 focus:ring-primary text-on-surface p-4 rounded-md">
                    <option>All Services</option>
                    <option>Beard Grooming Only</option>
                    <option>Haircut &amp; Styling Only</option>
                    <option>Premium Members Only</option>
                  </select>
                </div>
                <button 
                  className="w-full py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm rounded-md hover:brightness-110 active:scale-[0.98] transition-all mt-4" 
                  type="button"
                >
                  Launch Promotion
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Right Column: Grid of Active Promotions */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-on-surface">Active Campaigns</h2>
            <div className="flex gap-2">
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Promotion Card 1 */}
            <div className="bg-surface-container-low group overflow-hidden rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
              <div className="h-32 bg-surface-container-highest relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10"></div>
                <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-20">Running</div>
                <img 
                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="Father & Son" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA19-Wr4FhuIwVk5tNr7sKtaRyB-KTDEu8_DQ1HL1OcLBmskIEOqFsSzMh9z-xCsBy1MOaQfHn7hXhegSnUNnb1btoX-TD349-TIQCMNEyZ7sFVf6lEBfEwRZFoqHZv0lS8gUmX6nBrGWnIhtpqp4g9c9t6OnFAvgmNjCEAIZ7b1MWt8AbbX020-U6vViYT8xex_qszDioEfyESaCWZVIvFrNWcHuO-oZvGfQkny0qbhUwLsySwijEV9mChq9WCNPSMLtsVnNQEO8"
                />
              </div>
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Father &amp; Son Bundle</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">25% Discount</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>Expires Dec 24</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>142 Used</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion Card 2 */}
            <div className="bg-surface-container-low group overflow-hidden rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
              <div className="h-32 bg-surface-container-highest relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10"></div>
                <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-20">Running</div>
                <img 
                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="First-Time Groom" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZLDMiLJfsoZPFnWJGCFzGsbjrQSzkcVbt9REE6HFgPALCre5cbRcyWUhwb2kDSG-a9cGY2DGmnLM5Ei_lD5dC-T4k_GUVQo1t-SUrpFpJdEdilX7oiyCMTG5F3dnB8WnYqbP1Lcug5tLcq5Wn8XiRCBVFT0j3peUrGPR3xyNSyjRih3WQXnO04N48TNeBVFGL_rVusYtB8gkKUfYQiI9UIlW6D7B2kOtlnvL1iuVLYCiOMQ3v5GDl6est4n0FnRvr_ZnxW1aB9Vc"
                />
              </div>
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">First-Time Groom</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">15% Discount</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>Permanent</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>892 Used</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion Card 3 */}
            <div className="bg-surface-container-low group overflow-hidden rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
              <div className="h-32 bg-surface-container-highest relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10"></div>
                <div className="absolute top-4 right-4 bg-zinc-500/20 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-20">Paused</div>
                <img 
                  className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-40 transition-all duration-700" 
                  alt="Seasonal Beard Care" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfUrCOX8PmCfgzKdN43kLdMHfpaRf2I-FxBCDWj_vcbQABCV2Oah7gL5cvSI_CNoXFMU6eMtZ8gNxLbV0Wo9JMIGcymTDEC3oXCS79lB_B22_7Fhi4Yh-GqaCUqQPtIHMLz3aPzoYTNW57RsOF6LlOwIXuJLbNv6m_ZGEm5U32CSH4DKezRmpO7oMcrKXPNe5vos3qMO-8NJWsqRUgwA4THfQt9bTgySe-Z1PLnEUaJkslSeUfiljgN4vk3C8CD3KYXT-S2LWhcvg"
                />
              </div>
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface-variant">Seasonal Beard Care</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">10% Discount</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>Expired Nov 01</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>56 Used</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State / Add New Card */}
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/40 transition-all min-h-[250px]">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">add</span>
              </div>
              <h3 className="text-on-surface font-body font-semibold">New Promotion</h3>
              <p className="text-on-surface-variant text-xs mt-2">Create a custom campaign</p>
            </div>
          </div>

          {/* Recent Activity Table (Bento Style) */}
          <div className="mt-12 bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Recent Redemptions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-highest hover:bg-surface-container-high rounded-lg transition-colors border-l-2 border-primary">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-primary">JD</div>
                  <div>
                    <div className="text-on-surface font-semibold">Jameson D.</div>
                    <div className="text-xs text-on-surface-variant">Applied 'Father &amp; Son Bundle'</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold">-$15.00</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">2 mins ago</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-container-highest hover:bg-surface-container-high rounded-lg transition-colors border-l-2 border-transparent hover:border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-secondary">MR</div>
                  <div>
                    <div className="text-on-surface font-semibold">Marcus R.</div>
                    <div className="text-xs text-on-surface-variant">Applied 'First-Time Groom'</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold">-$8.25</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">15 mins ago</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPromosiPage;
