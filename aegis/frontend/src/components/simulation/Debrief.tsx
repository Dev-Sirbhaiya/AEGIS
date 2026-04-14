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
      return <p className="text-gray-300 text-sm whitespace-pre-wrap">{debrief}</p>;
    }
  } else {
    data = debrief;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
      <div>
        <h2 className="text-white text-lg font-bold mb-1">Debrief</h2>
        {data.readiness_level && (
          <span className="text-xs text-blue-400 font-semibold bg-blue-900/30 border border-blue-700 px-2 py-0.5 rounded">
            {data.readiness_level}
          </span>
        )}
        {data.overall_assessment && (
          <p className="text-gray-300 text-sm mt-2">{data.overall_assessment}</p>
        )}
      </div>

      {data.what_went_well && data.what_went_well.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-green-400 text-sm font-semibold mb-2">
            <CheckCircle size={14} /> What Went Well
          </h3>
          <ul className="space-y-1">
            {data.what_went_well.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.areas_for_improvement && data.areas_for_improvement.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-yellow-400 text-sm font-semibold mb-2">
            <AlertTriangle size={14} /> Areas for Improvement
          </h3>
          <div className="space-y-2">
            {data.areas_for_improvement.map((item, i) => (
              <div key={i} className="bg-yellow-900/10 border border-yellow-800/40 rounded p-3">
                <p className="text-gray-300 text-sm font-medium">{item.issue}</p>
                <p className="text-yellow-300 text-xs mt-1">→ {item.correct_action}</p>
                {item.reference && (
                  <p className="text-gray-500 text-xs mt-1">Ref: {item.reference}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.key_learnings && data.key_learnings.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold mb-2">
            <BookOpen size={14} /> Key Learnings
          </h3>
          <ul className="space-y-1">
            {data.key_learnings.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
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
