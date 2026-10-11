# Pramaan — Pollution Evidence Prototype Blueprint

**Status:** Design blueprint plus a browser-only React/Vite synthetic frontend prototype. No infrastructure, real datasets, or validated measurements are built in this workspace.

## 1. Product vision and scope

Pramaan ("proof") is a decision-support prototype that turns time-stamped air-quality observations into an inspectable **evidence packet** for a suspected pollution episode. It helps residents and investigators ask whether a change was real, persistent, spatially coherent, and consistent with a *candidate* source, while making contrary evidence and uncertainty equally visible. The output is a reproducible hypothesis assessment, **not** a regulatory finding, health diagnosis, legal proof, or automatic accusation.

The first demonstration centers on outdoor PM2.5 episodes near a hypothetical facility, with an upwind reference, downwind monitors, wind observations, and contextual events. The design should also handle the outcome “insufficient evidence” or “hypothesis weakened.” Facility names, coordinates, and observations in the demo are synthetic. Later pollutant types (NO₂, SO₂, VOCs) require pollutant-specific QA, transport assumptions, and thresholds; they must not inherit PM2.5 rules without review.

### Principles

- **Show work:** every conclusion links to immutable input versions, computations, thresholds, contrary observations, and algorithm version.
- **Attempt to disprove:** evaluate pre-registered alternatives before assigning a high evidence grade.
- **Separate levels of claim:** measured concentration, detected episode, spatial association, candidate-source consistency, and proven causation are distinct.
- **Conservative on missingness:** missing, stale, miscalibrated, or tampered data lowers confidence; it never silently becomes a zero or a confirming observation.
- **Human review:** an investigator approves any public-facing narrative; prototype output labels itself as an assessment.

## 2. Personas and jobs

| Persona | Job | Needed output |
| --- | --- | --- |
| Resident/community advocate | Understand an episode and share a defensible account | Plain-language packet, uncertainty, accessible map and timeline, source links |
| Field investigator/environmental scientist | Test hypotheses and audit data quality | Raw-versus-corrected series, QA flags, wind context, falsification matrix, reproducible calculations |
| Sensor steward | Deploy, calibrate, inspect, and retire monitors | Placement metadata, calibration and maintenance history, clock/connectivity/tamper alerts |
| Reviewer/journalist/regulator | Check whether a claim overreaches | Provenance, counterevidence, evidence grade rationale, export and verification instructions |
| Prototype operator | Load synthetic scenarios and demonstrate reproducibility | Scenario fixtures, health status, deterministic rerun and reset |

## 3. Prototype user flow and acceptance criteria

1. Operator selects a synthetic case and its candidate source and analysis window.
2. System displays map, sensor health, raw and corrected time series, wind direction/speed, known events, and data gaps.
3. Analyst opens the episode: sees baseline, excess, persistence, spatial/wind comparison, and alternative-hypothesis tests.
4. System generates a versioned evidence grade and a narrative with linked claims; analyst can reject or revise the narrative without changing observations.
5. Reviewer exports a packet with a manifest and verifies its integrity independently.

| ID | Verifiable acceptance criterion for a completed prototype |
| --- | --- |
| AC-01 | A seeded scenario can be loaded and replayed with identical inputs and configuration; the resulting metrics, grade, and packet manifest are reproducible. |
| AC-02 | Each plotted point exposes sensor, UTC timestamp, units, raw value, corrected value if any, QA state, calibration version, ingest time, and source record ID. |
| AC-03 | Gaps, clock anomalies, sensor drift, bad wind, and maintenance intervals visibly change coverage and eligibility; excluded values remain inspectable. |
| AC-04 | Episode metrics show baseline definition, window, uncertainty/coverage, persistence, and sensitivity to alternate reasonable windows. |
| AC-05 | Each candidate-source assessment includes a table of supportive, contrary, inconclusive, and unavailable tests; at least one falsifier can lower the grade in every demo case. |
| AC-06 | A high grade cannot be assigned when independent reference evidence is absent, wind quality is inadequate, or required QA is unresolved. |
| AC-07 | Generated narrative claims cite exact evidence IDs and state the grade and limitations; an unsupported causation claim is blocked or flagged for rewrite. |
| AC-08 | Packet export includes machine-readable inputs/derivations, human-readable report, hashes, manifest, algorithm/config versions, and verification result; changing a byte after sealing fails verification. |
| AC-09 | Demo includes a plausible positive association, a confounded/ambiguous event, and a falsified or sensor-fault event with different explanations and grades. |
| AC-10 | Public view hides precise private-location metadata and personal identifiers; analyst view retains authorized audit detail. |

## 4. Data model and provenance

Use UTC internally, explicit IANA zone only for display, WGS84 coordinates, meters for distances, degrees clockwise from true north for wind **from** direction, m/s for speed, and µg/m³ for PM2.5. Preserve original units and conversion metadata; reject unrecognized units. IDs are stable UUIDs or content-addressed identifiers. Never overwrite an observation: corrections and QA decisions are append-only derived records.

| Entity | Minimum fields and relationships |
| --- | --- |
| `Sensor` | `sensor_id`, type/model/serial, owner, pollutant capabilities, installation/retirement times, sampling cadence, privacy class, `placement_id` |
| `Placement` | `placement_id`, effective interval, coordinates with accuracy and public generalization, intake height, mounting, obstruction/traffic/road proximity, site photos/notes, survey method, candidate-source distance/bearing, siting approval |
| `Calibration` | `calibration_id`, sensor, effective interval, method, reference device, coefficients, uncertainty, operator, certificate/artifact digest; no retrospective use outside validity |
| `Observation` | `observation_id`, sensor, measured-at UTC and received-at UTC, original reading/unit, pollutant, averaging period, device sequence, firmware, source payload digest, transport metadata, signature if supported |
| `WeatherObservation` | time/window, station/location, wind-from direction/speed/gust, stability proxies, precipitation, temperature/RH, quality and source provenance |
| `QAEvent` | subject ID, rule/version, flag (`valid`, `suspect`, `invalid`, `missing`), reason, effective interval, actor and time; retains previous decisions |
| `ContextEvent` | time/window, geometry, type (traffic, wildfire smoke, construction, fire, facility operation, regional alert), source, reliability, uncertainty, optional supporting artifact |
| `CandidateSource` | source ID, generalized or precise geometry, emission/pollutant hypothesis, operating evidence if available, provenance; candidate does not imply emitter |
| `AnalysisRun` | run ID, input snapshot/manifest digest, code image/commit, config and threshold version, analyst, baseline/control/window choices, metrics, uncertainty, missing-data accounting, created-at |
| `HypothesisTest` | run, hypothesis and preregistered falsifier, observed result, threshold, outcome (`supports`, `contradicts`, `inconclusive`, `unavailable`), linked evidence IDs |
| `EvidencePacket` | packet ID, run, grade and rationale, claim/citation graph, reviewer status, artifact list and digests, manifest digest, seal time, verification history |

Raw readings, derived intervals, calibrations, placement revisions, manual annotations, and reports have distinct IDs. The derivation graph points backward to exact versions, including weather and contextual sources. Access-controlled location detail is separate from shareable generalized geometry. Store source license and retention class per artifact. A device signature attests only to a device key, not to measurement truth.

## 5. Measurement, episode, and falsification rules

All numeric values below are **initial demo configuration examples**, not statutory limits or validated health thresholds. Freeze and publish configuration before running each scenario; refine against expert review and local monitoring characteristics before field use.

### Quality gates and episode definition

1. Normalize to fixed 5-minute UTC bins, recording the count and coverage per bin; do not interpolate missing PM2.5 or wind to manufacture persistence. Keep original cadence. A bin is eligible only with ≥70% expected valid samples and a valid effective calibration.
2. Flag impossible/negative values, saturation, duplicate sequence IDs, implausible jumps, stuck readings, clock skew (example >2 minutes), humidity interference, and maintenance windows. Cross-device agreement is a diagnostic, not an automatic deletion rule. Distinguish missing from explicitly invalid and from below detection limit.
3. Compute a local robust baseline from comparable pre-event time or matched control periods (example median of valid bins over previous 24 hours, excluding known episodes); expose baseline distribution and day/time sensitivity. Avoid an event-contaminated baseline.
4. Propose an episode when corrected downwind PM2.5 exceeds both the baseline by an example 10 µg/m³ and a relative example 50% for ≥3 consecutive eligible 5-minute bins. Show actual values and uncertainty. Crossing this trigger only detects a candidate episode, not a source.
5. Require ≥75% eligible bins for each compared interval as an example coverage gate; below it, report metrics with a coverage warning but do not upgrade a grade. Time alignment tolerance and expected transport lag must be explicit and tested across a bounded range, not fitted after seeing the peak.

### Pre-registered candidate-source tests

| Test | Supporting pattern | Falsifier / downgrade condition |
| --- | --- | --- |
| Upwind/downwind contrast | Downwind excess over simultaneous upwind reference beyond combined sensor uncertainty | Similar or larger upwind rise; no valid upwind comparator |
| Wind-sector and lag | Valid wind carries air from candidate toward affected monitors for plausible travel time | Sustained winds away from candidate, calm/variable winds that defeat direction inference, or lag inconsistent with distance |
| Spatial coherence | Multiple independent downwind monitors respond with plausible ordering | Only one monitor spikes while nearby independent monitors remain stable under comparable exposure |
| Background/regional event | Local excess remains after regional/control signal is considered | Regional monitors rise together or an identified wildfire/transport plume better explains the episode |
| Confounders | Alternative local activities examined with timing/location evidence | Traffic, construction, cooking, fireworks, dust, or another candidate fits at least as well; label unresolved rather than choose a favorite |
| Instrument validity | Maintenance, calibration, clock, RH, power, and sequence checks pass | Fault, relocation, tamper alert, bad calibration, or missing audit trail overlaps episode |
| Repeatability (optional) | Independent comparable episodes with same spatial pattern | No repeat does not alone disprove a one-off event; cherry-picked events or changing placements weaken generalization |

For each test, save predicted observation **before** inspecting its result, data used, uncertainty, outcome, and reason. Report both falsifying and unavailable tests. Do not treat lack of an operations log as proof of inactivity or operation. If the candidate has no verified activity data, state it. Never convert correlation, wind alignment, or grade into a probability of guilt.

## 6. Evidence grades and decision policy

Grades assess the **quality of evidence for a specified hypothesis and time window**, not ambient-air safety or culpability. Overall grade is bounded by the weakest required domain (measurement quality, temporal/spatial comparison, meteorology, confounder analysis, provenance). No weighted score can compensate for a hard exclusion.

| Grade | Interpretation and minimum evidence |
| --- | --- |
| `U — Unassessable` | Coverage, provenance, clock, calibration, or meteorology is insufficient for a defensible comparison. |
| `D — Contradicted` | Credible falsifier conflicts with the source hypothesis, even if an episode was observed. Document the better-supported alternative or uncertainty. |
| `C — Episode observed` | QA-passing, persistent change versus disclosed baseline; source attribution not established. |
| `B — Consistent association` | C plus independent upwind/downwind or spatial corroboration, adequate wind/lag, and explicit review of major alternatives; no decisive contradiction. |
| `A — Strong, bounded association` | B plus multiple independent sensors/episodes or independent operational evidence, stable conclusions under reasonable analysis choices, complete provenance, and no unresolved material falsifier. Still not proof of causation. |

Apply `U` if required QA or minimum coverage fails; use `D` for a valid decisive contradiction, not merely missing data. Otherwise promote from C only if all required criteria for B/A pass. A reviewer records overrides with rationale and a new report version, never edits the original run. Display episode-detection confidence separately from source-association grade.

## 7. Stability and sensitivity analysis

Run the same hypothesis across predeclared reasonable perturbations: baseline length (for example 12/24/48 hours), event-window shift (±15 minutes), bin width (5/10 minutes), lag range determined from source distance and observed wind speed, calibration uncertainty bounds, exclusion of one monitor at a time, and alternate valid wind station if available. Report a compact matrix of episode detection, peak excess, contrast, falsifier outcomes, and grade per variant. State the fraction of valid variants reaching each grade, **not** a posterior probability. If a small justified choice changes B/A to C/D/U, label the conclusion unstable and cap the reported grade at C pending review. Do not try arbitrary variants until one supports a preferred conclusion. Track all attempted variants and the frozen configuration.

## 8. Sensor placement and field protocol

- Before installation, survey candidate-source geometry and prevailing winds; place at least one contemporaneous upwind/background monitor and two downwind monitors at different distances or bearings, plus a regional reference where feasible. Site independently enough to detect a single bad monitor. Wind instrumentation should represent the air pathway; record station distance and terrain/building effects.
- Match monitor type, inlet height (record actual height), sampling/averaging cadence, calibration, and exposure as closely as possible. Avoid direct exhaust, walls, vents, road intersections, sheltered courtyards, and unrepresentative microenvironments unless those are explicitly the question under test.
- Record GPS uncertainty, mounting photos, power/network conditions, local obstruction, relocation and maintenance logs, consent and privacy constraints, and tamper seals. Do not publish private home coordinates by default.
- Perform pre-deployment co-location against a suitable reference and periodic cross-checks; log humidity and local conditions. Low-cost PM sensors are screening instruments whose biases can vary with aerosol and RH. Publish uncertainty and calibration validity rather than representing them as regulatory-grade monitors.
- Before each case, inspect whether winds actually make the designated monitors upwind/downwind; roles are time-dependent, not permanent map labels. Calm, recirculating, or complex terrain cases should be unassessable for directional attribution.

## 9. Tamper-evident evidence chain

1. At ingest, retain exact raw payload and metadata; compute SHA-256 over canonical bytes, record ingestion timestamp, transport identity, and device signature/sequence if available. Flag missing sequence or clock drift. A server timestamp does not prove the device measurement time.
2. Store original payloads and attachments in versioned, encrypted, access-controlled object storage; prohibit mutation by application roles. Append corrections, calibration changes, QA decisions, and analyst annotations as new signed/audited events. Use distinct permissions for ingest, analysis, review, and export.
3. Construct each run from a pinned manifest of sorted artifact IDs/digests plus canonical config, code version, and environment version. Deterministic serialization and hashing yield a run digest; export a packet manifest containing hashes of every included file. Seal/sign the manifest with a managed signing key, record signer/key version and trusted service timestamp, and optionally anchor digests in an external append-only log.
4. Verification recomputes every file digest and manifest digest, checks signature, key status, run-to-source references, and expected sequence/coverage, then reports `verified`, `failed`, or `incomplete`. A valid hash proves bytes have not changed since sealing; it does **not** prove truthful sensors, reliable calibration, or lawful custody before ingest.
5. Log access, exports, key rotations, and failed verification; retain original packet and publish a superseding version with explanation for any correction. Define retention and deletion policies before real-world collection, with legal review for protected records.

## 10. Narrative checker

Generate a structured claim ledger before prose: claim ID, claim type (`measurement`, `comparison`, `association`, `causation`, `health`, `legal`), asserted time/place/unit, cited evidence IDs, computation/threshold, grade ceiling, and caveats. The checker validates citation existence and source version, numerical agreement within displayed rounding, eligible time/location, unit consistency, no cherry-picked omission of decisive contrary evidence, and required uncertainty language. It rejects unsupported causation, named culpability, medical claims, or legal-standard language. Examples:

- Allowed at C: “Monitor D1 recorded a 25 µg/m³ increase above its disclosed baseline during 10:00–10:20 UTC; the source is undetermined.”
- Allowed at B if tests pass: “The pattern is consistent with transport from candidate S1 during this window; an alternative regional contribution remains possible.”
- Blocked: “S1 caused the pollution and violated the law” based only on PM spikes and wind alignment.

Use deterministic templates for the first prototype; any later LLM-generated draft must pass the same checker and human review. Show the checker result and revisions in the packet. Citations must resolve to plotted observations, tests, or artifacts in the sealed manifest. Narratives have separate draft/approved/superseded states.

## 11. AWS target architecture (designed, not provisioned)

```text
Synthetic fixtures / future devices → IoT Core or authenticated API Gateway ingestion
    → SQS + Lambda validation/QA → S3 raw bucket (versioning, Object Lock if configured)
    → EventBridge/Step Functions analysis orchestration → containerized deterministic analysis (ECS Fargate)
    → S3 derived artifacts + DynamoDB metadata/index (or RDS if relational queries demand it)
    → API Gateway + Lambda read API → CloudFront-hosted web UI
    → packet generator → S3 sealed exports + KMS signing → verifier endpoint/CLI
CloudWatch logs/metrics, CloudTrail audit, IAM least privilege, KMS encryption, Secrets Manager
```

Start the demo with fixture ingestion through the same validation contract as future devices. Use idempotency keys (`sensor_id`, device sequence, measurement time, payload digest) and a dead-letter queue for malformed or duplicate/conflicting messages. Store raw bytes before derived processing; queue-driven processing is at-least-once, so analyses must be idempotent. S3 Object Lock requires an appropriate bucket and retention configuration at creation; versioning alone does not prevent privileged deletion. Separate public generalized coordinates from private metadata. Use regional services and explicit data residency, retention, cost budgets, and backup/restore targets once a deployment region and real data policy are chosen. No AWS account, region, domain, budget, or compliance posture is assumed here.

## 12. Demo cases and expected behavior

All scenario inputs are synthetic and labeled as such in UI and exports; expected grades are assertions against versioned fixture/config data, not claims about any actual facility.

| Case | Seeded pattern | Expected assessment |
| --- | --- | --- |
| A: coherent local plume | Valid downwind rise on two monitors, stable upwind/regional references, credible wind/lag, sufficient coverage, no material alternative | Episode detected; B association (A only if stronger independent evidence is explicitly added); cautious cited narrative |
| B: regional smoke/traffic confounder | Multiple monitors including upwind/regional rise, or traffic timing explains signal; candidate-facing wind alone looks tempting | Episode may be detected; C or D for candidate hypothesis; contrary tests and alternative prominent |
| C: faulty or tampered sensor | Single extreme spike, stuck/jump sequence or calibration/clock/tamper alert, peers stable | U if QA invalidates comparison; if valid peers decisively contradict a still-testable hypothesis, D; no source accusation |
| D: sparse/variable wind | Downwind PM increase but missing reference bins or calm, rotating winds | C if episode QA passes, otherwise U; source attribution withheld |

Include a fixture variant where changing the baseline or lag flips a tentative B to C, demonstrating the stability cap, and a modified exported file that fails integrity verification. Show a case selection screen, map/timeline, test matrix, sensitivity view, claim ledger, report, and verifier result.

## 13. Phased implementation plan

| Phase | Deliverable | Exit gate |
| --- | --- | --- |
| 0. Scientific design | Expert-reviewed measurement protocol, candidate hypotheses/falsifiers, fixture schema, privacy and grade rubric | Reviewers agree on claim ceilings and validation examples |
| 1. Local deterministic core | Synthetic fixtures, canonical ingestion contract, QA, episode metrics, falsification and stability engine, reproducible packet format | All demo cases meet expected results and rerun identically |
| 2. Evidence experience | Map/timeline, raw/corrected/QA drilldown, test matrix, narrative checker, reviewer workflow, export/verifier | AC-01–AC-09 pass in an end-to-end demo |
| 3. AWS pilot | IaC for isolated environment, ingest pipeline, object storage/audit/signing, analysis worker, read API/UI, monitoring | Deployment, fault recovery, permissions, and cost checks pass |
| 4. Limited field validation | Consented placements, co-location/reference comparison, drift and meteorological evaluation, outside domain review | Revise thresholds/uncertainty and claims before any public real-world use |

Each phase records code/data/config versions and unresolved limitations. A field trial is an evaluation of the prototype, not a certification. Choose specific framework, IaC tool, retention period, and deployment region during phase planning rather than implying they exist now.

## 14. Testing and evaluation plan

- **Contract/unit:** timestamp and timezone parsing, units, bin coverage, calibration validity boundaries, duplicate/out-of-order delivery, QA states, wind-from geometry and angle wrap, lag windows, baseline contamination, missingness, and grade caps.
- **Property/metamorphic:** reordering input delivery leaves results unchanged; duplicate payloads do not double-count; removing valid data cannot increase evidentiary grade; changing a cited value changes the run/packet digest; equivalent units yield equivalent metrics.
- **Scenario/golden:** all seeded cases, exact expected metrics/grade/test outcomes with config versions, sensitivity flip, wrong wind direction, regional simultaneity, single-sensor fault, and no viable comparator.
- **Narrative:** unsupported number/citation, omitted decisive falsifier, incorrect unit, causation/legal/health overclaim, stale superseded source, and successful bounded claims.
- **Integrity/security:** bit-flip and deleted artifact detection, altered manifest/signature, revoked or rotated keys, unauthorized access to private coordinates, least-privilege IAM, retry/idempotency and dead-letter recovery.
- **Operational:** ingestion latency, analysis completion under a stated demo dataset size, fixture replay determinism across environments, audit trail, backup/restore and cost alarm in the AWS pilot.
- **Scientific evaluation:** compare collocated sensors with reference instruments across humidity/season and known events; measure false episode alerts, missed episodes, QA coverage, source-hypothesis disagreement, and reviewer inter-rater agreement. Publish failures and applicability limits; recalibrate rubric rather than retrofitting a preferred demo conclusion.

## 15. Explicit built-versus-designed boundary and assumptions

| Area | Present in this workspace | Described target |
| --- | --- | --- |
| Product and methodology | This blueprint and illustrative UI logic | Reviewed scientific protocol and operational product |
| Code/UI/tests/fixtures | Local React/Vite demo with three synthetic cases, illustrative heuristics, and browser integrity check; no full ingestion engine | Phased prototype and automated verification |
| Sensors/measurements | None | Synthetic demos first; later consented, calibrated field deployment |
| AWS/keys/storage | None provisioned | Target architecture subject to region, budget, security and retention decisions |
| Evidence packets/grades | Definitions only | Computed, sealed, reviewed outputs after implementation |

**Assumptions to validate:** “Pramaan” refers to an air-pollution evidence prototype; PM2.5 is the initial pollutant; the first user-facing claim is a bounded assessment of an episode near a candidate facility; scenarios are synthetic; AWS is the desired deployment target; and no jurisdiction-specific legal or regulatory threshold has been supplied. If the intended pollutant, geography, source, sensor fleet, evidentiary standard, or application audience differs, adjust the protocol and acceptance criteria before implementation. Numeric demo thresholds, coverage limits, and example grades are placeholders for domain review, never field-validated standards.
