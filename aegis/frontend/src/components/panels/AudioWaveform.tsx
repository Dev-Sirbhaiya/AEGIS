import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

const MOCK_LABELS = [
  { label: 'Normal ambient', score: 0.72 },
  { label: 'Crowd noise', score: 0.18 },
  { label: 'PA announcement', score: 0.10 },
];

export default function AudioWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [labels] = useState(MOCK_LABELS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let frame = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x + frame) * 0.05;
        const amp = Math.sin(t) * 0.4 + Math.sin(t * 2.3) * 0.2 + Math.sin(t * 0.7) * 0.1;
        const y = height / 2 + amp * (height * 0.35);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame += 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="bg-gray-900 rounded border border-gray-700">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 text-sm text-gray-300">
        <Volume2 size={14} />
        <span>Audio Analysis</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-16" width={400} height={64} />

      <div className="px-3 py-2 flex flex-wrap gap-2">
        {labels.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-1.5 rounded-full bg-blue-500"
              style={{ width: `${Math.round(l.score * 60)}px` }}
            />
            <span className="text-gray-400">{l.label}</span>
            <span className="text-gray-600">{Math.round(l.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
