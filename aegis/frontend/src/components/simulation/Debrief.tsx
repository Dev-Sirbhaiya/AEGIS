import { CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface DebriefData {
  overall_assessment?: string;
  what_went_well?: string[];
  areas_for_improvement?: Array<{ issue: string; correct_action: string; reference?: string }>;
  key_learnings?: string[];
  recommended_training?: string[];
  readiness_level?: string;
}

interface Props {
  debrief: string | DebriefData;
}

export default function Debrief({ debrief }: Props) {
  let data: DebriefData = {};
  if (typeof debrief === 'string') {
    try {
      data = JSON.parse(debrief);
    } catch {
      return <p className="text-slate-700 text-sm whitespace-pre-wrap">{debrief}</p>;
    }
  } else {
    data = debrief;
  }

  return (
    <div className="glass-panel p-6 space-y-5">
      <div>
        <h2 className="text-slate-900 text-lg font-bold mb-1">Debrief</h2>
        {data.readiness_level && (
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {data.readiness_level}
          </span>
        )}
        {data.overall_assessment && (
          <p className="text-slate-700 text-sm mt-2 leading-6">{data.overall_assessment}</p>
        )}
      </div>

      {data.what_went_well && data.what_went_well.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-green-700 text-sm font-semibold mb-2">
            <CheckCircle size={14} /> What Went Well
          </h3>
          <ul className="space-y-1">
            {data.what_went_well.map((item, i) => (
              <li key={i} className="text-slate-700 text-sm flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.areas_for_improvement && data.areas_for_improvement.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-amber-700 text-sm font-semibold mb-2">
            <AlertTriangle size={14} /> Areas for Improvement
          </h3>
          <div className="space-y-2">
            {data.areas_for_improvement.map((item, i) => (
              <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="text-slate-800 text-sm font-semibold">{item.issue}</p>
                <p className="text-yellow-300 text-xs mt-1">→ {item.correct_action}</p>
                {item.reference && (
                  <p className="text-slate-500 text-xs mt-1">Ref: {item.reference}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.key_learnings && data.key_learnings.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-blue-700 text-sm font-semibold mb-2">
            <BookOpen size={14} /> Key Learnings
          </h3>
          <ul className="space-y-1">
            {data.key_learnings.map((item, i) => (
              <li key={i} className="text-slate-700 text-sm flex gap-2">
                <span className="text-blue-500 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
