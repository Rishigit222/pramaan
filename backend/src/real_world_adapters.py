"""Non-operational adapter interfaces for governed real-world integrations."""
from __future__ import annotations

from typing import Any, Protocol


class CalibrationRegistry(Protocol):
    def get_valid_record(self, sensor_id: str, measured_at: str) -> dict[str, Any]: ...


class AuthorityAdapter(Protocol):
    jurisdiction_id: str

    def validate_package(self, package: dict[str, Any]) -> None: ...
    def submit(self, package: dict[str, Any]) -> dict[str, Any]: ...
    def status(self, submission_id: str) -> dict[str, Any]: ...


class ExternalDispersionModelAdapter(Protocol):
    """Boundary to an independently installed/licensed solver and its QA."""

    model_name: str

    def prepare(self, request: dict[str, Any]) -> dict[str, Any]: ...
    def execute(self, prepared: dict[str, Any]) -> dict[str, Any]: ...
    def validate_output(self, output: dict[str, Any]) -> None: ...


class UnconfiguredAuthorityAdapter:
    jurisdiction_id = "unconfigured"

    def validate_package(self, package: dict[str, Any]) -> None:
        raise NotImplementedError("authority integration is a reviewed future boundary")

    def submit(self, package: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("no live agency submission is implemented")

    def status(self, submission_id: str) -> dict[str, Any]:
        raise NotImplementedError("no live agency status endpoint is implemented")


class ExternalModelAdapterStub:
    model_name = "unconfigured-external-model"

    def prepare(self, request: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("connect an approved AERMOD/CALPUFF/OpenFOAM-style runner")

    def execute(self, prepared: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("this repository does not run a dispersion solver")

    def validate_output(self, output: dict[str, Any]) -> None:
        raise NotImplementedError("solver-specific output QA requires domain review")
