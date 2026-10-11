"""Validation-only contracts for future field, authority, and dispersion work.

This module deliberately contains no network clients, calibration fitting, agency
submission, or atmospheric solver.  It is safe to use at an intake boundary to
reject incomplete records before a future, reviewed implementation is connected.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Mapping


class ContractValidationError(ValueError):
    """A payload is not sufficient for a governed real-world workflow."""


def _required(payload: Mapping[str, Any], fields: tuple[str, ...]) -> None:
    missing = [field for field in fields if payload.get(field) in (None, "")]
    if missing:
        raise ContractValidationError("missing required fields: " + ", ".join(missing))


def _iso_utc(value: Any, field: str) -> None:
    if not isinstance(value, str):
        raise ContractValidationError(f"{field} must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ContractValidationError(f"{field} must be valid ISO-8601") from error
    if parsed.tzinfo is None:
        raise ContractValidationError(f"{field} must include a timezone")


def _finite_number(value: Any, field: str) -> None:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ContractValidationError(f"{field} must be numeric")


def validate_calibration_record(payload: Mapping[str, Any]) -> None:
    """Validate metadata, not calibration coefficients or scientific fitness."""
    _required(payload, ("calibrationId", "sensorId", "effectiveFrom", "effectiveTo", "method", "referenceDevice", "uncertainty", "artifactDigest"))
    _iso_utc(payload["effectiveFrom"], "effectiveFrom")
    _iso_utc(payload["effectiveTo"], "effectiveTo")
    if payload["method"] not in {"colocation", "reference-comparison", "manufacturer", "other"}:
        raise ContractValidationError("method is not an allowed calibration method")
    if not isinstance(payload["referenceDevice"], Mapping):
        raise ContractValidationError("referenceDevice must identify the reference and traceability")
    _finite_number(payload["uncertainty"], "uncertainty")
    if payload["uncertainty"] < 0:
        raise ContractValidationError("uncertainty cannot be negative")
    if not isinstance(payload["artifactDigest"], str) or len(payload["artifactDigest"]) != 64:
        raise ContractValidationError("artifactDigest must be a SHA-256 hex digest")
    if not isinstance(payload.get("approvedBy"), Mapping):
        raise ContractValidationError("approvedBy is required; calibration cannot be self-approved")


def validate_jurisdiction_config(payload: Mapping[str, Any]) -> None:
    """Validate explicit jurisdiction policy; no default legal rules are inferred."""
    _required(payload, ("jurisdictionId", "authorityName", "version", "effectiveFrom", "contact", "pollutants", "units", "reviewStatus"))
    _iso_utc(payload["effectiveFrom"], "effectiveFrom")
    if not isinstance(payload["pollutants"], list) or not payload["pollutants"]:
        raise ContractValidationError("pollutants must be a non-empty explicit list")
    if not isinstance(payload["units"], Mapping) or not payload["units"]:
        raise ContractValidationError("units must map each pollutant to an explicit unit")
    if payload["reviewStatus"] not in {"draft", "expert-reviewed", "approved-for-pilot", "retired"}:
        raise ContractValidationError("invalid jurisdiction reviewStatus")
    if payload["reviewStatus"] == "draft":
        raise ContractValidationError("draft jurisdiction configuration cannot govern a run")


def validate_authority_package(payload: Mapping[str, Any]) -> None:
    """Validate an auditable submission package without sending it anywhere."""
    _required(payload, ("packageId", "caseId", "jurisdictionId", "packetDigest", "packetVersion", "consent", "review"))
    if not isinstance(payload["consent"], Mapping) or payload["consent"].get("status") != "recorded":
        raise ContractValidationError("recorded consent/legal basis is required")
    review = payload["review"]
    if not isinstance(review, Mapping) or review.get("status") != "approved":
        raise ContractValidationError("expert and authority submission review must be approved")
    if not isinstance(review.get("approvers"), list) or len(review["approvers"]) < 2:
        raise ContractValidationError("at least two named approvers are required")
    if not isinstance(payload["packetDigest"], str) or len(payload["packetDigest"]) != 64:
        raise ContractValidationError("packetDigest must be a SHA-256 hex digest")


def validate_dispersion_request(payload: Mapping[str, Any]) -> None:
    """Validate an external-model request; it must never be treated as a solver."""
    _required(payload, ("runId", "model", "modelVersion", "domain", "sources", "meteorology", "receptors", "configDigest", "approval"))
    if payload["model"] not in {"aermod", "calpuff", "openfoam", "other-external"}:
        raise ContractValidationError("model must name an approved external solver family")
    if not isinstance(payload["modelVersion"], str) or not payload["modelVersion"].strip():
        raise ContractValidationError("modelVersion is required for reproducibility")
    for field in ("domain", "meteorology", "receptors"):
        if not isinstance(payload[field], Mapping):
            raise ContractValidationError(f"{field} must be structured and versioned")
    if not isinstance(payload["sources"], list) or not payload["sources"]:
        raise ContractValidationError("at least one fully specified source is required")
    if not isinstance(payload["approval"], Mapping) or payload["approval"].get("status") != "approved":
        raise ContractValidationError("qualified model-review approval is required")
    if not isinstance(payload["configDigest"], str) or len(payload["configDigest"]) != 64:
        raise ContractValidationError("configDigest must be a SHA-256 hex digest")


# JSON-Schema-shaped documentation for API gateways or a future schema validator.
CALIBRATION_SCHEMA = {"type": "object", "required": ["calibrationId", "sensorId", "effectiveFrom", "effectiveTo", "method", "referenceDevice", "uncertainty", "artifactDigest", "approvedBy"]}
JURISDICTION_SCHEMA = {"type": "object", "required": ["jurisdictionId", "authorityName", "version", "effectiveFrom", "contact", "pollutants", "units", "reviewStatus"]}
AUTHORITY_PACKAGE_SCHEMA = {"type": "object", "required": ["packageId", "caseId", "jurisdictionId", "packetDigest", "packetVersion", "consent", "review"]}
DISPERSION_REQUEST_SCHEMA = {"type": "object", "required": ["runId", "model", "modelVersion", "domain", "sources", "meteorology", "receptors", "configDigest", "approval"]}
