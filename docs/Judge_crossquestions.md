# PS-CRM — Judge Cross-Questions & Official Answers
**Version:** 1.0 | **Date:** March 2026
**Purpose:** Prepared responses to all 6 strategic cross-questions raised in the Hackathon Reality Check document. All answers are grounded in PRD v2.0 and Features v2.0.

---

## Cross Question 1
### Are you actually deploying Kubernetes, Kafka, multi-replica DB, Elasticsearch, and microservices for this hackathon?

**Answer:**

No, and we don't claim to.

Our demo runs on:
- Single Node.js backend (modular monolith)
- Single PostgreSQL instance with PostGIS
- Redis for OTP and rate limiting
- One Python FastAPI ML service
- Hosted on a single cloud VM (Render / Railway)

The architecture is **designed to be microservice-ready and horizontally scalable** — but for this demo it is deployed as a modular monolith. Kafka, read replicas, and Elasticsearch are production scaling decisions documented in the Phase 3–4 roadmap, not demo claims.

**What we say in pitch:** *"Scalable by design — currently deployed as a modular monolith for demo."*

---

## Cross Question 2
### Who approved tax discounts, permit fast-tracks, fuel vouchers, and VIP bypass?

**Answer:**

Nobody — and we don't claim they are live.

In our final documents, the entire Perk Store is marked as a **Phase 2–3 conceptual feature** requiring municipal MoUs and private partner agreements before activation.

What IS live in the demo:
- Reputation points system
- Badge collection (earned on verified complaints)
- Ward leaderboard (monthly Civic Health Score)
- Community pooled rewards (symbolic, no legal clearance needed)

None of these require government approval or legal clearance.

**What we say in pitch:** *"The Civic Credits reward marketplace is a Phase 2 expansion requiring municipal and partner agreements — our demo focuses on the transparency and SLA enforcement engine."*

---

## Cross Question 3
### Will municipal officers legally allow real-time public tracking?

**Answer:**

We removed live officer tracking entirely from the platform.

The final design replaces it with **GPS-locked proof upload**:
- Officer cannot upload a resolution photo from more than 150 meters away from the complaint pin
- Upload button is disabled if the location check fails
- Citizens see milestone-based status updates only: Assigned → In Progress → Resolved — with a timestamped, location-verified proof photo attached

This achieves the same accountability goal with zero privacy risk, zero union conflict, and zero political misuse surface.

**What we say in pitch:** *"Field officers submit GPS-verified resolution proof — location-confirmed accountability without real-time surveillance."*

---

## Cross Question 4
### Are you actually training and deploying on-device ML models (EfficientNet, CoreML, TFLite)?

**Answer:**

No on-device ML is claimed anywhere in our final documents.

What we actually use:
- Pre-trained EfficientNet-B2 served via Python FastAPI — **server-side inference only**
- App calls our classification API, receives predicted category + confidence score
- If confidence ≥ 60%: suggestion chip shown — *"Looks like a Pothole — confirm?"*
- If confidence < 60%: no suggestion shown; citizen selects category manually

This is fully demonstrable live. No training pipeline, no CoreML export, no TFLite conversion claimed.

**What we say in pitch:** *"AI-assisted auto-category suggestion — our server-side classifier analyses the uploaded photo and pre-fills the complaint category."*

---

## Cross Question 5
### Do you have legal clearance for Aadhaar / eKYC integration?

**Answer:**

No — and we don't claim it.

Authentication in the demo is **Phone OTP only**: name and phone number, nothing more. The onboarding flow requires no government ID.

eKYC is documented in the PRD as a *"future integration-ready identity layer"* — present in the architecture diagram to show the system is designed for it, but no Aadhaar API calls are made or claimed in v1.

The graded trust model (Tier 0 → Tier 3) is presented conceptually to show how identity depth unlocks additional capabilities — it is a design decision, not an implementation claim.

**What we say in pitch:** *"Authentication starts with phone OTP. The system is architected for eKYC as a Phase 2 expansion pending regulatory clearance."*

---

## Cross Question 6
### How do you prevent misuse in volunteer verification?

**Answer:**

For the demo, volunteer verification is **simulated** — the UI and logic flow are shown but no live volunteer network is claimed.

What IS fully live in the demo:

- **Automated verification path:** EXIF/GPS cross-check, ML image confidence score, behavioural heuristics (rate limiting, duplicate flagging)
- **AI Priority Score** routes complaints automatically without needing a human volunteer for high-confidence reports (score ≥ 0.75 → fast-tracked)
- **Admin override** is fully functional for any verdict at any stage
- **Audit log** records every state change immutably

The volunteer program is explicitly positioned as a **Phase 2 pilot** with documented safeguards: random 10% audit of volunteer verdicts, admin override on all decisions, accuracy rate tracking per volunteer, and a code of conduct agreement at enrollment.

**What we say in pitch:** *"High-confidence complaints are auto-verified by AI and fast-tracked directly to departments. The volunteer layer adds community trust for medium-confidence cases — designed with audit controls and admin override as core safeguards."*

---

## Summary Table

| # | Question | Our Position | Demo Status |
|---|----------|-------------|-------------|
| 1 | Kubernetes / Kafka / multi-replica? | Modular monolith; scalable by design | 🟢 Honest & live |
| 2 | Tax discounts / permit fast-tracks approved? | Phase 2–3 conceptual; MoU required | 🟡 Conceptual only |
| 3 | Officers allow live tracking? | Removed; replaced by GPS-locked proof upload | 🟢 Replaced & live |
| 4 | On-device ML deployed? | Server-side inference only; pre-trained model | 🟢 Honest & live |
| 5 | Aadhaar / eKYC legal clearance? | Phone OTP only; eKYC is roadmap | 🟡 Roadmap only |
| 6 | Volunteer misuse prevention? | Simulated; auto-verify + admin override live | 🟢 Core logic live |

---

*PS-CRM Judge Q&A v1.0 | March 2026 | Aligned with PRD v2.0 and Features v2.0*