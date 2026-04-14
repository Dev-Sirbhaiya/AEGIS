# AEGIS — Adaptive Engagement & Guided Intelligence for Security

## Product Requirements Document (PRD)

**Version:** 1.0
**Date:** April 2026
**Competition:** NAISC 2026 Grand Finals — Certis Challenge Track
**Tagline:** *"See. Hear. Understand. Respond."*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Context & Domain Analysis](#2-problem-context--domain-analysis)
3. [Product Vision & Positioning](#3-product-vision--positioning)
4. [System Architecture](#4-system-architecture)
5. [Module Specifications](#5-module-specifications)
6. [Data Pipeline & Processing](#6-data-pipeline--processing)
7. [SOC Dashboard (Frontend)](#7-soc-dashboard-frontend)
8. [Voice Agent](#8-voice-agent)
9. [Knowledge & RAG System](#9-knowledge--rag-system)
10. [Training Simulation Engine](#10-training-simulation-engine)
11. [Reporting & Predictive Intelligence](#11-reporting--predictive-intelligence)
12. [Remote Access & Collaboration](#12-remote-access--collaboration)
13. [Tech Stack](#13-tech-stack)
14. [Folder Structure](#14-folder-structure)
15. [Data Models & Schemas](#15-data-models--schemas)
16. [API Contracts](#16-api-contracts)
17. [Deployment & Infrastructure](#17-deployment--infrastructure)
18. [Demo Scenarios & Simulation Data](#18-demo-scenarios--simulation-data)
19. [Development Phases & Milestones](#19-development-phases--milestones)
20. [Evaluation Metrics](#20-evaluation-metrics)
21. [Future Enhancements](#21-future-enhancements)
22. [Appendix](#22-appendix)

---

## 1. Executive Summary

### What is AEGIS?

AEGIS (Adaptive Engagement & Guided Intelligence for Security) is a multimodal AI-powered Security Response Advisor designed for Security Operations Centres (SOCs) at critical infrastructure sites — specifically airports like Singapore Changi. It ingests video (CCTV), audio (distress calls, alarms, intercom), access control logs, and sensor data, then uses specialised AI models to detect anomalies, assess incidents, and recommend proportionate responses aligned with standard operating procedures.

### Why AEGIS?

Certis Group operates a 4,000-person security operation at Changi Airport, monitoring over 2,000 CCTV cameras across multiple terminals, processing 7,000+ flights per week, and handling millions of passengers annually. Their existing Mozart platform excels at orchestrating workflows and unifying data sources, but it is fundamentally an **operational orchestration** tool — it tells you *what* is happening and routes tasks. It does not:

- **Explain** why something is anomalous in natural language
- **Recommend** proportionate courses of action ranked by effectiveness
- **Autonomously handle** voice calls during distress situations
- **Learn** from historical incident patterns to predict future threats
- **Train** officers through simulated incident scenarios

AEGIS fills these gaps. It can operate alongside Mozart as an intelligence layer, or function as an independent standalone system.

### Core Value Proposition

| Gap in Current Systems | AEGIS Capability |
|---|---|
| Alerts without context | Context-aware natural language explanations of detected anomalies |
| Manual call handling overwhelms SOC | Autonomous voice agent triages calls, raises alerts, SOC can take over anytime |
| Reactive-only response | Ranked response recommendations from RAG-embedded SOPs, with relevant contacts and emergency procedures |
| No institutional memory | Daily/monthly intelligent logs feed predictive early-warning system |
| Officers trained only on-the-job | Synthetic incident simulation engine for training response decisions and timing |
| No remote oversight | Authenticated remote dashboard for supervisors with seamless data handoff |

---

## 2. Problem Context & Domain Analysis

### 2.1 About Certis Group

Certis Group is Singapore's leading advanced integrated security organisation, wholly owned by Temasek Holdings. Originating from the Singapore Police Force's Guard & Escort Unit (1958), it became CISCO in 1972, corporatised in 2005, and rebranded to Certis in 2018. Key facts:

- **33,000+ employees** across Singapore, Australia, Hong Kong, Macau, China, and Qatar
- **One of five licensed auxiliary police forces** in Singapore authorised to provide armed security
- **Changi Airport contract** valued at S$680M+ covering access control, passenger screening, and baggage screening across all terminals
- **3,500+ aviation security officers** at Changi, awarded "Service Partner of the Year" for 3 consecutive years
- **Key deployments:** Jewel Changi Airport, Our Tampines Hub, Paya Lebar Quarter, JTC Corporation, One Bangkok (Thailand)

### 2.2 Mozart Platform — What It Does

Mozart is Certis' proprietary AI multi-service orchestration platform (Command & Control as a Service). It is ISO15408 EAL2 certified (Common Criteria cybersecurity certification). Its four core engines are:

- **Edge Intelligence:** Patented multi-sensory pervasive network for on-premise data processing
- **Operational Intelligence (OPINET):** Co-operative capabilities for situational awareness
- **Applied Intelligence:** AI for operational orchestration and precision
- **Platform as a Service:** Cloud computing for scalable digital services

**Mozart's strengths:** Unified dashboard for CCTV/IoT/BMS, workflow automation via digital SOPs, smart dispatch based on proximity/skills, mobile workforce app, case management, and enterprise-grade cybersecurity.

### 2.3 Mozart's Gaps — Where AEGIS Adds Value

| Dimension | Mozart | AEGIS |
|---|---|---|
| Detection | Video analytics detect anomalies, route alerts | Multimodal detection (video + audio + sensor fusion) with anomaly explanation |
| Response | SOP-driven workflows, operator follows steps | AI-generated ranked recommendations with reasoning, adapted to specific incident context |
| Audio/Voice | Not a primary focus | Autonomous voice agent handles distress calls, transcribes, raises alerts |
| Explanation | Dashboard shows data, operator interprets | Natural language explanation panel with situation assessment |
| Learning | Analytics and reports | Predictive early-warning from historical pattern analysis, monthly trend summaries |
| Training | Not a training platform | Synthetic incident simulation for officer training and assessment |
| Accessibility | Requires Mozart deployment | Lightweight, open-source, deployable alongside or independently |

### 2.4 Changi Airport — Operational Context

Singapore Changi Airport is a critical infrastructure target. Operational realities relevant to AEGIS:

- **4 terminals + Jewel** with distinct security zones (airside, landside, transit, cargo)
- **2,000+ CCTV cameras** monitored from centralised CIOC
- **7,000+ flights/week** (~one every 90 seconds)
- **65M+ passengers/year** — diverse, multilingual, varying threat profiles
- **Incident types:** Unauthorized zone access, unattended baggage, medical emergencies, lift breakdowns, aggressive behavior, prohibited item detection, crowd surges, drone intrusions, fire alarms, VIP protection scenarios
- **Regulatory framework:** ICAO Standards and Recommended Practices (SARPs), CAAS regulations, coordinated with Airport Police Division (APD), Immigration & Checkpoints Authority (ICA), SATS, CAG
- **Workforce challenges:** 12-hour rotating shifts, high turnover, need for continuous training, multi-ethnic workforce requiring multilingual support

### 2.5 NAISC Challenge Requirements Mapping

| Requirement | AEGIS Implementation |
|---|---|
| CCTV footage and live camera feeds | Anomalib-based video anomaly detection pipeline with frame extraction and heatmap generation |
| Panic/distress calls from intercoms | PANNs/CLAP audio classification + autonomous voice agent with Whisper STT |
| Access control logs and door alarms | Structured log ingestion with pattern matching and anomaly scoring |
| Motion/intrusion sensor alerts | Event stream processing with temporal correlation to video/audio |
| Context-aware response recommendations | RAG over security SOPs + LLM-generated ranked action plans |
| Diverse interaction modes | Split-screen SOC dashboard, voice agent, remote access portal, training simulator |
| Open-source resources | Anomalib, PANNs, CLAP, Whisper, FAISS/ChromaDB, FastAPI, React, configurable LLM backend |

---

## 3. Product Vision & Positioning

### 3.1 Product Name

**AEGIS** — Adaptive Engagement & Guided Intelligence for Security

In Greek mythology, the aegis is the shield of Zeus and Athena — a symbol of divine protection. The name reflects the product's role as an intelligent protective layer for security operations.

### 3.2 Design Philosophy

1. **Human-in-the-loop, always:** AEGIS advises, never acts unilaterally. SOC operators retain full authority. The voice agent can be overridden at any moment.
2. **Multimodal fusion over single-source:** Combining video + audio + logs + sensors produces higher-confidence assessments than any single modality.
3. **Explain, don't just alert:** Every detection comes with a natural language explanation of *what* was detected, *why* it is anomalous, and *what* the recommended response is.
4. **Proportionate response:** Recommendations are ranked by severity alignment — avoiding over-reaction (which causes panic) and under-reaction (which causes harm).
5. **Continuous learning:** Every incident becomes training data. Monthly summaries feed predictive models. Officer training simulations close the feedback loop.

### 3.3 Relationship to Mozart

AEGIS is designed to be **Mozart-complementary** (can sit on top of Mozart's data feeds and enhance its intelligence layer) or **Mozart-independent** (runs standalone with its own data ingestion). The architecture uses a clean API boundary so either deployment mode works without code changes.

### 3.4 User Personas

**Primary: SOC Operator**
- Sits in SCOC/CIOC monitoring multiple feeds
- Needs: fast situational awareness, clear recommendations, one-click escalation
- Pain: alert fatigue, information overload, ambiguous situations

**Secondary: SOC Supervisor / Shift Commander**
- Oversees multiple operators, makes escalation decisions
- Needs: aggregated view, incident history, ability to review operator decisions
- Pain: no time to review every incident, handoff between shifts is lossy

**Tertiary: Training Coordinator**
- Designs and runs training exercises for security officers
- Needs: realistic scenario generation, performance measurement, feedback loops
- Pain: training is expensive, unrepeatable, and hard to standardise

**Remote: Senior Management / External Authorities**
- Receives escalated incidents, reviews reports
- Needs: authenticated remote access, data handoff, exportable reports
- Pain: out of the loop until too late, no way to review decisions after the fact

---

## 4. System Architecture

### 4.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Video   │  │  Audio   │  │  Access  │  │  Sensor  │  │ Mozart  │ │
│  │  (CCTV)  │  │ (Intercom│  │  Control │  │  (IoT)   │  │   API   │ │
│  │          │  │  /Alarm) │  │   Logs   │  │          │  │(optional│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │             │              │              │      │
└───────┼──────────────┼─────────────┼──────────────┼──────────────┼──────┘
        │              │             │              │              │
        ▼              ▼             ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROCESSING & ANALYSIS LAYER                        │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │ VIDEO MODULE  │  │ AUDIO MODULE  │  │   LOG/SENSOR PROCESSOR    │   │
│  │               │  │               │  │                           │   │
│  │  Anomalib     │  │  PANNs/CLAP   │  │  Pattern matching         │   │
│  │  (PaDiM/      │  │  (classify    │  │  Temporal correlation     │   │
│  │   PatchCore/  │  │   audio       │  │  Anomaly scoring          │   │
│  │   EfficientAD)│  │   events)     │  │                           │   │
│  │               │  │               │  │                           │   │
│  │  Frame        │  │  Whisper      │  │                           │   │
│  │  Extraction   │  │  (STT for     │  │                           │   │
│  │  + Heatmaps   │  │   calls)      │  │                           │   │
│  └───────┬───────┘  └───────┬───────┘  └─────────────┬─────────────┘   │
│          │                  │                         │                  │
│          └──────────────────┼─────────────────────────┘                  │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   MULTIMODAL FUSION ENGINE                       │   │
│  │                                                                  │   │
│  │   Correlates events across modalities                            │   │
│  │   Assigns unified severity score (1-5)                          │   │
│  │   Generates incident context object                              │   │
│  │   Triggers appropriate response pipeline                        │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                            │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE & RESPONSE LAYER                       │
│                                                                         │
│  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────┐   │
│  │   RAG ENGINE       │  │   LLM BACKBONE     │  │  VOICE AGENT    │   │
│  │                    │  │                    │  │                 │   │
│  │  ChromaDB/FAISS    │  │  Configurable:     │  │  Whisper (STT)  │   │
│  │  Security SOPs     │  │  - Claude API      │  │  LLM (respond)  │   │
│  │  Emergency contacts│  │  - OpenAI API      │  │  Kokoro (TTS)   │   │
│  │  ICAO guidelines   │  │  - Groq API        │  │                 │   │
│  │  Location-specific │  │  - Local Llama/    │  │  Alert raising  │   │
│  │  procedures        │  │    Mistral         │  │  SOC handoff    │   │
│  └────────┬───────────┘  └────────┬───────────┘  └────────┬────────┘   │
│           │                       │                        │            │
│           └───────────────────────┼────────────────────────┘            │
│                                   ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              RESPONSE RECOMMENDATION ENGINE                      │   │
│  │                                                                  │   │
│  │   Input: incident context + retrieved SOPs + location data       │   │
│  │   Output: ranked list of response actions with reasoning         │   │
│  │   + relevant emergency contacts + estimated response times       │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                            │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                               │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    SOC DASHBOARD (React)                       │     │
│  │                                                                │     │
│  │  ┌─────────────────────┐  ┌────────────────────────────────┐  │     │
│  │  │   LEFT PANEL        │  │   RIGHT PANEL                  │  │     │
│  │  │                     │  │                                │  │     │
│  │  │   Camera feeds      │  │   Situation explanation         │  │     │
│  │  │   Key frames        │  │   Response recommendations     │  │     │
│  │  │   Heatmaps          │  │   (ranked by effectiveness)    │  │     │
│  │  │   Audio waveforms   │  │   Emergency contacts           │  │     │
│  │  │   Sensor data       │  │   Historical similar incidents │  │     │
│  │  │   Alert timeline    │  │   Action buttons               │  │     │
│  │  └─────────────────────┘  └────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐     │
│  │  Training    │  │  Remote      │  │  Reporting &              │     │
│  │  Simulator   │  │  Access      │  │  Predictive Analytics     │     │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE LAYER                                │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐     │
│  │ PostgreSQL│  │ ChromaDB │  │  Redis   │  │  File Storage      │     │
│  │ (incidents│  │ (vectors)│  │ (cache,  │  │  (frames, video    │     │
│  │  logs,    │  │          │  │  pub/sub)│  │   clips, reports)  │     │
│  │  reports) │  │          │  │          │  │                    │     │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Core Design Principles

1. **Modular microservice architecture:** Each module (video, audio, fusion, LLM, voice, RAG) runs as an independent service communicating via REST APIs and WebSocket events. Any module can be swapped, upgraded, or scaled independently.

2. **LLM-agnostic backbone:** The LLM integration layer uses a provider abstraction. You configure your preferred backend via environment variables — no code changes needed.

3. **Event-driven processing:** Redis pub/sub handles real-time event propagation. When the video module detects an anomaly, it publishes to the `anomaly:video` channel. The fusion engine subscribes to all anomaly channels, correlates, and publishes to `incident:new`.

4. **Offline-capable:** Core detection (Anomalib, PANNs) runs locally. LLM calls can use local models (Llama/Mistral via Ollama) for air-gapped deployments.

---

## 5. Module Specifications

### 5.1 Video Anomaly Detection Module

**Purpose:** Ingest CCTV frames, detect visual anomalies, generate explanatory heatmaps, extract key frames.

**Model: Anomalib (EfficientAD recommended for real-time, PatchCore for accuracy)**

- **Input:** Video stream (RTSP/file) or individual frames (JPEG/PNG)
- **Processing:**
  1. Frame sampling at configurable FPS (default: 2 FPS for efficiency, 5 FPS for high-security zones)
  2. Resize to 256×256 for model input
  3. Anomalib inference produces anomaly score (0.0–1.0) and pixel-level heatmap
  4. Frames exceeding threshold (configurable, default: 0.5) are flagged
  5. Flagged frames grouped into incidents by temporal proximity (within 30s = same incident)
  6. Key frames (highest anomaly score in each incident) are stored
- **Output:**
  ```json
  {
    "event_id": "vid_20260406_143022_cam12",
    "camera_id": "T2_GATE_B4_CAM12",
    "timestamp": "2026-04-06T14:30:22Z",
    "anomaly_score": 0.87,
    "anomaly_type": "visual_anomaly",
    "heatmap_path": "/data/heatmaps/vid_20260406_143022_cam12.png",
    "keyframe_path": "/data/frames/vid_20260406_143022_cam12.jpg",
    "bbox": [120, 340, 280, 510],
    "metadata": {
      "zone": "Terminal 2 Gate B4",
      "camera_type": "fixed",
      "resolution": "1920x1080"
    }
  }
  ```

**Anomalib Model Selection Guide:**

| Model | Speed | Accuracy | Memory | Best For |
|---|---|---|---|---|
| EfficientAD | Very Fast | High | Low | Real-time monitoring, edge deployment |
| PatchCore | Moderate | Very High | High | High-security zones, post-event analysis |
| PaDiM | Fast | High | Moderate | General purpose, good balance |
| STFPM | Fast | High | Moderate | Texture-heavy scenes |

**Training Strategy:** For the hackathon, use pretrained models on MVTec AD or UCF-Crime dataset. For production, fine-tune on facility-specific "normal" footage.

### 5.2 Audio Analysis Module

**Purpose:** Classify audio events from intercoms, ambient microphones, and alarm systems. Detect distress signals, alarms, glass breaking, gunshots, screams, and other security-relevant sounds.

**Models:**

- **PANNs (Cnn14):** Pre-trained on AudioSet (527 sound classes). Use as primary classifier for environmental sounds. Detects: glass breaking, gunshot, scream, alarm, siren, explosion, crowd noise, running footsteps, etc.
- **CLAP (Contrastive Language-Audio Pretraining):** Zero-shot audio classification. Use for flexible, query-based detection — e.g., "Is this audio a distress call?" without needing pre-labelled data for every possible sound category.
- **Whisper (large-v3):** Speech-to-text for distress calls, intercom communications, and voice agent conversations.

**Processing Pipeline:**

```
Audio Input (mic/intercom/file)
  │
  ├──► PANNs Classifier ──► Event labels + confidence scores
  │                          (e.g., "Scream: 0.92", "Glass breaking: 0.78")
  │
  ├──► CLAP Zero-Shot ──► Security-specific queries
  │                        ("distress call", "physical altercation",
  │                         "unauthorized alarm", "crowd panic")
  │
  └──► Whisper STT ──► Transcription (if speech detected)
                        │
                        └──► Sentiment/urgency analysis via LLM
```

**Output:**
```json
{
  "event_id": "aud_20260406_143025_mic07",
  "source_id": "T2_INTERCOM_LIFT_B3",
  "timestamp": "2026-04-06T14:30:25Z",
  "panns_labels": [
    {"label": "Scream", "confidence": 0.92},
    {"label": "Speech", "confidence": 0.85}
  ],
  "clap_assessment": {
    "query": "distress call for help",
    "score": 0.88
  },
  "transcription": "Help! Someone collapsed in the lift! Please send help!",
  "urgency_score": 0.95,
  "language_detected": "en"
}
```

### 5.3 Log & Sensor Processor

**Purpose:** Ingest structured data from access control systems, door alarms, motion sensors, intrusion detectors, and any other IoT source.

**Input formats supported:**
- JSON event streams (primary)
- CSV logs (batch import)
- Syslog format
- MQTT messages (IoT sensors)

**Processing:**
1. Parse incoming events into normalised schema
2. Apply rule-based anomaly detection:
   - Access at unusual hours (outside normal operating window)
   - Repeated failed access attempts (>3 within 5 minutes)
   - Door held open beyond threshold (>60 seconds in secure zones)
   - Motion in restricted zones during closed hours
   - Sensor reading outside normal range (temperature, smoke, vibration)
3. Calculate anomaly score based on rule severity and temporal pattern
4. Correlate with location-based context (which camera covers this door, which zone is this sensor in)

**Output:**
```json
{
  "event_id": "log_20260406_143030_door_A5",
  "source_type": "access_control",
  "source_id": "T3_DOOR_AIRSIDE_A5",
  "timestamp": "2026-04-06T14:30:30Z",
  "event_type": "unauthorized_access_attempt",
  "anomaly_score": 0.75,
  "details": {
    "card_id": "REDACTED_HASH",
    "attempts": 4,
    "time_window": "3 minutes",
    "zone": "Terminal 3 Airside",
    "clearance_required": "Level 3",
    "clearance_held": "Level 1"
  },
  "correlated_cameras": ["T3_AIRSIDE_CAM22", "T3_AIRSIDE_CAM23"]
}
```

### 5.4 Multimodal Fusion Engine

**Purpose:** Correlate events across all modalities to form unified incident assessments with higher confidence than any single source.

**Fusion Logic:**

```python
# Pseudocode for fusion algorithm
def fuse_events(events: List[Event], time_window: int = 60) -> List[Incident]:
    """
    Group events within time_window seconds and spatial proximity
    into unified incidents with combined severity scores.
    """
    incidents = []
    
    for event_cluster in cluster_by_time_and_location(events, time_window):
        incident = Incident()
        incident.modalities = set()
        
        for event in event_cluster:
            incident.modalities.add(event.modality)  # video, audio, log, sensor
            incident.events.append(event)
        
        # Multi-modal bonus: events confirmed by multiple modalities
        # get a confidence boost
        modality_count = len(incident.modalities)
        base_score = max(e.anomaly_score for e in event_cluster)
        
        # Fusion scoring
        if modality_count >= 3:
            incident.severity = min(base_score * 1.3, 1.0)  # High confidence
            incident.confidence = "HIGH"
        elif modality_count == 2:
            incident.severity = min(base_score * 1.15, 1.0)
            incident.confidence = "MEDIUM"
        else:
            incident.severity = base_score
            incident.confidence = "LOW"
        
        # Map to severity level (1-5)
        incident.severity_level = map_to_level(incident.severity)
        # 5: Critical (active threat to life)
        # 4: High (serious security breach)
        # 3: Medium (potential threat, requires investigation)
        # 2: Low (minor anomaly, monitoring)
        # 1: Info (logged, no action required)
        
        incidents.append(incident)
    
    return sorted(incidents, key=lambda i: i.severity, reverse=True)
```

**Severity Level Definitions (Airport Context):**

| Level | Name | Score Range | Example Scenarios |
|---|---|---|---|
| 5 | CRITICAL | 0.9–1.0 | Active shooter, explosion, aircraft security breach, bomb threat |
| 4 | HIGH | 0.75–0.89 | Unauthorized airside access, unattended suspicious package, physical assault |
| 3 | MEDIUM | 0.5–0.74 | Person in restricted area (may be lost), repeated access failures, aggressive passenger |
| 2 | LOW | 0.25–0.49 | Door held open, minor crowd buildup, unusual loitering |
| 1 | INFO | 0.0–0.24 | Routine sensor trigger, normal operational variance |

### 5.5 Knowledge Graph for Cross-Modal Correlation

When the voice agent raises an alert from an audio event, the system uses a lightweight knowledge representation to pull relevant video frames:

```python
# Knowledge graph links locations to cameras, sensors, and procedures
LOCATION_GRAPH = {
    "T2_LIFT_B3": {
        "cameras": ["T2_LOBBY_CAM08", "T2_LIFT_B3_CAM_INT"],
        "sensors": ["T2_LIFT_B3_MOTION", "T2_LIFT_B3_DOOR"],
        "intercoms": ["T2_INTERCOM_LIFT_B3"],
        "nearest_responders": ["T2_PATROL_TEAM_B", "T2_MEDICAL_POST"],
        "sop_tags": ["lift_breakdown", "medical_emergency", "trapped_person"],
        "floor": "B1",
        "terminal": "T2"
    }
}
```

When audio from `T2_INTERCOM_LIFT_B3` triggers an alert, the system automatically:
1. Pulls last 60s of footage from `T2_LOBBY_CAM08` and `T2_LIFT_B3_CAM_INT`
2. Checks motion sensor status on `T2_LIFT_B3_MOTION`
3. Retrieves relevant SOPs tagged with `lift_breakdown`, `medical_emergency`
4. Identifies `T2_PATROL_TEAM_B` as nearest responder

---

## 6. Data Pipeline & Processing

### 6.1 Real-Time Pipeline (WebSocket + Redis Pub/Sub)

```
[Data Sources] ──► [Ingestion Workers] ──► [Redis Pub/Sub] ──► [Processing Modules]
                                                │
                                                ├── anomaly:video
                                                ├── anomaly:audio
                                                ├── anomaly:log
                                                ├── anomaly:sensor
                                                ├── incident:new
                                                ├── incident:update
                                                ├── voice:alert
                                                └── voice:handoff
                                                │
                                        [Fusion Engine subscribes to all anomaly:*]
                                        [Dashboard subscribes to incident:* and voice:*]
```

### 6.2 Batch Pipeline (Daily/Monthly Reports)

```
[PostgreSQL incident logs] ──► [Aggregation Job (cron)] ──► [LLM Summarization]
                                                                │
                                                    ┌───────────┴──────────┐
                                                    │                      │
                                              [Daily Report]        [Monthly Report]
                                                    │                      │
                                              Quick summary         Trend analysis
                                              Key incidents         Predictive insights
                                              Response times        Security assignment
                                              Officer actions         recommendations
```

### 6.3 Data Flow for a Single Incident (End-to-End)

```
1. Camera T2_GATE_B4_CAM12 captures person entering restricted zone
2. Anomalib detects anomaly (score: 0.82), generates heatmap, publishes to anomaly:video
3. Motion sensor T2_GATE_B4_MOTION triggers, publishes to anomaly:sensor
4. Access log shows no valid badge scan at T2_GATE_B4_DOOR, publishes to anomaly:log
5. Fusion engine correlates 3 events (within 15s, same zone)
   → Creates incident with severity 4 (HIGH), confidence HIGH (3 modalities)
6. Incident published to incident:new
7. RAG retrieves SOPs for "unauthorized_airside_access" at Terminal 2
8. LLM generates:
   - Situation explanation
   - Ranked response options
   - Relevant contacts (APD, T2 supervisor)
9. Dashboard updates:
   - Left panel: live camera feed highlighted, key frame, heatmap
   - Right panel: explanation, recommendations, contact buttons
10. If voice call comes in simultaneously, voice agent handles initial response,
    correlates with existing incident, adds context
11. Incident logged to PostgreSQL for daily/monthly reporting
```

---

## 7. SOC Dashboard (Frontend)

### 7.1 Layout Specification

The dashboard follows a **split-screen design** optimised for SOC operator workflow:

```
┌────────────────────────────────────────────────────────────────────────┐
│  AEGIS   │ Incidents (12)  │ Cameras  │ Training │ Reports │ 🔔 3  👤 │
├───────────────────────────────┬────────────────────────────────────────┤
│                               │                                        │
│     LEFT PANEL (60%)          │      RIGHT PANEL (40%)                 │
│                               │                                        │
│  ┌─────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │  Active Camera Feed     │  │  │  SITUATION ASSESSMENT            │  │
│  │  [Live / Key Frames]    │  │  │                                  │  │
│  │                         │  │  │  Severity: ██████████ HIGH (4)   │  │
│  │  ┌───────┐ ┌───────┐   │  │  │  Confidence: HIGH (3 modalities) │  │
│  │  │ Cam12 │ │ Cam13 │   │  │  │                                  │  │
│  │  │ LIVE  │ │ LIVE  │   │  │  │  An individual without valid     │  │
│  │  └───────┘ └───────┘   │  │  │  credentials has entered the     │  │
│  │                         │  │  │  restricted airside zone at      │  │
│  │  Anomaly Heatmap:       │  │  │  Terminal 2 Gate B4. Motion      │  │
│  │  ┌─────────────────┐   │  │  │  sensor and access logs confirm  │  │
│  │  │   ████ ░░░      │   │  │  │  no authorized entry. Visual     │  │
│  │  │   ████ ░░░      │   │  │  │  anomaly detected at 14:30:22.   │  │
│  │  └─────────────────┘   │  │  │                                  │  │
│  │                         │  │  ├──────────────────────────────────┤  │
│  │  Audio (if applicable): │  │  │  RECOMMENDED ACTIONS             │  │
│  │  ┌─────────────────┐   │  │  │                                  │  │
│  │  │ ~~waveform~~    │   │  │  │  1. ⚡ Dispatch T2 Patrol Team B │  │
│  │  │ "Help! Someone  │   │  │  │     to Gate B4 immediately       │  │
│  │  │  collapsed..."  │   │  │  │     [DISPATCH] [VIEW SOP]        │  │
│  │  └─────────────────┘   │  │  │                                  │  │
│  │                         │  │  │  2. 📞 Notify Airport Police     │  │
│  │  Sensor Timeline:       │  │  │     Division (APD) duty officer  │  │
│  │  ──●──●──●──────────   │  │  │     [CALL] [ALERT]              │  │
│  │  14:30 14:31 14:32      │  │  │                                  │  │
│  │                         │  │  │  3. 🔒 Lock down Gate B4 access  │  │
│  │                         │  │  │     points pending investigation │  │
│  └─────────────────────────┘  │  │     [INITIATE]                  │  │
│                               │  │                                  │  │
│  ┌─────────────────────────┐  │  │  4. 📹 Review last 5 min of     │  │
│  │  ACTIVE INCIDENTS       │  │  │     Cam12, Cam13 footage         │  │
│  │  (sorted by severity)   │  │  │     [REVIEW]                    │  │
│  │                         │  │  │                                  │  │
│  │  🔴 [4] Unauthorized    │  │  ├──────────────────────────────────┤  │
│  │  access - T2 Gate B4    │  │  │  CONTACTS                       │  │
│  │  14:30 • 3 modalities   │  │  │                                  │  │
│  │                         │  │  │  APD Duty: +65 6XXX XXXX        │  │
│  │  🟡 [2] Door held open  │  │  │  T2 Supervisor: +65 6XXX XXXX  │  │
│  │  T3 Cargo Bay C         │  │  │  Medical: +65 6XXX XXXX        │  │
│  │  14:28 • 1 modality     │  │  │                                  │  │
│  │                         │  │  ├──────────────────────────────────┤  │
│  │  🟢 [1] Routine sensor  │  │  │  [📤 Share] [📋 Export]         │  │
│  │  trigger - T1 Zone A    │  │  │  [🔄 Transfer] [📝 Add Note]   │  │
│  │  14:25 • 1 modality     │  │  │                                  │  │
│  └─────────────────────────┘  │  └──────────────────────────────────┘  │
│                               │                                        │
│  ┌─────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │  VOICE AGENT STATUS     │  │  │  SIMILAR PAST INCIDENTS          │  │
│  │  🟢 Active call:        │  │  │                                  │  │
│  │  T2 Intercom Lift B3    │  │  │  • 2026-03-15: Tailgating at    │  │
│  │  Duration: 2:34         │  │  │    T2 Gate B2 → Resolved by     │  │
│  │  [TAKE OVER] [MUTE]     │  │  │    patrol escort. Time: 4min    │  │
│  └─────────────────────────┘  │  │                                  │  │
│                               │  │  • 2026-02-28: Unauthorized      │  │
│                               │  │    entry T1 Gate A5 → APD        │  │
│                               │  │    apprehension. Time: 8min      │  │
│                               │  └──────────────────────────────────┘  │
├───────────────────────────────┴────────────────────────────────────────┤
│  Status: Connected │ Models: ✅ Video ✅ Audio ✅ LLM │ Uptime: 47h  │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Frontend Technology

- **Framework:** React 18+ with TypeScript
- **State management:** Zustand (lightweight, performant)
- **Real-time:** WebSocket (socket.io-client) for live incident updates
- **UI Library:** shadcn/ui + Tailwind CSS
- **Video:** HLS.js for RTSP-to-HLS camera feeds, or `<video>` tags for demo MP4s
- **Charts:** Recharts for analytics and timelines
- **Audio visualization:** Web Audio API for waveform display
- **Maps:** Leaflet.js with custom airport floor plan overlay (for spatial incident view)

### 7.3 Key UI Features

1. **Incident Priority Queue:** Incidents auto-sort by severity. Clicking an incident loads its full context into both panels.
2. **Voice Agent Panel:** Shows real-time transcription of ongoing calls. SOC operator can click "TAKE OVER" to join the call at any moment.
3. **Action Buttons:** Each recommended action has a one-click button that triggers the appropriate workflow (dispatch, call, lock, alert).
4. **Share/Transfer:** Authenticated handoff — click "Transfer" to pass the incident (with all context, frames, explanations) to another operator or supervisor. Post-authentication, the recipient sees everything instantly.
5. **Export:** Generate PDF report of the incident for records, including key frames, heatmaps, timeline, actions taken, and response times.

---

## 8. Voice Agent

### 8.1 Architecture

```
[Incoming Call / Intercom Audio]
         │
         ▼
[Whisper STT] ──► Transcription ──► [LLM Conversation Engine]
                                            │
                                            ├──► Respond to caller (empathetic, calm)
                                            ├──► Assess urgency and incident type
                                            ├──► Raise alert to SOC if anomaly detected
                                            └──► Update incident context in real-time
                                            │
                                            ▼
                                    [Kokoro / Edge TTS] ──► Audio response to caller
```

### 8.2 Voice Agent Behavior Specification

**Personality:** Calm, professional, reassuring. Uses clear, simple language. Trained to de-escalate.

**Core capabilities:**
1. **Answer incoming distress calls** — greet, identify caller's situation, gather key information (location, nature of emergency, number of people affected)
2. **Classify urgency in real-time** — as the conversation progresses, continuously update the incident severity level
3. **Raise SOC alerts** — when anomaly or emergency is detected, immediately push alert to SOC dashboard with transcription, audio clip, and assessed severity
4. **Maintain conversation** — continue talking to caller (providing reassurance, asking follow-up questions) while SOC processes the alert
5. **Seamless SOC handoff** — when SOC operator clicks "TAKE OVER", the agent gracefully transitions: *"I'm now connecting you with our security operations team..."* and passes all context

**Example conversation flow:**

```
[CALLER]: Help! Someone's collapsed in Terminal 2 near Gate B4!
[AEGIS]:  I understand there's a medical emergency at Terminal 2, Gate B4.
          I'm alerting our security and medical teams right now.
          Can you tell me — is the person conscious? Are they breathing?

          [SYSTEM: Alert raised → Severity 4, Type: medical_emergency,
           Location: T2_Gate_B4, Key info: person collapsed]

[CALLER]: I think they're breathing but they're not responding.
[AEGIS]:  Thank you. Our medical team is being dispatched to your location
          now. Please stay with the person and don't move them. If they
          stop breathing, do you know CPR?

          [SYSTEM: Update → "unconscious but breathing", dispatch medical]

[SOC clicks TAKE OVER]
[AEGIS]:  I'm now connecting you with our operations team who will
          assist you further. Stay calm, help is on the way.
[SOC]:    Hello, this is Security Operations. I can see your location
          on our system. Our medical responder is 2 minutes away...
```

### 8.3 Technology Choices

| Component | Technology | Reason |
|---|---|---|
| Speech-to-Text | Whisper large-v3 (OpenAI) | Best open-source STT accuracy, multilingual, handles noisy environments |
| Text-to-Speech | Kokoro-82M (open-source) | High quality, fast, lightweight, natural sounding. Alternative: Edge TTS (Microsoft, free API) |
| Conversation LLM | Same configurable backend | Uses the same LLM as the response engine, with a voice-agent-specific system prompt |
| Audio streaming | WebSocket + WebRTC | Low-latency bidirectional audio |
| Call management | Custom Python (asyncio) | Handles concurrent calls, queue management, SOC handoff |

### 8.4 Voice Agent System Prompt (Template)

```
You are AEGIS Voice Agent, a calm and professional security operations
assistant at Changi Airport. You handle incoming distress and intercom
calls. Your priorities, in order:

1. SAFETY: Ensure caller safety. If medical emergency, guide basic first aid.
2. INFORMATION: Gather location, nature of incident, number of people affected.
3. REASSURANCE: Keep caller calm. Help is being dispatched.
4. ESCALATION: If you detect a security threat, immediately flag for SOC.

Rules:
- Never reveal security procedures or internal protocols to callers
- Use simple, clear language. The caller may be panicking.
- If you hear multiple languages, try to identify and respond in kind.
- Always confirm location: terminal, gate/zone, floor, landmarks.
- If unsure about severity, default to higher severity.
- You will be told when SOC takes over. Transition gracefully.

Context available to you:
- Location: {location_name} ({location_id})
- Nearby cameras: {camera_list}
- Current alerts in this zone: {active_alerts}
- Nearest responders: {nearest_responders}
```

---

## 9. Knowledge & RAG System

### 9.1 Document Corpus

The RAG system embeds and indexes the following document categories:

| Category | Examples | Source |
|---|---|---|
| Security SOPs | Incident response procedures, escalation matrices, use-of-force guidelines | Publicly available security best practices (ASIS International, ICAO, CAAS) |
| Emergency Procedures | Fire evacuation, bomb threat protocol, medical emergency, active shooter | Airport emergency plans (publicly available frameworks) |
| Location Data | Terminal maps, camera locations, sensor positions, zone classifications | Custom-built for demo (configurable JSON) |
| Contact Directories | Emergency services, airport authority, airline contacts, medical facilities | Custom-built for demo (configurable JSON) |
| Regulatory Guidelines | ICAO SARPs, Singapore security regulations, data protection requirements | Publicly available documents |
| Historical Incidents | Past incident reports with resolution details and response times | Synthetic data for demo, real data in production |

### 9.2 RAG Architecture

```
[Query from Fusion Engine: "unauthorized access at airside gate"]
         │
         ▼
[Embedding Model: all-MiniLM-L6-v2 (sentence-transformers)]
         │
         ▼
[Vector Search: ChromaDB / FAISS]
  - Top-K retrieval (K=5)
  - Filtered by location tags and incident type
         │
         ▼
[Retrieved Documents]
  1. SOP: "Unauthorized Access to Restricted Areas" (relevance: 0.94)
  2. SOP: "Tailgating Prevention Protocol" (relevance: 0.87)
  3. Contact: "Terminal 2 APD duty roster" (relevance: 0.82)
  4. History: "2026-03-15 similar incident at T2 Gate B2" (relevance: 0.79)
  5. Regulation: "CAAS Airport Security Programme Section 4.2" (relevance: 0.75)
         │
         ▼
[LLM Prompt Construction]
  System: "You are a security advisor. Based on the incident context
           and retrieved procedures, provide ranked response
           recommendations..."
  Context: {incident_object}
  Retrieved: {documents}
         │
         ▼
[LLM Response: Ranked actions with reasoning]
```

### 9.3 Embedding & Indexing Pipeline

```python
# Pseudocode for document indexing
from sentence_transformers import SentenceTransformer
import chromadb

embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="./data/chroma")
collection = client.get_or_create_collection(
    name="security_knowledge",
    metadata={"hnsw:space": "cosine"}
)

def index_document(doc_path: str, doc_type: str, tags: List[str]):
    """Chunk document, embed, and store in ChromaDB."""
    chunks = chunk_document(doc_path, chunk_size=500, overlap=50)
    
    for i, chunk in enumerate(chunks):
        embedding = embedder.encode(chunk.text)
        collection.add(
            ids=[f"{doc_path}_{i}"],
            embeddings=[embedding.tolist()],
            documents=[chunk.text],
            metadatas=[{
                "source": doc_path,
                "doc_type": doc_type,  # sop, contact, regulation, history
                "tags": ",".join(tags),  # location and incident type tags
                "chunk_index": i
            }]
        )
```

---

## 10. Training Simulation Engine

### 10.1 Purpose

A dedicated mode where AEGIS generates synthetic security incidents for training purposes. Officers practice response decisions, are measured on response times and action quality, and the system provides feedback.

### 10.2 Simulation Modes

**Mode 1: Scenario Replay**
- Replay real (anonymised) or synthetic past incidents
- Officer sees the same data feeds the SOC would see
- System tracks: time to first response, actions chosen, escalation decisions
- After scenario: AI-generated debrief comparing officer's actions to optimal response

**Mode 2: Live Synthetic Generation**
- System generates incidents in real-time using:
  - Pre-built scenario templates (20+ scenarios covering all severity levels)
  - Synthetic video frames (static images with overlaid anomaly indicators)
  - Synthetic audio (pre-recorded distress calls, alarm sounds)
  - Simulated log events
- Difficulty levels: Beginner (single-modality, clear anomaly), Intermediate (multi-modal, moderate ambiguity), Advanced (concurrent incidents, deceptive signals, time pressure)

**Mode 3: Evaluation**
- Standardised test scenarios for officer certification
- Automated scoring rubric based on:
  - Response time (seconds from alert to first action)
  - Action appropriateness (does action match severity level?)
  - Escalation accuracy (did they escalate when needed? Over-escalate?)
  - Communication quality (did they gather right info from voice agent sim?)

### 10.3 Scenario Template Schema

```json
{
  "scenario_id": "SIM_UNAUTH_ACCESS_001",
  "title": "Unauthorized Airside Access at Terminal 2",
  "difficulty": "intermediate",
  "duration_minutes": 5,
  "description": "A person without valid credentials enters the airside zone through a gate that was briefly left unattended during a shift change.",
  "severity_level": 4,
  "events_timeline": [
    {
      "time_offset_seconds": 0,
      "modality": "sensor",
      "event": {
        "type": "door_alarm",
        "source": "T2_GATE_B4_DOOR",
        "details": "Door opened without valid badge scan"
      }
    },
    {
      "time_offset_seconds": 5,
      "modality": "video",
      "event": {
        "type": "visual_anomaly",
        "camera": "T2_GATE_B4_CAM12",
        "frame_path": "/sim_data/frames/unauth_access_001_frame1.jpg",
        "heatmap_path": "/sim_data/heatmaps/unauth_access_001_heat1.png",
        "anomaly_score": 0.82
      }
    },
    {
      "time_offset_seconds": 15,
      "modality": "log",
      "event": {
        "type": "access_control",
        "details": "Badge scan attempt failed - clearance mismatch",
        "location": "T2_GATE_B4"
      }
    },
    {
      "time_offset_seconds": 30,
      "modality": "audio",
      "event": {
        "type": "intercom_call",
        "source": "T2_INTERCOM_GATE_B4",
        "audio_path": "/sim_data/audio/confused_passenger_001.wav",
        "transcription": "Excuse me, I think I went through the wrong door. Can someone help?"
      }
    }
  ],
  "optimal_response": {
    "primary_action": "Dispatch patrol team to intercept and verify",
    "secondary_action": "Pull up camera feeds for visual confirmation",
    "do_not": "Do not trigger full lockdown (disproportionate for single individual)",
    "escalation": "Escalate to APD only if individual refuses to cooperate or additional threat indicators emerge",
    "expected_response_time_seconds": 30
  },
  "scoring_rubric": {
    "response_time_30s": 10,
    "response_time_60s": 7,
    "response_time_90s": 4,
    "correct_primary_action": 30,
    "correct_secondary_action": 20,
    "appropriate_escalation": 20,
    "no_over_reaction": 10,
    "communication_quality": 10
  }
}
```

### 10.4 Pre-Built Scenario Library (20 Scenarios)

| ID | Scenario | Difficulty | Severity |
|---|---|---|---|
| SIM_001 | Unauthorized airside access | Intermediate | 4 |
| SIM_002 | Unattended baggage in transit area | Intermediate | 3 |
| SIM_003 | Medical emergency — passenger collapse | Beginner | 3 |
| SIM_004 | Lift breakdown with trapped passengers | Beginner | 2 |
| SIM_005 | Aggressive passenger at screening checkpoint | Intermediate | 3 |
| SIM_006 | Fire alarm activation in Terminal 3 | Intermediate | 4 |
| SIM_007 | Suspicious package near check-in counter | Advanced | 4 |
| SIM_008 | Crowd surge at arrival hall | Advanced | 3 |
| SIM_009 | Drone detected near runway perimeter | Advanced | 5 |
| SIM_010 | Child separated from guardian | Beginner | 2 |
| SIM_011 | VIP security detail — threat assessment | Advanced | 4 |
| SIM_012 | Cyber-physical attack — access system compromise | Advanced | 5 |
| SIM_013 | Slip-and-fall injury in wet area | Beginner | 1 |
| SIM_014 | Smoking violation in non-smoking zone | Beginner | 1 |
| SIM_015 | Tailgating through secure door | Intermediate | 3 |
| SIM_016 | Simultaneous incidents — medical + unauthorized access | Advanced | 4 |
| SIM_017 | False alarm — motion sensor malfunction | Intermediate | 1 |
| SIM_018 | Hazardous material spill at cargo area | Advanced | 4 |
| SIM_019 | Active threat — armed individual | Advanced | 5 |
| SIM_020 | Power outage affecting security systems | Advanced | 4 |

---

## 11. Reporting & Predictive Intelligence

### 11.1 Daily Report (Auto-Generated)

Generated at end of each 24h period via LLM summarization of all logged incidents:

```markdown
## AEGIS Daily Security Report — 2026-04-06

### Summary
- Total incidents: 47
- Critical (5): 0 | High (4): 2 | Medium (3): 8 | Low (2): 15 | Info (1): 22
- Average response time: 42 seconds
- Voice agent calls handled: 12 (3 escalated to SOC)

### Notable Incidents
1. [HIGH] 14:30 — Unauthorized access at T2 Gate B4
   - Resolution: Patrol intercept, individual was confused transit passenger
   - Response time: 28 seconds | Actions taken: dispatch, verify, escort

2. [HIGH] 22:15 — Suspicious package at T1 Check-in Row G
   - Resolution: APD sweep, item was abandoned luggage (passenger paged)
   - Response time: 35 seconds | Actions taken: cordon, APD alert, PA announcement

### Patterns Observed
- 67% of door alarms occurred during shift changes (06:00, 18:00)
- T2 Gate B4 has had 3 unauthorized access attempts this week
  → RECOMMENDATION: Increase patrol presence during 14:00-16:00

### Officer Performance
- Fastest response: Officer Chen (avg 18s)
- Training recommended: Officer Lim (2 incidents with delayed escalation)
```

### 11.2 Monthly Intelligence Summary

```markdown
## AEGIS Monthly Intelligence Summary — March 2026

### Trend Analysis
- Total incidents: 1,247 (↓5% vs February)
- Severity distribution shift: Fewer HIGH incidents (↓12%), more INFO (↑8%)
  → Interpretation: Improved preventive measures reducing serious incidents

### Predictive Insights
- High-risk periods identified: Fridays 18:00-22:00 (departure rush)
- T3 Cargo Bay showing increasing motion sensor triggers (+23% MoM)
  → EARLY WARNING: Possible perimeter weakness, recommend physical inspection
- Voice agent handling 15% more calls autonomously without SOC escalation
  → System confidence improving

### Security Assignment Recommendations
Based on incident patterns and predictive model:
1. Add 2 officers to T2 Gate B3-B5 corridor during 14:00-18:00
2. Rotate T3 Cargo patrols from 2-hour to 1-hour intervals
3. Deploy mobile CCTV unit at T1 Check-in during peak Friday departures
4. Schedule refresher training for 8 officers (identified by response metrics)
```

### 11.3 Predictive Model

Uses a simple time-series model (Prophet or custom LSTM) trained on historical incident logs:

**Features:** Hour of day, day of week, terminal, zone, flight schedule density, weather conditions, special events, historical incident counts

**Predictions:** Incident probability per zone per hour for the next 7 days, surfaced as a heatmap on the dashboard.

---

## 12. Remote Access & Collaboration

### 12.1 Feature Set

Access to the SOC dashboard features (specifically components 2, 3, 4 of the product — voice agent status, dashboard, and reporting) from any authenticated device:

1. **Role-based access control (RBAC):**
   - `operator`: Full dashboard, voice agent, incident management
   - `supervisor`: Everything + officer performance metrics + override authority
   - `admin`: Everything + system configuration + user management
   - `viewer`: Read-only dashboard + reports (for senior management)

2. **Data handoff:**
   - Click "Transfer" on any incident to assign to another authenticated user
   - Recipient receives push notification with full incident context
   - All generated reports, explanations, key frames, and recordings transfer seamlessly
   - Audit trail: every transfer logged with timestamp, from, to, reason

3. **Real-time sync:**
   - Multiple users can view the same incident simultaneously
   - Actions by any user are reflected for all viewers in real-time (WebSocket sync)
   - Annotations and notes are shared across sessions

4. **Authentication:**
   - JWT-based authentication with refresh tokens
   - Session timeout after 30 minutes of inactivity
   - Two-factor authentication support (TOTP)
   - All API calls authenticated and authorised

### 12.2 Mobile Responsiveness

The remote dashboard is fully responsive, optimised for tablets (primary remote device for supervisors on patrol) and smartphones (for quick checks). The split-screen layout collapses to a tabbed interface on smaller screens.

---

## 13. Tech Stack

### 13.1 Complete Technology Table

| Layer | Component | Technology | Version | Purpose |
|---|---|---|---|---|
| **Frontend** | UI Framework | React + TypeScript | 18.x | SOC Dashboard |
| | Styling | Tailwind CSS + shadcn/ui | 3.x | Component library |
| | State | Zustand | 4.x | Lightweight state management |
| | Real-time | Socket.io-client | 4.x | WebSocket for live updates |
| | Video | HLS.js | 1.x | Camera feed display |
| | Charts | Recharts | 2.x | Analytics and timelines |
| | Maps | Leaflet.js | 1.9.x | Spatial incident view |
| | Audio viz | Web Audio API | Native | Waveform rendering |
| **Backend** | API Framework | FastAPI (Python) | 0.100+ | REST + WebSocket API |
| | Task Queue | Celery + Redis | 5.x | Async processing for ML models |
| | WebSocket | Socket.io (python-socketio) | 5.x | Real-time event broadcasting |
| | Auth | PyJWT + passlib | - | JWT authentication |
| **AI/ML** | Video Anomaly | Anomalib (EfficientAD/PatchCore) | 1.x | Visual anomaly detection |
| | Audio Classify | PANNs (Cnn14) | - | Environmental sound classification |
| | Audio Zero-Shot | CLAP | - | Flexible audio queries |
| | Speech-to-Text | Whisper (large-v3) | - | Transcription |
| | Text-to-Speech | Kokoro-82M | - | Voice agent responses |
| | Embeddings | sentence-transformers (all-MiniLM-L6-v2) | - | Document embedding for RAG |
| | LLM (configurable) | Claude API / OpenAI API / Groq API / Ollama (Llama/Mistral) | - | Reasoning, recommendations, summarization |
| **RAG** | Vector DB | ChromaDB | 0.4+ | Document retrieval |
| | Alternate Vector DB | FAISS | - | If ChromaDB is too heavy |
| | Chunking | LangChain text splitters | - | Document preprocessing |
| **Data** | Primary DB | PostgreSQL | 16.x | Incidents, logs, reports, users |
| | Cache/PubSub | Redis | 7.x | Event bus, caching, session store |
| | File Storage | Local filesystem / MinIO | - | Frames, heatmaps, audio, reports |
| **Infrastructure** | Containerization | Docker + Docker Compose | - | Development and deployment |
| | Process Manager | Supervisor / PM2 | - | Service lifecycle |
| | Reverse Proxy | Nginx | - | Frontend serving, API routing |

### 13.2 LLM Provider Abstraction

```python
# config/llm_config.py

from enum import Enum
from pydantic import BaseModel

class LLMProvider(str, Enum):
    CLAUDE = "claude"
    OPENAI = "openai"
    GROQ = "groq"
    OLLAMA = "ollama"

class LLMConfig(BaseModel):
    provider: LLMProvider = LLMProvider.GROQ  # Default: fast and free-tier friendly
    model: str = "llama-3.1-70b-versatile"
    api_key: str | None = None  # Read from env: CLAUDE_API_KEY, OPENAI_API_KEY, GROQ_API_KEY
    base_url: str | None = None  # For Ollama: http://localhost:11434/v1
    temperature: float = 0.3  # Low temp for consistent security recommendations
    max_tokens: int = 2000

# Usage — all providers use OpenAI-compatible interface
# Claude: anthropic SDK
# OpenAI: openai SDK
# Groq: openai SDK with groq base_url
# Ollama: openai SDK with local base_url
```

### 13.3 Google Colab Compatibility Notes

Since heavier models run on Colab GPU:

- **Anomalib inference:** Runs on Colab T4/A100. Export model to ONNX for local CPU inference during demo.
- **Whisper large-v3:** Requires GPU. Use `faster-whisper` implementation for 4x speedup. On CPU, fall back to `whisper-base` or use Groq's Whisper API (free tier).
- **PANNs Cnn14:** Lightweight enough for CPU inference (~100ms per 10s clip).
- **CLAP:** Moderate GPU requirement. Can run on Colab, export embeddings for demo.
- **LLM:** Use Groq API for hackathon demo (fast, free tier, no GPU needed). Ollama with Llama 3.1 8B as local fallback.

---

## 14. Folder Structure

```
aegis/
├── README.md                          # Project overview, setup, usage
├── PRD.md                             # This document
├── docker-compose.yml                 # Full stack orchestration
├── .env.example                       # Environment variable template
├── Makefile                           # Common commands (setup, run, test)
│
├── backend/                           # FastAPI backend
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Backend container
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py                # App settings (pydantic-settings)
│   │   ├── llm_config.py             # LLM provider abstraction
│   │   └── logging_config.py          # Structured logging setup
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── incidents.py           # CRUD + query incidents
│   │   │   ├── cameras.py             # Camera feed management
│   │   │   ├── voice.py               # Voice agent control endpoints
│   │   │   ├── simulation.py          # Training simulation endpoints
│   │   │   ├── reports.py             # Report generation/retrieval
│   │   │   ├── auth.py                # Authentication endpoints
│   │   │   └── health.py              # Health check
│   │   ├── websocket/
│   │   │   ├── events.py              # WebSocket event handlers
│   │   │   └── manager.py            # Connection manager
│   │   └── middleware/
│   │       ├── auth.py                # JWT middleware
│   │       └── cors.py                # CORS configuration
│   │
│   ├── models/                        # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── incident.py                # Incident model
│   │   ├── event.py                   # Raw event model
│   │   ├── user.py                    # User model
│   │   ├── report.py                  # Report model
│   │   └── simulation.py             # Simulation session/score model
│   │
│   ├── services/                      # Business logic
│   │   ├── __init__.py
│   │   ├── video/
│   │   │   ├── anomaly_detector.py    # Anomalib wrapper
│   │   │   ├── frame_extractor.py     # CCTV frame sampling
│   │   │   └── heatmap_generator.py   # Anomaly heatmap overlay
│   │   ├── audio/
│   │   │   ├── panns_classifier.py    # PANNs wrapper
│   │   │   ├── clap_classifier.py     # CLAP zero-shot wrapper
│   │   │   ├── whisper_stt.py         # Whisper STT wrapper
│   │   │   └── audio_processor.py     # Audio preprocessing
│   │   ├── fusion/
│   │   │   ├── engine.py              # Multimodal fusion logic
│   │   │   ├── severity.py            # Severity scoring
│   │   │   └── correlator.py          # Temporal/spatial correlation
│   │   ├── intelligence/
│   │   │   ├── rag.py                 # RAG pipeline
│   │   │   ├── llm_client.py          # LLM provider abstraction
│   │   │   ├── response_engine.py     # Ranked response generation
│   │   │   └── prompts.py             # All LLM prompt templates
│   │   ├── voice/
│   │   │   ├── agent.py               # Voice agent conversation manager
│   │   │   ├── tts.py                 # Text-to-speech (Kokoro/Edge)
│   │   │   └── call_manager.py        # Call queue and SOC handoff
│   │   ├── simulation/
│   │   │   ├── generator.py           # Synthetic incident generator
│   │   │   ├── evaluator.py           # Officer performance scoring
│   │   │   └── scenario_loader.py     # Load scenario templates
│   │   ├── reporting/
│   │   │   ├── daily_report.py        # Daily report generator
│   │   │   ├── monthly_report.py      # Monthly intelligence summary
│   │   │   └── predictive.py          # Trend prediction
│   │   └── knowledge/
│   │       ├── graph.py               # Location-camera-sensor knowledge graph
│   │       └── indexer.py             # Document embedding pipeline
│   │
│   ├── db/
│   │   ├── session.py                 # Database session management
│   │   └── migrations/               # Alembic migrations
│   │
│   └── tests/
│       ├── test_fusion.py
│       ├── test_rag.py
│       ├── test_voice.py
│       └── test_simulation.py
│
├── frontend/                          # React frontend
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   │
│   ├── public/
│   │   ├── airport_floorplan.svg      # Airport map overlay
│   │   └── aegis_logo.svg
│   │
│   └── src/
│       ├── App.tsx                    # Root component
│       ├── main.tsx                   # Entry point
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Dashboard.tsx       # Main split-screen layout
│       │   │   ├── Navbar.tsx          # Top navigation
│       │   │   └── StatusBar.tsx       # Bottom status bar
│       │   ├── panels/
│       │   │   ├── LeftPanel.tsx       # Data visualization panel
│       │   │   ├── RightPanel.tsx      # Context & recommendations
│       │   │   ├── CameraFeed.tsx      # Live/recorded video display
│       │   │   ├── HeatmapView.tsx     # Anomaly heatmap overlay
│       │   │   ├── AudioWaveform.tsx   # Audio visualization
│       │   │   ├── SensorTimeline.tsx  # Event timeline chart
│       │   │   └── IncidentList.tsx    # Priority-sorted incident queue
│       │   ├── intelligence/
│       │   │   ├── SituationCard.tsx   # Situation explanation display
│       │   │   ├── ActionList.tsx      # Ranked recommendations
│       │   │   ├── ContactCard.tsx     # Emergency contacts
│       │   │   └── HistoryPanel.tsx    # Similar past incidents
│       │   ├── voice/
│       │   │   ├── VoiceStatus.tsx     # Voice agent status panel
│       │   │   ├── Transcription.tsx   # Live transcription display
│       │   │   └── CallControls.tsx    # Take over / mute controls
│       │   ├── simulation/
│       │   │   ├── SimDashboard.tsx    # Training mode dashboard
│       │   │   ├── ScenarioSelect.tsx  # Scenario picker
│       │   │   ├── ScoreCard.tsx       # Performance scoring
│       │   │   └── Debrief.tsx         # Post-scenario analysis
│       │   ├── reports/
│       │   │   ├── DailyReport.tsx     # Daily report view
│       │   │   ├── MonthlyReport.tsx   # Monthly intelligence view
│       │   │   └── PredictiveMap.tsx   # Heatmap prediction overlay
│       │   └── shared/
│       │       ├── SeverityBadge.tsx   # Color-coded severity indicator
│       │       ├── LoadingSpinner.tsx
│       │       └── Modal.tsx
│       │
│       ├── hooks/
│       │   ├── useWebSocket.ts        # WebSocket connection hook
│       │   ├── useIncidents.ts        # Incident state management
│       │   └── useAuth.ts             # Authentication hook
│       │
│       ├── stores/
│       │   ├── incidentStore.ts       # Zustand incident store
│       │   ├── cameraStore.ts         # Camera feed store
│       │   └── authStore.ts           # Auth state store
│       │
│       ├── services/
│       │   ├── api.ts                 # Axios API client
│       │   └── socket.ts             # Socket.io client
│       │
│       ├── types/
│       │   ├── incident.ts            # Incident type definitions
│       │   ├── event.ts               # Event type definitions
│       │   └── simulation.ts          # Simulation type definitions
│       │
│       └── utils/
│           ├── severity.ts            # Severity color/label mapping
│           └── formatters.ts          # Date, time, score formatters
│
├── data/                              # Data directory
│   ├── knowledge_base/               # RAG documents
│   │   ├── sops/                     # Security SOPs (markdown/PDF)
│   │   │   ├── unauthorized_access.md
│   │   │   ├── medical_emergency.md
│   │   │   ├── bomb_threat.md
│   │   │   ├── fire_evacuation.md
│   │   │   ├── active_shooter.md
│   │   │   ├── unattended_baggage.md
│   │   │   └── crowd_management.md
│   │   ├── contacts/                 # Emergency contact directories
│   │   │   └── changi_contacts.json
│   │   ├── regulations/             # Regulatory guidelines
│   │   │   └── icao_sarps_summary.md
│   │   └── locations/               # Location-specific data
│   │       └── changi_zones.json
│   ├── simulations/                  # Training scenario data
│   │   ├── scenarios/               # Scenario JSON templates
│   │   │   ├── SIM_001.json
│   │   │   ├── SIM_002.json
│   │   │   └── ...
│   │   ├── frames/                  # Synthetic video frames
│   │   ├── audio/                   # Synthetic audio clips
│   │   └── logs/                    # Synthetic log data
│   ├── demo/                        # Demo video/audio files
│   │   ├── sample_cctv_normal.mp4
│   │   ├── sample_cctv_anomaly.mp4
│   │   ├── sample_distress_call.wav
│   │   └── sample_alarm.wav
│   └── chroma/                      # ChromaDB persistent storage
│
├── models/                           # Pre-trained model weights
│   ├── anomalib/                    # Anomalib model checkpoints
│   ├── panns/                       # PANNs Cnn14 weights
│   ├── clap/                        # CLAP model weights
│   └── whisper/                     # Whisper model cache
│
├── notebooks/                        # Jupyter notebooks (Colab-ready)
│   ├── 01_anomalib_training.ipynb    # Train/evaluate anomaly detection
│   ├── 02_panns_inference.ipynb      # Audio classification demo
│   ├── 03_clap_zero_shot.ipynb       # CLAP zero-shot demo
│   ├── 04_rag_indexing.ipynb         # Document embedding pipeline
│   ├── 05_fusion_demo.ipynb          # Multimodal fusion demonstration
│   └── 06_full_pipeline.ipynb        # End-to-end pipeline demo
│
├── scripts/
│   ├── setup.sh                      # One-command setup script
│   ├── seed_db.py                    # Seed database with demo data
│   ├── index_knowledge.py            # Index all documents into ChromaDB
│   ├── download_models.py            # Download all model weights
│   └── generate_demo_data.py         # Generate synthetic demo data
│
└── docs/
    ├── ARCHITECTURE.md                # Architecture deep-dive
    ├── API.md                         # API documentation
    ├── DEPLOYMENT.md                  # Deployment guide
    └── DEMO_GUIDE.md                 # 5-minute demo script
```

---

## 15. Data Models & Schemas

### 15.1 Core Database Models (PostgreSQL)

```python
# Incident Model
class Incident(Base):
    __tablename__ = "incidents"
    
    id: str                       # UUID
    created_at: datetime
    updated_at: datetime
    status: str                   # "active", "investigating", "resolved", "false_alarm"
    severity_level: int           # 1-5
    confidence: str               # "LOW", "MEDIUM", "HIGH"
    severity_score: float         # 0.0-1.0
    
    # Location
    terminal: str
    zone: str
    location_id: str              # Knowledge graph key
    
    # AI Assessment
    explanation: str              # LLM-generated situation explanation
    recommendations: JSON         # Ranked action list
    contacts: JSON                # Relevant emergency contacts
    
    # Modalities involved
    has_video: bool
    has_audio: bool
    has_log: bool
    has_sensor: bool
    
    # Resolution
    resolved_at: datetime | None
    resolution_notes: str | None
    response_time_seconds: int | None
    actions_taken: JSON | None
    resolved_by: str | None       # User ID
    
    # Relations
    events: List[Event]           # All raw events in this incident
    transfers: List[Transfer]     # Handoff history


# Event Model
class Event(Base):
    __tablename__ = "events"
    
    id: str                       # UUID
    incident_id: str | None       # FK to Incident
    timestamp: datetime
    modality: str                 # "video", "audio", "log", "sensor"
    source_id: str                # Camera ID, mic ID, door ID, etc.
    event_type: str               # "visual_anomaly", "scream", "door_alarm", etc.
    anomaly_score: float
    
    # Modality-specific data
    data: JSON                    # Full event payload (varies by modality)
    
    # File references
    frame_path: str | None
    heatmap_path: str | None
    audio_path: str | None


# Simulation Session Model
class SimulationSession(Base):
    __tablename__ = "simulation_sessions"
    
    id: str
    user_id: str
    scenario_id: str
    started_at: datetime
    completed_at: datetime | None
    
    # Scoring
    total_score: int | None
    response_time_seconds: int | None
    actions_taken: JSON | None
    debrief: str | None           # LLM-generated feedback
    
    # Difficulty
    difficulty: str               # "beginner", "intermediate", "advanced"
```

---

## 16. API Contracts

### 16.1 REST API Endpoints

```
Authentication
  POST   /api/auth/login           # Login, returns JWT
  POST   /api/auth/refresh         # Refresh token
  POST   /api/auth/logout          # Invalidate session

Incidents
  GET    /api/incidents            # List incidents (filterable, paginated)
  GET    /api/incidents/:id        # Get incident details
  PATCH  /api/incidents/:id        # Update incident (status, notes, actions)
  POST   /api/incidents/:id/transfer  # Transfer to another user

Events
  GET    /api/events               # List raw events
  POST   /api/events/ingest        # Manually ingest an event (for testing)

Voice Agent
  POST   /api/voice/start          # Start voice agent for a call
  POST   /api/voice/takeover/:id   # SOC takes over a call
  POST   /api/voice/end/:id        # End a call
  GET    /api/voice/active         # List active calls

Simulation
  GET    /api/simulation/scenarios       # List available scenarios
  POST   /api/simulation/start           # Start a training session
  POST   /api/simulation/action          # Submit an action during simulation
  POST   /api/simulation/end             # End session, get score
  GET    /api/simulation/history         # Past session scores

Reports
  GET    /api/reports/daily/:date        # Get daily report
  GET    /api/reports/monthly/:month     # Get monthly report
  POST   /api/reports/generate           # Trigger report generation
  GET    /api/reports/predictions        # Get predictive heatmap data

Cameras
  GET    /api/cameras                    # List all cameras
  GET    /api/cameras/:id/feed           # Get camera feed URL
  GET    /api/cameras/:id/frames         # Get recent extracted frames

System
  GET    /api/health                     # Health check
  GET    /api/models/status              # ML model status
```

### 16.2 WebSocket Events

```
Client → Server:
  subscribe:incidents         # Subscribe to incident updates
  subscribe:camera:CAMERA_ID  # Subscribe to specific camera events
  subscribe:voice             # Subscribe to voice agent updates
  action:incident             # Take action on an incident

Server → Client:
  incident:new                # New incident created
  incident:update             # Incident updated (status, severity, etc.)
  incident:resolved           # Incident resolved
  voice:call_started          # New call received
  voice:transcription         # Real-time transcription chunk
  voice:alert                 # Voice agent raised an alert
  voice:handoff               # Call transferred to SOC
  simulation:event            # Simulation event triggered
  simulation:score            # Simulation score update
```

---

## 17. Deployment & Infrastructure

### 17.1 Docker Compose (Development & Demo)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://aegis:aegis@postgres:5432/aegis
      - REDIS_URL=redis://redis:6379
      - LLM_PROVIDER=${LLM_PROVIDER:-groq}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: aegis
      POSTGRES_USER: aegis
      POSTGRES_PASSWORD: aegis
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
```

### 17.2 Environment Variables (.env.example)

```bash
# LLM Configuration (set ONE provider)
LLM_PROVIDER=groq                    # claude | openai | groq | ollama
GROQ_API_KEY=gsk_xxxxx
CLAUDE_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
OLLAMA_BASE_URL=http://localhost:11434/v1

# Database
DATABASE_URL=postgresql://aegis:aegis@localhost:5432/aegis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_MINUTES=60

# ML Models
ANOMALIB_MODEL=efficient_ad          # efficient_ad | patchcore | padim
WHISPER_MODEL=large-v3               # tiny | base | small | medium | large-v3
VIDEO_FPS=2                          # Frames per second to process
ANOMALY_THRESHOLD=0.5                # Anomaly score threshold

# Voice Agent
TTS_ENGINE=kokoro                    # kokoro | edge_tts
VOICE_AGENT_LANGUAGE=en              # Default language

# Paths
DATA_DIR=./data
MODELS_DIR=./models
```

### 17.3 One-Command Setup

```bash
# Clone and run
git clone https://github.com/yourteam/aegis.git
cd aegis
cp .env.example .env
# Edit .env with your API keys
make setup    # Installs dependencies, downloads models, seeds DB
make run      # Starts all services via docker-compose
# Open http://localhost:3000
```

---

## 18. Demo Scenarios & Simulation Data

### 18.1 Five-Minute Demo Script

For the NAISC Grand Finals (5-minute live demo cap):

**Minute 0:00–0:30 — Introduction**
- Show AEGIS dashboard in normal monitoring mode
- Briefly explain split-screen layout: left = data, right = intelligence

**Minute 0:30–1:30 — Scenario 1: Medical Emergency (Severity 3)**
- Trigger simulated intercom call: "Someone collapsed in Terminal 2!"
- Show: Voice agent answers, transcribes in real-time, identifies medical emergency
- Show: Alert raised on dashboard, camera feed pulls up relevant area
- Show: Right panel shows situation explanation + recommended actions (dispatch medical team, guide caller through basic checks)
- Demonstrate: Click "TAKE OVER" to show seamless SOC handoff

**Minute 1:30–3:00 — Scenario 2: Unauthorized Access (Severity 4)**
- Trigger multi-modal incident: door alarm + video anomaly + access log failure
- Show: Fusion engine correlates 3 modalities, assigns HIGH confidence
- Show: Heatmap highlighting anomalous region in video frame
- Show: RAG retrieves relevant SOP, LLM generates ranked recommendations
- Show: One-click action buttons (Dispatch, Alert APD, Lock Down)
- Show: Contact cards with relevant phone numbers

**Minute 3:00–4:00 — Training Simulation**
- Switch to Training mode
- Select a pre-built scenario
- Show: Synthetic incident plays out
- Demonstrate: Officer makes response decisions
- Show: Real-time scoring and post-scenario debrief with AI feedback

**Minute 4:00–4:30 — Reporting & Predictions**
- Show: Auto-generated daily report summary
- Show: Predictive heatmap (high-risk zones highlighted for next 24 hours)
- Show: Monthly trend analysis with security assignment recommendations

**Minute 4:30–5:00 — Remote Access & Handoff**
- Show: Transfer incident to another user with one click
- Show: Mobile-responsive view
- Closing: Emphasise human-in-the-loop philosophy, Mozart-complementary positioning

### 18.2 Demo Data Package

The repo includes pre-built demo data:

| Asset | Description | Location |
|---|---|---|
| Normal CCTV footage | 30s clip of normal airport corridor | `data/demo/sample_cctv_normal.mp4` |
| Anomaly CCTV footage | 30s clip with person in restricted area | `data/demo/sample_cctv_anomaly.mp4` |
| Distress call audio | Simulated intercom call (medical emergency) | `data/demo/sample_distress_call.wav` |
| Alarm audio | Fire alarm sound clip | `data/demo/sample_alarm.wav` |
| Access logs (normal) | 1 hour of normal access events | `data/demo/access_logs_normal.json` |
| Access logs (anomaly) | Events including unauthorized attempts | `data/demo/access_logs_anomaly.json` |
| Pre-indexed knowledge base | Security SOPs, contacts, locations | `data/chroma/` (pre-built) |
| 20 scenario templates | Training simulation scenarios | `data/simulations/scenarios/` |

---

## 19. Development Phases & Milestones

### Phase 1: Foundation (Days 1–3)

- [ ] Set up repository structure and Docker environment
- [ ] Implement FastAPI backend skeleton with health check
- [ ] Set up PostgreSQL + Redis + ChromaDB
- [ ] Implement LLM provider abstraction (configurable backend)
- [ ] Build React frontend shell with split-screen layout
- [ ] Implement WebSocket infrastructure (socket.io)
- [ ] JWT authentication system

### Phase 2: Core AI Pipeline (Days 4–7)

- [ ] Integrate Anomalib (EfficientAD) — video anomaly detection
- [ ] Integrate PANNs (Cnn14) — audio classification
- [ ] Integrate CLAP — zero-shot audio queries
- [ ] Integrate Whisper — speech-to-text
- [ ] Build multimodal fusion engine
- [ ] Implement severity scoring and incident creation

### Phase 3: Intelligence Layer (Days 8–10)

- [ ] Write and embed security SOP documents
- [ ] Build RAG pipeline (embed → retrieve → prompt → respond)
- [ ] Implement response recommendation engine
- [ ] Build knowledge graph (location → camera → sensor → SOP mapping)
- [ ] Connect RAG output to dashboard right panel

### Phase 4: Voice Agent (Days 11–13)

- [ ] Implement Whisper STT streaming pipeline
- [ ] Implement Kokoro/Edge TTS for voice responses
- [ ] Build conversation manager with LLM backbone
- [ ] Implement alert raising and SOC handoff logic
- [ ] Build voice agent UI panel in dashboard

### Phase 5: Dashboard & UX (Days 14–16)

- [ ] Complete left panel: camera feeds, heatmaps, audio waveforms, sensor timeline
- [ ] Complete right panel: situation card, action list, contacts, history
- [ ] Incident list with priority sorting and filtering
- [ ] Implement action buttons (dispatch, call, alert, lock)
- [ ] Transfer/share functionality

### Phase 6: Training & Reporting (Days 17–19)

- [ ] Build scenario template loader and synthetic event generator
- [ ] Implement training mode UI with scenario selection
- [ ] Build scoring engine and debrief generation
- [ ] Implement daily report generator
- [ ] Implement monthly intelligence summary
- [ ] Build predictive heatmap (simple time-series model)

### Phase 7: Polish & Demo (Days 20–21)

- [ ] Prepare demo data package
- [ ] Record demo video for slides
- [ ] Write README with setup instructions
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Mobile responsive adjustments

---

## 20. Evaluation Metrics

### 20.1 Technical Metrics

| Metric | Target | Measurement |
|---|---|---|
| Video anomaly detection latency | < 500ms per frame | Anomalib inference time |
| Audio classification latency | < 200ms per 10s clip | PANNs inference time |
| Fusion → recommendation latency | < 3 seconds | End-to-end from detection to dashboard update |
| Voice agent response latency | < 2 seconds | STT + LLM + TTS pipeline |
| Dashboard real-time update | < 500ms | WebSocket event propagation |
| Concurrent incidents handled | 10+ | Load testing |

### 20.2 Quality Metrics

| Metric | Target | Measurement |
|---|---|---|
| Anomaly detection precision | > 85% | On demo dataset |
| Response recommendation relevance | > 90% | Human evaluation (judge panel) |
| Voice agent conversation quality | Natural, helpful | Qualitative assessment |
| SOP retrieval accuracy | > 90% | Top-5 retrieval hits correct SOP |

### 20.3 Hackathon Judging Criteria (Anticipated)

| Criterion | How AEGIS Addresses It |
|---|---|
| Technical Innovation | Multimodal fusion with cross-modal knowledge graph; autonomous voice agent with SOC handoff |
| Practical Applicability | Designed specifically for Changi Airport operations; aligns with Certis/Mozart ecosystem |
| Working Demo | Full split-screen dashboard with live AI inference, voice agent, and training simulator |
| Architecture Quality | Modular microservices, LLM-agnostic, event-driven, well-documented |
| Future Potential | Predictive intelligence, officer training platform, scalable to any critical infrastructure |

---

## 21. Future Enhancements

### 21.1 Short-Term (Post-Hackathon)

- **Multi-language voice agent:** Support Mandarin, Malay, Tamil (Singapore's official languages) + major tourist languages
- **Real CCTV integration:** RTSP stream ingestion with GPU-accelerated inference
- **Mozart API integration:** Direct data feed from Mozart's OPINET and Edge Intelligence engines
- **Mobile app:** Native iOS/Android app for patrol officers with push notifications
- **Facial recognition integration:** (With appropriate privacy safeguards and regulatory compliance) for VIP detection, missing persons

### 21.2 Medium-Term

- **Federated learning:** Train anomaly models across multiple sites without sharing sensitive footage
- **Digital twin:** 3D model of airport with real-time incident overlay
- **Autonomous robot coordination:** Integrate with Certis' Crystal/Oscar robots and FieldAI autonomy stack via Mozart
- **Advanced NLP:** Sentiment analysis on social media for crowd mood prediction around airport events
- **Regulatory compliance engine:** Automated CAAS/ICAO compliance checking against incident responses

### 21.3 Long-Term Vision

- **Cross-site intelligence network:** AEGIS instances at multiple Certis-managed properties sharing anonymised threat patterns
- **Predictive pre-deployment:** AI recommends security force deployment BEFORE incidents based on pattern prediction
- **Autonomous security perimeter:** Full integration with drones, robots, and smart barriers for autonomous perimeter response (human-approved)

---

## 22. Appendix

### 22.1 Key Open-Source Repositories

| Library | URL | Purpose |
|---|---|---|
| Anomalib | github.com/open-edge-platform/anomalib | Video anomaly detection |
| PANNs | github.com/qiuqiangkong/audioset_tagging_cnn | Audio classification |
| CLAP | github.com/LAION-AI/CLAP | Zero-shot audio classification |
| Whisper | github.com/openai/whisper | Speech-to-text |
| faster-whisper | github.com/SYSTRAN/faster-whisper | Optimised Whisper inference |
| Kokoro-82M | huggingface.co/hexgrad/Kokoro-82M | Text-to-speech |
| ChromaDB | github.com/chroma-core/chroma | Vector database |
| FAISS | github.com/facebookresearch/faiss | Vector similarity search |
| LangChain | github.com/langchain-ai/langchain | RAG orchestration |
| sentence-transformers | github.com/UKPLab/sentence-transformers | Document embeddings |
| UCF-Crime | github.com/WaqasSultani/AnomalyDetection | Crime video dataset |

### 22.2 Sample SOP Document (for RAG Embedding)

```markdown
# SOP: Unauthorized Access to Restricted Area

## Severity: HIGH (Level 4)

## Trigger Conditions
- Access control system logs a failed authentication at a restricted zone entry
- Visual detection of person in area without visible credentials
- Motion sensor activated in restricted area during non-operational hours

## Immediate Actions (in order)
1. Verify via nearest CCTV camera — confirm visual of unauthorized individual
2. Dispatch nearest patrol team to intercept (do NOT approach alone)
3. Notify Shift Commander
4. If airside: Notify Airport Police Division (APD) duty officer immediately
5. If individual is cooperative: verify identity, escort to appropriate area
6. If individual is non-cooperative or threatening: maintain safe distance,
   await APD, cordon area

## Do NOT
- Engage physically unless there is immediate danger to life
- Trigger full terminal evacuation (disproportionate for single individual)
- Use public address system to announce (avoid panic)

## Escalation Criteria
- Individual is armed or makes threats → Severity 5 (CRITICAL), APD + SPF
- Individual has accessed aircraft or runway → Severity 5, full protocol
- Multiple unauthorized individuals → Severity 5, potential coordinated breach

## Contacts
- APD Duty Officer: +65 6XXX XXXX
- Shift Commander: via radio channel 4
- CAG Security Ops: +65 6XXX XXXX

## Resolution
- Document: time of detection, response time, individual identity (if established),
  actions taken, resolution
- File incident report within 2 hours
- Review CCTV footage for 30 minutes prior to incident (check for accomplices)
```

### 22.3 Knowledge Graph Schema (changi_zones.json sample)

```json
{
  "T2_GATE_B4": {
    "name": "Terminal 2, Gate B4",
    "terminal": "T2",
    "floor": "L2",
    "zone_type": "airside_gate",
    "security_level": 3,
    "cameras": [
      {"id": "T2_GATE_B4_CAM12", "type": "fixed", "resolution": "1080p"},
      {"id": "T2_GATE_B4_CAM13", "type": "ptz", "resolution": "4K"}
    ],
    "sensors": [
      {"id": "T2_GATE_B4_MOTION", "type": "motion"},
      {"id": "T2_GATE_B4_DOOR", "type": "door_contact"}
    ],
    "intercoms": ["T2_INTERCOM_GATE_B4"],
    "access_points": [
      {"id": "T2_GATE_B4_DOOR", "required_clearance": 3}
    ],
    "nearest_responders": [
      {"team": "T2_PATROL_TEAM_B", "avg_response_seconds": 120},
      {"team": "T2_MEDICAL_POST", "avg_response_seconds": 180}
    ],
    "sop_tags": [
      "unauthorized_access", "tailgating", "unattended_baggage",
      "medical_emergency", "aggressive_behavior"
    ],
    "adjacent_zones": ["T2_GATE_B3", "T2_GATE_B5", "T2_CORRIDOR_B"]
  }
}
```

### 22.4 LLM Prompt Templates

**Response Recommendation Prompt:**

```
You are AEGIS, an AI security advisor for airport operations.

INCIDENT CONTEXT:
{incident_json}

RETRIEVED SECURITY PROCEDURES:
{retrieved_sops}

LOCATION CONTEXT:
{location_data}

HISTORICAL SIMILAR INCIDENTS:
{similar_incidents}

Based on the above, provide:

1. SITUATION ASSESSMENT (2-3 sentences explaining what is happening and why
   it requires attention)

2. RECOMMENDED ACTIONS (ranked by priority, 3-5 actions):
   For each action:
   - Clear directive (what to do)
   - Reasoning (why this action)
   - Estimated impact
   - Required personnel/resources

3. DO NOT (1-2 things to explicitly avoid doing)

4. ESCALATION CRITERIA (when to escalate to higher severity)

5. RELEVANT CONTACTS (from the location data)

Respond in structured JSON format.
Keep recommendations proportionate to the severity level.
Never recommend lethal force unless there is an imminent threat to life.
Always prioritize de-escalation.
```

**Training Debrief Prompt:**

```
You are a security training evaluator. An officer just completed a
simulation scenario. Evaluate their performance.

SCENARIO:
{scenario_json}

OPTIMAL RESPONSE:
{optimal_response}

OFFICER'S ACTIONS:
{officer_actions}

OFFICER'S RESPONSE TIME: {response_time_seconds} seconds

Provide a debrief that includes:
1. SCORE BREAKDOWN (response time, action quality, escalation accuracy)
2. WHAT WENT WELL (positive reinforcement)
3. AREAS FOR IMPROVEMENT (constructive, specific)
4. KEY LEARNING POINTS
5. OVERALL ASSESSMENT (1 paragraph)

Be encouraging but honest. Focus on actionable improvements.
```

---

## End of PRD

*This document provides complete context for any developer or AI assistant to understand, build, and deploy AEGIS. Every module, API endpoint, data model, prompt template, and architectural decision is documented. Clone the repo, follow the setup instructions, and build an award-winning multimodal security response advisor.*

**Project Codename:** AEGIS
**Mission:** See. Hear. Understand. Respond.
**For:** NAISC 2026 Grand Finals — Certis Challenge Track
