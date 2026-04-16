import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import StatusBar from './components/layout/StatusBar';
import Dashboard from './components/layout/Dashboard';
import SimDashboard from './components/simulation/SimDashboard';
import DailyReport from './components/reports/DailyReport';
import MonthlyReport from './components/reports/MonthlyReport';
import PredictiveMap from './components/reports/PredictiveMap';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { useAuthStore } = await import('./stores/authStore');
      await useAuthStore.getState().login(username, password);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[160, 280, 400, 520].map((r) => (
          <div key={r} className="absolute rounded-full border border-aegis-cyan/5"
            style={{ width: r, height: r }} />
        ))}
      </div>

      <div className="glass-panel p-8 w-full max-w-sm relative z-10" style={{ boxShadow: '0 0 40px rgba(0,212,255,0.08)' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-aegis-cyan/10 border border-aegis-cyan/30 flex items-center justify-center">
                <span className="text-aegis-cyan text-2xl">⬡</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-aegis-cyan/20 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-widest font-mono text-gradient-cyan">AEGIS</div>
          <div className="text-gray-500 text-xs mt-1 font-mono tracking-wider">ADAPTIVE SECURITY INTELLIGENCE</div>
          <div className="text-gray-600 text-xs mt-1 italic">"See. Hear. Understand. Respond."</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 text-white border border-white/10 rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-aegis-cyan/60 focus:bg-aegis-cyan/5 transition-all placeholder:text-gray-600"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 text-white border border-white/10 rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-aegis-cyan/60 focus:bg-aegis-cyan/5 transition-all placeholder:text-gray-600"
          />
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 font-mono font-bold text-sm rounded tracking-widest transition-all duration-200 text-aegis-cyan border border-aegis-cyan/40 bg-aegis-cyan/10 hover:bg-aegis-cyan/20 hover:border-aegis-cyan/70 hover:shadow-[0_0_16px_rgba(0,212,255,0.3)]"
          >
            AUTHENTICATE
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] font-mono text-gray-700">
          CERTIS GROUP · CHANGI AIRPORT · SOC-SECURE
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [tab, setTab] = useState<'daily' | 'monthly' | 'predictive'>('daily');

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-6 pt-4 border-b border-white/5 pb-0">
        {(['daily', 'monthly', 'predictive'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono font-medium border-b-2 transition-all tracking-wider ${
              tab === t
                ? 'border-aegis-cyan text-aegis-cyan'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'predictive' ? 'PREDICTIVE' : t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'daily' && <DailyReport />}
        {tab === 'monthly' && <MonthlyReport />}
        {tab === 'predictive' && <PredictiveMap />}
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col text-white overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <main className="flex-1 overflow-hidden min-h-0">
        {children}
      </main>
      <StatusBar />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AppShell>
            <Dashboard />
          </AppShell>
        }
      />
      <Route
        path="/training"
        element={
          <AppShell>
            <div className="h-full overflow-y-auto">
              <SimDashboard />
            </div>
          </AppShell>
        }
      />
      <Route
        path="/reports"
        element={
          <AppShell>
            <ReportsPage />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
