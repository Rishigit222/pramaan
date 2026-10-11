"""Explicit contracts for upstream observations; implementations are deliberately not live yet."""
from typing import Any, Protocol

class IngestionAdapter(Protocol):
    name: str
    def fetch(self, *, latitude: float, longitude: float, start: str, end: str) -> list[dict[str, Any]]: ...

class OpenMeteoAdapter:
    name = "open-meteo"
    def fetch(self, **_: Any) -> list[dict[str, Any]]:
        raise NotImplementedError("Open-Meteo adapter is a contract only; add timeout, provenance and QA before enabling")

class OpenAQAdapter:
    name = "openaq"
    def fetch(self, **_: Any) -> list[dict[str, Any]]:
        raise NotImplementedError("OpenAQ adapter is a contract only; add API key/configuration and QA before enabling")
