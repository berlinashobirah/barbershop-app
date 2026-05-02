import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // Baca state dari localStorage secara reaktif
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<{ name: string } | null>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });

  // Sinkronisasi setiap kali ada perubahan (login/logout dari tab lain atau halaman ini)
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem('auth_token'));
      const s = localStorage.getItem('user');
      setUser(s ? JSON.parse(s) : null);
    };

    // 'auth-change' dikirim secara manual dari halaman Login setelah berhasil login
    window.addEventListener('auth-change', syncAuth);
    // 'storage' mendeteksi perubahan dari tab lain
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (window.location.pathname !== '/') {
        navigate(`/#${id}`);
      }
    }
  };

  const isHome = window.location.pathname === '/';

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-widest text-[#C5A028] uppercase font-headline">
          The Modern Artisan
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          <a
            href={isHome ? '#' : '/'}
            onClick={isHome ? (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined}
            className="text-neutral-400 font-medium hover:text-[#C5A028] transition-all duration-300 font-serif tracking-tight text-lg"
          >
            Beranda
          </a>
          <a
            href="#services"
            onClick={(e) => handleScroll(e, 'services')}
            className="text-neutral-400 font-medium hover:text-[#C5A028] transition-all duration-300 font-serif tracking-tight text-lg"
          >
            Layanan
          </a>
          <a
            href="#booking"
            onClick={(e) => handleScroll(e, 'booking')}
            className="text-neutral-400 font-medium hover:text-[#C5A028] transition-all duration-300 font-serif tracking-tight text-lg"
          >
            Pesan Sesi
          </a>
          <a
            href="#barbers"
            onClick={(e) => handleScroll(e, 'barbers')}
            className="text-neutral-400 font-medium hover:text-[#C5A028] transition-all duration-300 font-serif tracking-tight text-lg"
          >
            Kapster
          </a>
        </div>

        {/* CTA Button / User Profile */}
        {!token ? (
          <Link
            to="/login"
            className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold tracking-wide uppercase transition-transform scale-95 hover:scale-100 active:opacity-80"
          >
            Masuk
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-[#C5A028] font-bold text-sm hidden md:block">
              Halo, {user?.name?.split(' ')[0] ?? 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="border border-primary-container text-primary-container px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-primary-container/10 transition-all active:scale-95"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
