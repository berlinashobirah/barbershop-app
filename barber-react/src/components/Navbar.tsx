const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-md flex justify-between items-center px-8 h-20">
      {/* Logo */}
      <div className="text-2xl font-['Noto_Serif'] italic text-[#eac249]">
        The Modern Artisan
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 items-center">
        <a
          href="#"
          className="font-['Noto_Serif'] font-bold tracking-tight text-[#eac249] border-b-2 border-[#eac249] pb-1 transition-colors duration-300"
        >
          Beranda
        </a>
        <a
          href="#"
          className="font-['Noto_Serif'] font-bold tracking-tight text-[#c8c6c5] hover:text-[#eac249] transition-colors duration-300"
        >
          Layanan
        </a>
        <a
          href="#"
          className="font-['Noto_Serif'] font-bold tracking-tight text-[#c8c6c5] hover:text-[#eac249] transition-colors duration-300"
        >
          Pesan Sesi
        </a>
        <a
          href="#"
          className="font-['Noto_Serif'] font-bold tracking-tight text-[#c8c6c5] hover:text-[#eac249] transition-colors duration-300"
        >
          Antrean
        </a>
      </div>

      {/* CTA Button */}
      <button className="bg-primary text-on-primary px-6 py-2 font-bold rounded-md hover:opacity-80 transition-all active:scale-95">
        Masuk
      </button>
    </nav>
  )
}

export default Navbar
