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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-1">AEGIS</div>
          <div className="text-gray-400 text-sm">Security Operations Centre</div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-sm transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [tab, setTab] = useState<'daily' | 'monthly' | 'predictive'>('daily');

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-6 pt-4 border-b border-gray-700 pb-0">
        {(['daily', 'monthly', 'predictive'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t === 'predictive' ? 'Predictive Map' : `${t.charAt(0).toUpperCase() + t.slice(1)} Report`}
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
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
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
