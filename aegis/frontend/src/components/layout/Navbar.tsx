import { Link, useLocation } from 'react-router-dom';
import { Bell, Shield, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useIncidentStore } from '../../stores/incidentStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const incidents = useIncidentStore((s) => s.incidents);
  const location = useLocation();

  const activeIncidents = incidents.filter((i) => i.status === 'active').length;

  const navLinks = [
    { to: '/', label: 'Incidents' },
    { to: '/training', label: 'Training' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="text-blue-400" size={24} />
        <span className="text-white font-bold text-lg tracking-wide">AEGIS</span>
        <span className="text-gray-500 text-xs">SOC Dashboard</span>
      </div>

      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              location.pathname === link.to
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell size={18} className="text-gray-400" />
          {activeIncidents > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeIncidents > 9 ? '9+' : activeIncidents}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User size={16} />
          <span>{user?.username ?? 'operator'}</span>
          <span className="text-gray-600">|</span>
          <button onClick={logout} className="hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
