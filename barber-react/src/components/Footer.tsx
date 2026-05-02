const Footer = () => {
  return (
    <footer className="bg-[#131313] w-full py-12 flex flex-col items-center gap-6 border-t border-white/5">
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        <a
          className="font-body text-xs uppercase tracking-widest text-[#c8c6c5] hover:text-white transition-all"
          href="#"
        >
          Tentang Kami
        </a>
        <a
          className="font-body text-xs uppercase tracking-widest text-[#c8c6c5] hover:text-white transition-all"
          href="#"
        >
          Kebijakan Privasi
        </a>
        <a
          className="font-body text-xs uppercase tracking-widest text-[#c8c6c5] hover:text-white transition-all"
          href="#"
        >
          Syarat & Ketentuan
        </a>
        <a
          className="font-body text-xs uppercase tracking-widest text-[#c8c6c5] hover:text-white transition-all"
          href="#"
        >
          Hubungi Kami
        </a>
      </div>
      <div className="flex gap-6 mt-4">
        <a className="text-[#c8c6c5] hover:text-[#eac249] transition-colors" href="#">
          <span className="material-symbols-outlined">public</span>
        </a>
        <a className="text-[#c8c6c5] hover:text-[#eac249] transition-colors" href="#">
          <span className="material-symbols-outlined">share</span>
        </a>
        <a className="text-[#c8c6c5] hover:text-[#eac249] transition-colors" href="#">
          <span className="material-symbols-outlined">alternate_email</span>
        </a>
      </div>
      <p className="font-body text-[10px] uppercase tracking-widest text-[#c8c6c5] text-center px-4">
        © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
      </p>
    </footer>
  );
};

export default Footer;
