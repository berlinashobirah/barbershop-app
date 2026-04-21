const features = [
  {
    icon: 'verified',
    title: 'Kapster Profesional',
    description:
      'Tim kami adalah seniman rambut bersertifikat dengan dedikasi tinggi pada detail.',
  },
  {
    icon: 'fluid',
    title: 'Suasana Eksklusif',
    description: 'Nikmati interior bertema industrial-klasik yang tenang dan nyaman.',
  },
  {
    icon: 'shopping_basket',
    title: 'Produk Premium',
    description:
      'Kami hanya menggunakan pomade dan skin-care artisan terbaik untuk kesehatan kulit Anda.',
  },
]

const ExperienceSection = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        {/* Image Block */}
        <div className="order-2 md:order-1 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-primary"></div>
          <img
            alt="Barber Tools"
            className="rounded-lg shadow-2xl w-full h-auto"
            data-alt="meticulously organized professional barber tools including straight razors and scissors on a dark marble surface"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPH3Gy-ohN2rpLoV1hATBvRiOSvdcaabvCHhIQbFjrvpSV-S49af0gMipKd_pKVCrBsPcM7t3tKvHSXVhz-cJxpQeCDJQVOSQXRvGGEY6iDEr7SUcqtDTNLXAL4nCyBX1akUOEFAmHpkSY5O-9NeOmuVsmTvbw2r-n9vM9xryyRcrBRM-OfPjPFuTvhUrps-XkyQmcLLH7napAm5f4N-oOhGYMU0GUvRZMtad0YwW1uwJBns0jkdFonctIj3Dqd6ckuu-sNV7rIt0"
          />
          <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-md hidden md:block">
            <p className="text-on-primary font-headline font-bold text-4xl">10+</p>
            <p className="text-on-primary text-xs uppercase tracking-tighter">Tahun Pengalaman</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="order-1 md:order-2">
          <h2 className="font-headline text-4xl font-bold mb-8 leading-tight">
            Mengapa Memilih <br />
            The Modern Artisan?
          </h2>
          <ul className="space-y-8">
            {features.map((feature) => (
              <li key={feature.icon} className="flex gap-4">
                <span className="bg-surface-container-highest p-3 rounded-md h-fit">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {feature.icon}
                  </span>
                </span>
                <div>
                  <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                  <p className="text-secondary text-sm">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
