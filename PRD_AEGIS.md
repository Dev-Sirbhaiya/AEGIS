# AEGIS - Product Requirements Document

**Version:** 2.0
**Date:** 2026-04-17
**Baseline:** Current shipped state on `main`
**Competition:** NAISC 2026 Grand Finals - Certis Challenge Track

---

## 1. Executive Summary

AEGIS (Adaptive Engagement & Guided Intelligence for Security) is a multimodal security response advisor for airport Security Operations Centres.

It is designed to help security officers and supervisors interpret incidents faster by combining CCTV, audio, access-control, and sensor context into a single decision-support workflow. The product uses retrieval-augmented intelligence and an LLM to explain situations, recommend proportionate responses, support voice triage, run scenario-based training, and surface reporting insights.

The current `main` branch is optimized for two things:

- a clear operator experience
- a reliable 5-minute demo experience

---

## 2. Problem Statement

Airport SOC teams face a recurring set of operational problems:

- too many alerts with too little context
- fragmented information across video, audio, logs, and sensors
- high-pressure decision-making with little time to interpret ambiguous events
- limited training opportunities for repeatable scenario response practice
- weak continuity between live incidents, learning, and reporting

Traditional orchestration systems can route workflows and unify feeds, but they often leave the operator to interpret what is happening and decide what to do next.

AEGIS addresses that gap by acting as an explainable, human-in-the-loop intelligence layer.

---

## 3. Target Users

### 3.1 Primary User: SOC Operator

Needs:

- fast situational awareness
- readable incident context
- clear recommended next steps
- easy movement between live monitoring and follow-up action

### 3.2 Secondary User: SOC Supervisor

Needs:

- oversight of active incidents
- confidence in operator decisions
- access to summaries, trends, and historical context

### 3.3 Training User: Security Trainer or Team Lead

Needs:

- repeatable scenarios
- measurable response performance
- post-scenario debriefing

### 3.4 Demo/Judging Audience

Needs:

- an understandable end-to-end story
- visible multimodal intelligence
- a stable product experience even under partial infrastructure failure

---

## 4. Product Goals

### 4.1 Core Goals

- Fuse multimodal inputs into a single operator-facing incident workflow
- Generate explainable, proportionate recommendations aligned with SOP-style guidance
- Support voice/intercom triage as part of the incident workflow
- Reinforce best practices through scenario-based simulation and debriefing
- Present all of the above in a clean, readable interface

### 4.2 Demo Goals

- Run locally on a standard development machine
- Degrade gracefully when hosted dependencies are unavailable
- Show meaningful activity within a 5-minute finals/demo window

---

## 5. Non-Goals

AEGIS does not currently aim to be:

- a fully autonomous real-world dispatch system
- a replacement for existing airport orchestration/control systems
- a production-hardened nationwide deployment platform

The current product is best described as a human-in-the-loop security response advisor with agentic elements, not a fully autonomous field-response platform.

---

## 6. Current Scope on Main

The current shipped implementation includes:

- authenticated dashboard access with seeded `admin / admin`
- live SOC dashboard for incidents, media context, explanation, and actions
- Socket.IO-based real-time behavior for incidents, simulations, and action acknowledgements
- voice workflow support for emergency/intercom interaction
- training simulator with scenario playback, scoring, and debrief
- report views for daily, monthly, and predictive insights
- demo-safe fallbacks for local and judging scenarios

Recent main-branch updates also include:

- a readability-first light UI instead of the older dark cinematic concept
- `Public Sans` as the primary interface font
- `JetBrains Mono` reserved for data and numerical displays
- user-controlled homepage scrolling
- faster training event feeds, now compressed to a 3 to 5 second cadence

---

## 7. Functional Requirements

### 7.1 Multimodal Incident Understanding

The product must:

- ingest and represent CCTV, audio, access, and sensor context
- correlate signals into a unified incident view
- expose severity, confidence, and modality context to the operator

### 7.2 Response Guidance

The product must:

- generate a readable situation assessment
- produce prioritized recommended actions
- keep the operator in control of action choice

### 7.3 Voice Triage

The product must:

- support emergency/intercom call handling
- transcribe speech
- generate contextual voice responses
- allow operator takeover

### 7.4 Training

The product must:

- allow scenario selection
- stream incident events over time
- capture officer actions
- score the response
- generate a debrief

### 7.5 Reporting

The product must:

- show daily summaries
- show monthly trends
- surface predictive/high-risk patterns

---

## 8. UX Requirements

### 8.1 Readability First

The current UX direction prioritizes:

- strong text contrast
- low visual strain
- reduced decorative styling
- clearer spacing and hierarchy

### 8.2 Operator Flow

An operator should be able to:

1. sign in or enter demo mode
2. review active incidents on the dashboard
3. inspect media and explanation context
4. acknowledge or discuss recommended actions
5. move to training or reports without leaving the product shell

### 8.3 Demo Flow

A presenter should be able to:

1. show the dashboard
2. show the training simulator
3. show reports
4. complete the story within a short presentation window

---

## 9. Technical and Runtime Requirements

### 9.1 Recommended Local Development Mode

The preferred local path is:

1. backend run locally from `backend`
2. frontend run locally from `frontend`
3. SQLite for local development
4. Groq or Ollama for LLM usage

### 9.2 Runtime Conventions

- local backend entrypoint: `uvicorn main:app`
- local backend port for frontend proxying: `8001`
- frontend dev port: `5173`
- local backend env file: `backend/.env`
- Docker Compose env file: root `.env`

### 9.3 Optional Container Path

Docker Compose remains supported for full-stack runs, but it is no longer the default recommendation for everyday Windows development.

---

## 10. Success Criteria

The current product should be judged successful when it can:

- display a coherent incident workflow from multimodal input to operator guidance
- show explainable recommendations rather than raw alerts alone
- demonstrate a usable training simulation with scoring and debrief
- remain usable in demo conditions with fallbacks
- communicate clearly to both operators and judges

---

## 11. Known Boundaries

Current limitations and honest framing:

- some controls are still dashboard/demo interactions rather than deep real-world integrations
- the system is decision-support first
- Docker support exists, but local development is smoother in the local backend + local frontend mode
- the product is optimized for clarity and demo reliability, not for claiming operational autonomy

---

## 12. Documentation Alignment Notes

Any documentation derived from this PRD should reflect the current product state by:

- describing the UI as readability-first, not dark-cinematic
- mentioning the user-controlled scrolling dashboard layout
- mentioning the compressed 3 to 5 second training event cadence
- using `main:app` as the backend entrypoint
- documenting the local frontend/backend pairing as `5173` and `8001`

---

## 13. Summary

AEGIS on the current `main` branch is a stronger, clearer, and more demo-ready product than the earlier concept build. Its differentiation comes from combining multimodal security context, explainable guidance, voice workflow support, training, and reporting in one operator-facing system that remains human-in-the-loop.
