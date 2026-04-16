import { getSeverityConfig } from '../../utils/severity';

interface Props {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SeverityBadge({ level, showLabel = true, size = 'md' }: Props) {
  const config = getSeverityConfig(level);
  const sizeClass =
    size === 'sm'
      ? 'text-xs px-1.5 py-0.5'
      : size === 'lg'
      ? 'text-sm px-3 py-1'
      : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold border ${sizeClass} ${config.textColor} ${config.bgColor} ${config.borderColor} ${config.glowClass}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>L{level} {config.name}</span>}
    </span>
  );
}
