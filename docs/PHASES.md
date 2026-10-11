# Pramaan Delivery Phases

This is the executable plan for turning the prototype into a credible hackathon submission and then into a deployable pilot.

## Phase 0 — Win the story

**Objective:** Make the product legible in 30 seconds.

### Work items

- Lead with “proof before blame”.
- Frame the problem as an inspection-decision failure, not an AQI visualization problem.
- Make Case B the hero case.
- Label all fixtures synthetic.
- Keep “consistent with”, “contradicted by”, and “insufficient evidence” vocabulary.

### Exit gate

Someone who did not build the app can answer: who uses it, what decision changes, and why abstention is useful.

## Phase 1 — Working local prototype

**Objective:** One reliable, credential-free browser demo.

### Work items

- `npm install`
- `npm run build`
- Run the Vite app.
- Load all three cases.
- Test chart hover/focus.
- Test wind/timing controls.
- Test claim injection.
- Test integrity tamper toggle.

### Exit gate

The full demo can be recorded locally without a backend, credentials, or network APIs.

## Phase 2 — Hackathon polish

**Objective:** Make the interface memorable and judge-friendly.

### Work items

- Keep the editorial dark visual system.
- Preserve 3D depth through layered cards, orbit graphic, grid map, and clear motion.
- Put the recommendation beside the verdict.
- Put limitations next to the metric, not buried in a footer.
- Add keyboard focus and responsive behavior.
- Record the three-minute video.

### Exit gate

The judge sees an observable action on every case and never needs the team to explain what to click next.

## Phase 3 — Validation evidence

**Objective:** Be honest and technically defensible.

### Work items

- Add golden checks for each fixture.
- Record expected grade and test outcomes.
- Check tamper detection after changing observations.
- Check narrative rejection for unknown IDs and causal language.
- Record limitations in the submission.

### Exit gate

Every number shown in the demo can be traced to a fixture or deterministic calculation.

## Phase 4 — Thin AWS vertical slice

**Objective:** Satisfy the AWS requirement with one real path, not a diagram-only claim.

### Work items

- Host the built frontend.
- Add `POST /cases` through API Gateway and Lambda.
- Persist a case summary in DynamoDB.
- Write a sealed snapshot to S3.
- Add `GET /cases/{id}`.
- Keep local fallback if the cloud path is unavailable.

### Exit gate

One case can be created and retrieved through AWS and the video can show the actual resource path.

## Phase 5 — Evidence hardening

**Objective:** Move from browser demonstration to reviewable evidence packet.

### Work items

- S3 versioning and Object Lock configured correctly.
- KMS asymmetric signing.
- Independent verifier endpoint.
- Exported case-file schema.
- Audit events and access control.

### Exit gate

A reviewer can independently verify an exported packet without trusting the UI.

## Phase 6 — Real-data pilot

**Objective:** Introduce real measurements only after the measurement contract is ready.

### Work items

- Source contracts for weather and sensor feeds.
- Calibration and placement metadata.
- Missing-data and QA policy.
- Consent and privacy process.
- Domain expert review.
- Validation scorecard.

### Exit gate

The team can report failures, applicability limits, and calibration status without turning a demo heuristic into a public accusation.

## Cut list when time is short

Cut these before cutting reliability:

- Crowd compass triangulation.
- Messaging-app intake.
- Recurrence ledger.
- Operator portal.
- Bedrock prose generation.
- Complex authentication.
- Multi-pollutant support.

Never cut:

- Synthetic labels.
- Abstention path.
- Evidence IDs.
- Tamper demo.
- Limitations.
- Working build.
