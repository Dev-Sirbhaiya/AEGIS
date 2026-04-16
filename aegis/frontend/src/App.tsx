import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/layout/Navbar';
import StatusBar from './components/layout/StatusBar';
import Dashboard from './components/layout/Dashboard';
import SimDashboard from './components/simulation/SimDashboard';
import DailyReport from './components/reports/DailyReport';
import MonthlyReport from './components/reports/MonthlyReport';
import PredictiveMap from './components/reports/PredictiveMap';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Already logged in — skip the login screen
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await useAuthStore.getState().login(username, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const isNetwork = err && typeof err === 'object' && 'code' in err && (err as {code: string}).code === 'ERR_NETWORK';
      setError(isNetwork ? 'Backend offline — use Demo Mode below' : 'Invalid credentials');
    }
  };

  const handleDemoMode = () => {
    localStorage.setItem('aegis_token', 'demo');
    useAuthStore.setState({ token: 'demo', isAuthenticated: true });
    navigate('/', { replace: true });
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

      <div className="glass-panel p-8 w-full max-w-sm relative z-10" style={{ boxShadow: '0 0 40px rgba(232,160,32,0.08)' }}>
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
            className="w-full py-2.5 font-mono font-bold text-sm rounded tracking-widest transition-all duration-200 text-aegis-cyan border border-aegis-cyan/40 bg-aegis-cyan/10 hover:bg-aegis-cyan/20 hover:border-aegis-cyan/70 hover:shadow-[0_0_16px_rgba(232,160,32,0.35)]"
          >
            AUTHENTICATE
          </button>
        </form>

        <div className="mt-3 relative">
          <div className="absolute inset-x-0 top-1/2 border-t border-white/5" />
          <div className="relative flex justify-center">
            <span className="px-2 text-[10px] font-mono text-gray-700" style={{ background: 'var(--bg-panel)' }}>OR</span>
          </div>
        </div>

        <button
          onClick={handleDemoMode}
          className="mt-3 w-full py-2 font-mono font-bold text-xs rounded tracking-widest transition-all duration-200 text-amber-400/80 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40"
        >
          ENTER DEMO MODE
        </button>

        <div className="mt-5 text-center text-[10px] font-mono text-gray-700">
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
          <PrivateRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/training"
        element={
          <PrivateRoute>
            <AppShell>
              <div className="h-full overflow-y-auto">
                <SimDashboard />
              </div>
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <AppShell>
              <ReportsPage />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
