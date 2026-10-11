# Pramaan backend foundation

This is a deployable AWS SAM scaffold, not a deployed service. It targets `us-east-1` and preserves the prototype's evidence-first boundary. The Lambda uses Python 3.12 and the AWS runtime's boto3; no secrets are in source.

## Local mock mode

```powershell
$env:MOCK_MODE='true'; python -c "import sys; sys.path.insert(0,'backend'); from src.handler import lambda_handler; print(lambda_handler({'httpMethod':'POST','path':'/complaints','headers':{'Idempotency-Key':'demo-1'},'body':'{\"incidentType\":\"smoke\",\"occurredAt\":\"2026-10-11T00:00:00Z\",\"location\":\"north gate\"}'},None))"
```

Mock storage is process-local and is never evidence-grade persistence.

## Deploy (only after AWS credentials and permissions are intentionally configured)

```powershell
sam validate --template-file infrastructure/template.yaml
sam build --template-file infrastructure/template.yaml
sam deploy --guided --template-file infrastructure/template.yaml --region us-east-1
```

`sam deploy` requires an AWS account, credentials, CloudFormation/SAM deployment permissions, IAM role creation permission, and a deliberate stack review. Nothing in this repository deploys automatically. Set `EvidenceObjectLock=true` only on a new bucket when retention policy, legal hold, and break-glass access have been reviewed; Object Lock cannot be enabled after bucket creation. The default is `false`.

The API has Cognito JWT authorization, CORS, validation, deterministic idempotency via `Idempotency-Key`, DynamoDB point-in-time recovery, private versioned S3 evidence storage, and an asymmetric KMS signing key. Signing is scaffolded in infrastructure permissions; a future sealing/verification flow must call KMS `Sign` and publish the public key/manifest.

Open-Meteo and OpenAQ are represented by explicit adapter contracts in `backend/src/adapters.py`. They are intentionally not live calls: add bounded timeouts, source licensing/provenance, API credentials where required, and QA rules before enabling real ingestion.

`backend/src/real_world_contracts.py` and `backend/src/real_world_adapters.py` add validation-only contracts and fail-closed interfaces for calibration records, jurisdiction configurations, authority packages, and external dispersion-model runners. They do not fit calibration, contact an agency, or run AERMOD/CALPUFF/OpenFOAM. Read `docs/REAL_WORLD_INTEGRATION.md` before implementing any concrete adapter.

## Routes

`POST /cases`, `GET /cases`, `GET /cases/{caseId}`, `POST /complaints`, and `GET /cases/{caseId}/verification`.

The current frontend remains browser-only and continues to run with `npm run dev` / `npm run build`.
