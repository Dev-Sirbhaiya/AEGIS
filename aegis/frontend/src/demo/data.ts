import type { Incident } from '../types/incident';
import type { Scenario } from '../types/simulation';

export interface DemoCamera {
  camera_id: string;
  location_id: string;
  terminal: string;
  zone: string;
  location_name: string;
}

export const demoCameras: DemoCamera[] = [
  {
    camera_id: 'CAM_T2_B4_01',
    location_id: 'T2_GATE_B4',
    terminal: 'T2',
    zone: 'airside',
    location_name: 'Gate B4 Airside Entry',
  },
  {
    camera_id: 'CAM_T3_ARR_03',
    location_id: 'T3_ARRIVAL_HALL',
    terminal: 'T3',
    zone: 'public',
    location_name: 'Terminal 3 Arrival Hall Retail Cluster',
  },
  {
    camera_id: 'CAM_T1_ROW_G_02',
    location_id: 'T1_CHECKIN_ROW_G',
    terminal: 'T1',
    zone: 'public',
    location_name: 'Terminal 1 Check-in Row G',
  },
];

const now = new Date();

export const demoIncidents: Incident[] = [
  {
    id: 'INC_DEMO_001',
    created_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
    status: 'active',
    severity_level: 5,
    severity_score: 0.94,
    confidence: 'HIGH',
    terminal: 'T2',
    zone: 'airside',
    location_id: 'T2_GATE_B4',
    explanation:
      'Multimodal alert: door alarm, CCTV anomaly, and access-control failure indicate a likely unauthorized airside access attempt at Gate B4.',
    recommendations: [
      {
        priority: 1,
        action: 'Dispatch Patrol Team Alpha to T2 Gate B4 immediately',
        reasoning: 'Unauthorized person may still be inside a restricted zone.',
        who: 'SOC Operator',
      },
      {
        priority: 2,
        action: 'Lock down Gate B4 via SCMT',
        reasoning: 'Prevents further airside access until identity is verified.',
        who: 'SOC Operator',
      },
      {
        priority: 3,
        action: 'Notify APD duty officer',
        reasoning: 'High-severity access breach requires police coordination.',
        who: 'Shift Supervisor',
      },
    ],
    contacts: [
      { name: 'APD', role: 'Airport Police Division', phone: '6542-7777' },
      { name: 'Patrol Alpha', role: 'Nearest patrol unit', phone: 'Channel 1' },
    ],
    has_video: true,
    has_audio: true,
    has_log: true,
    has_sensor: true,
    actions_taken: [],
  },
  {
    id: 'INC_DEMO_002',
    created_at: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
    status: 'investigating',
    severity_level: 4,
    severity_score: 0.83,
    confidence: 'HIGH',
    terminal: 'T3',
    zone: 'public',
    location_id: 'T3_ARRIVAL_HALL',
    explanation:
      'Smoke alarm and CCTV confirmation suggest a contained fire event in the retail cluster with crowd panic beginning to spread.',
    recommendations: [
      {
        priority: 1,
        action: 'Activate fire response and notify SCDF / ARFF',
        reasoning: 'Fire response requires immediate multi-agency mobilization.',
        who: 'SOC Operator',
      },
      {
        priority: 2,
        action: 'Issue controlled evacuation announcement',
        reasoning: 'Passenger movement needs to remain orderly to avoid bottlenecks.',
        who: 'Public Address Officer',
      },
    ],
    contacts: [
      { name: 'SCDF', role: 'Civil Defence Force', phone: '995' },
      { name: 'ARFF', role: 'Aircraft Rescue & Fire Fighting', phone: '6595-6118' },
    ],
    has_video: true,
    has_audio: true,
    has_log: false,
    has_sensor: true,
    actions_taken: [],
  },
  {
    id: 'INC_DEMO_003',
    created_at: new Date(now.getTime() - 52 * 60 * 1000).toISOString(),
    status: 'resolved',
    severity_level: 3,
    severity_score: 0.61,
    confidence: 'MEDIUM',
    terminal: 'T1',
    zone: 'public',
    location_id: 'T1_CHECKIN_ROW_G',
    explanation:
      'Unattended baggage remained in place for over 25 minutes before owner tracing was completed.',
    recommendations: [
      {
        priority: 1,
        action: 'Cordon area and review nearby CCTV',
        reasoning: 'Standard unattended-item procedure.',
        who: 'Patrol Team Delta',
      },
    ],
    contacts: [{ name: 'APD BDU', role: 'Bomb Disposal Unit', phone: '6542-7777' }],
    has_video: true,
    has_audio: false,
    has_log: false,
    has_sensor: true,
    resolved_at: new Date(now.getTime() - 28 * 60 * 1000).toISOString(),
    resolution_notes: 'Owner identified and item cleared after secondary screening.',
    response_time_seconds: 420,
    actions_taken: ['Cordon established', 'CCTV reviewed', 'Owner traced'],
  },
  {
    id: 'INC_DEMO_004',
    created_at: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
    status: 'active',
    severity_level: 2,
    severity_score: 0.42,
    confidence: 'LOW',
    terminal: 'T4',
    zone: 'public',
    location_id: 'T4_CHECKIN',
    explanation:
      'Lift breakdown reported at T4 check-in level. A passenger has activated the intercom. No injury reported. AEGIS Voice agent is triaging.',
    recommendations: [
      { priority: 1, action: 'Dispatch maintenance team to T4 lift lobby', reasoning: 'Mechanical fault requires on-site assessment.', who: 'Facilities Manager' },
      { priority: 2, action: 'Notify lift passengers via PA system', reasoning: 'Passengers inside require reassurance and instructions.', who: 'SOC Operator' },
    ],
    contacts: [{ name: 'Facilities', role: 'T4 Maintenance', phone: '6595-4200' }],
    has_video: false, has_audio: true, has_log: false, has_sensor: true,
    actions_taken: [],
  },
  {
    id: 'INC_DEMO_005',
    created_at: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
    status: 'active',
    severity_level: 3,
    severity_score: 0.67,
    confidence: 'MEDIUM',
    terminal: 'JEWEL',
    zone: 'public',
    location_id: 'JEWEL_L1',
    explanation:
      'Crowd density at Jewel Level 1 Rain Vortex observation area has exceeded safe threshold. Sensor data indicates a surge consistent with flight arrival clustering. Risk of crowd crush at the viewing barrier.',
    recommendations: [
      { priority: 1, action: 'Deploy crowd management officers to Jewel L1 barrier zone', reasoning: 'Density >4 pax/m² at barrier detected.', who: 'Patrol Team Charlie' },
      { priority: 2, action: 'Activate PA advisory directing visitors to alternate viewing areas', reasoning: 'Redistribute crowd flow before pressure becomes unsafe.', who: 'SOC Operator' },
    ],
    contacts: [{ name: 'Jewel Security', role: 'On-site Supervisor', phone: 'Channel 3' }],
    has_video: true, has_audio: false, has_log: false, has_sensor: true,
    actions_taken: [],
  },
  {
    id: 'INC_DEMO_006',
    created_at: new Date(now.getTime() - 72 * 60 * 1000).toISOString(),
    status: 'resolved',
    severity_level: 4,
    severity_score: 0.79,
    confidence: 'HIGH',
    terminal: 'T3',
    zone: 'airside',
    location_id: 'T3_GATE_C1',
    explanation:
      'Drone intrusion detected over T3 airside apron. ATC notified. Drone identified as rogue commercial unit, operator traced and detained by APD within 12 minutes.',
    recommendations: [],
    contacts: [{ name: 'ATC', role: 'Air Traffic Control', phone: '6595-6000' }],
    has_video: true, has_audio: false, has_log: true, has_sensor: true,
    resolved_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    resolution_notes: 'Drone operator identified and detained. Airspace cleared.',
    response_time_seconds: 180,
    actions_taken: ['ATC notified', 'APD deployed', 'Operator detained'],
  },
];

export const demoScenarios: Scenario[] = [
  {
    scenario_id: 'SIM_001',
    title: 'Unauthorized Airside Access',
    difficulty: 'beginner',
    severity_level: 4,
    duration_minutes: 5,
    description:
      'An individual is detected attempting to access an airside gate without authorization. Multiple systems trigger alerts in quick succession.',
    events_timeline: [
      {
        time_offset_seconds: 0,
        modality: 'sensor',
        event: {
          type: 'door_alarm',
          source_id: 'DOOR_T2_B4_MAIN',
          location_id: 'T2_GATE_B4',
          anomaly_score: 0.7,
          details: 'Door forced open at Gate B4.',
        },
      },
      {
        time_offset_seconds: 8,
        modality: 'video',
        event: {
          type: 'visual_anomaly',
          source_id: 'CAM_T2_B4_01',
          location_id: 'T2_GATE_B4',
          anomaly_score: 0.82,
          details: 'Unknown individual detected in airside zone without visible ID.',
        },
      },
      {
        time_offset_seconds: 15,
        modality: 'log',
        event: {
          type: 'access_control_failure',
          source_id: 'ACL_T2_B4',
          location_id: 'T2_GATE_B4',
          anomaly_score: 0.75,
          details: 'Badge 77421 denied: no airside clearance.',
        },
      },
    ],
    optimal_response: {
      primary_action: 'dispatch patrol to T2_GATE_B4',
      secondary_action: 'lock down Gate B4 via SCMT',
      do_not: 'Do not unlock the gate until identity is confirmed.',
      escalation: 'If the individual flees or is unidentified, escalate to Level 5 and notify APD.',
      expected_response_time_seconds: 30,
    },
    scoring_rubric: {
      response_time_30s: 10,
      response_time_60s: 7,
      response_time_90s: 4,
      correct_primary_action: 30,
      correct_secondary_action: 20,
      appropriate_escalation: 20,
      no_over_reaction: 10,
      communication_quality: 10,
    },
  },
  {
    scenario_id: 'SIM_006',
    title: 'Fire Alarm - Terminal 3 Retail',
    difficulty: 'intermediate',
    severity_level: 4,
    duration_minutes: 6,
    description:
      'A fire alarm has been triggered in a Terminal 3 retail outlet. Smoke is visible on CCTV and passengers are beginning to panic.',
    events_timeline: [
      {
        time_offset_seconds: 0,
        modality: 'sensor',
        event: {
          type: 'fire_alarm',
          source_id: 'SMOKE_T3_ARR_01',
          location_id: 'T3_ARRIVAL_HALL',
          anomaly_score: 0.8,
          details: 'Smoke detector activated near the retail cluster.',
        },
      },
      {
        time_offset_seconds: 5,
        modality: 'video',
        event: {
          type: 'smoke_detected',
          source_id: 'CAM_T3_ARR_03',
          location_id: 'T3_ARRIVAL_HALL',
          anomaly_score: 0.85,
          details: 'Visible smoke rising from the outlet on CCTV.',
        },
      },
      {
        time_offset_seconds: 15,
        modality: 'audio',
        event: {
          type: 'crowd_panic',
          source_id: 'CAM_T3_ARR_04',
          location_id: 'T3_ARRIVAL_HALL',
          anomaly_score: 0.75,
          details: 'Shouting and rapid crowd movement detected in the arrival hall.',
        },
      },
    ],
    optimal_response: {
      primary_action: 'activate fire alarm and notify SCDF via 995 and ARFF simultaneously',
      secondary_action: 'use PA system to announce evacuation using code Red',
      do_not: 'Do not use lifts during evacuation and do not say fire on public PA.',
      escalation: 'If fire spreads beyond the initial zone, escalate to Level 5 and begin full terminal evacuation.',
      expected_response_time_seconds: 20,
    },
    scoring_rubric: {
      response_time_30s: 10,
      response_time_60s: 7,
      response_time_90s: 4,
      correct_primary_action: 30,
      correct_secondary_action: 20,
      appropriate_escalation: 20,
      no_over_reaction: 10,
      communication_quality: 10,
    },
  },
  {
    scenario_id: 'SIM_008',
    title: 'Crowd Surge - Mass Flight Cancellation',
    difficulty: 'intermediate',
    severity_level: 3,
    duration_minutes: 5,
    description:
      'Multiple delayed flights have been cancelled at once and congestion is building near rebooking counters.',
    events_timeline: [
      {
        time_offset_seconds: 0,
        modality: 'log',
        event: {
          type: 'operations_alert',
          source_id: 'OPS_T1_GATE_CLUSTER',
          location_id: 'T1_TRANSIT_REBOOK',
          anomaly_score: 0.64,
          details: 'Three outbound flights cancelled within 10 minutes.',
        },
      },
      {
        time_offset_seconds: 6,
        modality: 'video',
        event: {
          type: 'crowd_density_rising',
          source_id: 'CAM_T1_REBOOK_02',
          location_id: 'T1_TRANSIT_REBOOK',
          anomaly_score: 0.7,
          details: 'Passenger queue length increasing rapidly.',
        },
      },
      {
        time_offset_seconds: 12,
        modality: 'audio',
        event: {
          type: 'agitation_detected',
          source_id: 'MIC_T1_REBOOK_01',
          location_id: 'T1_TRANSIT_REBOOK',
          anomaly_score: 0.55,
          details: 'Raised voices and repeated complaints detected near counters.',
        },
      },
    ],
    optimal_response: {
      primary_action: 'dispatch crowd management team to T1_TRANSIT_REBOOK',
      secondary_action: 'issue queue guidance and coordinate airline ground staff support',
      do_not: 'Do not allow unmanaged crowding around exit routes.',
      escalation: 'Escalate if queue spillover blocks circulation or passengers become aggressive.',
      expected_response_time_seconds: 45,
    },
    scoring_rubric: {
      response_time_30s: 10,
      response_time_60s: 7,
      response_time_90s: 4,
      correct_primary_action: 30,
      correct_secondary_action: 20,
      appropriate_escalation: 20,
      no_over_reaction: 10,
      communication_quality: 10,
    },
  },
];

// Demo voice call for T4 lift breakdown
export const demoVoiceCall = {
  call_id: 'CALL_DEMO_001',
  source_id: 'INTERCOM_T4_LIFT_3',
  location_id: 'T4_CHECKIN',
  status: 'active' as const,
  started_at: new Date(now.getTime() - 45 * 1000).toISOString(),
  urgency_score: 0.35,
  alert_raised: false,
};

export const demoTranscriptions = [
  { role: 'caller' as const, text: "Hello? Is anyone there? The lift has stopped and the doors won't open. There are three of us inside.", timestamp: new Date(now.getTime() - 42 * 1000).toISOString() },
  { role: 'agent'  as const, text: "AEGIS Voice responding. Please remain calm — I've registered your location at T4 Level 2 Lift 3. Help is on the way. Is anyone injured?", timestamp: new Date(now.getTime() - 38 * 1000).toISOString() },
  { role: 'caller' as const, text: "No, no injuries. But it's getting warm in here. My elderly mother is with me. How long will this take?", timestamp: new Date(now.getTime() - 33 * 1000).toISOString() },
  { role: 'agent'  as const, text: "Understood. Maintenance has been notified and a team is en route — estimated arrival under 5 minutes. There is a ventilation grill above you. Stay close to the door and keep the phone line open.", timestamp: new Date(now.getTime() - 28 * 1000).toISOString() },
];

// Camera media fallback map: camera_id → { video_url, audio_url }
export const DEMO_MEDIA_MAP: Record<string, { video_url: string; audio_url: string }> = {
  CAM_T2_B4_01:      { video_url: '/media/videos/terminal_corridor.mp4', audio_url: '/media/audio/terminal_crowd.wav'  },
  CAM_T3_ARR_03:     { video_url: '/media/videos/arrival_hall.mp4',      audio_url: '/media/audio/terminal_crowd.wav'  },
  CAM_T1_ROW_G_02:   { video_url: '/media/videos/rolling_corridor.mp4',  audio_url: '/media/audio/departures_hall.wav' },
};

export const demoDailyReport = {
  date: new Date().toISOString().slice(0, 10),
  executive_summary: 'Security posture at Changi Airport remained elevated today with one critical incident at T2 Gate B4 resolved through rapid multimodal detection and coordinated APD response. Four additional incidents were managed within SLA. Predictive analysis indicates continued elevated risk at T3 arrival zones during peak hours (0800–1100, 1800–2100).',
  metrics: {
    total_incidents: 6,
    resolved_count: 2,
    active_count: 3,
    avg_response_time_seconds: 145,
    false_positive_rate: 0.08,
  },
  patterns_observed: [
    'Crowd surge events correlating with SQ/TR flight arrival clusters at T3',
    'Repeated access control anomalies at T2 Gate B4 between 02:00–04:00 (3 events in 7 days)',
    'Lift breakdown intercom calls elevated at T4 — maintenance review recommended',
  ],
  tomorrow_watchpoints: [
    'Morning peak 0700–0900: T3 Arrival Hall crowd density — pre-position 2 additional officers',
    'Night shift 0200–0400: T2 Gate B4 door sensors — increase patrol frequency',
  ],
};

export const demoMonthlyReport = {
  executive_summary:
    'March incident patterns suggest a stable overall posture with elevated volatility in high-traffic public areas and a persistent need for rapid response to multimodal anomalies.',
  incident_analysis: {
    by_severity: {
      2: 8,
      3: 19,
      4: 11,
      5: 3,
    },
  },
  threat_landscape: {
    threat_level_assessment: 'Moderate with localized spikes tied to public-area congestion and access-control exceptions.',
    primary_threats: ['Unauthorized access', 'Crowd surge', 'Fire response readiness'],
    emerging_concerns: ['Intercom misuse during disruptions', 'Exit-point congestion'],
  },
  strategic_recommendations: [
    {
      priority: 'High',
      recommendation: 'Tighten response drills for access-control anomalies at airside transition points.',
      rationale: 'These incidents drive the highest composite severity scores.',
    },
    {
      priority: 'Medium',
      recommendation: 'Expand crowd-flow signage and queue marshaling support near rebooking zones.',
      rationale: 'Passenger agitation rises quickly when circulation is not managed.',
    },
  ],
};

export const demoPredictions = [
  { location_id: 'T2_GATE_B4', hour: 18, risk_score: 0.72 },
  { location_id: 'T2_GATE_B4', hour: 19, risk_score: 0.84 },
  { location_id: 'T2_GATE_B4', hour: 20, risk_score: 0.77 },
  { location_id: 'T3_ARRIVAL_HALL', hour: 12, risk_score: 0.55 },
  { location_id: 'T3_ARRIVAL_HALL', hour: 13, risk_score: 0.68 },
  { location_id: 'T3_ARRIVAL_HALL', hour: 14, risk_score: 0.62 },
  { location_id: 'T1_TRANSIT_REBOOK', hour: 16, risk_score: 0.59 },
  { location_id: 'T1_TRANSIT_REBOOK', hour: 17, risk_score: 0.74 },
  { location_id: 'T1_TRANSIT_REBOOK', hour: 18, risk_score: 0.66 },
];
