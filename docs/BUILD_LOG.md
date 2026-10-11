# Pramaan Build Log

## 2026-10-11 — Local five-stage investigation run lab

### Implemented

- Added `src/case-run.ts`, a deterministic local run model for the existing synthetic fixtures. Each run exposes five stages: Intake, QA gate, Falsification, Cross-examination, and Seal. Stage text is derived from the fixture inputs, test outcomes, existing sensitivity function, and existing browser seal; no new observation or backend result is introduced.
- Added `src/run-lab.tsx` and a Run Lab navigation surface with explicit `DEMO / SYNTHETIC` and local-only labels. Users can select one of the three fixtures, start/pause/resume/reset/re-run a paced run, see stage progress and outputs, and receive a deterministic run ID.
- Added browser-local run history. Completed packets are retained as best-effort `pramaan.case-runs.v1` records; reruns keep the same fixture-derived run ID and increment a local run count. Complaint records are not selectable, run, or assigned synthetic evidence.
- Added a downloadable evidence packet containing the fixture inputs, all test outcomes, grade boundary/action and ceiling, citation ledger, SHA-256 integrity result, and explicit limitations. The packet is only produced after the local seal stage verifies.
- Added a side-by-side synthetic case comparison for grade, eligible completeness, supports/contradicts/inconclusive/unavailable counts, and next action.
- Added guided judge mode with step-by-step highlights. It only changes walkthrough UI state and never changes evidence, grades, claims, complaints, or packet inputs.
- Added responsive Run Lab styling in `src/style.css` while reusing the existing console surfaces and dependencies.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite v6.4.4 transformed 1,591 modules and produced `dist/assets/index-CBGhnJF_.css` (128.32 kB, gzip 28.33 kB) and `dist/assets/index-r3ps6oPD.js` (250.54 kB, gzip 75.45 kB).

### Boundaries

- This is a browser-only simulator over existing synthetic fixtures. It makes no live, AWS, authority, sensor, causal, legal, medical, or regulatory claim.
- Browser history and downloaded packets are local best-effort artifacts. A verified hash detects byte changes after sealing; it does not prove sensor truth, calibration, custody, or causation.

## 2026-10-11 — Premium command-center visual refinement

### Implemented

- Refined `src/style.css` with an editorial Space Grotesk / DM Sans hierarchy, stronger page-heading rhythm, compact KPI index cards, quieter depth, and more deliberate local/synthetic boundary treatments.
- Tightened command-center and analytics surfaces for scanability: queue rows, health bars, review metadata, falsification comparisons, analytics tables, audit history, and report/settings panels now share a denser readable surface system.
- Added reusable visual treatments for stage progress, packet/run history cards, guided-mode notices, pending intake, storage errors, loading, success, and failure states without introducing new data or changing the local/synthetic/pending flows.
- Improved keyboard focus visibility, reduced-motion handling, print output, empty states, and mobile layouts for queue/drawer, KPIs, comparison tables, forms, and investigation panels.

### Verified

- `npx vite build` passed: Vite v6.4.4 transformed 1,589 modules and produced `dist/assets/index-fwQT6Dut.css` (119.50 kB, gzip 26.56 kB) and `dist/assets/index-DtkrHS4K.js` (226.99 kB, gzip 69.23 kB).
- `npm run build` was run and is currently blocked before Vite by existing TypeScript errors in `src/main.tsx` / `src/case-run.ts`: unused icon imports, `CaseId` not exported from `case-run`, and missing `RunLabView`. The CSS-only refinement does not modify that data flow.

## 2026-10-11 — Local operations analytics layer

### Implemented

- Added `src/operations-analytics.ts`, a reusable deterministic derivation module for queue aging, workflow status distribution, evidence completeness bands, owner workload, illustrative SLA risk, and local audit activity.
- Extended Reports into a Reports / Analytics view with LOCAL / DEMO labels, metric cards, bar charts, traceable input tables, recent audit events, empty-state handling, and print support.
- Added local JSON export for the complete analytics summary. The export records its deterministic as-of timestamp and explicitly marks SLA risk as illustrative.
- Analytics combines seeded synthetic queue records, saved complaints, separately stored complaint workflow statuses, and validated local audit events without mutating evidence, complaint records, grades, claims, or attribution.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite v6.4.4 transformed 1,589 modules and produced `dist/assets/index-D9mPsRXv.css` (87.89 kB, gzip 20.02 kB) and `dist/assets/index-CN7mFyVT.js` (226.93 kB, gzip 69.21 kB).

## 2026-10-11 — Environmental operations console refinement

### Implemented

- Refined the console visual system with a quieter dark palette, stronger type hierarchy, more consistent panel surfaces, clearer spacing, and restrained elevation across the shell, command center, queue, and detail drawer.
- Improved queue usability with larger targets, stronger selected/hover states, clearer health/status treatment, focus-visible search and select affordances, and a sticky desktop drawer that becomes an ordered mobile detail panel.
- Tightened responsive behavior for compact screens: KPI cards, queue rows, drawer metadata, toolbar controls, and source-health cards retain readable hierarchy without introducing new data or workflow states.
- Added state-communicating micro-interactions for navigation, cards, queue rows, drawer controls, and local status surfaces while preserving reduced-motion and browser-local/synthetic boundaries.

### Verified

- `npm run build` passed after the refinement: `tsc -b && vite build`.

## 2026-10-11 — Local complaint queue retry

### Implemented

- Brought ordinary locally saved complaints into the populated Case Desk alongside clearly labelled synthetic records, with richer row context, searchable/filterable queue visibility, and the existing responsive drawer layout.
- Added complaint-specific assignment and review-status metadata in a separate browser-storage record keyed by complaint ID. These operational changes never mutate complaint observations, evidence status, grades, claims, or source attribution.
- Added pending-safe drawer export language and JSON payloads for ordinary complaints, while retaining synthetic export labels for fixture records.
- Made the audit panel refresh from persisted browser history when same-tab workflow actions occur, so assignment, status, export, and review activity remain visible after navigation.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite transformed 1,588 modules and produced `dist/assets/index-CxNaBstw.css` (76.66 kB, gzip 17.79 kB) and `dist/assets/index-BprZE41u.js` (219.42 kB, gzip 67.39 kB).

## 2026-10-11 — Populated local command center retry

### Implemented

- Expanded the local Case Desk with a denser command-center overview: average evidence health, ownership coverage, local source registry, recent activity, and a four-step decision checklist.
- Added clearly labelled local data-source health cards for Open-Meteo, OpenAQ, and browser storage. Offline and unconfigured states remain explicit; no readings or connection claims are fabricated.
- Improved active-queue language and empty-state recovery guidance while retaining seeded synthetic records, local assignment/status controls, report export, and the evidence/attribution safety boundary.
- Kept checklist state in component-local UI state and preserved reset behavior for the seeded workspace.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite transformed 1,588 modules and produced `dist/assets/index-CxNaBstw.css` (76.66 kB, gzip 17.79 kB) and `dist/assets/index-CxNouHG0.js` (217.48 kB, gzip 66.90 kB).

## 2026-10-11 — Command-center resilience and empty-state boundary

### Implemented

- Hardened the local `DEMO-*` workspace reader so malformed or unrelated browser-storage entries cannot appear as seeded operational records.
- Kept an intentionally empty local workspace valid after a user clears records; KPI calculations now remain meaningful (`0%`) instead of displaying `NaN`.
- Preserved the explicit DEMO/SYNTHETIC boundary and existing complaint/evidence safety behavior.

### Verified

- `npm run build` passed after these changes; see the command output from this work session for the generated bundle sizes.

## 2026-10-11 — Local demo command center density pass

### Implemented

- Added an eight-record seeded `DEMO / SYNTHETIC` workspace spanning cases, pending complaints, a regional event, QA fault, sensor maintenance, and report-ready work.
- Added command-center KPIs, evidence completeness and ownership coverage indicators, activity timeline, action checklist, local data-source health, and recent-work queue.
- Added responsive expanded-record drawer with timestamps, role owners, stage, SLA window, evidence completeness, notes, and next action.
- Added local-only role assignment and review-status changes with best-effort browser audit entries, plus reset demo workspace control.
- Kept synthetic operational workflow separate from scientific measurements, grades, claims, attribution, external feeds, and backend status.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite transformed 1,588 modules and produced `dist/assets/index-RYoxp-kB.css` (70.80 kB, gzip 16.81 kB) and `dist/assets/index-BVcIB6Lh.js` (215.10 kB, gzip 66.31 kB).

This file is a lightweight shared memory for the implementation team. It records completed work and actual checks only.

## 2026-10-11 — Real-world integration boundary

### Implemented

- Added `docs/REAL_WORLD_INTEGRATION.md` with concrete calibration, observation/QA, jurisdiction, authority, provenance, uncertainty, external dispersion-model, licensing/compute/data, expert-approval, and acceptance-test boundaries.
- Added validation-only contracts in `backend/src/real_world_contracts.py` for calibration records, jurisdiction configurations, authority packages, and external dispersion requests, including JSON-Schema-shaped required-field declarations.
- Added fail-closed `AuthorityAdapter` and `ExternalDispersionModelAdapter` protocols plus unconfigured stubs in `backend/src/real_world_adapters.py`.
- Updated the backend README and full report to keep live agency integration, calibration results, and atmospheric modelling explicitly unimplemented.

### Verified

- `python -m py_compile backend/src/real_world_contracts.py backend/src/real_world_adapters.py` passed.
- `npm run build` passed after documentation/backend contract additions.

### Boundaries

- No agency endpoint, credentials, calibration fit, field result, AERMOD/CALPUFF/OpenFOAM execution, or scientifically simplified plume was added. No deployment was performed.

## 2026-10-11 — Configurable service boundary

### Implemented

- Added typed `src/service.ts` with `VITE_API_BASE_URL` and Cognito domain/client/redirect settings. Missing API configuration keeps browser-local behavior; a backend is labelled connected only after a successful response.
- Added a Sensors / Sources panel with Open-Meteo and OpenAQ provenance, last-fetched state, and explicit QA boundaries. Without trusted coordinates it does not request or display fabricated live values.
- Added a coordinate model in `src/geo.ts` and a clearly labelled coordinate-map adapter that does not geocode text complaints or invent GPS points.
- Added signed-out and sign-in-required Cognito-hosted-auth states without collecting credentials in the app, plus an explicit signed-in placeholder boundary.
- Added a case sync control that calls `GET /cases` when an API base URL is configured and reports local fallback on missing configuration or failed requests.

### Verified

- `npm run build` passed after the integration edits.

### Boundaries

- Open-Meteo/OpenAQ adapters remain metadata-only until a trusted coordinate, bounded request policy, and source-specific QA contract are supplied. No cloud deployment or secrets were added.

## 2026-10-11 — Operations console upgrade

### Implemented

- Replaced the single-scroll entry point with a responsive local operations console and role/view navigation: Intake, Case Desk, Investigations, Evidence, Sensors, Reports, and Settings.
- Added a combined local queue for saved complaints and synthetic cases with search, status filters, priority/recent sorting, keyboard-accessible controls, explicit pending/synthetic labels, and an explainable review-priority card.
- Added investigation workspace tabs for Overview, Observations, Hypotheses, Evidence, Actions, and Audit while retaining the existing fixture calculations, claim checker, sensitivity controls, and tamper verification.
- Added persisted local audit events, toast notifications, report JSON export, print-friendly reporting, display density, reduced motion, and privacy-notice preferences.
- Added capabilities/limitations presentation and robust empty, storage, and no-match states. Exported complaint records remain pending evidence and synthetic fixtures remain synthetic.
- Exported `readComplaints` from the existing complaint workspace so the console can reuse the established local persistence contract without changing complaint validation or record shape.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite v6.4.4 transformed 1,585 modules and built in 3.06 s. Output included `dist/assets/index-DVFhSGzO.css` (62.72 kB, gzip 15.06 kB) and `dist/assets/index-C4FQ2W2z.js` (197.62 kB, gzip 61.56 kB).
- No automated browser smoke test is configured in this project; no browser automation was run in this pass.

### Remaining boundaries

- Sensors and cloud/backend navigation entries are local prototype surfaces; no live feed, AWS integration, dispatch, or real-world evidence was introduced.

## 2026-10-11 — Release-blocker corrections

### Implemented

- Complaint selections no longer reuse the synthetic investigation fallback. Investigations, Evidence, and Sensors now show an explicit pending-intake or limited-prototype view with no grade, fixture readings, or source result.
- Replaced hardcoded queue priorities with computed disclosed factors: evidence gap, QA concern, and time sensitivity. Fixture date strings and complaint ISO dates are converted to numeric timestamps before recent sorting.
- Added schema validation for audit entries and preferences, safe local-storage writes, visible storage errors, and same-tab complaint change events so queue state refreshes after additions/deletions.
- Added cancellation, loading reset, and error handling around asynchronous seals. Case changes reset wind/timing assumptions, claim injection, and tamper state.
- Replaced the misleading audit “ON” label with “BEST-EFFORT / browser storage only”; the privacy preference now displays an explicit non-redaction notice.
- Restored repeatable chart time-bin inspection with click, focus, and arrow-key controls.

### Verified

- `npm run build` passed: `tsc -b && vite build`; Vite v6.4.4 transformed 1,586 modules and built in 2.91 s. Output included `dist/assets/index-By85RMQ4.css` (63.90 kB, gzip 15.34 kB) and `dist/assets/index-c5BoFATr.js` (202.93 kB, gzip 63.05 kB).
- No test runner is present in the project and no additional dependency was introduced solely for tests; pure helper logic is isolated in `src/console-helpers.ts` for future runner coverage.

### Remaining gaps

- No automated browser interaction suite is configured. Sensor feeds, backend persistence, redaction/anonymization, and real-world evidence remain unimplemented prototype boundaries.

## 2026-10-11 — Case desk frontend overhaul

### Implemented

- Made the synthetic single-sensor anomaly the initial case, so the first decision demonstrates why weak QA must block attribution. All three original fixtures remain selectable.
- Rebuilt the opening as a two-column command-center hero with a selected-case brief, local-demo status, grade, and next action. Case selection updates the brief in the current session; this is not a live data feed.
- Reordered the investigation around case selection, a prominent grade/summary/action decision card, test-outcome counts, then metrics, observation chart/map, full falsification assessment, cross-examination, claims, and integrity verification.
- Added a sensor-map legend and refined chart, map, card, tab, navigation, and responsive treatments with hover transitions and reduced-motion support; retained the existing schematic and computed placement.
- Improved mobile navigation disclosure semantics and visible keyboard focus while keeping tab arrow/Home/End navigation, chart time-bin controls, sliders, claim injection, and browser SHA-256 tamper flow.

### Verified

- `npm run build` passed after the final code edits (`tsc -b && vite build`); Vite v6.4.4 transformed 1,584 modules and built in 3.63 s. Output included `dist/assets/index-Bj7T3k9N.css` (39.49 kB) and `dist/assets/index-CGENumjS.js` (189.16 kB).
- No browser/device smoke test or automated interaction test was run in this pass; the project has no test script.

### Remaining boundaries

- Case status reflects the selected local synthetic fixture, not streaming or real-world observations. The map remains schematic and the prototype has no deployed backend or field validation.
- Browser hashing detects changes relative to a local seal; it supplies no trusted signature or immutable storage.

## 2026-10-10 — Frontend decision experience polish

### Implemented

- Reframed the opening around “Proof before blame,” the synthetic-data boundary, and a three-step observe → challenge → verify story.
- Added a live decision summary and direct assessment link above the case tabs so the grade's meaning and next action remain visible when switching cases.
- Added per-case grade previews, keyboard-operable arrow/Home/End case tabs with a labelled tab panel, and section jumps through observations, assessment, cross-examination, and integrity.
- Added a touch/keyboard time-bin scrubber alongside existing chart hover/focus; refined mobile card spacing, navigation, focus, reduced-motion handling, and decision hierarchy.
- Left fixture data, test logic, claim checking, sensitivity calculation, sensor placement, and tamper verification unchanged.

### Verified

- `npm run build` passed after the final frontend edits: `tsc -b && vite build`; Vite v6.4.4 transformed 1,584 modules and built in 2.66 s.
- No browser/device smoke test was run in this pass.

### Remaining UX boundaries

- The chart and map use synthetic schematic data; the map does not support geographic or field siting interpretation.
- No saved case history or export flow exists; the demo remains a single-page local fixture experience.

## 2026-10-10 — Initial prototype assembled

### Implemented

- React + Vite browser application.
- Three synthetic fixtures: coherent plume, single-sensor anomaly, regional smoke front.
- Interactive PM2.5 chart with hover/focus inspection.
- Schematic sensor network with wind direction and computed next placement.
- Falsification matrix with supports, contradicts, inconclusive, and unavailable outcomes.
- Grade and recommended action panels.
- Wind-direction and timing cross-examination controls.
- Deterministic claim ledger and hallucinated claim rejection.
- Browser SHA-256 artifact sealing and manifest-root verification.
- Tamper simulation that identifies the changed observation artifact.
- Responsive dark editorial interface with layered depth and orbit motif.
- Master specification and phased delivery docs.

### Verified

- `npm run build` passed.
- Vite development server started successfully.
- Three cases load from local fixtures.
- Claim injection fails the checker as intended.
- Sealed case verifies without tampering.
- Tampered observation copy fails verification.
- Production build re-run after documentation updates.

### Known boundaries

- All data is synthetic.
- Scores are illustrative heuristics, not calibrated posteriors.
- No deployed AWS backend exists yet.
- Browser seal has no trusted timestamp, signature, or immutable storage.
- Schematic map is not georeferenced.

## Team prompt for future implementation work

Before changing code:

1. Read `docs/PRAMAAN_MASTER_SPEC.md`.
2. Read `docs/PHASES.md`.
3. Check the current build.
4. Make the smallest complete change.
5. Update this log with actual checks.
6. Never upgrade “designed” to “built” without verification.
