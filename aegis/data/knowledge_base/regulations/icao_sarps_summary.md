# ICAO Standards and Recommended Practices (SARPs) — Aviation Security Summary

## Source: ICAO Annex 17 — Security: Safeguarding International Civil Aviation Against Acts of Unlawful Interference

This document summarizes key ICAO SARPs applicable to airport security operations, specifically as they pertain to the AEGIS system's operational context at Changi International Airport.

---

## 1. Access Control (Chapter 4)

**Standard 4.1**: Each Contracting State shall establish measures to prevent unauthorized access to airside areas, including the movement area, safety-critical areas, and facilities serving aircraft.

**Standard 4.2**: All persons and their belongings entering security restricted areas shall be subjected to security controls prior to entry.

**Key Requirements**:
- Identity verification for all airside personnel (photo ID + valid clearance)
- Electronic access control systems with audit logging
- Dual-authentication for critical infrastructure areas (ATC, fuel stores, cargo)
- Background checks for all security-cleared personnel, renewed annually
- Immediate revocation of access upon termination or security concern

**AEGIS Application**: Access control anomalies (failed badge scans, tailgating) must generate real-time alerts. All access events must be logged with timestamp, badge ID, and outcome for 12-month retention.

---

## 2. Screening of Passengers and Baggage (Chapter 4)

**Standard 4.3**: All departing passengers and their cabin baggage shall be screened prior to boarding an aircraft on an international flight.

**Standard 4.4**: Checked baggage shall be screened by X-ray or other comparable means; positive matching of baggage to passengers required.

**Key Requirements**:
- 100% screening of departing passengers
- Prohibited items list enforcement (ICAO Doc 8973 Chapter 4)
- Random additional screening protocols
- ETD (Explosive Trace Detection) for random and selected passengers

**AEGIS Application**: Screening anomalies (alarm triggers, ETD positives, X-ray flags) are classified as Level 3+ events requiring immediate officer response. Unresolved alarms cannot permit passenger boarding.

---

## 3. Response Protocols (Chapter 4 & 5)

**Standard 5.1**: Each Contracting State shall establish an Airport Security Programme specifying response procedures for acts of unlawful interference.

**Recommended Practice 5.2**: Airports should conduct security exercises simulating acts of unlawful interference at intervals not exceeding 2 years.

**Key Requirements**:
- Documented incident response procedures (SOPs) for all threat types
- Coordination protocols between airport security, police, and civil aviation authority
- Crisis communication procedures including media management
- Mandatory occurrence reporting to CAAS within 24 hours of any security incident

**AEGIS Application**: All Level 3+ incidents automatically trigger SOP retrieval and recommendation generation. The system logs response actions for regulatory compliance reporting.

---

## 4. Incident Reporting Requirements

**Standard**: Security incidents at internationally-designated airports must be reported to the national aviation authority (Singapore: CAAS) under the following timelines:

| Incident Type | Reporting Timeline |
|---|---|
| Hijacking or attempted seizure of aircraft | Immediate (within 1 hour) |
| Unlawful interference with aircraft | Within 4 hours |
| Unauthorized airside access resulting in breach | Within 4 hours |
| Bomb threat (credible) | Immediate |
| Drone incursion (affecting flight operations) | Within 4 hours |
| Security screening failure (item passed undetected) | Within 24 hours |

**AEGIS Application**: The reporting module automatically generates draft occurrence reports for operator review when a Level 4+ incident is logged and resolved.

---

## 5. Use of Technology in Aviation Security

ICAO encourages the adoption of:
- **Automated surveillance systems** for perimeter and airside monitoring
- **Biometric identity verification** at access control points
- **AI-assisted screening** (algorithm-assisted image analysis for X-ray)
- **Integrated security information management systems** for multi-modal correlation

ICAO Doc 9985 (Manual on the Use of Advanced Technology in Security Screening) specifically endorses the integration of video analytics, audio detection, and access control correlation — the core architecture of AEGIS.

---

## 6. Training Requirements

**Standard**: Security personnel shall receive initial and recurrent training in accordance with a national training programme.

**Required training topics**:
- Human factors in aviation security
- Recognition of prohibited items
- Emergency response and evacuation procedures
- Communication and reporting protocols

**AEGIS Application**: The AEGIS Training Module supports simulation-based security training (SIM_001–SIM_010) aligned with ICAO-recommended exercise formats, with automated scoring and debrief generation.

---

*Reference: ICAO Annex 17, 11th Edition (2020). ICAO Doc 8973 (Security Manual), 10th Edition. Civil Aviation Authority of Singapore Airport Security Programme.*
