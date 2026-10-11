# Pramaan (प्रमाण)
## Proof Before Blame

### Full Product, Technical, Demo, and Delivery Report

**Version:** 1.0 prototype report  
**Project:** Pramaan pollution complaint evidence studio  
**Initial pollutant:** PM2.5  
**Current implementation:** React + Vite browser prototype  
**Data status:** Synthetic fixtures and locally entered complaints only  
**Prepared for:** Environmental Hacks / Bharat Builds Tour submission  
**Status:** Working prototype; AWS and real-data integrations are planned, not claimed as deployed

---

## Executive summary

Pollution complaints often arrive as accusations without enough evidence to support a defensible decision. A resident may identify the nearest factory, but proximity is not proof. Wind, timing, regional background, sensor quality, and alternative explanations can all point in different directions. Inspectors have limited capacity, operators need a fair way to be cleared for a specific incident, and editable screenshots or spreadsheets make evidence difficult to trust.

**Pramaan** turns a pollution complaint into an inspectable evidence case. It tests competing explanations, makes contradictory and missing evidence visible, abstains when a source cannot be supported, recommends the next measurement, and detects changes to a sealed evidence snapshot.

The product is designed around four operational decisions:

1. Which complaint or site should be inspected first?
2. Which candidate can be cleared for this incident?
3. Where should the next sensor be placed?
4. Can the evidence record be trusted as unchanged?

Pramaan is deliberately not a pollution dashboard and does not claim to establish legal guilt, regulatory violations, medical effects, or scientific causation from sparse low-cost sensor data. Its central promise is more disciplined:

> **It does not ask who looks guilty. It asks what the evidence can actually support.**

---

## 1. Product identity

### Name

**Pramaan** means proof or evidence in Hindi.

### Tagline

**Proof before blame.**

### Product category

Environmental evidence and decision-support workflow.

### Primary users

- Pollution control inspectors and municipal officers
- Residents and resident welfare associations
- Campus or ward administrators
- Site operators who need incident-specific evidence
- Journalists, researchers, and reviewers
- Sensor network stewards

### Core product statement

> Pramaan converts a pollution complaint into a transparent case file: it tests the named source, records what contradicts it, tells the authority what to do next, and makes later evidence changes detectable.

---

## 2. The problem

### 2.1 Complaints are not yet investigations

A resident's report may be valuable, but a report alone generally does not contain enough information to distinguish:

- A recurring local source from a one-off event
- A real pollution episode from ordinary background variation
- A nearby source from an upwind source
- A local plume from regional smoke or haze
- A source signal from a faulty or poorly calibrated sensor

Without a structured investigation, complaints tend to be ignored, over-simplified, or converted into an accusation against the most visible nearby site.

### 2.2 Proximity is mistaken for proof

The nearest site is not necessarily the source. Wind direction, transport time, operating status, terrain, and regional conditions matter. A system that only draws nearby sites on a map risks making the wrong party look responsible.

### 2.3 Sensor coverage is sparse

Many communities do not have dense reference-monitor coverage. Missingness is normal. A credible system must make “we cannot tell from these data” a useful output rather than forcing a classification.

### 2.4 Inspection capacity is limited

An authority cannot visit every complaint immediately. The authority needs an explainable triage signal, not an opaque score that is difficult to defend.

### 2.5 Evidence can be edited

Screenshots and spreadsheets are easy to change after an incident. Even when the original data was valid, stakeholders may not trust a record without a reproducible integrity mechanism.

### 2.6 Innocent operators have no incident-level alibi

A site repeatedly named by residents often has no structured way to show that it was contradicted by the evidence on a particular date and time. Pramaan includes incident-specific clearance language to make the system useful to both investigators and operators.

---

## 3. The proposed solution

Pramaan is a case-file engine and evidence workspace with six connected capabilities:

1. **Complaint intake:** Record what was observed without pretending the report is a verified sensor measurement.
2. **Falsification engine:** Test each candidate source using wind, time lag, spatial coherence, regional background, confounders, and instrument validity.
3. **Computed abstention:** Refuse to name a source when the available evidence does not satisfy the decision rule.
4. **Cross-examination:** Perturb assumptions and show whether the conclusion survives.
5. **Next measurement:** Compute a candidate location where a sensor would best separate remaining explanations.
6. **Integrity and narrative controls:** Seal case artifacts and prevent unsupported causal or legal language from appearing in the evidence summary.

The current prototype implements these behaviors with synthetic investigation fixtures and a local complaint workspace.

---

## 4. What is built now

### 4.1 Working browser application

The application is a React + Vite single-page prototype. It runs locally without API keys or external services.

Run commands:

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
```

### 4.2 Synthetic investigation cases

The app provides three contrastive cases:

#### Case 01 — Coherent local plume

Two independent downwind monitors rise in sequence while an upwind reference remains near baseline. Wind and lag are compatible with a candidate association. The result is bounded as a consistent association rather than a causal finding.

#### Case 02 — Single-sensor anomaly

A dramatic reading comes from a monitor with a clock/calibration problem and no independent peer corroboration. Pramaan excludes the invalid reading from source attribution, refuses to name a source, and recommends an independent next measurement.

#### Case 03 — Regional smoke front

Upwind, downwind, and regional references rise together. The candidate-specific local hypothesis is contradicted by the broader pattern. Pramaan directs attention to a regional explanation and provides incident-specific clearance language for the candidate.

### 4.3 Complaint workspace

The local complaint flow allows a user to:

- Select an incident type: smoke/haze, dust, odour, or other
- Record the incident date and time
- Describe the location
- Add notes
- Receive field-level validation
- Save the complaint locally in browser storage
- Reopen saved records
- Delete records with confirmation
- Download a JSON copy
- See a pending-evidence status and next-data checklist

New complaints are not assigned a synthetic grade or fabricated source result. This boundary is essential: an intake report is not the same as an evidence-backed investigation.

### 4.4 Evidence and integrity behavior

The current prototype includes:

- Interactive PM2.5 time-series visualization
- Schematic sensor network map
- Wind direction display
- Falsification matrix
- Supports / contradicts / inconclusive / unavailable outcomes
- Grade and recommended action
- Wind and timing cross-examination controls
- Sensor placement calculation for the unresolved case
- Claim ledger with evidence IDs
- Hallucinated claim injection and rejection
- SHA-256 browser hashing through Web Crypto
- Merkle-like manifest root
- Tamper simulation identifying the changed artifact

---

## 5. User journeys

### 5.1 Resident journey

1. Open the local complaint workspace.
2. Select what was observed.
3. Enter when and where it happened.
4. Add optional notes.
5. Save the report.
6. Receive a record ID and pending-evidence status.
7. Download a JSON copy if they want to share the record.

The resident is not told that the complaint proves a source. The system clearly distinguishes an observation report from a verified measurement.

### 5.2 Inspector journey

1. Open a synthetic or future connected case.
2. Read the recommended action first.
3. Review peak, coverage, and signal metrics.
4. Inspect the time series and sensor geometry.
5. Review each falsification test.
6. Challenge wind and timing assumptions.
7. Read the alternative explanation.
8. Choose whether to inspect, measure, or escalate regionally.

### 5.3 Operator journey

1. Receive a candidate-source assessment.
2. Read which tests support or contradict the hypothesis.
3. Receive an incident-specific alibi when the evidence contradicts the site.
4. In a future version, attach a right-of-reply record without changing the original evidence.

### 5.4 Reviewer or journalist journey

1. Open the evidence claim ledger.
2. Follow every evidence ID to a source observation or test.
3. Trigger the narrative checker with an unsupported claim.
4. Verify the evidence manifest.
5. Modify a held copy and see the verification fail.

---

## 6. Investigation methodology

### 6.1 Hypotheses

The system should retain more than the named suspect:

- Candidate site hypotheses
- Regional haze or smoke
- Unrecorded source
- Instrument or data-quality failure

This is an important anti-bias mechanism. “None of these” must remain possible.

### 6.2 Test outcomes

Each test returns a standardized result:

| Outcome | Meaning |
|---|---|
| Supports | The observed pattern is compatible with the hypothesis |
| Contradicts | A credible falsifier conflicts with the hypothesis |
| Inconclusive | Evidence exists but does not discriminate |
| Unavailable | Required evidence or quality information is missing |

### 6.3 Falsification battery

#### Upwind/downwind contrast

Does the affected monitor rise more than an upwind reference beyond a reasonable uncertainty allowance?

#### Wind sector and transport lag

Does wind carry air from the candidate toward the affected monitor, and is the observed timing compatible with distance and wind speed?

#### Spatial coherence

Do independent monitors respond in a plausible spatial sequence rather than only one monitor spiking?

#### Regional background

Do regional or upwind references rise simultaneously, suggesting a broader event rather than a local source?

#### Confounders

Are traffic, construction, cooking, fireworks, dust, weather, and other known activities considered?

#### Instrument validity

Are calibration, clock, coverage, maintenance, sequence, and stuck-reading checks valid?

---

## 7. Grading and decision policy

Grades describe the quality of evidence for a specified hypothesis and time window. They are not guilt probabilities.

| Grade | Meaning | Action |
|---|---|---|
| A | Strong, stable, bounded association | Inspect now |
| B | Consistent association with alternatives still visible | Worth a visit or request records |
| C | Episode observed but source unresolved | Measure first |
| D | Candidate hypothesis contradicted | Clear candidate for this episode; investigate alternative |
| U | Data is not sufficient for assessment | Repair QA or collect more data |
| R | Regional event | Escalate to city-level response |

### Prototype policy

The current fixtures use illustrative grades and indices. These are deliberately labelled as synthetic and heuristic. They are not calibrated field probabilities or legal standards.

### Production policy

A production grade must be bounded by the weakest required evidence domain. More supportive tests cannot compensate for a decisive QA failure, absent comparator, or invalid wind record.

---

## 8. Cross-examination and stability

The system exposes its own fragility instead of presenting a single opaque confidence number.

### Current controls

- Wind-direction shift: −30° to +30°
- Transport-timing shift: −15 to +15 minutes

The UI reports a sensitivity index and perturbed grade.

### Planned production analysis

The engine should run a deterministic set of 300 predeclared variants that perturb:

- Wind direction
- Wind speed
- Event onset
- Baseline duration
- Event-window position
- Bin width
- Lag range
- Calibration uncertainty
- One-monitor exclusion

The output should state the share of variants reaching each grade. It must not be described as a probability that a site is guilty.

### What would change my mind

A planned extension would search for the smallest wind, timing, or baseline change that flips the verdict. This makes the system useful in a review or hearing because the investigator can see precisely what data quality would undermine the conclusion.

---

## 9. Sensor placement

When the system cannot distinguish two live hypotheses, it should still provide an operational next step.

The prototype computes a schematic placement downwind of the candidate using the recorded wind direction. It labels the location as schematic and not georeferenced.

A production placement optimizer should score candidate points by predicted separation:

```text
score(point) =
  abs(predicted concentration under hypothesis A
      - predicted concentration under hypothesis B)
  / assumed sensor noise
```

The resulting instruction should contain:

- Candidate location
- Direction and distance
- Competing hypotheses
- Expected separation
- Deployment duration
- Reference-monitor requirement
- Field-siting and safety warning

The placement recommendation is not a validated dispersion-model output. It is an information-gain aid for deciding where to measure next.

---

## 10. Narrative and AI safety

The system treats language as part of the evidence chain.

### Claim structure

Each claim contains:

- Claim ID
- Claim type
- Text
- Evidence IDs
- Grade ceiling

### Checker behavior

The checker rejects:

- Unknown evidence IDs
- Missing citations
- Causal language unsupported by the evidence
- Legal terms such as “guilty” or “violated”
- Unsupported medical or safety claims
- Numerical text that conflicts with the recorded fixture
- Association claims that omit contrary or unresolved evidence

### Future Bedrock integration

Amazon Bedrock may eventually draft English and Hindi summaries, but only behind the deterministic checker and human review. A template fallback should be used whenever generated text fails validation.

The AI should explain the evidence. It must not add new facts.

---

## 11. Tamper-evident evidence

### Current browser implementation

The prototype canonicalizes and hashes:

1. `observations.json`
2. `assessment.json`
3. `config.json`

The sorted artifact digests are then hashed into a manifest root. A held copy of the observation artifact is modified during the demo, and verification reports the exact changed artifact.

### What this proves

- The current bytes differ from the sealed bytes.
- The manifest no longer matches.
- The verifier can identify the changed artifact.

### What this does not prove

- That the sensor was truthful
- That the sensor was calibrated correctly
- That the data was legally collected
- That custody was perfect before sealing
- That the evidence establishes causation

### Production architecture

The target AWS design includes:

- S3 versioning
- S3 Object Lock configured at bucket creation
- KMS asymmetric signing
- Immutable or append-only event records
- Independent verification endpoint
- CloudTrail and CloudWatch audit signals
- Separate access controls for ingest, analysis, review, and export

These services are designed targets and are not represented as deployed in the current prototype.

---

## 12. Technical architecture

### 12.1 Current local architecture

```text
React UI
  ├── Synthetic evidence fixtures
  ├── Local deterministic calculations
  ├── Claim checker
  ├── Web Crypto hashing
  └── Browser localStorage complaint workspace
```

### 12.2 Planned AWS architecture

```text
Complaint / sensor input
        ↓
API Gateway
        ↓
Lambda intake and validation
        ↓
DynamoDB case state
        ↓
Step Functions orchestration
        ├── Fetch / validate data
        ├── Run deterministic analysis
        ├── Compute placement
        ├── Generate constrained narrative
        └── Seal packet
        ↓
S3 versioned evidence artifacts
        ↓
KMS signature + Object Lock
        ↓
API read/verify endpoint
        ↓
Hosted web application
```

### 12.3 Candidate API contract

```text
POST /cases
POST /cases/{caseId}/runs
GET  /cases/{caseId}
GET  /cases/{caseId}/packet
POST /cases/{caseId}/verify
```

The current frontend is designed so the local fixture path can later be replaced by these service calls without changing the user-facing case workflow.

---

## 13. Data model

### Current complaint record

```json
{
  "schemaVersion": 1,
  "recordType": "local-complaint",
  "evidenceStatus": "pending",
  "complaint": {
    "id": "uuid",
    "incidentType": "Smoke or haze",
    "occurredAt": "2026-10-10T12:30:00.000Z",
    "location": "near the north gate",
    "notes": "Observed for approximately ten minutes",
    "createdAt": "2026-10-10T12:45:00.000Z"
  }
}
```

### Production entities

- Sensor
- Placement
- Calibration
- Observation
- Weather observation
- QA event
- Context event
- Candidate source
- Analysis run
- Hypothesis test
- Evidence packet
- Narrative claim
- Right-of-reply record

The production model must preserve raw inputs and append corrections rather than overwriting historical observations.

---

## 14. Privacy, ethics, and governance

### Privacy

- Reporter identity should be separated from public case views.
- Public maps should fuzz private locations.
- Photo EXIF metadata should be stripped.
- Downloaded JSON should clearly warn that it contains location and notes.
- Browser-only complaint records can disappear when site data is cleared, so export is encouraged.

### Fairness

- The system must test alternatives rather than defaulting to the nearest source.
- Cleared operators should receive incident-specific evidence language.
- A right of reply should not mutate original evidence.
- No long-term “polluter score” should be displayed.

### Safety boundaries

Pramaan is not:

- A legal judgment
- A medical exposure assessment
- A regulatory compliance determination
- A validated atmospheric dispersion model
- A replacement for professional inspection

---

## 15. Validation strategy

Before real-world adoption, the team should build a transparent validation scorecard.

### Synthetic benchmark

Generate incidents with known ground truth across:

- Wind direction and speed
- Source locations
- Plume strength
- Sensor noise
- Missing monitors
- QA faults
- Regional events
- Confounders

### Metrics

- Wrong-source commitment rate
- Accuracy when committing
- Abstention rate
- Regional-event recognition rate
- Brier score and calibration plot where meaningful
- Stability versus correctness
- Performance under missing data
- Performance under wind error
- Ablation impact of each test

### Real-data sanity checks

- A known synchronized city-wide event should return a regional assessment.
- A sensor-outage case should abstain.
- A known monitor fault should not produce a source commitment.

Results must be measured before they appear in the submission or product UI.

---

## 16. Hackathon demo plan

### Three-minute script

#### 0:00–0:20 — Problem

“A pollution complaint is usually treated as an accusation. The nearest visible site becomes the suspect, even when the evidence says otherwise.”

#### 0:20–0:55 — Case A

Show the coherent plume, test matrix, grade, and next action. Emphasize “consistent with”, not “caused by”.

#### 0:55–1:35 — Case B

Show the invalid monitor, contradiction, refusal to blame, and computed next sensor placement.

Key line:

> “The system did not fail to find the culprit. It succeeded in preventing an unsupported accusation.”

#### 1:35–1:55 — Cross-examination

Move the wind and timing controls. Show stability changing and the point where the conclusion weakens.

#### 1:55–2:20 — Regional case

Show simultaneous network rise, local contradiction, and regional escalation.

#### 2:20–2:45 — Integrity

Seal the case, toggle tampering, verify, and show the changed artifact.

#### 2:45–3:00 — Close

“Pramaan changes four decisions: who gets inspected, who gets cleared, where the next sensor goes, and whether the record can be trusted.”

---

## 17. Hackathon judging alignment

### Idea and impact

Pramaan addresses a concrete environmental decision failure: complaints do not reliably become defensible investigations. Its impact is operational, not merely visual.

### Built on AWS

The current local prototype is intentionally credential-free. The planned AWS path uses API Gateway, Lambda, DynamoDB, S3, Step Functions, KMS, CloudWatch, and hosting services. Only services actually provisioned should be stated as deployed in the final submission.

### Design and usability

The interface prioritizes the decision, the next action, and the limits of the evidence. It is responsive, keyboard-navigable, and uses clear status language.

### Execution

The browser prototype has a complete local flow, working synthetic cases, local complaint persistence, claim rejection, and tamper verification.

### Demo video

The product has a strong contrastive story: support one association, refuse one accusation, escalate one regional event, then demonstrate evidence tampering.

---

## 18. Current status matrix

| Capability | Status |
|---|---|
| React/Vite application | Built |
| Three synthetic cases | Built |
| Time-series visualization | Built |
| Schematic sensor map | Built |
| Falsification matrix | Built |
| Grade and next action | Built |
| Cross-examination sliders | Built; illustrative sensitivity |
| Local complaint intake | Built |
| Local complaint persistence | Built with browser storage |
| Complaint JSON download | Built |
| Pending-evidence boundary | Built |
| Claim ledger | Built |
| Hallucination rejection | Built |
| Browser SHA-256 seal | Built |
| Tamper detection | Built |
| Real sensor data | Not built |
| Real pollution authority integration | Not built |
| AWS deployment | Not built |
| KMS signature | Designed |
| S3 Object Lock | Designed |
| Step Functions workflow | Designed |
| Bedrock narrative generation | Designed |
| Real-world calibration | Not built |
| Field validation | Not built |

---

## 19. Phased roadmap

### Phase 0 — Product and scientific boundary

Finalize claims, non-goals, test vocabulary, fixture schema, grade rubric, and privacy policy.

**Exit gate:** An external reviewer can explain the system without confusing it with a legal attribution tool.

### Phase 1 — Deterministic local core

Implement versioned fixtures, QA, episode metrics, falsification, stability, placement, and reproducible packet output.

**Exit gate:** Repeated runs produce identical results for identical inputs.

### Phase 2 — Evidence experience

Complete the case board, chart, map, tests, claim ledger, report, and verifier.

**Exit gate:** A judge can run the complete Case B story without assistance.

### Phase 3 — AWS thin vertical slice

Deploy one real path: create case, run analysis, store state, seal snapshot, retrieve case, verify packet.

**Exit gate:** A case can be demonstrated through actual AWS resources.

### Phase 4 — Evidence hardening

Add Object Lock, KMS signing, audit trails, independent verifier, access controls, and retention policy.

**Exit gate:** An outside reviewer can verify a packet without trusting the frontend.

### Phase 5 — Real-data pilot

Add sensor and weather contracts, calibration records, consent, field placement, domain review, and a validation scorecard.

**Exit gate:** The product can report failures and uncertainty honestly on real data.

---

## 20. Risks and mitigations

| Risk | Mitigation |
|---|---|
| False accusation | Refutation-first tests, abstention, 2× margin, minimum testability, cautious language |
| Bad sensor data | QA flags, calibration metadata, independent comparators, U grade |
| Regional event misattributed locally | Regional background test and R escalation |
| Overconfident heuristics | Stability analysis, visible rules, future calibration |
| AI hallucination | Evidence IDs, deterministic checker, template fallback, human review |
| Evidence edited later | Canonical hashing, manifest root, future signing and Object Lock |
| Reporter retaliation | Anonymous/public separation and location fuzzing |
| Operator manipulation of schedules | Treat schedules as modest contextual evidence and flag self-reported data |
| Browser data loss | Export JSON and clear local-only warning |
| Hackathon overclaiming | Built-versus-designed status matrix and synthetic labels |

---

## 21. Recommended next implementation step

The highest-value next step is a thin AWS vertical slice, not another visual feature:

1. Deploy the frontend.
2. Add `POST /cases` through API Gateway and Lambda.
3. Save a case summary to DynamoDB.
4. Store a canonical evidence snapshot in S3.
5. Add `GET /cases/{id}`.
6. Add an integrity verification route.
7. Keep the local fallback so the demo works during an outage.

This will turn the current working browser prototype into a credible deployed demonstration without pretending that real sensor science or field validation already exists.

---

## 22. Final conclusion

Pramaan is a pollution complaint evidence workflow designed around a simple principle: the system should be useful even when it cannot name a source.

It supports the evidence when the pattern is coherent, clears a candidate when the data contradicts it, escalates when the event is regional, and recommends what to measure next when the evidence is insufficient. It makes the reasoning visible, constrains the language, and detects changes to the record.

The current prototype demonstrates this interaction model with synthetic fixtures and local complaint records. The next stage is to deploy the same case contract on AWS, connect trustworthy data sources, calibrate the heuristics against outcomes, and validate the workflow with domain experts.

The product’s strongest claim is also its most defensible:

> **Pramaan does not promise certainty. It makes uncertainty actionable—and makes unsupported blame harder.**

### Implementation addendum — Configurable service boundary (2026-10-11)

The frontend now includes a typed service boundary that reads `VITE_API_BASE_URL`, `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, and `VITE_COGNITO_REDIRECT_URI`. When the API base URL is absent, the existing local complaint and synthetic workflows remain active. When configured, the Sources screen can verify the backend with `GET /cases`; only a successful HTTP response is labelled connected, and request failures remain visibly local fallback.

The Sources screen documents Open-Meteo and OpenAQ provenance, last-fetched state, and QA boundaries without fabricating readings while offline. A coordinate model and lightweight coordinate-map adapter accept only supplied latitude/longitude values; text locations are never geocoded and no fake GPS markers are rendered. Cognito is represented by signed-out, sign-in-required, and signed-in-placeholder UI states; passwords, tokens, and credentials are not collected by the frontend.

This is a frontend integration boundary, not a deployed cloud connection. Open-Meteo/OpenAQ live ingestion, token exchange, geospatial validation, and backend persistence remain dependent on configured services and future QA work.

---

## Implementation addendum — Operations console upgrade (2026-10-11)

The browser prototype now includes a responsive operations console around the existing evidence engine. The shell provides role-oriented navigation for Intake, Case Desk, Investigations, Evidence, Sensors, Reports, and Settings; unsupported sensor/live-service surfaces are explicitly labelled local prototype.

### Built in this upgrade

- A local Case Desk merges saved complaints with the three synthetic fixtures while preserving the pending-evidence boundary for complaints.
- Search, status filtering, priority/recent sorting, keyboard-operable controls, empty states, and a transparent review queue explain triage factors without inventing live status or evidence.
- Investigation detail tabs cover Overview, Observations, Hypotheses, Evidence, Actions, and Audit. Existing claim checking, sensitivity controls, and SHA-256 tamper verification remain available.
- Local interaction/audit events persist in browser storage. Preferences persist for density, reduced motion, and public-view privacy reminders.
- A local Report Center exports the selected record as explicitly synthetic or pending-evidence JSON and provides a print-friendly view.
- Toast notifications cover refresh, open, export, audit, and verification-related interactions.

### Boundary

This remains a frontend-only browser prototype. Sensors, AWS services, dispatch, regulatory decisions, and real-world attribution are designed or labelled prototype surfaces; no live data or backend was added.

---

## Implementation addendum — Local demo command center density pass (2026-10-11)

The Case Desk now opens to a populated local command center backed by eight explicitly labelled `DEMO / SYNTHETIC` records. The seeded queue spans synthetic case review, pending complaints, a regional event, a QA fault, sensor maintenance, and report-ready packets. Each item exposes illustrative timestamp, role owner, stage, SLA window, evidence-completeness indicator, note, and next action metadata.

The overview adds KPI cards, a compact activity timeline, evidence-health and coverage bars, a local action checklist, data-source health indicators, and a responsive recent-work queue. Selecting a record opens an in-app detail drawer. Users can assign a record to a role or change its local review status; changes are browser-local and written to the best-effort audit history. Reset Demo Workspace restores the eight seeded records.

All seeded content is synthetic and local to the browser. These controls do not edit scientific observations, grades, claims, source attribution, live status, or backend state. External feeds remain unconnected and pending complaints remain pending evidence.

---

## Implementation addendum — Real-world integration boundary (2026-10-11)

The remaining roadmap now has an explicit design boundary in `docs/REAL_WORLD_INTEGRATION.md`. Backend-only validation contracts and fail-closed adapter interfaces cover calibration provenance and validity intervals, jurisdiction configuration, authority submission packages, and external dispersion-model execution. These are interfaces and metadata checks only: no calibration was fitted, no agency integration is live, and no atmospheric dispersion solver or browser plume was implemented. AERMOD/CALPUFF/OpenFOAM-style integration is reserved for a separately licensed, version-pinned, expert-reviewed external runner with raw inputs, logs, uncertainty, and QA retained.

The acceptance gates require provenance, append-only corrections, calibration/reference QA, model applicability review, uncertainty and sensitivity reporting, two-person approval, right of reply, jurisdiction-specific configuration, and fail-closed behavior. The prototype must not claim field validation, regulatory authority, legal findings, causation, or fabricated calibration/model results.

### Release-blocker corrections

- Complaint selections now render an explicit pending-intake workspace in Investigations, Evidence, and Sensors. They never fall through to a synthetic fixture or grade.
- Queue priority totals are computed from disclosed evidence-gap, QA-concern, and time-sensitivity factors. Recent sorting uses numeric timestamps for both fixtures and complaints.
- Audit and preference storage now validates shapes, catches storage failures, and describes history as best-effort local browser storage. Same-tab complaint changes refresh the queue.
- Seal verification resets on case changes, exposes loading/error states, and cancels stale asynchronous updates. Synthetic chart bins are keyboard/click inspectable again.

---

## Implementation addendum — Local operations analytics (2026-10-11)

The Reports view now includes a reusable local operations analytics layer in `src/operations-analytics.ts`. It derives queue aging buckets, workflow status distribution, evidence completeness bands, owner workload, illustrative SLA-risk bands, and audit activity from the seeded synthetic queue, saved complaints, separately persisted complaint workflow statuses, and validated browser audit events.

The derivation is date-safe and deterministic: display timestamps are parsed explicitly, invalid dates are excluded, and the newest valid local record timestamp is used as the summary's `asOf` reference rather than the current wall clock. The Reports / Analytics view presents LOCAL / DEMO labels, cards, bar charts, a traceable record table, recent audit events, an empty state, print support, and a local JSON summary export.

This layer is operational reporting only. SLA risk is explicitly illustrative and is calculated from local age and workflow status; it is not a service-level measurement. Analytics never edits scientific observations, evidence artifacts, complaint text, grades, claims, or source attribution. No backend, live feed, or fabricated status was added.

---

## Implementation addendum — Local five-stage investigation run lab (2026-10-11)

The prototype now includes a runnable local investigation workflow in `src/run-lab.tsx` backed by the deterministic helpers in `src/case-run.ts`. It is a demonstration orchestration layer over the three existing synthetic fixtures, not a second evidence engine and not a live case service.

### Built in this upgrade

- A visible five-stage run: **Intake → QA gate → Falsification → Cross-examination → Seal**.
- Fixture-derived stage output using only the existing case inputs, monitor status labels, recorded tests, existing sensitivity function, and existing SHA-256 sealing functions.
- Start, pause, resume, reset, and re-run controls with progress, current-stage state, and a deterministic fixture-derived run ID.
- Browser-local completed-run history under `pramaan.case-runs.v1`. Re-running a fixture preserves its deterministic ID and updates a local count; history is explicitly best-effort browser storage.
- A downloadable evidence packet containing the selected fixture inputs, every test outcome, grade/action boundary and ceiling, citation ledger, integrity root/result, and limitations. The packet is labelled `DEMO / SYNTHETIC · local fixture only`.
- A two-case comparison view showing grade, eligible completeness, each standardized test-outcome count, and the next action for both synthetic fixtures.
- Guided judge mode that highlights the case selector, run controls, stage progress, comparison, and packet handoff. Walkthrough state changes only the interface and does not alter evidence.

### Evidence boundary

Complaints remain pending evidence and cannot be selected by the simulator, assigned a synthetic run, or included in a synthetic evidence packet. The Run Lab does not fetch live sensors, create backend cases, infer new measurements, or upgrade a fixture grade. A successful local integrity result means only that the canonical browser artifact bytes match the local seal; it does not establish sensor truth, calibration, custody, causation, legal responsibility, regulatory violation, or health impact.

### Current status additions

| Capability | Status |
|---|---|
| Five-stage local synthetic run | Built |
| Visible progress and pause/reset/re-run controls | Built |
| Deterministic fixture-derived run ID | Built |
| Browser-local run history | Built; best-effort storage |
| Downloadable bounded evidence packet | Built; synthetic/local only |
| Two-case synthetic comparison | Built |
| Guided judge walkthrough | Built; presentation guidance only |
| Complaint-to-synthetic-run assignment | Intentionally not built |
| Live orchestration or backend run service | Not built |

The production roadmap still requires an independently validated service boundary, raw-input retention, QA and calibration provenance, expert review, and immutable storage before any real-world investigation claim could be made.
