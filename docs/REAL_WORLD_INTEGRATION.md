# Real-world integration boundary

**Status: design and validation contracts only (2026-10-11).** Pramaan remains a browser prototype with synthetic fixtures. This document defines the minimum boundary for three future capabilities: field calibration, regulatory-authority workflows, and production atmospheric dispersion modelling. None is live, deployed, legally approved, or scientifically validated in this repository.

## Non-negotiable safety gates

No real-world run may produce a public source-association or authority-facing result unless all gates below are satisfied and recorded in the immutable run manifest:

1. **Scope gate:** pollutant, averaging period, geography, source hypothesis, decision use, and jurisdiction are explicit. A complaint is never an emission measurement.
2. **Provenance gate:** every raw observation, weather record, source parameter, derived value, model input, software build, and configuration has an ID, UTC time, source/license, digest, and retention class. Corrections append a new record.
3. **Measurement gate:** placement, instrument identity, calibration validity, co-location/reference evidence, clock status, maintenance, and QA disposition are present. Invalid or missing data cannot be silently imputed.
4. **Meteorology gate:** the wind and stability data are representative for the pathway and model, with calm/variable/complex-terrain exclusions explicitly evaluated.
5. **Model gate:** a qualified atmospheric scientist approves the model, version, domain, source characterization, meteorological preprocessing, receptor design, and applicability limits. No in-browser plume is a substitute.
6. **Uncertainty gate:** input and model uncertainty are propagated or bounded, sensitivity variants are predeclared, and conclusions are capped by the weakest required evidence domain.
7. **Human gate:** two-person review is required for a regulated submission or public attribution: measurement/QA reviewer and independent scientific or regulatory reviewer. The operator/site receives a right of reply.
8. **Language gate:** outputs say “consistent with”, “contradicted by”, or “unassessable”. They never turn a model result into guilt, causation, health advice, or a legal finding.

The backend stubs in `backend/src/real_world_contracts.py` and `backend/src/real_world_adapters.py` enforce metadata prerequisites and fail closed. They do not call an agency, fit calibration coefficients, or run a dispersion solver.

## Canonical contracts

All timestamps are ISO-8601 with an explicit timezone and are normalized to UTC. Coordinates are WGS84 with accuracy; distances are metres; wind is degrees clockwise from true north and explicitly labelled **from** direction; concentration units and averaging periods are pollutant-specific and never inferred.

### Calibration record

```json
{
  "calibrationId": "cal-uuid", "sensorId": "sensor-uuid",
  "effectiveFrom": "2026-01-01T00:00:00Z", "effectiveTo": "2026-02-01T00:00:00Z",
  "method": "colocation", "referenceDevice": {"id": "ref-1", "traceability": "certificate-digest"},
  "coefficients": {"version": "method-specific"}, "uncertainty": 4.2,
  "artifactDigest": "64-hex-sha256", "operator": {"id": "person", "role": "technician"},
  "approvedBy": {"id": "reviewer", "qualification": "measurement-scientist"}
}
```

This is a validity and provenance record, not evidence that a calibration is good. Coefficients must be fit only by a reviewed procedure using retained raw co-location data, pollutant/RH/temperature coverage, reference traceability, holdout evaluation, and an uncertainty budget. No coefficient may be applied outside its validity interval or environmental domain. Calibration reports must include bias, precision, missingness, drift, residual diagnostics, and failure cases; this project contains no calibration result.

### Observation and QA minimum

Each observation must retain `observationId`, `sensorId`, measured/received UTC times, original value/unit, pollutant, averaging period, sequence, firmware, payload digest, calibration ID (or explicit unavailable), placement ID, and append-only QA events. QA states are `valid`, `suspect`, `invalid`, and `missing`, with rule version, reason, interval, actor, and timestamp. Duplicate delivery must be idempotent; out-of-order delivery must not change a deterministic run. Negative/impossible, saturated, stuck, clock-skewed, maintenance-overlapping, and humidity-affected values remain inspectable even when excluded.

### Jurisdiction configuration

```json
{
  "jurisdictionId": "country-region-authority",
  "authorityName": "Named authority; not inferred",
  "version": "2026-01",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "contact": {"submissionChannel": "documented endpoint or manual handoff"},
  "pollutants": ["PM2.5"], "units": {"PM2.5": "ug/m3"},
  "thresholdReferences": [{"id": "published-document", "uri": "https://...", "retrievedAt": "...", "digest": "..."}],
  "retention": {"class": "authority-defined"},
  "reviewStatus": "expert-reviewed"
}
```

Thresholds, reporting formats, evidence rules, privacy/retention, data residency, and signing requirements are jurisdiction-specific. A missing or draft configuration blocks a regulated workflow. The system must not invent an agency endpoint or claim that an adapter is an official channel.

### Authority adapter interface

`AuthorityAdapter` exposes `validate_package`, `submit`, and `status`. A concrete adapter must declare the jurisdiction and API/document version, authenticate through an approved secret mechanism, use bounded timeouts and idempotency, retain request/response digests, map errors without rewriting evidence, and support a dry-run/manual-export mode. Submission is a separate state transition after expert approval; it must never mutate the sealed packet. The current `UnconfiguredAuthorityAdapter` always raises `NotImplementedError`.

Authority package minimum: `packageId`, `caseId`, `jurisdictionId`, packet/version/digest, cited evidence manifest, consent/legal basis, data classification, two approvers, right-of-reply status, and a submission audit event. “Submitted” means a documented receipt was obtained, not that the authority accepted a finding.

## Calibration workflow (future, not executed here)

1. Pre-register purpose, pollutant, sensors, reference method, siting, duration, environmental range, exclusion rules, and success criteria.
2. Obtain consent, safety review, chain-of-custody procedure, and reference-instrument traceability.
3. Co-locate with synchronized clocks; preserve raw payloads and environmental covariates; log maintenance and interruptions.
4. Split fit/holdout periods before inspecting results. Report bias, precision, coverage, drift, residual structure, and uncertainty by relevant conditions.
5. Have an independent measurement expert review the method and approve a versioned calibration record.
6. Validate on a new period/site or reference; define invalidation triggers and recalibration cadence.
7. Only then enable the record for a bounded pilot, with calibration status visible in every packet.

Acceptance tests include boundary timestamps, expired calibration rejection, duplicate/out-of-order invariance, missing reference rejection, holdout artifact linkage, and a negative test proving that an invented calibration result cannot enter an evidence packet.

## External dispersion model strategy

Pramaan will integrate a separately installed/licensed, version-pinned model through `ExternalDispersionModelAdapter`: `prepare(request)`, `execute(prepared)`, and `validate_output(output)`. Candidate families include AERMOD, CALPUFF, or OpenFOAM-style workflows; the choice depends on source type, terrain, meteorology, pollutant chemistry, regulatory guidance, licensing, and expert review. The adapter owns solver invocation and provenance; Pramaan owns case identity, input manifest, QA gates, uncertainty display, and cautious evidence language.

Request minimum: model/version and executable/container digest; source geometry, release parameters and operating evidence; terrain/land-use/domain/grid; meteorological observations and preprocessing version; receptors and coordinate accuracy; pollutant/chemistry assumptions; run window; configuration digest; license/terms; and qualified approval. Output minimum: raw solver artifacts, logs, warnings, exit code, output digest, receptor/time/unit metadata, convergence/completeness QA, uncertainty/sensitivity artifacts, and reviewer disposition. A result without raw inputs and logs is incomplete.

Required compute/data planning includes licensed software and redistribution constraints, reproducible Linux/container or controlled workstation, CPU/RAM/storage/time budget, terrain and land-use datasets, representative meteorology, emissions/source characterization, receptor siting, data residency, and retention. These requirements are not provisioned here.

### Model safety and QA gates

- Verify source and receptor geometry, coordinate reference systems, units, stack/building parameters, and time alignment.
- Preprocess meteorology with a documented, versioned toolchain; test missingness, representativeness, stability, and calm winds.
- Run solver validation/regression cases and at least one independent implementation or benchmark where feasible.
- Compare sensitivity to source rates, meteorology, terrain, chemistry, grid/receptor choices, and background; predeclare variants.
- Reject crashed, incomplete, non-converged, out-of-domain, or unit-inconsistent outputs.
- Treat modelled concentration as a scenario estimate with uncertainty, never as a measured fact or automatic regulatory exceedance.

No simplified Gaussian equation, canvas plume, or browser interpolation may be added as a production substitute. The existing schematic placement aid remains explicitly non-model output.

## Acceptance and expert sign-off

Before a limited field pilot: contract/unit tests pass; raw/derived lineage and digest verification pass; calibration expiry and QA exclusions behave correctly; authority dry-run is idempotent and cannot mutate evidence; adapter replay is deterministic; solver failure and missing-input paths fail closed; uncertainty and sensitivity are visible; private coordinates are access-controlled; and a reviewer can reproduce the packet from pinned inputs.

Required approvals: measurement/metrology expert for calibration; atmospheric scientist for model applicability and uncertainty; data/privacy/security reviewer for provenance and access; jurisdictional/legal or agency-designated reviewer for authority package; and an accountable product owner for the public-claim ceiling. Written approval, qualification, version, scope, and expiry belong in the run manifest. Approval does not make this prototype a regulator or certify a sensor.

## Explicit current status

| Capability | Status in this repository |
|---|---|
| Calibration fitting/results | Not implemented; no results fabricated |
| Agency authentication/submission | Not implemented; no live integration claimed |
| AERMOD/CALPUFF/OpenFOAM execution | Not implemented; no scientifically invalid browser plume |
| Contract validation and adapter seams | Added as fail-closed backend stubs |
| Field or regulatory acceptance | Not granted; requires the gates and expert approvals above |
