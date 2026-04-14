"""
Seed the database with demo data for AEGIS demonstrations.

Creates:
  - Default admin user (admin / admin)
  - 5 demo incidents with varied severities and modalities
  - 2 demo simulation sessions

Run from backend directory:
    cd aegis/backend && python ../scripts/seed_db.py
"""
import sys
import os
import asyncio
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/backend")

from config.settings import settings
from db.session import init_db, async_session
from models.user import User
from models.incident import Incident
from models.event import Event


DEMO_INCIDENTS = [
    {
        "severity_level": 5,
        "severity_score": 0.94,
        "confidence": "HIGH",
        "status": "active",
        "terminal": "T2",
        "zone": "airside",
        "location_id": "T2_GATE_B4",
        "explanation": "Multi-modal alert: unauthorized access attempt at airside Gate B4 combined with visual anomaly and intercom distress call. High confidence composite threat.",
        "recommendations": [
            {"priority": 1, "action": "Dispatch Patrol Team Alpha to T2 Gate B4 immediately", "reasoning": "Unauthorized individual in airside zone", "who": "SOC Operator"},
            {"priority": 2, "action": "Lock down Gate B4 via SCMT", "reasoning": "Prevent further airside access", "who": "SOC Operator"},
            {"priority": 3, "action": "Notify APD at ext 6542-7777", "reasoning": "Level 4+ incident requires law enforcement", "who": "Duty Manager"},
        ],
        "contacts": [
            {"name": "APD", "role": "Airport Police Division", "phone": "6542-7777"},
            {"name": "Patrol Team Alpha", "role": "Nearest patrol unit", "phone": "Channel 1"},
        ],
        "has_video": True, "has_audio": True, "has_sensor": True, "has_log": True,
    },
    {
        "severity_level": 4,
        "severity_score": 0.81,
        "confidence": "MEDIUM",
        "status": "investigating",
        "terminal": "T3",
        "zone": "public",
        "location_id": "T3_ARRIVAL_HALL",
        "explanation": "Fire alarm triggered in T3 arrival hall with video confirmation of smoke. Crowd self-evacuating. SCDF has been notified.",
        "recommendations": [
            {"priority": 1, "action": "Activate building fire alarm for T3 arrival hall", "reasoning": "Immediate evacuation required", "who": "SOC Operator"},
            {"priority": 2, "action": "Call SCDF via 995 and ARFF simultaneously", "reasoning": "Fire response requires multiple agencies", "who": "SOC Operator"},
        ],
        "contacts": [
            {"name": "SCDF", "role": "Singapore Civil Defence Force", "phone": "995"},
            {"name": "ARFF", "role": "Aircraft Rescue & Fire Fighting", "phone": "6595-6118"},
        ],
        "has_video": True, "has_audio": True, "has_sensor": True, "has_log": False,
    },
    {
        "severity_level": 3,
        "severity_score": 0.62,
        "confidence": "MEDIUM",
        "status": "active",
        "terminal": "T1",
        "zone": "public",
        "location_id": "T1_CHECKIN_ROW_G",
        "explanation": "Unattended baggage detected at T1 check-in Row G for over 25 minutes. PA announcement made with no response.",
        "recommendations": [
            {"priority": 1, "action": "Dispatch patrol to cordon unattended bag — 30m radius", "reasoning": "SOP requires physical cordon", "who": "Patrol Team Delta"},
            {"priority": 2, "action": "Review CCTV to identify owner", "reasoning": "Identify individual who left item", "who": "CCTV Operator"},
        ],
        "contacts": [{"name": "APD BDU", "role": "Bomb Disposal Unit — on standby", "phone": "6542-7777"}],
        "has_video": True, "has_audio": False, "has_sensor": True, "has_log": False,
    },
    {
        "severity_level": 2,
        "severity_score": 0.41,
        "confidence": "LOW",
        "status": "resolved",
        "terminal": "T2",
        "zone": "public",
        "location_id": "T2_LIFT_B3",
        "explanation": "Lift B3L1 stopped between floors with 3 passengers trapped. Maintenance has been notified and is en route.",
        "recommendations": [
            {"priority": 1, "action": "Dispatch officer to T2 Lift B3 and contact CAG Facilities ext 3000", "reasoning": "Passenger communication required", "who": "Patrol Team Bravo"},
        ],
        "contacts": [{"name": "CAG Facilities", "role": "Lift maintenance", "phone": "6595-3000"}],
        "has_video": False, "has_audio": True, "has_sensor": True, "has_log": False,
        "resolved_at": datetime.utcnow() - timedelta(hours=1),
        "resolution_notes": "Lift restored to service by technician within 20 minutes. All passengers safe.",
        "response_time_seconds": 95,
    },
    {
        "severity_level": 3,
        "severity_score": 0.58,
        "confidence": "LOW",
        "status": "active",
        "terminal": "T4",
        "zone": "public",
        "location_id": "T4_SCREENING_A",
        "explanation": "Aggressive passenger at T4 security screening refusing secondary screening and threatening staff.",
        "recommendations": [
            {"priority": 1, "action": "Dispatch screening security team to T4 Screening Area A", "reasoning": "Staff safety and screening compliance required", "who": "Screening Security Team A"},
            {"priority": 2, "action": "Request APD attendance if physical threats escalate", "reasoning": "Physical assault risk present", "who": "SOC Operator"},
        ],
        "contacts": [{"name": "APD", "role": "Airport Police Division", "phone": "999"}],
        "has_video": True, "has_audio": True, "has_sensor": False, "has_log": True,
    },
]


async def seed():
    await init_db()
    print("Database initialized")

    async with async_session() as session:
        # Create admin user
        from passlib.hash import bcrypt
        admin = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@aegis.local",
            hashed_password=bcrypt.hash("admin"),
            role="admin",
            is_active=True,
            created_at=datetime.utcnow(),
        )

        # Check if admin already exists
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.username == "admin"))
        existing = result.scalar_one_or_none()
        if not existing:
            session.add(admin)
            print("Created admin user (admin/admin)")
        else:
            print("Admin user already exists")

        # Create demo incidents
        base_time = datetime.utcnow() - timedelta(hours=2)
        created_count = 0

        for i, demo in enumerate(DEMO_INCIDENTS):
            incident_id = str(uuid.uuid4())
            created_at = base_time + timedelta(minutes=i * 15)

            incident = Incident(
                id=incident_id,
                created_at=created_at,
                updated_at=datetime.utcnow(),
                status=demo["status"],
                severity_level=demo["severity_level"],
                severity_score=demo["severity_score"],
                confidence=demo["confidence"],
                terminal=demo.get("terminal"),
                zone=demo.get("zone"),
                location_id=demo["location_id"],
                explanation=demo["explanation"],
                recommendations=demo["recommendations"],
                contacts=demo["contacts"],
                has_video=demo["has_video"],
                has_audio=demo["has_audio"],
                has_log=demo["has_log"],
                has_sensor=demo["has_sensor"],
                resolved_at=demo.get("resolved_at"),
                resolution_notes=demo.get("resolution_notes"),
                response_time_seconds=demo.get("response_time_seconds"),
            )
            session.add(incident)
            created_count += 1

            # Add a sample event
            event = Event(
                id=str(uuid.uuid4()),
                incident_id=incident_id,
                timestamp=created_at,
                modality="video" if demo["has_video"] else "sensor",
                source_id=f"CAM_{demo['location_id']}_01",
                event_type="anomaly",
                anomaly_score=demo["severity_score"],
                data={"demo": True},
            )
            session.add(event)

        await session.commit()
        print(f"Seeded {created_count} demo incidents")
        print("Done. AEGIS is ready for demonstration.")


if __name__ == "__main__":
    asyncio.run(seed())
