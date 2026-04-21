const footerLinks = ['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Hubungi Kami']
const socialIcons = ['public', 'share', 'alternate_email']

const Footer = () => {
  return (
    <footer className="bg-[#131313] w-full py-12 flex flex-col items-center gap-6 border-t border-white/5">
      {/* Nav Links */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {footerLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c8c6c5] hover:text-white transition-all"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Social Icons */}
      <div className="flex gap-6 mt-4">
        {socialIcons.map((icon) => (
          <a
            key={icon}
            href="#"
            className="text-[#c8c6c5] hover:text-[#eac249] transition-colors"
          >
            <span className="material-symbols-outlined">{icon}</span>
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p className="font-['Manrope'] text-[10px] uppercase tracking-widest text-[#c8c6c5] text-center px-4">
        © 2024 The Modern Artisan Barbershop. Presisi dalam setiap potongan.
      </p>
    </footer>
  )
}

export default Footer
