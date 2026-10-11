# AWS Builder Center Article Draft — Pramaan

## Form metadata

### Title

**Proof Before Blame: Building Pramaan for Pollution Complaints**

### Description

Pollution complaints often become accusations before they become investigations. Pramaan turns a complaint into a transparent evidence workflow that can challenge a suspected source, abstain when the data is weak, recommend the next measurement, and detect changes to the record.

### Tags

1. AWS
2. Serverless
3. Sustainability
4. Amazon DynamoDB
5. Amazon S3

### Cover image

Optional. Suggested concept: a dark evidence-case interface with a split path from “complaint” to “inspect / measure / escalate”, using an abstract wind field and a sealed evidence marker. Do not place dense text in the image.

---

# Proof Before Blame: Building Pramaan for Pollution Complaints

Every pollution complaint has a human story behind it. Someone smells smoke, sees dust, notices haze, or watches a familiar site operate late into the night. The report may be genuine. But a report is not automatically evidence of which source caused an episode.

That gap is where many complaints die.

An authority may have too few inspectors, too few monitors, incomplete wind data, and several plausible explanations. The nearest visible site becomes the suspect because the workflow has no better answer. A spreadsheet or screenshot may contain useful readings, but it can be edited later. An operator who was not responsible has no incident-specific way to be cleared.

We built **Pramaan (प्रमाण)** around a different principle:

> **Proof before blame.**

Pramaan is a pollution complaint evidence workflow. It tests competing explanations, exposes contradictory and missing evidence, refuses unsupported attribution, tells an investigator what to do next, and makes changes to a sealed evidence record detectable.

This article explains what we built, what runs today, how AWS fits into the design, and what we deliberately have not claimed yet.

## The decision after a complaint

Pramaan is not another air-quality dashboard. A dashboard answers a question such as “what is the current PM2.5 level?” Pramaan is designed for the next operational question:

**What should happen after somebody reports a pollution incident?**

The system is organized around four decisions:

1. Which complaint or candidate should an inspector review first?
2. Which suspected site can be cleared for this specific incident window?
3. Where should the next sensor be placed if the evidence is insufficient?
4. Can a reviewer verify that the case record was not silently changed?

That framing changes the product from a visualization into a workflow.

## The anti-blame investigation

Each case keeps more than the named suspect alive. The working model includes:

- A candidate local source
- Regional haze or smoke
- An unrecorded source
- Instrument or data-quality failure

Every test has one of four outcomes:

- **Supports:** the observed pattern is compatible with the hypothesis.
- **Contradicts:** a credible falsifier conflicts with the hypothesis.
- **Inconclusive:** data exists, but it does not discriminate.
- **Unavailable:** the required evidence or quality information is missing.

The current synthetic investigation battery includes:

- Upwind/downwind contrast
- Wind sector and transport timing
- Spatial coherence across independent monitors
- Regional background comparison
- Other local sources and confounders
- Instrument validity, calibration, and clock status

The language is intentionally bounded. The prototype says **“consistent with”** and **“contradicted by.”** It does not say “guilty,” “violated,” or “caused” when the available evidence cannot support those claims.

## Three cases that teach the product

The prototype includes three reproducible synthetic cases. They are clearly labelled synthetic in the interface and exported packets.

### Case 1: Coherent local plume

Two independent downwind monitors rise in sequence while an upwind reference remains near baseline. Wind and timing are compatible with a candidate association. The prototype reports a bounded Grade B association and shows the alternative explanation that remains possible.

### Case 2: Single-sensor anomaly

A dramatic reading comes from a monitor with a clock or calibration problem. Independent peers do not corroborate the rise. Pramaan excludes the invalid reading from source attribution, refuses to name a source, and recommends collecting better evidence.

This is the case that matters most to us. The system does not treat abstention as failure. It turns uncertainty into a next measurement.

### Case 3: Regional smoke front

Upwind, downwind, and regional references rise together. The candidate-specific local explanation is contradicted by the broader pattern. Pramaan directs the reviewer toward a regional explanation and provides incident-specific clearance language for the candidate.

## What is implemented today

The current application is a local React and Vite prototype. It runs without API keys or a cloud account and includes more than a static screen:

- Complaint intake for smoke, dust, odour, and other incidents
- Browser-local complaint persistence and JSON export
- A populated synthetic operations command center
- Searchable and filterable local review queue
- Local role assignment and workflow-status changes
- Best-effort browser audit history
- Operations analytics for queue age, status, ownership, evidence completeness, and illustrative SLA risk
- Interactive synthetic PM2.5 time-series views
- Schematic sensor geometry and computed next-sensor placement
- A falsification matrix with visible contrary evidence
- Cross-examination controls for wind and timing assumptions
- A five-stage Run Lab: Intake, QA gate, Falsification, Cross-examination, and Seal
- Case comparison across grade, coverage, and test outcomes
- Guided judge mode for the demonstration
- Downloadable synthetic evidence packets
- A citation-enforced claim checker
- An injected unsupported-claim rejection demo
- Browser SHA-256 sealing and tamper verification
- Responsive views for the case desk, reports, settings, sources, and investigations

The complaint workflow has an important boundary: an ordinary user report remains **pending evidence**. It is never silently assigned a synthetic sensor reading, synthetic grade, or source attribution.

## The evidence packet

When a synthetic Run Lab execution completes, Pramaan can create a local JSON evidence packet containing:

- Fixture identity and version
- Case and incident window
- Sensor records
- QA gate output
- Falsification results
- Cross-examination output
- Grade and recommended-action boundary
- Citation ledger
- SHA-256 integrity result
- Artifact hashes
- Explicit limitations

The packet is labelled `DEMO / SYNTHETIC · local fixture only`.

This is not a legal chain of custody. A browser hash can show that the bytes differ from the local sealed bytes. It cannot prove that a sensor was truthful, that calibration was valid, or that the evidence was collected lawfully. We show that limitation next to the feature rather than hiding it in documentation.

## Why the narrative checker exists

Environmental evidence is easy to overstate in plain language. A chart may show a peak, while a sentence turns it into a causal or legal claim. We therefore model claims as structured records before displaying prose.

Each claim has:

- A claim ID
- A claim type
- One or more evidence IDs
- A grade ceiling
- The text shown to the reviewer

The deterministic checker rejects unknown citations, missing citations, causal language, unsupported legal language, and measurements that disagree with the fixture. The demo includes a button that injects a sentence such as “the candidate caused the pollution,” and the checker rejects it.

The long-term design is to put a language model behind the same gate. The model may explain structured findings, but it may not add facts that do not exist in the evidence ledger.

## Where AWS fits

The browser prototype is intentionally usable without AWS credentials. Alongside it, the project includes an AWS SAM foundation for a future deployed workflow in `us-east-1`.

The current infrastructure scaffold defines:

### Amazon Cognito

Intended for multi-user authentication and role-aware access to case records. The frontend has a hosted-sign-in boundary, but no production user pool has been deployed from this project yet.

### Amazon API Gateway

Intended to expose the case and complaint API:

```text
POST /cases
GET  /cases
GET  /cases/{caseId}
POST /complaints
GET  /cases/{caseId}/verification
```

### AWS Lambda

Intended to handle validated case creation, complaint intake, case retrieval, idempotency, and verification metadata. A Python 3.12-compatible handler and local mock mode are included in the repository.

### Amazon DynamoDB

Intended to store case metadata and workflow state with point-in-time recovery and encryption.

### Amazon S3

Intended to store versioned evidence artifacts and sealed case snapshots in a private bucket.

### AWS KMS

The infrastructure scaffold defines an asymmetric sign/verify key for future evidence-manifest signatures. The current browser seal does not call KMS yet.

### S3 Object Lock

Object Lock is parameterized in the SAM template and defaults to off. It must be deliberately enabled when a new bucket is created, after retention, legal-hold, and break-glass policies have been reviewed. We have not enabled it in a production bucket.

AWS SAM is included as the infrastructure-as-code tool. The services above are defined as a deployment foundation; they are not being presented as a live cloud deployment in this article.

## Data sources and scientific boundaries

Open-Meteo and OpenAQ are represented by adapter contracts and provenance metadata. The current prototype does not display live readings without trusted coordinates and a completed, QA-reviewed request.

The same rule applies to geospatial data. The prototype accepts real coordinates through a typed adapter boundary, but it does not convert text such as “near the north gate” into invented GPS values.

Production-grade atmospheric dispersion modelling is also not simulated in the browser. A future version should integrate a validated external model through a controlled adapter, with explicit solver version, input manifest, meteorology, terrain, emission assumptions, uncertainty, licensing, and expert review.

## What we learned

### 1. Abstention can be the product value

The most useful result is sometimes “do not blame this site yet.” A system that only produces a culprit is structurally incentivized to overclaim. A system that can recommend the next sensor remains useful under uncertainty.

### 2. Data quality has to be a first-class object

A sensor reading without calibration, clock, coverage, or comparison context is not automatically evidence. The interface therefore shows QA exclusions rather than silently dropping them.

### 3. Integrity and truth are different

Hashing detects byte changes. It does not make a sensor truthful. Keeping those claims separate makes the product more credible.

### 4. A polished UI must not imply a live system

Operational language such as “connected,” “verified,” or “ready” can be misleading when it describes seeded demo records. We label local, synthetic, pending, configured, and connected states separately.

## Current status

Pramaan is a working local prototype with an AWS deployment scaffold.

Built and verified locally:

- React/Vite frontend
- Synthetic evidence engine and three cases
- Complaint intake and local persistence
- Operations queue and local workflow metadata
- Run Lab and evidence packet export
- Browser SHA-256 tamper demonstration
- Python backend handler syntax and local mock smoke checks
- AWS SAM template and service contracts

Not yet deployed or field-validated:

- Public frontend URL
- Cognito user pool
- API Gateway endpoint
- DynamoDB production table
- S3 Object Lock bucket
- KMS signature flow
- Live OpenAQ/Open-Meteo ingestion
- Real field calibration
- Regulatory-authority submission integration
- Validated atmospheric dispersion solver
- User study or inspector feedback

## Next milestone

The next milestone is a thin AWS vertical slice:

1. Validate and deploy the SAM stack in `us-east-1`.
2. Configure Cognito authentication.
3. Persist one case and one complaint in DynamoDB.
4. Store one canonical evidence snapshot in S3.
5. Sign and verify one manifest with KMS.
6. Connect the frontend to the deployed API.
7. Replace one synthetic case with a cited historical event.
8. Run a transparent validation scorecard before making real-world claims.

## Closing

The best pollution-response system is not the one that names a culprit fastest. It is the one that prevents the wrong accusation while still telling the city what to do next.

Pramaan is our attempt to build that workflow:

> **It does not promise certainty. It makes uncertainty actionable—and makes unsupported blame harder.**

---

## Publishing checklist

Before publishing this draft:

- Confirm the AWS Builder Terms.
- Add the public repository URL once it exists.
- Add the deployed URL only after verifying it from a logged-out browser.
- Add a three-minute demo video link after recording it.
- Keep every AWS service labelled as deployed only if it was actually deployed.
- Keep synthetic data labelled synthetic.
- Do not claim field validation, regulatory approval, or real sensor accuracy without evidence.
