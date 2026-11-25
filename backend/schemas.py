from datetime import datetime, timezone
import hashlib
from typing import Any, List, Literal
from pydantic import BaseModel, Field


class ForensicDetail(BaseModel):
    label: str
    value: str
    severity: Literal["ok", "warn", "danger"] = "ok"


class AnalysisResponse(BaseModel):
    trust_score: int = Field(..., ge=0, le=100)
    risk_level: Literal["SAFE", "CAUTION", "HIGH_RISK"]
    endpoint_used: str
    input_type: str
    verdict_title: str
    summary: str
    child_tip: str
    elderly_summary_en: str
    elderly_summary_ml: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    forensic_details: List[ForensicDetail]
    sha256_hash: str
    analyzed_at: str
    privacy_note: str = "Processed 100% in-memory. Zero files stored on disk."


def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def score_to_risk(score: int) -> Literal["SAFE", "CAUTION", "HIGH_RISK"]:
    if score >= 70:
        return "SAFE"
    if score >= 40:
        return "CAUTION"
    return "HIGH_RISK"
