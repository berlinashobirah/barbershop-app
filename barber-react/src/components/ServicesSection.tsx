const ServicesSection = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-8">
        {/* Section Header */}
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

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:min-h-[600px]">
          {/* Main Service: Haircut */}
          <div className="md:col-span-7 bg-surface-container-low relative group overflow-hidden rounded-lg flex flex-col justify-end p-8 border border-outline-variant/10 min-h-[400px] md:min-h-0">
            <img
              alt="Potong Rambut Artisan"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              data-alt="close-up of a professional barber carefully styling a man's hair with a comb and scissors, high contrast lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB8RO3g5-q8_nb8IGDbs_2_t6l0WPdX4IwRW0Z57iTFdBAp-lVVdMyAS_vN9YUZ_huOXGWqf_lZdFs03bKzMGwrOrQ_20nFHQujw5gS_oEFDzdzIX7dM0ypwUjK1CNPefwat_7w8Secn5Sm5nQBZpUkRxQ4qRxJ1BUKfmgLa3Lr3Yuk8u_Rp1iYXd-gjpZwqfqCt9BcOf_I4So6a8FCDP51-7Kpd0EnJx9IuFICe7l8HjfKtOhDiTJZ1K3jQtKS6FrlywXd8j0zzc"
            />
            <div className="relative z-10">
              <span className="text-primary font-label text-sm uppercase mb-2 block tracking-widest">
                Signature
              </span>
              <h3 className="font-headline text-3xl font-bold mb-2 text-white">Potong Rambut</h3>
              <p className="text-on-surface-variant max-w-md mb-6">
                Konsultasi gaya, cuci rambut premium, dan potongan presisi sesuai bentuk wajah.
              </p>
              <span className="text-primary font-bold text-xl">IDR 150.000</span>
            </div>
          </div>

          {/* Side Services */}
          <div className="md:col-span-5 grid grid-rows-2 gap-6">
            {/* Cukur Jenggot */}
            <div className="bg-surface-container-high p-8 rounded-lg flex flex-col justify-between border border-outline-variant/10 group">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl text-primary">content_cut</span>
                <span className="text-primary font-bold">IDR 85.000</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold mb-2">Cukur Jenggot</h3>
                <p className="text-secondary text-sm">
                  Hot towel shave dengan krim artisan untuk hasil halus tanpa iritasi.
                </p>
              </div>
            </div>

            {/* Treatment Wajah */}
            <div className="bg-surface-container-highest p-8 rounded-lg flex flex-col justify-between border border-outline-variant/10 group relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <span
                  className="material-symbols-outlined text-[120px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  face
                </span>
              </div>
              <div className="flex justify-between items-start relative z-10">
                <span className="material-symbols-outlined text-4xl text-primary">spa</span>
                <span className="text-primary font-bold">IDR 120.000</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline text-2xl font-bold mb-2">Treatment Wajah</h3>
                <p className="text-secondary text-sm">
                  Detoksifikasi kulit dan pijat relaksasi untuk tampilan segar maksimal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
