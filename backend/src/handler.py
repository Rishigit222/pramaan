"""Small API foundation. MOCK_MODE=true keeps local development credential-free."""
import base64, hashlib, json, os, uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

MOCK = os.getenv("MOCK_MODE", "false").lower() == "true"
_MOCK_CASES: dict[str, dict[str, Any]] = {}

def _now() -> str: return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
def _response(status: int, body: Any) -> dict[str, Any]:
    return {"statusCode": status, "headers": {"content-type": "application/json", "access-control-allow-origin": os.getenv("CORS_ORIGIN", "*")}, "body": json.dumps(body, default=str)}
def _json(event: dict[str, Any]) -> dict[str, Any]:
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"): raw = base64.b64decode(raw).decode()
    try: value = json.loads(raw)
    except (TypeError, json.JSONDecodeError): raise ValueError("body must be valid JSON")
    if not isinstance(value, dict): raise ValueError("body must be a JSON object")
    return value
def _validate(payload: dict[str, Any], complaint: bool = False) -> None:
    required = ["incidentType", "occurredAt", "location"] if complaint else ["title"]
    missing = [key for key in required if not isinstance(payload.get(key), str) or not payload[key].strip()]
    if missing: raise ValueError("missing required fields: " + ", ".join(missing))
    if len(json.dumps(payload)) > 64_000: raise ValueError("payload exceeds 64 KB")
def _ddb():
    import boto3
    return boto3.resource("dynamodb").Table(os.environ["CASE_TABLE"])
def _case(case_id: str, payload: dict[str, Any], kind: str) -> dict[str, Any]:
    return {"caseId": case_id, "recordType": kind, "schemaVersion": 1, "status": "pending-evidence", "createdAt": _now(), "updatedAt": _now(), "payload": payload}
def _create(payload: dict[str, Any], kind: str, idem: str | None) -> dict[str, Any]:
    digest = hashlib.sha256((idem or json.dumps(payload, sort_keys=True)).encode()).hexdigest()[:24]
    case_id = f"case-{digest}"
    item = _case(case_id, payload, kind)
    if MOCK:
        if case_id in _MOCK_CASES: return _MOCK_CASES[case_id]
        _MOCK_CASES[case_id] = item; return item
    from botocore.exceptions import ClientError
    table = _ddb()
    try: table.put_item(Item=item, ConditionExpression="attribute_not_exists(caseId)")
    except ClientError as error:
        if error.response["Error"]["Code"] != "ConditionalCheckFailedException": raise
        return table.get_item(Key={"caseId": case_id}).get("Item", item)
    # Versioned evidence metadata; object retention is intentionally operator-configured.
    import boto3
    boto3.client("s3").put_object(Bucket=os.environ["EVIDENCE_BUCKET"], Key=f"cases/{case_id}/metadata.json", Body=json.dumps(item).encode(), ContentType="application/json")
    return item
def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    method = event.get("httpMethod", "GET").upper(); path = event.get("path", "")
    try:
        if method == "POST" and path.rstrip("/").endswith("/complaints"):
            payload = _json(event); _validate(payload, True); return _response(201, _create(payload, "complaint", event.get("headers", {}).get("Idempotency-Key")))
        if method == "POST" and path.rstrip("/").endswith("/cases"):
            payload = _json(event); _validate(payload); return _response(201, _create(payload, "case", event.get("headers", {}).get("Idempotency-Key")))
        case_id = (event.get("pathParameters") or {}).get("caseId")
        if method == "GET" and case_id and path.endswith("/verification"):
            item = _get(case_id)
            return _response(200, {"caseId": case_id, "verification": {"status": "unsealed", "evidenceStatus": item.get("status")}}) if item else _response(404, {"error": "case not found"})
        if method == "GET" and case_id:
            item = _get(case_id); return _response(200, item) if item else _response(404, {"error": "case not found"})
        if method == "GET" and path.rstrip("/").endswith("/cases"):
            if MOCK: return _response(200, {"items": list(_MOCK_CASES.values())})
            return _response(200, {"items": _ddb().scan(Limit=50).get("Items", [])})
        return _response(404, {"error": "route not found"})
    except ValueError as error: return _response(400, {"error": str(error)})
    except Exception: return _response(500, {"error": "internal error"})
def _get(case_id: str) -> dict[str, Any] | None:
    if MOCK: return _MOCK_CASES.get(case_id)
    return _ddb().get_item(Key={"caseId": case_id}).get("Item")
