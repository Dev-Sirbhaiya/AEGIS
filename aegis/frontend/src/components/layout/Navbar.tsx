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
    <nav className="glass-panel rounded-none border-x-0 border-t-0 px-4 py-2 flex items-center justify-between shrink-0" style={{borderBottom:'1px solid rgba(232,160,32,0.18)'}}>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="text-aegis-cyan animate-pulse" size={22} style={{animationDuration:'3s'}} />
        </div>
        <span className="font-bold text-lg tracking-widest text-gradient-cyan font-mono">AEGIS</span>
        <span className="text-gray-500 text-xs font-mono hidden sm:block">SOC DASHBOARD</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 font-mono text-xs tracking-wider ${
              location.pathname === link.to
                ? 'text-aegis-cyan border-b-2 border-aegis-cyan bg-aegis-cyan/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {link.label.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <User size={14} />
          <span>{user?.username ?? 'operator'}</span>
          <span className="text-gray-700">|</span>
          <button onClick={logout} className="hover:text-aegis-cyan transition-colors">
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
}
