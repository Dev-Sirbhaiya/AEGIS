import { formatDistanceToNow, format, formatDuration, intervalToDuration } from 'date-fns';

export function formatTimestamp(iso: string): string {
  try {
    return format(new Date(iso), 'HH:mm:ss dd/MM/yyyy');
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatDurationSeconds(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDuration(duration, { format: ['minutes', 'seconds'] }) || '0 seconds';
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatUrgency(score: number): string {
  if (score >= 0.9) return 'CRITICAL';
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MODERATE';
  return 'LOW';
}
