import { Link, useLocation } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Incidents' },
    { to: '/training', label: 'Training' },
    { to: '/reports', label: 'Reports' },
  ];


  return (
    <nav className="glass-panel rounded-none border-x-0 border-t-0 px-4 py-2 flex items-center justify-between shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="text-aegis-cyan animate-pulse" size={22} style={{animationDuration:'3s'}} />
        </div>
        <span className="font-bold text-lg tracking-[0.18em] text-gradient-cyan">AEGIS</span>
        <span className="section-eyebrow hidden sm:block">SOC Dashboard</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              location.pathname === link.to
                ? 'text-aegis-cyan bg-aegis-cyan/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User size={14} />
          <span>{user?.username ?? 'operator'}</span>
          <span className="text-slate-300">|</span>
          <button onClick={logout} className="font-semibold hover:text-aegis-cyan transition-colors">
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
}
