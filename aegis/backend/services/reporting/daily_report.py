"""Daily security report generator."""
import json
from datetime import datetime, date
from typing import List, Dict, Optional
from services.intelligence.prompts import DAILY_REPORT_PROMPT


async def generate_daily_report(
    report_date: date,
    incidents: List[Dict],
    llm=None,
) -> Dict:
    """Generate a daily security intelligence report."""
    total = len(incidents)
    resolved = sum(1 for i in incidents if i.get("status") == "resolved")
    by_severity = {}
    for i in incidents:
        lvl = str(i.get("severity_level", 1))
        by_severity[lvl] = by_severity.get(lvl, 0) + 1

    response_times = [i.get("response_time_seconds") for i in incidents if i.get("response_time_seconds")]
    avg_response = sum(response_times) / len(response_times) if response_times else 0

    incidents_summary = json.dumps([
        {
            "id": i.get("id"),
            "severity": i.get("severity_level"),
            "location": i.get("location_id"),
            "status": i.get("status"),
            "terminal": i.get("terminal"),
            "modalities": [k for k in ["video", "audio", "sensor", "log"] if i.get(f"has_{k}")],
        }
        for i in incidents[:20]  # limit for prompt size
    ], indent=2)

    statistics = json.dumps({
        "total_incidents": total,
        "resolved": resolved,
        "by_severity": by_severity,
        "avg_response_time_seconds": round(avg_response),
    })

    if llm:
        try:
            prompt = DAILY_REPORT_PROMPT.format(
                report_date=str(report_date),
                incidents_summary=incidents_summary,
                statistics=statistics,
            )
            response = await llm.chat(
                system_prompt="You are AEGIS generating a security report. Respond with valid JSON only.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000,
            )
            import re
            response = re.sub(r"```(?:json)?", "", response).strip()
            report = json.loads(response)
            report["date"] = str(report_date)
            return report
        except Exception as e:
            print(f"LLM daily report failed: {e}")

    # Fallback: structured report without LLM
    return {
        "date": str(report_date),
        "executive_summary": f"Security report for {report_date}. {total} incidents recorded, {resolved} resolved.",
        "key_incidents": [],
        "patterns_observed": [],
        "areas_of_concern": [],
        "positive_outcomes": [],
        "tomorrow_watchpoints": [],
        "metrics": {
            "total_incidents": total,
            "by_severity": by_severity,
            "avg_response_time_seconds": round(avg_response),
            "resolved_count": resolved,
        },
    }
