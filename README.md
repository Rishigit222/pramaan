# Pramaan — synthetic evidence studio

A self-contained, browser-only React + Vite prototype for examining **synthetic** PM2.5 episodes. It is a decision-support demonstration, not a regulatory finding, proof of causation, health assessment, or statement about a real site.

## What is included

- Three fully interactive synthetic investigation cases.
- Explicit supports / contradicts / inconclusive / unavailable test outcomes.
- Grade and next-action recommendations.
- Interactive time-series and schematic sensor geometry.
- Cross-examination controls for wind and transport timing.
- Computed next-sensor placement for the unresolved case.
- Incident-specific clearance/alibi language.
- Citation-enforced claim ledger with hallucinated-claim rejection.
- Browser SHA-256 sealing and tamper verification.
- Premium dark editorial UI with layered depth, orbit motif, and responsive layout.

## Project documentation

- `docs/PRAMAAN_MASTER_SPEC.md` — complete product, science, UX, integrity, AWS, ethics, and acceptance specification.
- `docs/PROJECT_BLUEPRINT.md` — detailed domain blueprint and target architecture.
- `docs/PHASES.md` — workable delivery phases and exit gates.
- `docs/BUILD_LOG.md` — team-style implementation memory and verified checks.
- `backend/README.md` — AWS SAM backend foundation, local mock mode, deployment steps, routes, and permission notes.
- `infrastructure/template.yaml` — us-east-1-oriented SAM template (Cognito, API Gateway, Lambda, DynamoDB, S3, KMS).

The project intentionally separates what is **built now** from what is **designed for later**. The browser prototype works without AWS credentials; the AWS section defines the next thin vertical slice rather than pretending a cloud deployment already exists.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To check production compilation, run `npm run build`; `npm run preview` serves the built app. No API keys or backend are required.

## Try the demonstration

1. Select **Coherent local plume** to see a grade B association with independent downwind rises and bounded language. Move the cross-examination wind and timing sliders far enough to cap the perturbed grade at C.
2. Select **Single-sensor anomaly** to see grade U, the QA-invalid D1 reading, contrary peer evidence, and a computed schematic downwind next-sensor placement. The coordinates are *grid positions*, not field GPS coordinates.
3. Select **Regional smoke front** for a grade D candidate-specific contradiction and a window-limited synthetic alibi certificate.
4. In the claim ledger, inject an unsupported claim. The deterministic checker rejects its unknown citation and causal/legal overclaim. Remove it to restore the pass state.
5. In the integrity lab, toggle tampering. A modified copy of `observations.json` fails verification against the original SHA-256 manifest root; toggle it off to verify again.

Case fixtures, the example grade rules, citation checks, placement geometry, and canonical hashing are in `src/evidence.ts`; the interface and SVG visualizations are in `src/main.tsx` and `src/style.css`. The existing `docs/PROJECT_BLUEPRINT.md` supplies the wider scientific and product design. All values, timestamps, sites, scores, and advisory events here are invented. The 0–100 detection/source-fit and stability indices are illustrative heuristics, **not calibrated posteriors or probabilities of guilt**. The UI is an intentionally reduced demonstration of the blueprint, not a full ingestion/QA or scientific validation engine.

The browser uses Web Crypto SHA-256 over canonicalized fixture artifacts and a hash of their sorted digest list (a Merkle-like manifest root). This demonstrates byte-change detection only: there is no trusted timestamp, independent digital signature, permanent storage, or proof that a sensor told the truth. Refreshing starts from the same local fixtures. The future AWS ingestion, immutable storage, signing, reviewer workflow, and field validation are described in the blueprint and are **not provisioned by this app**.

## Backend foundation (not deployed)

The repository now includes a deployable-but-not-yet-deployed AWS SAM scaffold. It is intentionally separate from the frontend and can be exercised without credentials using `MOCK_MODE=true`; see `backend/README.md`. The template defaults S3 Object Lock off because it must be selected at bucket creation after retention and break-glass policies are reviewed. No AWS account, credentials, secrets, or live Open-Meteo/OpenAQ feed are included.
# pramaan
