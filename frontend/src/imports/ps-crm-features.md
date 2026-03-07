# PS-CRM — Final Features Document
## Frontend UI Features & Backend Role Specifications
**Version:** 2.0 | **Date:** March 2026 | **Aligned with:** PRD v2.0

---

> **Read this first:** Every feature below is marked with a build tier:
> - 🟢 **Demo-Ready** — Must be working and demonstrable in the hackathon
> - 🟡 **Conceptual** — Present in pitch/UI mockups; explain as Phase 2–3
> - 🔴 **Removed** — Cut from all claims; do not mention in demo

---

## PART A — CITIZEN-FACING FRONTEND

### A1. Home Screen — Command Center Dashboard 🟢

**What the citizen sees:**
- **Impact Counter** — Animated number: *"X issues resolved in your ward this month."* Updates when any complaint nearby is resolved (not just the user's own)
- **Progress Ring** — Circular indicator showing proximity to next reward milestone. Fills per verified complaint. Satisfying animation on completion
- **The Fix Map** — Live interactive map centered on user location:
  - 🟢 Green pins = resolved issues
  - 🟡 Yellow pins = in-progress
  - 🔴 Red pins = reported, unverified (with "Confirm this?" CTA to earn witness credits)
  - Tap any pin → full complaint timeline, photos, resolution proof

**Backend requirement:** Aggregated ward-level resolution counts; geospatial query for nearby pins filtered by status.

---

### A2. Complaint Submission Flow 🟢

**Step-by-step UI:**
1. Tap "Report Issue" → full-screen camera opens
2. **AI Smart-Snap:** Point camera at problem → server-side classifier suggests category in real time — *"Looks like a Pothole — confirm?"*
3. GPS auto-detected; citizen adjusts pin on interactive map if needed
4. Choose sub-category (e.g., Pothole → Road / Footpath / Bridge)
5. Upload up to 5 photos or 1 video (60s max); voice note option (60s, transcribed)
6. Optional description (500 char max)
7. Submit → receive Complaint ID (CMP-2026-XXXXX) via push + SMS instantly
8. SLA deadline displayed immediately on confirmation screen

**Offline behaviour:** If no connectivity, complaint queued in local IndexedDB; auto-syncs when online. UI shows "Queued — will submit when connected."

**Backend requirement:** Multipart form-data endpoint; EXIF GPS extraction; ML inference API call; duplicate check on submission; Complaint ID generation; SLA deadline calculation from category rules.

---

### A3. AI Category Suggestion (Smart-Snap) 🟢

**UI behaviour:**
- Camera viewfinder shows a live suggestion chip: *"Pothole detected"*
- Citizen taps to confirm or selects differently from the category list
- If ML confidence < 60%, suggestion is suppressed; citizen selects manually

**What NOT to claim:** On-device ML (CoreML / TFLite). Use server-side inference only. Say: *"AI-assisted auto-category suggestion powered by our classification API."*

**Backend requirement:** FastAPI endpoint wrapping pre-trained EfficientNet-B2 (or MobileNetV3). Returns: predicted category, confidence score, tamper flag.

---

### A4. Complaint Tracking Screen 🟢

**UI elements:**
- Complaint ID prominently displayed with copy/share button
- **Status timeline bar:** Submitted → Verified → Assigned → In Progress → Resolved → Closed (current step highlighted, timestamps shown)
- SLA deadline countdown (shows "32h remaining" or "OVERDUE — Escalate" in red)
- Evidence photos from officer visible after resolution
- **Milestone updates only** — no live officer location. Show: *"Field officer assigned. GPS-verified proof will be uploaded on resolution."*
- Post-resolution: satisfaction survey (1–5 stars + comment)
- **Before/After shareable card button** appears after resolution

**Backend requirement:** Public GET endpoint (no auth required); status FSM enforced server-side; proof photo URL from officer upload.

---

### A5. Escalation & Re-open 🟢

**UI behaviour:**
- Escalation button appears only when SLA is breached (greyed out otherwise)
- Reason selector: "Still not fixed / Wrong resolution / Safety risk"
- Re-open button visible for 7 days post-resolution
- Escalated complaints show a distinct badge: 🔴 "Escalated — Under Review"

**Backend requirement:** Escalation record created; supervisor notified via push + email; complaint priority score boosted; 7-day re-open window enforced server-side.

---

### A6. Nearby Citizen Notifications & Community Confirmation 🟢

**UI behaviour:**
- Push notification: *"A new issue was reported 150m from you — confirm it to earn 5 credits"*
- One-tap confirm / deny on notification or from Fix Map red pin
- Confirmation counter shown on complaint detail: *"3 neighbors confirmed this issue"*
- Comment thread below complaint (Tier 1+ only, max 280 chars per comment)
- Rate limit: max 3 confirmations per user per day (shown as "Daily confirmations: 2/3 remaining")

**Backend requirement:** Geospatial query on new complaint submission; push notification fan-out to users within 250m; vote deduplication (unique constraint on user+complaint); daily rate limit enforced server-side.

---

### A7. Profile & Reputation Screen 🟢

**UI elements:**
- Reputation score (e.g., "420 pts") with level badge displayed
- Badge collection (earned badges highlighted, locked badges greyed with criteria shown)
- Complaint history list (status, category, date, resolution time per complaint)
- Notification preference toggles
- **Annual Report Card** button (visible from January): shareable graphic — "You helped X neighbors this year" (Spotify Wrapped–style)
- Account deletion option with clear PII scrub confirmation

**Backend requirement:** Reputation events table aggregation; badge criteria check on each reputation event; complaint history query by user_id.

---

### A8. Perk Store 🟡 (Conceptual — Phase 2)

**In demo:** Show as a UI mockup or locked screen with message: *"Coming in Phase 2 — redeem Civic Credits for real-world rewards via partner network."*

**Do NOT claim:** Tax discounts, permit fast-tracks, Aadhaar-linked benefits, utility bill rebates, driver's license fast-tracks. These require government MoU and legal clearance.

**What IS safe to show:** Recognition badges, leaderboard position, certificates of community service, community pooled rewards concept.

---

### A9. WhatsApp / Telegram Bot Flow 🟢

**Bot UX:**
```
User sends photo →
Bot: "Got it! Share your location?" [Location pin button]
Bot: "What best describes this?" [Pothole / Garbage / Water / Light / Other]
Bot: "Ticket #CMP-2026-04821 created ✅ Track: [link]"
Bot: "Earn Civic Credits for this report — create a free account → [link]"
```

**Backend requirement:** Webhook receiver for WhatsApp Business API / Telegram Bot API; complaint creation from bot payload; tracking URL generation; account linking flow.

---

### A10. Ward Leaderboard & Civic Health Score 🟢

**UI elements:**
- Monthly ward leaderboard ranked by composite Civic Health Score: complaints filed + resolution % + average resolution speed
- User's ward rank highlighted
- Top ward receives digital recognition banner in-app
- Anonymous display by default (no real names unless user opts in)

**Backend requirement:** Monthly aggregation job per ward; composite score calculation; leaderboard cache in Redis.

---

## PART B — FIELD OFFICER APP (React Native)

### B1. Task Dashboard 🟢
- List of assigned complaints sorted by SLA urgency (most overdue first)
- Each task shows: category icon, address, SLA countdown, complaint photo thumbnail
- Map view showing all assigned tasks with navigation links (Google Maps / Apple Maps deep link)
- Offline mode: download task details before entering low-connectivity zones

### B2. Task Workflow 🟢
- Status update buttons: "En Route" → "On Site" → "Resolved"
- **GPS-locked proof upload:** Camera enforces photo must be taken within 150m of complaint pin. Upload button disabled if location check fails. Error message: *"Move closer to the complaint location to upload proof."*
- Internal notes field (visible only to team, not citizen)
- Completion triggers automatic citizen notification

### B3. What NOT to show 🔴
- Live officer location broadcast to citizen — removed entirely due to privacy and union concerns
- Replace in all pitch materials with: "GPS-verified proof upload ensures location-confirmed resolution"

---

## PART C — DEPARTMENT ADMIN DASHBOARD (Web)

### C1. Complaint Queue 🟢
- Unified inbox with filters: category, ward, status, SLA status (on-track / at-risk / breached)
- Color-coded SLA urgency: 🟢 on track / 🟡 at risk / 🔴 breached
- Auto-routing displayed: shows which officer was assigned and why (load + proximity)
- Manual reassignment with reason log
- Batch operations: select multiple complaints, assign to same officer

### C2. Heatmap — Analytics Dashboard 🟢
- Complaint density heatmap by category, status, date range, ward-level drill-down (Leaflet.js)
- **Red Zone alert:** Areas with complaints aging past SLA threshold highlighted in real time
- SLA metrics panel: MTTA, MTTR, SLA compliance %, breach count
- Team performance: complaints assigned / resolved per officer per week
- **Transparency Log panel:** "This month, Ward 7 resolved 83 complaints. Avg resolution: 31h." (Public-facing version available without PII)
- Predictive spike alert: flag if complaint volume > 2x baseline in a 6-hour window
- Export: CSV and PDF

### C3. SLA Configuration 🟢
- Configure SLA per category and sub-category (in minutes)
- Set escalation chain: officer → dept head → city admin, with time thresholds
- Public SLA visibility: citizens see committed SLA for each category on submission screen

### C4. Volunteer Management 🟡 (Simulate in Demo)
- Enrollment queue, task assignment view, accuracy rate per volunteer
- Admin override for any volunteer verdict
- Random 10% audit trigger
- **For hackathon:** Show the UI; simulate the flow; do not claim a live volunteer network

### C5. User Management 🟢
- Suspend user with reason; suspension logged in audit trail
- View user's complaint history, reputation score, abuse flags
- False report audit: mark complaint as spam; triggers reputation penalty

---

## PART D — BACKEND SERVICES & ROLES

### D1. Auth Service
- Phone OTP registration and login
- JWT issuance (15-min access, 30-day refresh, RS256 signed)
- OTP brute-force protection: 5 attempts max, 15-min lockout
- Device fingerprinting for rate limiting
- RBAC enforcement: citizen / volunteer / officer / dept_admin / city_admin / super_admin

### D2. Complaint Service (Core)
- Complaint CRUD with status FSM enforcement
- Complaint ID generation
- SLA deadline calculation from category rules at submission time
- Duplicate detection on every new submission (100m + category + 6h window)
- Geospatial radius query for nearby citizen notification fan-out

### D3. AI / Verification Service (Python FastAPI)
**Priority Score Calculator:**
```python
priority_score = (
  0.30 * auth_score +          # Tier 0=0, Tier 1=0.5, Tier 2=0.7, Tier 3=1.0
  0.25 * geo_match +            # EXIF GPS vs submitted GPS
  0.25 * image_confidence +     # ML classifier confidence
  0.20 * history_score +        # Normalized user reputation
  location_sensitivity_bonus +  # Near hospital/school/govt building
  duplicate_count_bonus         # +0.1 per merged duplicate
)
```
**Image Classifier:** Pre-trained EfficientNet-B2 (server-side only). Returns category, confidence, tamper flag.
**Duplicate Detector:** pHash for image near-duplicates + cosine similarity on complaint descriptions.
**EXIF Extractor:** Validates GPS coordinates and timestamp against submitted location and time.
**Anomaly Detector:** Z-score on complaint volume; alert if > 2 standard deviations from 7-day rolling average.

### D4. Assignment Service
- Auto-routing on verification: match skill tag + shift active + distance < 5km + lowest workload
- Assignment within 60 seconds of verification for standard complaints
- SLA countdown monitoring; T-24h reminder; T-0 auto-escalation
- Reassignment log with mandatory reason field

### D5. Notification Service
| Event | Channel | Recipient |
|-------|---------|-----------|
| Complaint Submitted | Push + SMS | Citizen |
| Nearby complaint posted | Push | Citizens within 250m |
| Complaint Verified | Push + SMS | Citizen |
| Complaint Assigned | Push | Citizen |
| SLA Warning T-24h | Push + Email | Officer + Dept Admin |
| SLA Breach | Push + Email + SMS | Officer + Dept Admin + City Admin |
| Complaint Resolved | Push + SMS | Citizen |
| Volunteer Task Assigned | Push | Volunteer |
| Reopen Request | Push + Email | Dept Admin + Officer |
| Anomaly Alert | Email + Dashboard | City Analyst + Admin |

### D6. Analytics Service (Python FastAPI)
- Heatmap tile generation (GeoJSON) from PostGIS spatial queries
- KPI aggregation: MTTA, MTTR, SLA compliance rate
- Ward Civic Health Score calculation (monthly batch job)
- Transparency Log generation
- CSV and PDF export endpoints

### D7. Audit Log (Append-Only)
- Every state change recorded: entity type, entity ID, action, old value, new value, performed by, IP, timestamp
- No delete or update permissions on audit_log table
- Admin UI for log visualization

---

## PART E — FEATURES CONFLICT RESOLUTION TABLE

| Feature | Original Claim | Final Decision | Reason |
|---------|---------------|---------------|--------|
| Kubernetes + Kafka + Elasticsearch | In PRD | 🔴 Removed from demo claims | Overkill for hackathon; say "microservice-ready modular monolith" |
| On-device ML (CoreML/TFLite) | In Engagement Doc | 🟡 Conceptual | Server-side inference only in demo |
| Live officer location tracking | In Engagement Doc | 🔴 Removed | Privacy + union risk; replaced by GPS-locked proof upload |
| Tax discounts, permit fast-tracks | In Engagement Doc | 🟡 Conceptual Phase 3 | Requires government MoU + legal clearance |
| Aadhaar / eKYC integration | In PRD | 🟡 Conceptual | No legal clearance; phone OTP only in demo |
| Volunteer verifier (live) | In PRD + Engagement Doc | 🟡 Simulated in demo | Complex; position as Phase 2 pilot |
| Multi-replica DB + read replicas | In PRD | 🔴 Removed from demo | Single PostgreSQL instance sufficient |
| AI Smart-Snap (category suggestion) | In Engagement Doc | 🟢 Demo-ready | Server-side, realistic to build |
| Duplicate detection | In AI Features doc | 🟢 Demo-ready | Core differentiator; fully buildable |
| AI Priority Scoring | In AI Features doc | 🟢 Demo-ready | Core differentiator; fully buildable |
| Nearby citizen notification | In AI Features doc | 🟢 Demo-ready | Standard geospatial + push; buildable |
| WhatsApp Bot | In Engagement Doc | 🟢 Demo-ready | WhatsApp Business API; realistic |
| Ward Leaderboard | In Engagement Doc | 🟢 Demo-ready | Simple aggregation query |
| Before/After shareable card | In Engagement Doc | 🟢 Demo-ready | Server-side PNG generation (Puppeteer) |
| Annual Report Card | In Engagement Doc | 🟢 Demo-ready | Batch data + static template render |

---

## PART F — HACKATHON DEMO SCRIPT (Core Flow)

**Show this sequence live:**
1. Citizen opens app → Home screen with Fix Map and nearby complaints
2. Taps "Report Issue" → Camera opens → points at a pothole → AI suggests "Pothole" → confirms
3. GPS auto-fills → submits → Complaint ID generated in < 2 seconds
4. Switch to Admin Dashboard → complaint appears in queue with priority score and SLA countdown
5. Show duplicate detection: submit a second nearby complaint → system merges and boosts priority
6. Assign to field officer → officer app shows task with GPS navigation
7. Officer "uploads proof" (GPS-locked) → complaint status moves to Resolved
8. Citizen receives notification → before/after card generated → share button
9. Show heatmap on admin dashboard with Red Zone overlay

**Mention as roadmap (do not demo):** Civic Credits perk store, eKYC, volunteer network, ERP integration, IoT sensors.

---

*PS-CRM Features v2.0 — Final | March 2026 | Aligned with PRD v2.0*

We are good to go 