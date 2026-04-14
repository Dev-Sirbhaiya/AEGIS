export interface SeverityConfig {
  level: number;
  name: string;
  color: string;
  bg: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const SEVERITY_CONFIG: Record<number, SeverityConfig> = {
  1: {
    level: 1,
    name: 'Minimal',
    color: '#16A34A',
    bg: '#DCFCE7',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    icon: '●',
  },
  2: {
    level: 2,
    name: 'Low',
    color: '#65A30D',
    bg: '#ECFCCB',
    textColor: 'text-lime-700',
    bgColor: 'bg-lime-100',
    borderColor: 'border-lime-400',
    icon: '▲',
  },
  3: {
    level: 3,
    name: 'Moderate',
    color: '#D97706',
    bg: '#FEF3C7',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
    icon: '◆',
  },
  4: {
    level: 4,
    name: 'High',
    color: '#EA580C',
    bg: '#FFEDD5',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    icon: '⬛',
  },
  5: {
    level: 5,
    name: 'Critical',
    color: '#DC2626',
    bg: '#FEE2E2',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    icon: '⬟',
  },
};

export function getSeverityConfig(level: number): SeverityConfig {
  return SEVERITY_CONFIG[Math.max(1, Math.min(5, level))];
}

export function getSeverityColor(level: number): string {
  return getSeverityConfig(level).color;
}
