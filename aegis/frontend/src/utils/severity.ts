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
    color: '#3d7055',
    bg: '#060f0a',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-950',
    borderColor: 'border-emerald-900',
    glowClass: 'glow-green',
    stripClass: 'severity-strip-1',
    icon: '●',
  },
  2: {
    level: 2,
    name: 'Low',
    color: '#7faa5e',
    bg: '#0c1809',
    textColor: 'text-green-500',
    bgColor: 'bg-green-950',
    borderColor: 'border-green-900',
    glowClass: '',
    stripClass: 'severity-strip-2',
    icon: '▲',
  },
  3: {
    level: 3,
    name: 'Moderate',
    color: '#d4891a',
    bg: '#1e1408',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-950',
    borderColor: 'border-amber-800',
    glowClass: 'glow-amber',
    stripClass: 'severity-strip-3',
    icon: '◆',
  },
  4: {
    level: 4,
    name: 'High',
    color: '#c94a18',
    bg: '#1c0d06',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-950',
    borderColor: 'border-orange-800',
    glowClass: '',
    stripClass: 'severity-strip-4',
    icon: '⬛',
  },
  5: {
    level: 5,
    name: 'Critical',
    color: '#cc3c3c',
    bg: '#1c0808',
    textColor: 'text-red-500',
    bgColor: 'bg-red-950',
    borderColor: 'border-red-900',
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
