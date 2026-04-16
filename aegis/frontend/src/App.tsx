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
      <div className="glass-panel p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold tracking-[0.18em] text-gradient-cyan mb-1">AEGIS</div>
          <div className="section-eyebrow">Adaptive Security Intelligence</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="app-input w-full text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="app-input w-full text-sm"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="button-primary w-full py-2.5 text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 border-t border-aegis-border" />
          <span className="section-eyebrow">Or</span>
          <div className="flex-1 border-t border-aegis-border" />
        </div>

        <button
          onClick={handleDemoMode}
          className="button-secondary mt-3 w-full py-2 text-sm"
        >
          Enter Demo Mode
        </button>

        <div className="mt-6 text-center text-xs text-slate-500">
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
      <div className="flex gap-1 px-6 pt-4 border-b border-slate-200 pb-0">
        {(['daily', 'monthly', 'predictive'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              tab === t
                ? 'border-aegis-cyan text-aegis-cyan'
                : 'border-transparent text-slate-500 hover:text-slate-800'
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <main className="flex-1 min-h-0">
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
