# Smart Public Service CRM (PS-CRM)
## Final Product Requirements Document
**Version:** 2.0 (Hackathon-Ready) | **Date:** March 2026 | **Status:** Final

---

## 1. Executive Summary

PS-CRM is a **citizen-facing, mobile-first platform** enabling residents to report local civic issues — garbage overflow, broken streetlights, potholes, water supply failures, sanitation hazards, illegal construction, and public safety concerns — and track them to resolution.

Municipal officials and field officers receive actionable data, automated routing, SLA management, and analytics dashboards to make government services measurably more responsive.

> **Vision:** Every citizen reports a civic problem in under 60 seconds. Verified resolution arrives within the municipality's SLA window. Full transparency throughout.

> **Hackathon Positioning:** "AI-Powered Civic Intelligence & SLA Enforcement Platform" — not a full government operating system. Architecture is microservice-ready, deployed as a modular monolith for demo.

---

## 2. Success Metrics & KPIs

| KPI | Definition | Target (12 months) |
|-----|-----------|-------------------|
| MTTA | Mean Time to Assignment | < 4 hours |
| MTTR | Mean Time to Resolution | < 72 hours (standard) |
| SLA Compliance Rate | % complaints resolved within category SLA | > 80% |
| Verification Rate | % complaints verified | > 60% |
| Reopen Rate | % complaints reopened after closure | < 10% |
| False Report Rate | % complaints marked spam after verification | < 5% |
| Citizen Satisfaction | Post-resolution survey score (1–5) | > 4.0 |

---

## 3. User Personas

| Persona | Primary Goals |
|---------|--------------|
| Verified Citizen | Quick reporting, real-time tracking, assured resolution |
| Pseudonymous Citizen | Report without exposing identity, basic outcome visibility |
| Volunteer Verifier | Contribute to neighborhood improvement, earn recognition |
| Field Officer | Efficient task list, GPS navigation, easy evidence upload |
| Department Admin | SLA oversight, load balancing, escalation management |
| City Analyst | Heatmaps, KPI tracking, policy-ready data export |

---

## 4. Authentication & Identity (Graded Trust)

### Authentication Tiers

| Tier | Method | Capabilities |
|------|--------|-------------|
| Tier 0 — Pseudonymous | Device fingerprint only | Submit complaint (low priority), no notifications |
| Tier 1 — Phone OTP | Mobile + SMS OTP | Full submission, notifications, escalation, reputation accrual |
| Tier 2 — Social Login | Google / Apple ID | Cross-device sync, same as Tier 1 |
| Tier 3 — eKYC (Future) | Government ID | **Conceptual only for v1** — "integration-ready identity layer"; not implemented in demo |

### UX Rules
- Default onboarding: phone OTP only — name + phone, nothing more
- eKYC is opt-in, positioned as a future phase expansion
- Pseudonymous users can upgrade existing complaints retroactively
- Privacy toggle: "Keep my identity private on the public dashboard"

### Session Management
- JWT access token (15-min TTL) + refresh token (30-day TTL)
- Web PWA: HttpOnly session cookies with CSRF protection
- Device fingerprinting (non-PII) for rate limiting and fraud heuristics

---

## 5. Core Feature Requirements

### 5.1 Complaint Submission
- 8 top-level categories with visual icons (Garbage, Streetlight, Pothole, Water, Sanitation, Construction, Safety, Other)
- Sub-category selection (e.g., Pothole → Road / Footpath / Bridge)
- GPS auto-location with interactive map pin; manual address fallback
- Media upload: up to 5 photos (max 10MB each) or 1 video (max 60s)
- Voice note: max 60 seconds, transcribed via speech-to-text API
- **AI-assisted category suggestion:** server-side image classifier suggests category — "Looks like a Pothole — confirm?" (on-device ML is a future optimization, not a demo claim)
- Optional description text (500 char max)
- Offline-capable: queue complaint locally, sync on reconnect

### 5.2 AI Priority Scoring (Core Demo Feature)
Each complaint receives a dynamic priority score combining:

```
priority_score = location_sensitivity + duplicate_count_weight + auth_trust + geo_match + image_confidence + report_history
```

**Location Sensitivity boost:** Higher score if complaint is near hospitals, schools, government buildings, or high-traffic zones.

**Duplicate detection boost:** Score increases when similar complaints are detected within 100m radius + same category + time proximity.

**Routing thresholds:**
- Score ≥ 0.75 → Fast-track to department (no human verification needed)
- Score 0.40–0.74 → Route to volunteer verifier within 24 hours
- Score < 0.40 → Field officer verification required; flagged for admin review

### 5.3 AI Duplicate Detection (Core Demo Feature)
- Text similarity analysis on complaint descriptions
- Location matching within 100m radius
- Time proximity analysis (complaints within same 6-hour window)
- On match: complaints are merged, original complainant notified, priority score boosted
- Prevents queue clutter and reduces administrative overhead

### 5.4 Tracking & Notifications
- Unique Complaint ID (e.g., CMP-2026-04821) with shareable public status URL
- Status timeline: Submitted → Verified → Assigned → In Progress → Resolved → Closed
- Push (FCM/APNs), SMS fallback, email (if provided)
- SLA deadline prominently displayed on complaint detail screen
- **No live officer location tracking** — replaced by milestone-based updates and GPS-verified proof upload (see Section 5.6)

### 5.5 Nearby Citizen Notification & Community Confirmation
- Citizens within 250m receive a real-time notification when a new complaint is posted nearby
- They can: confirm the issue, add evidence, or upvote (1 vote per user per complaint)
- Rate-limited to 3 confirmations per user per day
- Confirmations increase complaint credibility score and urgency weight
- Comment thread on complaints (verified Tier 1+ users only)

### 5.6 Escalation & Resolution
- SLA countdown monitored continuously
- T-24h: reminder to assigned officer and department admin
- T-0: auto-escalation to department head and city admin
- One-tap escalation for citizen when SLA is breached (with reason selector)
- Re-open complaint within 7 days if resolution is unsatisfactory
- Field officer proof upload: GPS-locked (cannot upload from > 150m from complaint pin) — this is the transparency mechanism replacing live tracking

### 5.7 Post-Resolution
- Citizen receives resolution notification with proof photo
- Satisfaction survey (1–5 stars + optional comment)
- **Shareable before/after card** generated as PNG (complaint photo + resolution photo + time taken) — styled as a civic achievement card for WhatsApp/Instagram sharing

---

## 6. Incentive & Reputation Model

### Philosophy
**Credits and reputation are earned only on verified resolution — not on submission.** This aligns user incentives with real outcomes and naturally filters spam.

### Reputation Scoring

| Event | Points Delta |
|-------|-------------|
| Complaint verified as genuine | +20 |
| Issue fully resolved | +30 |
| Volunteer verification completed | +15 |
| Witness confirmation (upvote on another's complaint) | +5 |
| Referral: friend files first verified report | +50 |
| Complaint marked false/spam | -30 |
| Complaint duplicate detected | -5 |
| Account suspended for abuse | Reset to 0 |

### Reward Tiers (Phased — Conceptual for Demo, Partner-Dependent)

| Tier | Credits | Examples | Phase |
|------|---------|---------|-------|
| Quick Wins | 50–100 | Free coffee, mobile recharge, queue priority token | Phase 2 (partner MoU required) |
| Meaningful | 150–300 | Fuel voucher, health checkup, civic plaque | Phase 3 |
| Prestige | 400–600 | City Citizen award nomination, legal aid session | Phase 3 |
| Community (pooled) | 1,000+ | Park bench, street mural, neighborhood Wi-Fi | Phase 4 |

> **Demo narrative:** Present rewards as "Phase 2 partner-based civic reward marketplace." Do not claim tax discounts, permit fast-tracks, or Aadhaar-linked benefits as implemented features — these require government MoU and legal clearance.

### Badges (Live in Demo)

| Badge | Criteria |
|-------|----------|
| 🌱 First Reporter | First verified complaint filed |
| 🔍 Verified Contributor | 5 complaints verified genuine |
| 🛠️ Problem Solver | 10 issues resolved in ward |
| 🦸 Neighborhood Hero | 25 verified reports, >90% accuracy |
| 🏆 Ward Champion | Top contributor in ward for 3 months |
| 🤝 Volunteer Star | 50 verifications completed |

### Penalties for Abuse
- 1st confirmed false report: warning + priority downgrade
- 2nd offense: 7-day complaint submission suspension
- 3rd offense: permanent account review

---

## 7. Verification Strategy

### Automated Checks (All in Demo)
1. **EXIF/GPS cross-check:** Flag discrepancies > 500m or > 2 hours between photo metadata and submitted location
2. **Duplicate cross-reference:** 100m radius + same category + time window
3. **ML image analysis:** Server-side category classifier + near-duplicate image detection
4. **Behavioural heuristics:** Flag accounts submitting > 10 complaints/hour or identical descriptions

### Volunteer Verification (Pilot Phase — Simulate in Demo)
- Nearest enrolled volunteer dispatched with checklist + photo requirement + GPS timestamp
- 10% of volunteer verifications randomly audited by officials
- Admin override capability retained for all volunteer verdicts
- **For hackathon demo:** Simulate this flow; position as pilot-phase extension, not a live feature

### Field Officer Verification
- For complaints with priority score < 0.40 or high-severity categories
- GPS-locked proof upload (cannot upload from > 150m of complaint pin)
- Creates immutable audit record

---

## 8. WhatsApp / Telegram Bot (Zero-Friction Entry)

Citizens can file without downloading the app:

```
User sends photo →
Bot: "Got it! Share your location?" [Location pin button]
Bot: "What best describes this?" [Pothole / Garbage / Water / Light / Other]
Bot: "Ticket #CMP-2026-04821 created ✅ Track here: [link]"
Bot: "Create a free account to earn Civic Credits → [link]"
```

This captures the 35–60 age segment least likely to install a new app. The tracking link is the conversion hook to full registration.

---

## 9. Data Model (Core Tables)

| Table | Key Fields |
|-------|-----------|
| `users` | id, phone, auth_level (0–3), reputation_score, is_volunteer, is_officer, is_admin, is_suspended |
| `complaints` | id, user_id (nullable), category, subcategory, description, status (enum), priority_score, lat, lng, sla_deadline, created_at, resolved_at |
| `attachments` | id, complaint_id, file_url, exif_gps_lat, exif_gps_lng, exif_timestamp, ml_label, ml_confidence, is_tampered |
| `departments` | id, name, category_list, ward_ids, sla_rules (jsonb), escalation_chain (jsonb) |
| `assignments` | id, complaint_id, assignee_id, assignee_role, status, resolution_notes, proof_url, proof_gps_lat, proof_gps_lng |
| `verifications` | id, complaint_id, verifier_id, type (auto/volunteer/officer), verdict, verified_at |
| `audit_log` | id, entity_type, entity_id, action, old_value, new_value, performed_by, timestamp |
| `reputation_events` | id, user_id, delta, event_type, reference_id |
| `escalations` | id, complaint_id, escalated_by, reason, level (1/2/3), escalated_at |
| `votes` | id, complaint_id, user_id |
| `comments` | id, complaint_id, user_id, body, is_deleted |

**DB:** PostgreSQL + PostGIS. Spatial GiST index on complaint location. For demo: single instance, no read replicas needed.

---

## 10. System Architecture (Demo-Realistic)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend — Citizen PWA | React 18 + Vite + Workbox | Mobile-first, offline-capable |
| Frontend — Officer App | React Native | GPS-locked photo, offline task sync |
| Frontend — Admin Dashboard | React + Recharts + Leaflet | Heatmap, KPIs, bulk operations |
| Backend | Node.js (modular monolith) | Microservice-ready by design; single deploy for demo |
| Auth | JWT + Phone OTP | 15-min access token, 30-day refresh |
| ML — Category Classifier | Python FastAPI + pre-trained EfficientNet-B2 | Server-side inference; category suggestion |
| ML — Tamper & Duplicate | pHash + text similarity | Near-duplicate image and description matching |
| Database | PostgreSQL 15 + PostGIS | Single instance for demo |
| Cache | Redis | OTP store, rate limiting, session cache |
| Object Store | S3-compatible (AWS S3 / MinIO) | Attachments with CDN |
| Notifications | FCM/APNs + Twilio SMS | Push + SMS fallback |
| Bot Integration | WhatsApp Business API / Telegram Bot API | Zero-friction complaint filing |

> **Do not claim in demo:** Kafka, multi-replica PostgreSQL, Elasticsearch, Kubernetes HPA, on-device ML. Say: "Architected to be microservice-ready and horizontally scalable."

---

## 11. SLA Configuration by Category

| Category | Default SLA | Escalation SLA | Emergency SLA |
|----------|-------------|----------------|---------------|
| Pothole (Road) | 72 hours | 48 hours | — |
| Pothole (Footpath) | 120 hours | 72 hours | — |
| Garbage Overflow | 24 hours | 12 hours | — |
| Streetlight Failure | 48 hours | 24 hours | — |
| Water Supply Failure | 24 hours | 8 hours | 4 hours |
| Sewage / Sanitation | 24 hours | 8 hours | 4 hours |
| Illegal Construction | 120 hours | 72 hours | — |
| Public Safety Hazard | 12 hours | 4 hours | 1 hour |

---

## 12. Security & Privacy

- TLS 1.3 + HSTS on all endpoints
- RBAC: citizen / volunteer / officer / dept_admin / city_admin / super_admin
- OTP brute-force: max 5 attempts, 15-min lockout
- Rate limiting: 60 req/min (unauthenticated), 200 req/min (authenticated)
- ClamAV malware scan on file uploads
- Append-only audit log (no deletes, no updates)
- PII encrypted at rest; phone number hashed in logs
- Public complaint feeds use deterministic pseudonyms in place of user IDs
- GDPR-aligned + India DPDP Act compliance
- Data residency: all data within national jurisdiction

---

## 13. Rollout Roadmap

| Phase | Name | Scope |
|-------|------|-------|
| Phase 0 | Discovery & Legal | Stakeholder interviews, legal review, municipal partner agreement, infra provisioning |
| Phase 1 — **Demo MVP** | Core Platform | Complaint submission, AI priority scoring, duplicate detection, nearby notifications, admin queue, basic heatmap, SLA countdown, WhatsApp bot, phone OTP auth |
| Phase 2 | Verification & Rewards | Volunteer verifier program, reputation system, Civic Credits, partner perk store (requires MoUs), eKYC-ready identity layer |
| Phase 3 | Scale & Analytics | Advanced analytics, predictive anomaly alerts, multilingual support, escalation automation, ward leaderboards |
| Phase 4 | Integrations | Municipal ERP connectors, IoT sensors, state-level federation, full credit economy activation |

---

## 14. Complaint Status State Machine

| Current Status | Trigger | Next Status |
|---------------|---------|-------------|
| Submitted | Auto (score pass) | Verified |
| Submitted | Auto (score fail) | Pending Verification |
| Pending Verification | Volunteer/Officer submits proof | Verified / Rejected |
| Verified | Department assignment created | Assigned |
| Assigned | Officer accepts task | In Progress |
| In Progress | Officer uploads GPS-locked proof | Resolved |
| Resolved | Citizen accepts / 7-day timeout | Closed |
| Resolved | Citizen disputes within 7 days | Reopened |
| Any | Admin audit | Rejected |

---

## 15. Open Questions (Unresolved)

1. Legal basis for eKYC in target jurisdiction — Aadhaar API access requires regulatory clearance
2. Municipal ERP systems for Phase 4 integration — API formats TBD
3. Government SMS gateway vs commercial provider (Twilio/MSG91)
4. Partner MoU requirements for incentive voucher program
5. Data retention mandate under local law for civic complaint records
6. Multi-language support requirement from Phase 1 vs Phase 3

---

*PS-CRM PRD v2.0 — Final | March 2026*