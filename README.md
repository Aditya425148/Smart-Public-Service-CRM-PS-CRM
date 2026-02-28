# Product Requirements Document
## Smart Public Service CRM (PS-CRM)
**Version:** 1.0 | **Date:** February 2026 | **Status:** Draft — For Internal Review
**Prepared for:** Product & Engineering Teams

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Success Metrics & KPIs](#2-success-metrics--kpis)
3. [User Personas & Journeys](#3-user-personas--journeys)
4. [Authentication, Identity & Graded Privacy](#4-authentication-identity--graded-privacy)
5. [Incentive Model](#5-incentive-model)
6. [Verification & Validation Strategy](#6-verification--validation-strategy)
7. [Feature Requirements](#7-feature-requirements)
8. [Data Model](#8-data-model)
9. [API Specification](#9-api-specification)
10. [System Architecture](#10-system-architecture)
11. [Security & Privacy](#11-security--privacy)
12. [Scalability & Reliability](#12-scalability--reliability)
13. [Testing & QA Strategy](#13-testing--qa-strategy)
14. [Rollout Roadmap](#14-rollout-roadmap)
15. [Governance & Operations](#15-governance--operations)
16. [Open Questions & Dependencies](#16-open-questions--dependencies)
17. [Appendix](#17-appendix)

---

## 1. Executive Summary

The **Smart Public Service CRM (PS-CRM)** is a citizen-facing, mobile-first platform that enables residents to report local civic issues — garbage overflow, broken streetlights, potholes, water supply failures, sanitation hazards, illegal construction, and public safety concerns — and track them to resolution. The system simultaneously provides municipal officials and field officers with actionable data, automated routing, SLA management, and analytics dashboards to make government services measurably more responsive and accountable.

> **Vision:** Every citizen should be able to report a civic problem in under 60 seconds and receive a verified resolution update — with full transparency — within the municipality's committed SLA window.

### 1.1 Problem Statement

Citizens currently have no reliable, low-friction channel to report local civic problems and receive verified follow-up. Existing mechanisms (phone hotlines, physical offices) are inaccessible to large segments of the population, lack transparent audit trails, and provide no data-driven accountability for government departments. This results in:

- Civic issues going unreported or unresolved for extended periods
- Citizens unable to track or escalate complaints
- Municipal departments lacking aggregated insight into problem hotspots and resource allocation
- Abuse through spam and false reports undermining system credibility

### 1.2 Goals and Non-Goals

**Goals**
- Reduce average time-to-report a civic complaint to under 60 seconds on mobile
- Achieve 80%+ SLA compliance rate within 12 months of full launch
- Provide verified complaint tracking with end-to-end audit trails
- Deliver actionable heatmaps and analytics to department administrators
- Build a trust layer (authentication, verification, reputation) to minimize spam
- Support multiple languages and low-bandwidth environments

**Non-Goals (v1.0)**
- Real-time municipal IoT sensor integration (Phase 4+)
- Monetary payment processing or direct government billing
- Cross-municipality federation or national portal integration
- AI-generated resolution suggestions for field officers (future ML roadmap)

---

## 2. Success Metrics & KPIs

| KPI | Definition | Target (12 months) | Tracking Method |
|-----|-----------|-------------------|----------------|
| MTTA | Mean Time to Assignment — from submission to department assignment | < 4 hours | DB analytics query |
| MTTR | Mean Time to Resolution — from submission to verified closure | < 72 hours (standard) | DB analytics query |
| SLA Compliance Rate | % complaints resolved within category SLA | > 80% | Admin dashboard |
| Verification Rate | % complaints verified by volunteer or field officer | > 60% | Verification table |
| Reopen Rate | % complaints reopened after initial closure | < 10% | Status change logs |
| User Retention (30d) | % registered users who file 2+ complaints in 30 days | > 35% | User event logs |
| False Report Rate | % complaints marked as false/spam after verification | < 5% | Admin dashboard |
| App Store Rating | Average rating across iOS and Android stores | > 4.2 / 5 | Store API |
| Citizen Satisfaction | Post-resolution survey score (1–5) | > 4.0 / 5 | In-app survey |
| Volunteer Fulfillment | % volunteer verification tasks completed within 24h | > 75% | Task assignment log |

---

## 3. User Personas & Journeys

### 3.1 Personas

| Persona | Description | Primary Goals | Pain Points |
|---------|-------------|--------------|-------------|
| Verified Citizen | Registered user (phone + optional eKYC), tech-comfortable, urban/semi-urban | Quick reporting, real-time tracking, assured resolution | Slow follow-up, no feedback loop |
| Pseudonymous Citizen | Privacy-conscious, may distrust government data usage, lower digital literacy | Report without exposing identity, basic outcome visibility | Fear of data misuse, complex UX |
| Volunteer Verifier | Community-engaged local resident, willing to do micro-tasks for recognition | Earn reputation/perks, contribute to neighborhood improvement | Unclear task scope, no compensation signal |
| Field Officer | Municipal staff assigned to verify or resolve complaints on-ground | Efficient task list, GPS navigation, easy evidence upload | Paper-heavy workflows, no digital trail |
| Department Admin | Department head or supervisor managing a team's complaint queue | SLA oversight, load balancing, escalation management | No unified view, manual reporting |
| City Analyst | Data/analytics role at municipal/state level monitoring trends | Heatmaps, KPI tracking, export for policy decisions | Fragmented data, no spatial analysis |

### 3.2 Primary User Journeys

**Journey 1 — Citizen Submits a Complaint**
1. Citizen opens app or PWA web interface
2. Selects complaint category from visual menu (pothole, garbage, water, etc.)
3. GPS auto-detects location; citizen adjusts pin if needed
4. Uploads photo/video; ML suggests category confirmation
5. Adds optional short description (voice note or text)
6. Submits; receives unique Complaint ID (e.g., CMP-2026-04821) via SMS + push
7. Receives acknowledgement with estimated SLA deadline

**Journey 2 — Verification Flow**
1. System performs automatic EXIF/GPS cross-check and image ML analysis
2. Risk score computed; high-trust complaints are fast-tracked to department
3. Medium-risk complaints dispatched to nearest available volunteer verifier
4. Volunteer visits location, completes checklist, uploads timestamped photo proof
5. Low-risk or high-stakes complaints assigned to field officer for official verification
6. Complaint status updated; citizen notified

**Journey 3 — Assignment & Resolution**
1. Verified complaint auto-routed to relevant department queue
2. Department admin reviews queue; system suggests assignment based on load and area
3. Field officer receives assignment notification with GPS navigation link
4. Officer resolves issue, uploads completion photo + official notes
5. Citizen receives resolution notification with proof
6. Citizen rates the resolution (1–5 stars) and adds feedback

**Journey 4 — SLA Breach & Escalation**
1. System monitors SLA countdown continuously
2. T-24h: reminder notification sent to assigned officer and department admin
3. T-0: auto-escalation to department head and city-level administrator
4. Optional: complaint gets boosted public visibility on dashboard
5. Escalated complaint tracked separately with higher-priority SLA

---

## 4. Authentication, Identity & Graded Privacy

### 4.1 Why Authentication Matters

Authentication enables: reliable two-way communication, reputation and accountability mechanisms, incentive delivery (vouchers, priority SLA), legal/administrative follow-up for safety hazards, and accurate fraud detection. However, the system must remain inclusive — authentication should be progressive and never fully gatekeeping for basic complaint submission.

### 4.2 Authentication Tiers

| Tier | Method | Trust Level | Capabilities |
|------|--------|-------------|--------------|
| Tier 0 — Pseudonymous | No account, device fingerprint only | Very Low | Submit complaint (low priority), no notifications, no escalation |
| Tier 1 — Phone OTP | Mobile number + SMS OTP | Low-Medium | Full complaint submission, push/SMS notifications, basic escalation, reputation accrual |
| Tier 2 — Social Login | Google / Apple ID (optional) | Medium | Faster onboarding, cross-device sync, same as Tier 1 capabilities |
| Tier 3 — eKYC Verified | Government ID, utility bill, or Aadhaar-style | High | Priority SLA, incentive eligibility, volunteer program access, legal escalation |

### 4.3 UX Rules for Authentication

- Default onboarding is phone OTP only. Require no more than name + phone
- eKYC is opt-in and triggered only when the user requests advanced perks or volunteer enrollment
- Show explicit benefit/trade-off text: *"Verify your ID to get 2x faster resolution and unlock rewards"*
- Allow pseudonymous users to 'upgrade' their existing complaints retroactively after verification
- Provide a clear privacy toggle: *"Keep my identity private on the public dashboard"*
- Implement progressive profiling: ask for email only when notifications or export is needed

### 4.4 Session & Token Management

- **Mobile:** JWT access token (15-min TTL) + refresh token (30-day TTL, stored securely in device keychain)
- **Web PWA:** HttpOnly session cookies; CSRF protection on all state-changing endpoints
- Device fingerprinting (non-PII) for fraud heuristics and rate limiting
- Force logout and token invalidation on password change or account suspension

---

## 5. Incentive Model

A sustainable incentive structure combining intrinsic motivation (civic pride, recognition) with targeted extrinsic rewards encourages genuine, high-quality reporting while minimizing abuse.

### 5.1 Intrinsic Incentives

- **Impact Visibility:** Citizens can see *"You reported 3 issues — 2 resolved in your neighborhood"* on their profile dashboard
- **Badges & Titles:** "Community Reporter" (5+ verified reports), "Civic Guardian" (20+ reports, >90% accuracy), "Volunteer Star" (50+ verifications)
- **Neighborhood Leaderboards:** Anonymous or pseudonymous leaderboards showing top 10 contributors per ward
- **Satisfaction Acknowledgements:** Official thank-you message shown after resolution with count of neighbors benefited

### 5.2 Extrinsic Incentives

- **Priority SLA:** Tier 3 (eKYC) users get 30% shorter SLA commitment and are first in the assignment queue
- **Partner Vouchers:** Occasional utility bill rebates or partner discounts for users with reputation > 500 points
- **Volunteer Perks:** Certificates of community service; priority access to municipality events
- **Neighborhood Micro-Grants:** Top wards (by complaint resolution cooperation score) receive small municipal improvement funds

### 5.3 Reputation Scoring

| Event | Points Delta | Notes |
|-------|-------------|-------|
| Complaint verified as genuine | +20 | After volunteer/officer verification |
| Complaint marked false/spam | -30 | After official audit |
| Volunteer verification completed | +15 | Quality-weighted by audit accuracy |
| Resolution rated 4–5 stars | +5 | Citizen closes complaint positively |
| Complaint duplicate detected | -5 | Mild penalty; could be honest mistake |
| Account suspended for abuse | Reset to 0 | With investigation record |

### 5.4 Penalties for False Reports

- Warning on first confirmed false report; temporary priority downgrade
- Second offense: 7-day suspension of complaint submission privileges
- Third offense: permanent account review; referral to municipal compliance
- Good-faith errors (wrong category, duplicate) incur minimal penalty to avoid chilling effect

---

## 6. Verification & Validation Strategy

### 6.1 Automated Digital Checks

1. **EXIF/GPS Verification:** Cross-check photo's embedded GPS coordinates and timestamp against the complaint location and submission time. Flag discrepancies > 500m or > 2 hours.
2. **Device Sensor Context:** Optionally collect cell-tower ID and Wi-Fi BSSID (opt-in) to corroborate location.
3. **ML Image Analysis:** Classify complaint category from photo. Detect image doctoring (clone-stamp, GAN artifacts). Detect near-duplicate images across complaints within 500m.
4. **Duplicate Cross-Reference:** Check against open complaints within 100m radius and same category. If duplicate found, merge and notify original complainant.
5. **Behavioural Heuristics:** Flag accounts submitting > 10 complaints per hour, > 5 within 100m in 10 minutes, or complaints with identical description text.

### 6.2 Risk Score Formula

```
risk_score = w1 × auth_score + w2 × geo_match + w3 × image_confidence + w4 × report_history_score
```

| Component | Weight | Range | Description |
|-----------|--------|-------|-------------|
| auth_score | w1 = 0.30 | 0–1 | Tier 0 = 0, Tier 1 = 0.5, Tier 2 = 0.7, Tier 3 = 1.0 |
| geo_match | w2 = 0.25 | 0–1 | EXIF GPS vs submitted GPS distance score |
| image_confidence | w3 = 0.25 | 0–1 | ML classifier confidence + tamper score |
| report_history_score | w4 = 0.20 | 0–1 | Normalized user reputation (capped at 1000 pts) |

**Routing thresholds:**
- `risk_score >= 0.75` → Fast-track to department assignment (no human verification)
- `risk_score 0.40–0.74` → Route to volunteer verifier within 24 hours
- `risk_score < 0.40` → Require field officer verification; flag for admin review

### 6.3 Crowdsourced Verification

- **Witness Confirmation:** Citizens within 250m can confirm/deny via 1-tap prompt. Rate-limited to 3 confirmations per user per day.
- **Volunteer Verifier Tasks:** App dispatches micro-task to nearest enrolled volunteer with checklist, photo requirement, and GPS timestamp.
- **Task Gamification:** Volunteers see a mini-map of open tasks near them with estimated walk time and reward points.

### 6.4 Field Officer Verification

- Assigned for complaints with `risk_score < 0.40` or high-severity categories (safety hazards, illegal construction)
- Officer app: GPS-locked proof upload (cannot upload from > 150m away from complaint pin)
- Official verification creates an immutable audit record signed with officer credentials

---

## 7. Feature Requirements

### 7.1 Citizen-Facing Features

#### 7.1.1 Complaint Submission
- Category selector: 8 top-level categories with visual icons (Garbage, Streetlight, Pothole, Water, Sanitation, Construction, Safety, Other)
- Sub-category selection (e.g., Pothole → Road / Footpath / Bridge)
- GPS auto-location with interactive map pin; fallback to manual address entry
- Media upload: up to 5 photos (max 10MB each) or 1 video (max 60s, max 50MB)
- Voice note: max 60 seconds transcribed to text via on-device or API speech-to-text
- ML-powered category suggestion: *"Looks like a Pothole — confirm?"*
- Optional description text field (500 char max)
- Offline-capable: queue complaint locally and sync when connectivity restores

#### 7.1.2 Tracking & Notifications
- Unique Complaint ID with shareable status URL (public, no auth needed to view status)
- Status timeline view: Submitted → Verified → Assigned → In Progress → Resolved → Closed
- Push notifications (FCM/APNs), SMS fallback, email (if provided)
- Estimated SLA deadline prominently displayed on complaint detail
- Post-resolution: satisfaction survey (1–5 stars + optional comment)

#### 7.1.3 Escalation & Appeal
- One-tap escalation button appears when SLA is breached
- Escalation reason selector (Still not fixed / Wrong resolution / Safety risk)
- Escalated complaint gets distinct tracking badge and notifies supervisor
- Re-open complaint within 7 days if resolution is unsatisfactory

#### 7.1.4 Community Features
- Public view: see all open complaints in a 1km radius on map view
- Upvote complaints (adds weight to urgency score; max 1 vote/user/complaint)
- Comment thread on complaints (verified users only)
- Neighborhood group pages: complaints, leaderboard, and resolution stats per ward

#### 7.1.5 Profile & History
- Personal complaint history with full audit trail per complaint
- Reputation badge and points display
- Notification preference settings
- Data download request (GDPR-style export as JSON/PDF)
- Account deletion with PII scrubbing confirmation

### 7.2 Official / Admin Features

#### 7.2.1 Department Queue & Routing
- Unified inbox sorted by category, area, priority, and SLA countdown
- Auto-routing rules: configurable by category, sub-category, geographic ward, and department
- Manual reassignment with reason log
- Batch operations: assign multiple complaints to same officer

#### 7.2.2 Field Officer Mobile App
- Task list with GPS map for navigation
- GPS-locked evidence upload: enforce photo taken at complaint location
- Offline task access: download task details before entering low-connectivity zones
- Status updates: In Transit → On Site → Resolved
- Internal notes visible only to team (not citizen)

#### 7.2.3 Admin Analytics Dashboard
- Heatmap: complaint density by category, status, and date range with ward-level drill-down
- SLA metrics: MTTA, MTTR, SLA compliance rate, breach count
- Team performance: complaints assigned/resolved per officer per week
- Verification metrics: volunteer fulfillment rate, false report rate
- Predictive alerts: spike detection (> 2x baseline complaints in 6h window)
- Data export: CSV and PDF reports; scheduled email delivery

#### 7.2.4 SLA Configuration
- Configurable SLA per category and sub-category (e.g., Pothole/Road: 48h, Safety Hazard: 4h)
- Escalation chain: officer → department head → city admin, with configurable time thresholds
- Public SLA visibility: citizens see the committed SLA for each category

#### 7.2.5 Volunteer Management
- Enrollment: application form, identity verification, code of conduct agreement
- Task assignment: automatic dispatch to nearest available volunteer
- Audit: random 10% of volunteer verifications reviewed by officials
- Volunteer dashboard: tasks completed, accuracy rate, earned reputation

---

## 8. Data Model

### 8.1 Core Tables

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | id, phone, email, display_name, auth_level (0–3), reputation_score, is_volunteer, is_officer, is_admin, created_at, last_login, is_suspended | Soft-delete; PII encrypted at rest |
| `complaints` | id, user_id (nullable), category, subcategory, description, status (enum), priority, lat, lng, address, risk_score, sla_deadline, created_at, updated_at, resolved_at | PostGIS GEOMETRY(Point) on lat/lng; status FSM enforced at API layer |
| `attachments` | id, complaint_id, uploader_id, file_url, mime_type, exif_gps_lat, exif_gps_lng, exif_timestamp, ml_label, ml_confidence, is_tampered | S3-compatible storage; URLs signed with 1h expiry |
| `departments` | id, name, category_list, ward_ids, sla_rules (jsonb), contact_points, escalation_chain (jsonb) | sla_rules: per-category SLA in minutes |
| `assignments` | id, complaint_id, assignee_id, assignee_role, assigned_at, accepted_at, status, resolution_notes, proof_url, proof_gps_lat, proof_gps_lng | proof_gps enforced by client + server |
| `verifications` | id, complaint_id, verifier_id, type (auto/volunteer/officer), verdict, notes, proof_url, verified_at | Immutable after verdict; admin override creates new row |
| `audit_log` | id, entity_type, entity_id, action, old_value (jsonb), new_value (jsonb), performed_by, ip_address, timestamp | Append-only; no deletes or updates |
| `reputation_events` | id, user_id, delta, event_type, reference_id, notes, created_at | Running sum maintained in users.reputation_score |
| `areas_geo` | id, name, level (ward/district/city), geometry (PostGIS POLYGON) | Used for routing rules and heatmap aggregation |
| `escalations` | id, complaint_id, escalated_by, escalated_to, reason, level (1/2/3), escalated_at, resolved_at | Tracks multi-level escalation chain |
| `votes` | id, complaint_id, user_id, created_at | Unique constraint on (complaint_id, user_id) |
| `comments` | id, complaint_id, user_id, body, created_at, is_deleted | Soft-delete; moderation flag |
| `surveys` | id, complaint_id, user_id, rating (1–5), feedback_text, submitted_at | One per complaint per user |

### 8.2 Storage & Indexing Strategy

- **Primary DB:** PostgreSQL 15+ with PostGIS extension for spatial queries
- **Spatial index:** GiST index on `complaints.location` for heatmap and radius queries
- **Full-text search:** `tsvector` index on `complaints.description`; Elasticsearch for heavy-load deployments
- **Time-series partitioning:** complaints table partitioned by month for query efficiency at scale
- **Attachment storage:** S3-compatible object store (AWS S3, MinIO, GCS) with CDN in front
- **Read replicas:** 2 read replicas for analytics and dashboard queries; primary for writes

---

## 9. API Specification

### 9.1 API Principles

- RESTful JSON API over HTTPS (TLS 1.3 minimum)
- GraphQL endpoint available for dashboard/analytics consumers
- Versioning: `/api/v1/` prefix; breaking changes increment major version
- Authentication: Bearer JWT in `Authorization` header for protected endpoints
- Rate limiting: 60 req/min per IP (unauthenticated); 200 req/min per user token
- All responses: `{ data, meta, errors }` envelope format

### 9.2 Citizen API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | None | Register with phone + OTP; returns user stub + access token |
| POST | `/api/v1/auth/otp/request` | None | Send OTP to phone number |
| POST | `/api/v1/auth/otp/verify` | None | Verify OTP; returns JWT pair |
| POST | `/api/v1/auth/refresh` | Refresh token | Rotate access token |
| POST | `/api/v1/complaints` | Tier 0+ | Submit new complaint (multipart/form-data with attachments) |
| GET | `/api/v1/complaints/{id}` | None | Fetch complaint status and timeline (public) |
| GET | `/api/v1/complaints?area={id}&status={s}&page={n}` | None | List complaints by area/status (public, paginated) |
| POST | `/api/v1/complaints/{id}/escalate` | Tier 1+ | Escalate a complaint; requires reason |
| POST | `/api/v1/complaints/{id}/reopen` | Tier 1+ | Reopen within 7 days of closure |
| POST | `/api/v1/complaints/{id}/vote` | Tier 1+ | Upvote; idempotent (one per user) |
| POST | `/api/v1/complaints/{id}/comments` | Tier 1+ | Add comment to complaint |
| GET | `/api/v1/users/me` | Tier 1+ | Fetch own profile, reputation, complaint history |
| PUT | `/api/v1/users/me` | Tier 1+ | Update profile settings |
| POST | `/api/v1/verifications` | Volunteer | Submit volunteer verification with proof |
| GET | `/api/v1/dashboard/heatmap?from=&to=&category=&ward=` | None | Aggregated GeoJSON heatmap tiles |
| GET | `/api/v1/dashboard/stats` | None | Public KPI summary (SLA, resolved counts) |

### 9.3 Admin API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/admin/complaints` | Admin | Full complaint queue with filters; includes PII |
| POST | `/api/v1/admin/assignments` | Admin | Create or update assignment |
| PUT | `/api/v1/admin/assignments/{id}` | Admin | Update assignment status or reassign |
| GET | `/api/v1/admin/analytics/kpis` | Admin | KPI metrics: MTTA, MTTR, SLA compliance |
| GET | `/api/v1/admin/analytics/heatmap/detailed` | Admin | Full-resolution heatmap with PII-linked data |
| POST | `/api/v1/admin/verifications/{id}/audit` | Admin | Official audit override of volunteer verdict |
| PUT | `/api/v1/admin/users/{id}/suspend` | Admin | Suspend user with reason |
| GET | `/api/v1/admin/volunteers` | Admin | List volunteers with task metrics |
| POST | `/api/v1/admin/sla/rules` | Admin | Create or update SLA rules per category |
| GET | `/api/v1/admin/reports/export?format={csv\|pdf}` | Admin | Generate and download periodic report |

---

## 10. System Architecture

### 10.1 Component Stack

| Layer | Component | Technology | Notes |
|-------|-----------|------------|-------|
| Frontend | Citizen PWA | React 18, Vite, Workbox | Mobile-first, offline-capable, WCAG 2.1 AA |
| Frontend | Field Officer App | React Native (iOS + Android) | GPS-locked photo, offline task sync |
| Frontend | Admin Dashboard | React + Recharts + Leaflet | Heatmap, KPI charts, bulk operations |
| API Gateway | Gateway / BFF | Kong or AWS API Gateway | Rate limiting, auth validation, routing |
| Services | Auth Service | Node.js / Express | JWT issuance, OTP, device fingerprint |
| Services | Complaint Service | Node.js / Express | Core complaint CRUD, status FSM |
| Services | Assignment Service | Node.js / Express | Routing rules, load balancing, SLA timer |
| Services | Verification Service | Python / FastAPI | Risk scoring, EXIF check, ML inference |
| Services | Notification Service | Node.js / Bull queue | Push (FCM/APNs), SMS (Twilio), Email (SES) |
| Services | Analytics Service | Python / FastAPI | KPI queries, heatmap aggregation, export |
| ML / AI | Image Classifier | Python / PyTorch (TorchServe) | Category classification, tamper detection |
| ML / AI | Anomaly Detector | Python / Scikit-learn | Complaint spike alerting |
| Data | Primary DB | PostgreSQL 15 + PostGIS | Partitioned, 2 read replicas |
| Data | Search | Elasticsearch 8 | Full-text complaint search |
| Data | Cache | Redis 7 | Session cache, rate limiting, OTP store |
| Data | Object Store | AWS S3 / GCS / MinIO | Attachments; CDN-fronted for citizen access |
| Messaging | Event Bus | Apache Kafka | Async events: assignment, notifications, audit |
| Infra | Orchestration | Kubernetes (EKS/GKE/AKS) | Horizontal autoscaling per service |
| Infra | CI/CD | GitHub Actions + ArgoCD | GitOps deployment pipeline |
| Observability | Metrics | Prometheus + Grafana | Per-service latency, error rate, throughput |
| Observability | Logging | ELK Stack | Structured logs, audit trail visualization |
| Observability | Error Tracking | Sentry | Frontend + backend error grouping |

### 10.2 ML Components

- **Image Classification:** CNN-based model (EfficientNet-B2 or MobileNetV3) trained on civic complaint photos. 8 categories. Retrained monthly with verified complaints as training data.
- **Tamper Detection:** Hash-based perceptual hashing (pHash) for near-duplicate detection. GAN artifact detector for manipulated images.
- **Anomaly Detection:** Time-series complaint volume monitoring with z-score alerts. Triggers admin notification on > 2 standard deviations from 7-day rolling average.
- **Spam Detection:** Behavioural clustering to identify coordinated false reporting campaigns.

---

## 11. Security & Privacy

### 11.1 Security Controls

| Area | Control | Implementation |
|------|---------|---------------|
| Transport | TLS 1.3 + HSTS | All endpoints; HSTS max-age 1 year with preload |
| Authentication | JWT with short TTL | Access: 15 min; Refresh: 30 days; RS256 signing |
| Authentication | OTP Brute Force Protection | Max 5 OTP attempts; 15-min lockout; device-level rate limit |
| Authorization | RBAC | Roles: citizen, volunteer, officer, dept_admin, city_admin, super_admin |
| Input Validation | Schema + sanitization | Joi/Zod validation on all API inputs; HTML sanitization on text |
| File Security | Malware scan + type check | ClamAV scan on upload; reject non-image/video MIME types |
| Injection Prevention | Parameterized queries | ORM with parameterized SQL only; no raw query interpolation |
| API Security | Rate limiting | Per-IP: 60/min; Per-user: 200/min; Per-OTP: 5/15min |
| Infrastructure | Network segmentation | DB not exposed to public internet; VPC private subnet |
| Infrastructure | Secrets management | AWS Secrets Manager / HashiCorp Vault; no secrets in code |
| Audit | Immutable audit log | All state changes logged; append-only; no delete permission |
| Monitoring | SIEM alerts | Alert on > 10 failed auth/min; unusual admin data exports |

### 11.2 Privacy Design

- **Data Minimization:** Collect only fields required for complaint routing and follow-up. Phone number hashed in logs.
- **Pseudonymization:** Public complaint feeds replace `user_id` with a deterministic pseudonym.
- **Retention Policy:** Personal data purged after 3 years of account inactivity. Complaint data anonymized (not deleted) for historical analytics.
- **Consent:** Explicit opt-in for location collection, device sensor data, and marketing communications. Logged with timestamp.
- **Right to Erasure:** Account deletion triggers async PII scrub job; complaint history anonymized, not deleted.
- **Data Residency:** All data stored within national jurisdiction by default.
- **Compliance:** GDPR-aligned controls; India DPDP Act / EU GDPR / applicable local laws.

---

## 12. Scalability & Reliability

### 12.1 Capacity Estimates

| Metric | Pilot (1 City) | Scale (5 Cities) | Target (State) |
|--------|---------------|-----------------|---------------|
| Daily Active Users | 5,000 | 50,000 | 500,000 |
| Complaints / Day | 500 | 5,000 | 50,000 |
| Attachments / Day | 1,500 files | 15,000 files | 150,000 files |
| API Requests / Day | 50,000 | 500,000 | 5,000,000 |
| DB Storage / Year | ~20 GB | ~200 GB | ~2 TB |
| Attachment Storage / Year | ~500 GB | ~5 TB | ~50 TB |

### 12.2 Scaling Strategy

- Horizontal pod autoscaling (HPA) on Kubernetes for API services based on CPU/request metrics
- PostgreSQL: primary-replica setup with PgBouncer connection pooling. Read replicas for analytics.
- Geography-based partitioning: complaints table partitioned by month + `city_id`
- CDN: CloudFront/Cloudflare for citizen-facing media and static assets
- Kafka: complaint events, notification triggers, and audit events processed asynchronously
- Offline-first PWA: local IndexedDB queue for complaint submission; syncs when online

### 12.3 Reliability Targets (SLOs)

| SLO | Target |
|-----|--------|
| API Availability | 99.5% (< 3.6h downtime/month) |
| Complaint Submission Availability | 99.9% (offline fallback in PWA) |
| Notification Delivery | 99% within 5 minutes of trigger |
| Heatmap Query P95 Latency | < 2 seconds |
| Complaint Submission P95 Latency | < 800ms |
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 15 minutes |

---

## 13. Testing & QA Strategy

### 13.1 Test Coverage Requirements

- **Unit tests:** minimum 80% line coverage on all service layers
- **Integration tests:** all API endpoints tested with real DB against OpenAPI spec
- **End-to-end tests:** Playwright/Detox automated tests for 5 critical user flows (submit, verify, assign, resolve, escalate)
- **Load tests:** k6 or Gatling scripts simulating 10x expected peak load; run before each major release
- **Security:** OWASP ZAP automated scan in CI; annual third-party penetration test
- **Accessibility:** automated axe-core scan; manual screen-reader test for citizen PWA

### 13.2 Field Validation (Pilot)

- Deploy to 1–2 wards with 100–500 beta citizens and 5–10 volunteer verifiers
- Weekly feedback sessions with citizens and field officers for 4 weeks
- Track all KPIs daily; tune `risk_score` thresholds based on false positive/negative rates
- A/B test incentive designs: cohort A gets badge rewards; cohort B gets priority SLA incentive

---

## 14. Rollout Roadmap

| Phase | Name | Duration | Scope & Deliverables |
|-------|------|----------|---------------------|
| Phase 0 | Discovery & Legal | 2–4 weeks | Stakeholder interviews, legal review, municipal partner agreement, tech stack finalization, infra provisioning |
| Phase 1 | MVP Launch | 8–12 weeks | Citizen PWA (complaint submit, tracking, notifications), Phone OTP auth, basic admin console, department queue, basic heatmap, SMS/push notifications, pilot in 1 ward |
| Phase 2 | Verification & Volunteers | 8 weeks | Volunteer verifier app and program, EXIF/GPS automated checks, ML image classifier v1, risk scoring engine, reputation system, duplicate detection, first A/B incentive test |
| Phase 3 | Scale & Analytics | 12 weeks | PostGIS optimizations, advanced admin analytics dashboard, SLA automation engine, multi-level escalation, predictive anomaly alerts, multilingual support (3+ languages) |
| Phase 4 | Integrations & Expansion | Ongoing | Municipal ERP/legacy system connectors, IoT/sensor data ingestion, state-level federation, payment partner integration for incentive vouchers, open data API |

### 14.1 MVP Scope Matrix

| Feature | In MVP | Post-MVP |
|---------|--------|----------|
| Complaint submission (phone) | ✅ | — |
| GPS + photo upload | ✅ | — |
| Complaint tracking + SMS notification | ✅ | — |
| Basic admin dashboard | ✅ | — |
| Department queue + manual assignment | ✅ | — |
| Basic heatmap (category/status) | ✅ | — |
| ML image classifier | ❌ | Phase 2 |
| Volunteer verifier program | ❌ | Phase 2 |
| eKYC authentication | ❌ | Phase 2 |
| Reputation and incentives | ❌ | Phase 2 |
| Advanced analytics + KPI dashboard | ❌ | Phase 3 |
| Escalation automation | ❌ | Phase 3 |
| Multilingual support | ❌ | Phase 3 |
| IoT sensor integration | ❌ | Phase 4 |

---

## 15. Governance & Operations

### 15.1 SLA Contracts by Category

| Category | Default SLA | Escalation SLA | Emergency SLA |
|----------|-------------|----------------|---------------|
| Pothole (Road) | 72 hours | 48 hours | N/A |
| Pothole (Footpath) | 120 hours | 72 hours | N/A |
| Garbage Overflow | 24 hours | 12 hours | N/A |
| Streetlight Failure | 48 hours | 24 hours | N/A |
| Water Supply Failure | 24 hours | 8 hours | 4 hours |
| Sewage / Sanitation Hazard | 24 hours | 8 hours | 4 hours |
| Illegal Construction | 120 hours | 72 hours | N/A |
| Public Safety Hazard | 12 hours | 4 hours | 1 hour |

### 15.2 Governance Structure

- **Product Owner:** roadmap, KPI accountability, stakeholder communications
- **Engineering Lead:** technical decisions, architecture sign-off, security reviews
- **Municipal Partner Lead:** department routing configuration, SLA policy, official verifier onboarding
- **Civic Advisory Board:** 3–5 citizen/NGO representatives providing quarterly feedback and public accountability reporting
- **Data Protection Officer:** privacy compliance, data retention policies, erasure requests

### 15.3 Challenges & Mitigations

| Challenge | Mitigation Strategy |
|-----------|---------------------|
| Spam / false reporting at scale | Graded auth, risk scoring, rate limits, reputation penalties, ML spam detection |
| Low volunteer engagement | Clear task UX, immediate point feedback, community recognition, certificate perks |
| Municipal department adoption | Lightweight officer app, training program, change management support |
| Legacy system integration | Modular connector design; CSV/API ingestion as fallback; phased to Phase 4 |
| Privacy backlash / low trust | Clear consent flows, data minimization, public transparency reports, independent audit |
| Low-connectivity environments | Offline-first PWA, SMS fallback, lightweight data payloads, progressive image compression |
| Geo-verification spoofing | Device sensor cross-checks, volunteer field verification, GPS-locked officer uploads |

---

## 16. Open Questions & Dependencies

### 16.1 Open Questions

1. What is the legal basis for eKYC identity verification in the target jurisdiction? Are Aadhaar APIs (or equivalent) available and approved?
2. Which municipal ERP systems need to integrate in Phase 4? What APIs or data formats do they expose?
3. Is there a government-backed SMS gateway for notifications, or will a commercial provider (Twilio, MSG91) be used?
4. Will the incentive voucher / utility bill rebate program require a formal government MOU with utilities?
5. What are the data retention requirements mandated by local law for civic complaint records?
6. Will the system operate in one language initially, or is multi-language support required from Phase 1?

### 16.2 External Dependencies

| Dependency | Owner | Risk Level | Mitigation |
|-----------|-------|------------|------------|
| SMS OTP Gateway (Twilio/MSG91) | Engineering | Medium | Multi-provider fallback; SLA contract |
| Push Notification (FCM/APNs) | Engineering | Low | Standard Google/Apple services |
| eKYC Provider / Aadhaar API | Legal + Engineering | High | Legal approval required; phased to Phase 2+ |
| Municipal ERP Connector | Municipal Partner | High | Phase 4; CSV fallback for Phase 1–3 |
| Government CDN / Data Residency | Infra | Medium | Identify approved cloud regions in Phase 0 |
| ML Training Data (labeled images) | Data Team | Medium | Bootstrap with public datasets; refine with pilot data |

---

## 17. Appendix

### A. Complaint Status State Machine

| Current Status | Trigger | Next Status | Who Can Trigger |
|---------------|---------|-------------|-----------------|
| Submitted | Auto (risk score pass) or Manual admin | Verified | System / Admin |
| Submitted | Auto (risk score fail) | Pending Verification | System |
| Pending Verification | Volunteer/Officer submits proof | Verified / Rejected | Volunteer / Officer |
| Verified | Department assignment created | Assigned | Admin / Auto-router |
| Assigned | Officer accepts task | In Progress | Field Officer |
| In Progress | Officer uploads resolution proof | Resolved | Field Officer |
| Resolved | Citizen accepts resolution | Closed | Citizen / Auto (7-day timeout) |
| Resolved | Citizen disputes within 7 days | Reopened | Citizen |
| Reopened | Re-assigned and resolved again | Resolved | Admin / Officer |
| Any | Admin marks spam after investigation | Rejected | Admin |

### B. Routing Pseudocode

```python
risk_score = (0.30 * auth_score) + (0.25 * geo_match) + (0.25 * image_confidence) + (0.20 * history_score)

if risk_score >= 0.75:
    fast_track_to_department()
elif risk_score >= 0.40:
    dispatch_to_volunteer(within_24h=True)
else:
    require_officer_verification()
    flag_for_admin_review()
```

### C. Notification Event Catalog

| Event | Channel | Recipient | Trigger |
|-------|---------|-----------|---------|
| Complaint Submitted | Push + SMS | Citizen | Immediate on submit |
| Complaint Verified | Push + SMS | Citizen | Verification verdict recorded |
| Complaint Assigned | Push | Citizen | Assignment created |
| SLA Warning (T-24h) | Push + Email | Officer + Dept Admin | 24h before SLA deadline |
| SLA Breach + Escalation | Push + Email + SMS | Officer + Dept Admin + City Admin | SLA deadline passed |
| Complaint Resolved | Push + SMS | Citizen | Resolution proof uploaded |
| Volunteer Task Assigned | Push | Volunteer | Task dispatch event |
| Reopen Request | Push + Email | Dept Admin + Officer | Citizen reopens complaint |
| Anomaly Alert | Email + Dashboard | City Analyst + Admin | ML spike detector trigger |

### D. Glossary

| Term | Definition |
|------|-----------|
| MTTA | Mean Time to Assignment — average time from complaint submission to department assignment |
| MTTR | Mean Time to Resolution — average time from complaint submission to verified closure |
| eKYC | Electronic Know Your Customer — digital identity verification via government ID or biometrics |
| PostGIS | PostgreSQL extension adding geographic/spatial object support for geospatial queries |
| SLA | Service Level Agreement — committed maximum response/resolution time per complaint category |
| PWA | Progressive Web App — web application with offline capability and mobile-native feel |
| FSM | Finite State Machine — complaint status transitions enforced as a defined set of valid state changes |
| RBAC | Role-Based Access Control — permissions granted based on user role, not individual user |
| GAN | Generative Adversarial Network — ML model used to generate synthetic/fake images (tamper vector) |
| HPA | Horizontal Pod Autoscaler — Kubernetes mechanism to automatically scale service instances |

---

*© 2026 Smart Public Service CRM — PS-CRM PRD v1.0 | Contact the Product Lead via the project channel for component-level design specs and API contracts.*
