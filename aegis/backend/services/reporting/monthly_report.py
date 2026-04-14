"""Monthly security intelligence report generator."""
import json
import re
from typing import List, Dict
from services.intelligence.prompts import MONTHLY_REPORT_PROMPT


async def generate_monthly_report(
    report_month: str,  # YYYY-MM
    incidents: List[Dict],
    llm=None,
) -> Dict:
    """Generate a monthly security intelligence report."""
    total = len(incidents)
    by_severity: Dict[str, int] = {}
    by_terminal: Dict[str, int] = {}
    by_type: Dict[str, int] = {}
    response_times = []

    for i in incidents:
        lvl = str(i.get("severity_level", 1))
        by_severity[lvl] = by_severity.get(lvl, 0) + 1

        terminal = i.get("terminal", "Unknown")
        by_terminal[terminal] = by_terminal.get(terminal, 0) + 1

        rt = i.get("response_time_seconds")
        if rt:
            response_times.append(rt)

    avg_response = sum(response_times) / len(response_times) if response_times else 0

    incidents_summary = json.dumps({
        "total": total,
        "sample": [
            {"id": i.get("id"), "severity": i.get("severity_level"), "location": i.get("location_id")}
            for i in incidents[:10]
        ],
    })

    statistics = json.dumps({
        "total_incidents": total,
        "by_severity": by_severity,
        "by_terminal": by_terminal,
        "avg_response_time_seconds": round(avg_response),
    })

    trend_data = json.dumps({
        "month": report_month,
        "high_severity_count": sum(1 for i in incidents if i.get("severity_level", 0) >= 4),
        "locations_hotspots": _get_hotspots(incidents, top_n=3),
    })

    if llm:
        try:
            prompt = MONTHLY_REPORT_PROMPT.format(
                report_month=report_month,
                incidents_summary=incidents_summary,
                statistics=statistics,
                trend_data=trend_data,
            )
            response = await llm.chat(
                system_prompt="You are AEGIS generating a monthly security report. Respond with valid JSON only.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2500,
            )
            response = re.sub(r"```(?:json)?", "", response).strip()
            report = json.loads(response)
            report["month"] = report_month
            return report
        except Exception as e:
            print(f"LLM monthly report failed: {e}")

    return {
        "month": report_month,
        "executive_summary": f"Monthly security intelligence report for {report_month}. {total} total incidents recorded.",
        "threat_landscape": {
            "primary_threats": [],
            "emerging_concerns": [],
            "threat_level_assessment": "Normal operational security posture",
        },
        "incident_analysis": {
            "total_incidents": total,
            "by_severity": by_severity,
            "by_terminal": by_terminal,
            "by_type": by_type,
            "avg_response_time_seconds": round(avg_response),
        },
        "hotspot_analysis": _get_hotspots(incidents, top_n=3),
        "strategic_recommendations": [],
    }


def _get_hotspots(incidents: List[Dict], top_n: int = 3) -> List[Dict]:
    """Return the top N locations by incident count."""
    counts: Dict[str, int] = {}
    for i in incidents:
        loc = i.get("location_id", "Unknown")
        counts[loc] = counts.get(loc, 0) + 1

    sorted_locs = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [{"location": loc, "incident_count": cnt, "dominant_types": [], "recommendation": "Review security posture"} for loc, cnt in sorted_locs]
