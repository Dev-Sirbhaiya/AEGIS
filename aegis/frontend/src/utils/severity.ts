export interface SeverityConfig {
  level: number;
  name: string;
  color: string;
  bg: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowClass: string;
  stripClass: string;
  icon: string;
}

export const SEVERITY_CONFIG: Record<number, SeverityConfig> = {
  1: {
    level: 1,
    name: 'Minimal',
    color: '#10b981',
    bg: '#022c22',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950',
    borderColor: 'border-emerald-800',
    glowClass: 'glow-green',
    stripClass: 'severity-strip-1',
    icon: '●',
  },
  2: {
    level: 2,
    name: 'Low',
    color: '#84cc16',
    bg: '#1a2e05',
    textColor: 'text-lime-400',
    bgColor: 'bg-lime-950',
    borderColor: 'border-lime-800',
    glowClass: '',
    stripClass: 'severity-strip-2',
    icon: '▲',
  },
  3: {
    level: 3,
    name: 'Moderate',
    color: '#f59e0b',
    bg: '#2d1f02',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950',
    borderColor: 'border-amber-700',
    glowClass: 'glow-amber',
    stripClass: 'severity-strip-3',
    icon: '◆',
  },
  4: {
    level: 4,
    name: 'High',
    color: '#f97316',
    bg: '#2a1404',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-950',
    borderColor: 'border-orange-700',
    glowClass: '',
    stripClass: 'severity-strip-4',
    icon: '⬛',
  },
  5: {
    level: 5,
    name: 'Critical',
    color: '#ef4444',
    bg: '#2d0606',
    textColor: 'text-red-400',
    bgColor: 'bg-red-950',
    borderColor: 'border-red-700',
    glowClass: 'glow-red',
    stripClass: 'severity-strip-5',
    icon: '⬟',
  },
};

export function getSeverityConfig(level: number): SeverityConfig {
  return SEVERITY_CONFIG[Math.max(1, Math.min(5, level))];
}

export function getSeverityColor(level: number): string {
  return getSeverityConfig(level).color;
}
