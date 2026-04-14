"""Reporting endpoints."""
from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from models.incident import Incident as IncidentModel

router = APIRouter()


def get_llm():
    from main import llm_client
    return llm_client


@router.get("/daily/{report_date}")
async def get_daily_report(
    report_date: str,
    db: AsyncSession = Depends(get_db),
    llm=Depends(get_llm),
):
    """Generate or retrieve daily security report."""
    try:
        d = date.fromisoformat(report_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    from sqlalchemy import and_, cast, Date, func
    result = await db.execute(
        select(IncidentModel).where(
            func.date(IncidentModel.created_at) == d
        )
    )
    incidents = result.scalars().all()
    incidents_data = [i.to_dict() for i in incidents]

    from services.reporting.daily_report import generate_daily_report
    report = await generate_daily_report(d, incidents_data, llm=llm)
    return report


@router.get("/monthly/{report_month}")
async def get_monthly_report(
    report_month: str,
    db: AsyncSession = Depends(get_db),
    llm=Depends(get_llm),
):
    """Generate monthly intelligence report."""
    try:
        year, month = report_month.split("-")
        year, month = int(year), int(month)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    from sqlalchemy import extract
    result = await db.execute(
        select(IncidentModel).where(
            extract("year", IncidentModel.created_at) == year,
            extract("month", IncidentModel.created_at) == month,
        )
    )
    incidents = result.scalars().all()
    incidents_data = [i.to_dict() for i in incidents]

    from services.reporting.monthly_report import generate_monthly_report
    report = await generate_monthly_report(report_month, incidents_data, llm=llm)
    return report


@router.post("/generate")
async def trigger_report_generation(
    body: dict,
    db: AsyncSession = Depends(get_db),
    llm=Depends(get_llm),
):
    """Trigger manual report generation."""
    report_type = body.get("type", "daily")
    period = body.get("period", str(date.today()))

    if report_type == "daily":
        d = date.fromisoformat(period)
        from sqlalchemy import func
        result = await db.execute(
            select(IncidentModel).where(func.date(IncidentModel.created_at) == d)
        )
        incidents = [i.to_dict() for i in result.scalars().all()]
        from services.reporting.daily_report import generate_daily_report
        return await generate_daily_report(d, incidents, llm=llm)

    return {"status": "generated", "type": report_type, "period": period}


@router.get("/predictions")
async def get_predictions(db: AsyncSession = Depends(get_db)):
    """Return predictive risk heatmap based on incident history."""
    result = await db.execute(
        select(IncidentModel).order_by(IncidentModel.created_at.desc()).limit(200)
    )
    incidents = [i.to_dict() for i in result.scalars().all()]

    from services.reporting.predictive import predict_risk_heatmap
    predictions = predict_risk_heatmap(incidents)
    return {"predictions": predictions, "based_on": len(incidents)}
