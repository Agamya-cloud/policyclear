import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  openAuth: (tab: 'signin' | 'signup') => void;
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/coverage', label: 'Coverage' },
  { to: '/exclusions', label: 'Exclusions' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/compare', label: 'Compare' },
  { to: '/chat', label: 'Chat' },
];

export default function Navbar({ openAuth }: Props) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-[#1A0F0A]/95 backdrop-blur-md border-b border-[#D4AF37]/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-[#1A0F0A]" />
          </div>
          <span className="font-playfair text-xl text-[#F5F1E8] tracking-wide">PolicyClear</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-poppins transition-colors ${
                  location.pathname === link.to
                    ? 'text-[#D4AF37]'
                    : 'text-[#A89070] hover:text-[#F5F1E8]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div
                className="w-9 h-9 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#1A0F0A] font-bold text-sm font-poppins cursor-pointer"
                title={profile?.full_name || user.email}
              >
                {initials}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-[#A89070] hover:text-[#F5F1E8] font-poppins transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth('signin')}
                className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-sm font-poppins hover:bg-[#D4AF37]/10 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="px-4 py-2 bg-[#D4AF37] text-[#1A0F0A] rounded-lg text-sm font-semibold font-poppins hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-[#F5F1E8]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#1A0F0A]/98 border-t border-[#D4AF37]/10 px-6 py-4 space-y-3">
          {user && navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-[#A89070] hover:text-[#F5F1E8] font-poppins text-sm py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#D4AF37]/10 flex gap-3">
            {user ? (
              <button onClick={handleSignOut} className="text-[#A89070] font-poppins text-sm">Sign Out</button>
            ) : (
              <>
                <button onClick={() => { openAuth('signin'); setMobileOpen(false); }} className="text-[#D4AF37] font-poppins text-sm">Sign In</button>
                <button onClick={() => { openAuth('signup'); setMobileOpen(false); }} className="text-[#D4AF37] font-poppins text-sm font-semibold">Sign Up</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
