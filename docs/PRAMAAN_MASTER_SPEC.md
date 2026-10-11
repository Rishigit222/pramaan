# Pramaan (प्रमाण) — Master Product Specification

> **Proof before blame.**

## Document status

| Field | Value |
|---|---|
| Product | Pramaan — pollution complaint evidence studio |
| Prototype status | Working browser prototype |
| Current data | Synthetic fixtures only |
| Initial pollutant | PM2.5 |
| Primary decision | What should an investigator do next? |
| Safety posture | Decision support; not legal, medical, regulatory, or causal proof |
| Last updated | 2026-10-10 |

## 1. The product in one sentence

Pramaan turns a pollution complaint into a reproducible case file that tests competing explanations, exposes uncertainty, protects wrongly suspected sites, recommends the next measurement, and detects changes to the evidence after sealing.

## 2. Why this exists

Pollution complaints are commonly treated as accusations. A resident sees smoke and names the nearest factory. An official has too few sensors and too many cases. A site operator has no evidence-based way to show that it could not have produced a particular episode. A spreadsheet or screenshot can be edited after the fact. The result is either inaction or unsupported blame.

Pramaan is intentionally not another AQI dashboard. An AQI dashboard answers “what is the air like?” Pramaan answers “what should happen after this complaint?”

## 3. The four decisions

1. **Inspection priority:** Which case or site deserves limited field capacity first?
2. **Incident-specific clearance:** Which candidate is contradicted by the evidence for this window?
3. **Next measurement:** Where should a low-cost sensor go to separate the remaining explanations?
4. **Integrity:** Can a reviewer verify that the case file was not silently edited?

## 4. Design principles

### Refutation before attribution

Every candidate is tested against evidence that could make it less plausible. “Nearest” is never a sufficient reason to name a candidate.

### Abstention is a result

Insufficient evidence is a first-class verdict with a visible rule and a concrete next action. It is not an error state.

### Cautious vocabulary

The prototype uses “consistent with”, “contradicted by”, “untestable”, and “regional event”. It does not use “guilty”, “caused”, or “violated”.

### Show the work

Every result is paired with the tests, the inputs, the rule version, the contrary evidence, and the limitations.

### Protect the accused and the reporter

Candidate-source results are incident-specific. Public views should generalize locations, remove personal identifiers, and never expose photo metadata by default.

### A seal is not truth

Hash verification proves that bytes have not changed since sealing. It does not prove that a sensor was truthful, calibrated, or legally collected.

## 5. User roles

| Role | Job to be done | Pramaan output |
|---|---|---|
| Resident/RWA member | Report an episode | Case ID and a traceable investigation |
| Inspector | Triage limited visits | Grade, tests, and next action |
| Site operator | Respond to a named hypothesis | Incident-specific alibi or right of reply |
| Sensor steward | Improve the network | Computed placement and QA warnings |
| Journalist/researcher | Verify the record | Evidence IDs, manifest, and integrity result |
| City administrator | See patterns without overclaiming | Regional escalation and repeat-case summaries |

## 6. The prototype experience

### 6.1 Landing / overview

The landing view should immediately communicate:

- Pramaan’s name and “Proof before blame” promise.
- The synthetic-data boundary.
- A visual explanation of observe → challenge → verify.
- A primary action that takes the user to the investigation.

### 6.2 Case selection

The prototype ships with three deliberately contrasting fixtures:

| Case | Teaching moment | Expected output |
|---|---|---|
| Coherent local plume | A candidate association can be supported without saying “caused” | Grade B, continued observation/inspection request |
| Single-sensor anomaly | Bad QA must block a tempting attribution | Unassessable, independent sensor placement |
| Regional smoke front | Local blame fails when the whole network rises | Grade D for local candidate; regional investigation |

Each fixture is visibly synthetic and reproducible.

### 6.3 Investigation board

The board contains:

1. Case metadata and data-status badge.
2. Peak, coverage, detection index, and source-fit index.
3. An interactive time-series chart.
4. A schematic sensor map with wind direction.
5. A falsification matrix.
6. A verdict and recommended action.
7. Cross-examination controls.
8. A citation-enforced claim ledger.
9. A tamper-evident integrity lab.

## 7. Investigation model

### 7.1 Hypothesis set

Every investigation keeps these options alive:

- Candidate site A, B, C, and so on.
- Regional background or smoke front.
- Unknown/unrecorded source.
- Instrument fault or data-quality failure.

The prototype represents the primary candidate and the alternatives in the fixture summary. A production engine would evaluate all candidates together.

### 7.2 Test vocabulary

Every test returns exactly one of:

- **Supports:** observed pattern is compatible with the hypothesis.
- **Contradicts:** observed pattern is a credible falsifier.
- **Inconclusive:** data exists but does not discriminate.
- **Unavailable:** required data or QA is missing.

### 7.3 Prototype tests

1. **Upwind/downwind contrast:** Does the affected monitor rise more than the upwind reference?
2. **Wind sector and lag:** Does wind carry air from the candidate toward the monitor within a plausible time?
3. **Spatial coherence:** Do independent monitors respond with an expected sequence?
4. **Regional background:** Do regional or upwind references rise together?
5. **Other local sources:** Are important confounders checked?
6. **Instrument validity:** Are calibration, clock, and stuck-reading checks valid?

### 7.4 Quality gates

The prototype makes QA visible through coverage, calibration/status labels, a suspect monitor in the refused case, and a stated exclusion. Production rules must include:

- Expected sample count and eligible coverage.
- Clock skew and duplicate sequence checks.
- Calibration validity interval.
- Saturation, stuck values, impossible jumps, and maintenance windows.
- Wind quality and calm/variable-wind exclusion.
- Raw versus derived values.

## 8. Evidence grade policy

Grades are action labels, not guilt probabilities.

| Grade | Meaning | Prototype action |
|---|---|---|
| A | Strong, stable bounded association | Inspect now |
| B | Consistent association with remaining alternatives | Request records / prioritize visit |
| C | Episode observed but source unresolved | Measure first |
| D | Candidate hypothesis contradicted | Clear candidate for this episode; investigate alternative |
| U | Data cannot support assessment | Repair QA / collect more data |
| R | Regional event | Escalate city-level |

The current UI uses the synthetic fixtures’ own grade labels. Before field use, the rubric needs expert review and calibration against outcomes.

## 9. Cross-examination

The cross-examination controls perturb the assumptions without pretending to generate a calibrated posterior.

Current controls:

- Wind-direction shift from −30° to +30°.
- Transport-timing shift from −15 to +15 minutes.

The UI displays:

- Stability index out of 100.
- Perturbed grade.
- Plain-language interpretation.
- A reset control.

Production extension:

- Re-run 300 deterministic-seeded variants.
- Include wind speed, baseline window, bin width, lag range, calibration bounds, and leave-one-monitor-out variants.
- Report the share of variants reaching each grade, not a probability of guilt.

## 10. Sensor placement

For an unresolved case, the prototype calculates a schematic downwind placement from the wind-from bearing. It intentionally labels the map “schematic — not georeferenced.”

Production placement should evaluate candidate grid locations using:

```text
separation(point) = abs(predicted_concentration_under_H1
                       - predicted_concentration_under_H2)
                       / assumed_sensor_noise
```

The output must include:

- Location and uncertainty.
- Two competing hypotheses.
- Expected difference.
- Deployment duration.
- Upwind/reference requirement.
- A field-siting warning.

## 11. Narrative safety

The claim ledger is deterministic. A claim includes:

- Claim ID.
- Type.
- Text.
- Evidence IDs.
- Grade ceiling.

The checker rejects:

- Unknown or missing evidence IDs.
- Unsupported causation.
- Legal claims.
- Health or safety claims.
- Measurement text that disagrees with the fixture.
- Association text that omits contrary or unresolved evidence.

The prototype’s “Inject a hallucinated claim” control demonstrates the failure path in the UI.

Any future LLM writer must produce a structured claim ledger first, then prose, and must pass this checker before display.

## 12. Integrity model

The prototype seals three canonical artifacts:

1. `observations.json`
2. `assessment.json`
3. `config.json`

Each artifact receives a SHA-256 digest. Sorted leaf digests are hashed into a manifest root. The UI then mutates a held copy of the observation artifact to show a failed verification and identify the changed item.

Production extension:

- Versioned S3 storage.
- S3 Object Lock configured at bucket creation.
- KMS asymmetric signing.
- Independent verification endpoint.
- Audit logging and key rotation.

## 13. Privacy and ethics

- Synthetic data is clearly labelled.
- Public location views should be fuzzed.
- Reporter identifiers should be separated from public case data.
- EXIF metadata should be stripped.
- No medical or legal conclusions.
- No “polluter score”.
- Repeated consistency is not the same as responsibility.
- Operators need a right of reply.

## 14. AWS implementation contract

The prototype is browser-first so it works without credentials. The production-shaped contract is:

```text
POST /cases
POST /cases/{caseId}/runs
GET  /cases/{caseId}
GET  /cases/{caseId}/packet
POST /cases/{caseId}/verify
```

Suggested services:

- API Gateway for the HTTP contract.
- Lambda for intake, deterministic analysis, and read endpoints.
- DynamoDB for case status and indexes.
- S3 for raw/derived/sealed artifacts.
- Step Functions for visible orchestration.
- KMS for signing.
- CloudFront or Amplify Hosting for the frontend.
- CloudWatch for errors, latency, and cost alarms.

The current app must not claim these are provisioned. It includes the interface and local behavior so deployment can be added behind the same contract.

## 15. Full phased delivery plan

### Phase 0 — Narrative and scientific boundary

Deliverables:

- Product promise.
- Non-goals.
- Synthetic fixtures.
- Test vocabulary.
- Grade definitions.
- Demo script.

Exit gate: a reviewer can explain what the prototype does and does not claim in under one minute.

### Phase 1 — Local deterministic engine

Deliverables:

- Versioned fixtures.
- Canonicalization.
- Test outcomes.
- Grade calculation.
- Sensitivity function.
- Placement calculation.

Exit gate: a reload and rerun produce identical outputs for all fixtures.

### Phase 2 — Evidence experience

Deliverables:

- Responsive interface.
- Time-series chart.
- Sensor map.
- Falsification matrix.
- Claim ledger.
- Integrity lab.

Exit gate: a judge can complete the full Case B story without assistance.

### Phase 3 — Reliability and validation

Deliverables:

- Build check.
- Golden fixture assertions.
- Tamper checks.
- Citation rejection tests.
- Accessibility pass.
- Browser smoke test.

Exit gate: no demo path depends on an unverified claim or hidden manual state.

### Phase 4 — AWS thin vertical slice

Deliverables:

- Hosted frontend.
- One API Gateway route.
- One Lambda analysis call.
- DynamoDB case record.
- S3 sealed artifact.

Exit gate: the same case ID can be created, read, analyzed, and verified through AWS.

### Phase 5 — Field readiness

Deliverables:

- Real source contracts.
- Ingestion QA.
- Sensor calibration records.
- Consent and privacy process.
- Domain review.
- Validation scorecard.

Exit gate: no real-world deployment until measurement and claims policies are reviewed.

## 16. Prototype acceptance checklist

- [x] Three selectable synthetic cases.
- [x] Interactive observation chart.
- [x] Schematic sensor map.
- [x] Explicit test outcomes.
- [x] Grade and next action.
- [x] Cross-examination controls.
- [x] Next-sensor placement for unresolved case.
- [x] Claim ledger.
- [x] Injected unsupported claim rejection.
- [x] SHA-256/Merkle-like sealing.
- [x] Visible tamper failure.
- [x] Responsive visual design.
- [x] Run instructions.
- [ ] Real sensor feed.
- [ ] Deployed AWS backend.
- [ ] KMS signature and Object Lock.
- [ ] Field validation.

## 17. Demo script

### Opening

> “A complaint is not evidence. Pramaan puts the accusation on trial.”

### Case A

Show the coherent local plume and explain that the result is “consistent with,” not “caused by.”

### Case B

Show the invalid sensor, the contradiction, the refusal to blame, and the sensor placement.

### Cross-examination

Move the sliders and show the grade/stability response.

### Integrity

Seal, tamper, verify, and identify the changed artifact.

### Close

> “Pramaan changes what happens after a complaint: who gets inspected, who gets cleared, where to measure next, and whether the record can be trusted.”

## 18. What must never be overclaimed

- Synthetic fixtures are not real city measurements.
- A heuristic score is not a probability of guilt.
- A hash does not prove sensor truth.
- A source association is not causation.
- A prototype grade is not a regulatory finding.
- A schematic placement is not a field deployment order.
- A future AWS architecture is not a deployed system.

## 19. Team handoff format

Every future change should update:

1. `docs/BUILD_LOG.md` with what changed and what was actually checked.
2. `docs/PHASES.md` if an exit gate changed.
3. This specification if a claim, grade, or data contract changes.
4. `README.md` if the run flow changes.

This keeps the project self-aware without storing secrets or private notes in the repository.
