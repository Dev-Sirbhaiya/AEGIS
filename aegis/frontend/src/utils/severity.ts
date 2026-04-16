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
    color: '#16a34a',
    bg: '#f0fdf4',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    glowClass: '',
    stripClass: 'severity-strip-1',
    icon: '●',
  },
  2: {
    level: 2,
    name: 'Low',
    color: '#22c55e',
    bg: '#f0fdf4',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    glowClass: '',
    stripClass: 'severity-strip-2',
    icon: '▲',
  },
  3: {
    level: 3,
    name: 'Moderate',
    color: '#d97706',
    bg: '#fffbeb',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    glowClass: '',
    stripClass: 'severity-strip-3',
    icon: '◆',
  },
  4: {
    level: 4,
    name: 'High',
    color: '#ea580c',
    bg: '#fff7ed',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    glowClass: '',
    stripClass: 'severity-strip-4',
    icon: '⬛',
  },
  5: {
    level: 5,
    name: 'Critical',
    color: '#dc2626',
    bg: '#fef2f2',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
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
