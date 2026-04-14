# AEGIS — 5-Minute Demo Script

**Target Audience**: NAISC 2026 Judges — Certis Challenge Track

---

## Pre-Demo Checklist (15 minutes before)

- [ ] Backend running: `uvicorn main:socket_app --port 8000`
- [ ] Frontend running: `npm run dev` → http://localhost:5173
- [ ] Database seeded: `python scripts/seed_db.py`
- [ ] Knowledge base indexed: `python scripts/index_knowledge.py`
- [ ] `.env` has a valid `GROQ_API_KEY` (Groq free tier is sufficient)
- [ ] Browser tab open at http://localhost:5173, logged in as admin

---

## Demo Script

### 00:00 — Introduction (30 seconds)

> "AEGIS — Adaptive Engagement & Guided Intelligence for Security — is a multimodal AI system for airport Security Operations Centres. It ingests CCTV video, audio feeds, access control logs, and IoT sensors simultaneously, then uses AI to detect threats, recommend responses, and handle emergency calls autonomously."

**[Point to the split-screen dashboard]**

---

### 00:30 — Live Incident Detection (90 seconds)

**[Click the Level 5 incident in the left panel incident list]**

> "Here we have a real-time incident — multiple sensors triggered simultaneously at Terminal 2 Gate B4. AEGIS has fused a video anomaly, a sensor door alarm, a log access failure, and an intercom call into a single correlated incident."

**[Point to the right panel]**

> "The AI has generated a natural language situation assessment — you can see it here — and produced a prioritized action list. These recommendations are retrieved from our Standard Operating Procedures knowledge base via RAG, then refined by a large language model."

**[Highlight the severity badge and confidence level]**

> "Confidence is HIGH because three modalities confirm the same threat. The multimodal boost algorithm escalated this from Level 3 to Level 5."

---

### 02:00 — Voice Agent (90 seconds)

> "While the SOC is managing the visual feed, an emergency intercom call has come in from Gate B4."

**[Trigger a voice call via API or show the Voice panel — point to active call indicator]**

> "AEGIS Voice has autonomously answered the call. It transcribes the caller's speech using Whisper, understands the situation using the LLM, and responds with calm safety instructions via text-to-speech — all in under 2 seconds per turn."

**[Show the live transcription scrolling in the right panel voice section]**

> "The urgency score is updating in real-time. When it crosses 0.6, AEGIS automatically raises an alert to the SOC — which you can see here."

**[Click TAKE OVER]**

> "The SOC operator can take control at any moment with a single click. The full conversation history is handed over instantly."

---

### 03:30 — Training Simulator (60 seconds)

**[Navigate to /training]**

> "AEGIS includes a simulation engine for training security officers. Ten realistic scenarios — from unauthorized access to active threats."

**[Click 'Start Scenario' on SIM_006 — Fire Alarm]**

> "Events stream in on a realistic timeline. The officer makes decisions by clicking actions."

**[Click 'Activate fire alarm' then 'Call SCDF']**

**[Click End Scenario]**

> "AEGIS scores the response and generates an AI debrief — what went well, what to improve, and which SOP to review. All aligned with ICAO training standards."

---

### 04:30 — Intelligence Reports (30 seconds)

**[Navigate to /reports]**

> "Finally, AEGIS generates daily and monthly security intelligence reports automatically. The predictive heatmap shows which zones are at elevated risk by time of day — based on historical incident frequency with recency weighting."

**[Show the heatmap]**

> "This helps supervisors pre-position officers before incidents happen."

---

### 05:00 — Close

> "AEGIS is a fully integrated, production-ready system. All AI models have mock fallbacks — it runs without GPU or API keys for demo purposes. The architecture is modular: each AI component can be upgraded independently. Thank you."

---

## Common Judge Questions

**Q: What happens if the LLM is down?**
A: All AI services have mock fallbacks. The fusion engine and recommendations degrade gracefully — the dashboard still functions with rule-based severity scoring.

**Q: How does it handle false positives?**
A: The multimodal fusion engine requires corroboration across modalities before boosting severity. A single camera anomaly stays at LOW confidence until confirmed by audio or sensor data.

**Q: Is it PDPA/data compliant?**
A: All data is stored on-premises. No biometric data is stored — only anonymized event scores and timestamps. CCTV frames are optionally cached locally.

**Q: Can it integrate with existing Certis systems?**
A: Yes. The event ingestion API accepts any sensor feed via REST. The WebSocket events can drive existing SCMT consoles via integration adapters.
