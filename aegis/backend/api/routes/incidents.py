"""Incident management endpoints."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from models.incident import Incident

router = APIRouter()


@router.get("/")
async def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[int] = Query(None),
    terminal: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List incidents with optional filters, sorted by severity descending."""
    query = select(Incident)
    if status:
        query = query.where(Incident.status == status)
    if severity:
        query = query.where(Incident.severity_level == severity)
    if terminal:
        query = query.where(Incident.terminal == terminal)
    query = query.order_by(Incident.severity_level.desc(), Incident.created_at.desc())
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    incidents = result.scalars().all()
    return {"incidents": [i.to_dict() for i in incidents], "total": len(incidents)}


@router.get("/{incident_id}")
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Get incident details with all events."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident.to_dict()


@router.patch("/{incident_id}")
async def update_incident(
    incident_id: str,
    update: dict,
    db: AsyncSession = Depends(get_db),
):
    """Update incident status, notes, or actions taken."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if "status" in update:
        incident.status = update["status"]
        if update["status"] == "resolved":
            incident.resolved_at = datetime.utcnow()
            if incident.created_at:
                incident.response_time_seconds = int(
                    (incident.resolved_at - incident.created_at).total_seconds()
                )
    if "resolution_notes" in update:
        incident.resolution_notes = update["resolution_notes"]
    if "actions_taken" in update:
        incident.actions_taken = update["actions_taken"]
    if "resolved_by" in update:
        incident.resolved_by = update["resolved_by"]

    incident.updated_at = datetime.utcnow()
    return incident.to_dict()


@router.post("/{incident_id}/transfer")
async def transfer_incident(
    incident_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
):
    """Transfer incident ownership to another user."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    target_user = body.get("target_user_id")
    if not target_user:
        raise HTTPException(status_code=400, detail="target_user_id required")

    incident.resolved_by = target_user
    incident.updated_at = datetime.utcnow()
    return {"status": "transferred", "incident_id": incident_id, "transferred_to": target_user}
