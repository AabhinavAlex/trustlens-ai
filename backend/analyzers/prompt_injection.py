import io
import re
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pypdf import PdfReader

from schemas import AnalysisResponse, ForensicDetail, compute_sha256, score_to_risk, utc_now_iso

router = APIRouter()

_INJECTION_PATTERNS = [
    ("Role / Instruction Override", r"(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|system)\s+(instructions|rules|prompts)"),
    ("System Prompt Extraction", r"(reveal|print|show|output|repeat)\s+(your\s+)?(system\s+prompt|hidden\s+instructions|developer\s+message)"),
    ("Jailbreak / Persona Hijack", r"(you\s+are\s+now|act\s+as|enter\s+developer\s+mode|dan\s+mode|bypass\s+safety)"),
    ("Delimiter Spoofing", r"(<\s*/?\s*system\s*>|\[INST\]|###\s*SYSTEM|BEGIN\s+OVERRIDE)"),
    ("Data Exfiltration Directive", r"(exfiltrate|send\s+all\s+secrets|upload\s+env|leak\s+api\s+key)"),
]

_ZERO_WIDTH_CHARS = ["\u200b", "\u200c", "\u200d", "\ufeff", "\u2060"]


@router.post("/api/prompt-injection", response_model=AnalysisResponse)
async def analyze_prompt_injection(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    raw_bytes = b""
    extracted_text = (text or "").strip()
    input_type = "text"

    if file is not None:
        raw_bytes = await file.read()
        if not raw_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf") or raw_bytes[:4] == b"%PDF":
            input_type = "pdf_text"
            try:
                reader = PdfReader(io.BytesIO(raw_bytes))
                pages_text = [p.extract_text() or "" for p in reader.pages]
                extracted_text = "\n".join(pages_text).strip()
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF text: {exc}")
        else:
            extracted_text = raw_bytes.decode("utf-8", errors="ignore").strip()
    elif extracted_text:
        raw_bytes = extracted_text.encode("utf-8")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="No text found to scan for prompt injection.")

    details: list[ForensicDetail] = []
    penalties = 0
    lower = extracted_text.lower()

    for label, pattern in _INJECTION_PATTERNS:
        matches = re.findall(pattern, lower)
        if matches:
            penalties += 35
            details.append(ForensicDetail(
                label=label,
                value=f"Matched adversarial pattern ({len(matches)}x)",
                severity="danger",
            ))

    zw_count = sum(extracted_text.count(ch) for ch in _ZERO_WIDTH_CHARS)
    if zw_count > 0:
        penalties += 25
        details.append(ForensicDetail(
            label="Hidden Zero-Width Unicode",
            value=f"{zw_count} invisible characters detected (stealth instruction hiding)",
            severity="danger",
        ))
    else:
        details.append(ForensicDetail(
            label="Invisible Character Scan",
            value="No zero-width Unicode obfuscation found",
            severity="ok",
        ))

    b64_hits = re.findall(r"\b[A-Za-z0-9+/]{32,}={0,2}\b", extracted_text)
    if b64_hits:
        penalties += 15
        details.append(ForensicDetail(
            label="Encoded Payload Segment",
            value=f"{len(b64_hits)} Base64-like block(s) detected",
            severity="warn",
        ))

    if penalties == 0:
        details.append(ForensicDetail(
            label="Adversarial Pattern Scan",
            value="Clean — no instruction-hijacking directives found",
            severity="ok",
        ))

    trust_score = max(5, min(98, 97 - penalties))
    risk = score_to_risk(trust_score)
    confidence = round(min(0.97, 0.72 + (penalties / 130.0)), 2)

    if risk == "HIGH_RISK":
        verdict = "Adversarial Prompt Injection Detected"
        summary = "Hidden or explicit AI instruction-override commands found. Do not feed this content into an AI assistant."
        child_tip = "This text has secret computer commands trying to trick AI helpers. Don't copy or share it!"
        elderly_en = "Warning: This document contains hidden computer commands meant to trick AI tools."
        elderly_ml = "മുന്നറിയിപ്പ്: ഈ സന്ദേശത്തിൽ AI സിസ്റ്റങ്ങളെ തെറ്റിദ്ധരിപ്പിക്കുന്ന രഹസ്യ നിർദ്ദേശങ്ങൾ അടങ്ങിയിരിക്കുന്നു."
    elif risk == "CAUTION":
        verdict = "Obfuscated Content Detected"
        summary = "Encoded blocks or unusual formatting found. Inspect before passing to automated AI workflows."
        child_tip = "This text has strange hidden codes. Ask an adult to check it."
        elderly_en = "Caution: Unusual hidden formatting was found in this text."
        elderly_ml = "ജാഗ്രത: ഈ സന്ദേശത്തിൽ അസാധാരണമായ കോഡുകൾ കണ്ടെത്തി."
    else:
        verdict = "No Prompt Injection Found"
        summary = "Text is free of instruction-override, jailbreak, or hidden Unicode injection patterns."
        child_tip = "This text looks clean and safe!"
        elderly_en = "This text is clean and safe from hidden AI manipulation commands."
        elderly_ml = "ഈ സന്ദേശത്തിൽ ദോഷകരമായ രഹസ്യ നിർദ്ദേശങ്ങളൊന്നും കണ്ടെത്തിയില്ല."

    return AnalysisResponse(
        trust_score=trust_score,
        risk_level=risk,
        endpoint_used="/api/prompt-injection",
        input_type=input_type,
        verdict_title=verdict,
        summary=summary,
        child_tip=child_tip,
        elderly_summary_en=elderly_en,
        elderly_summary_ml=elderly_ml,
        confidence=confidence,
        forensic_details=details,
        sha256_hash=compute_sha256(raw_bytes),
        analyzed_at=utc_now_iso(),
    )
