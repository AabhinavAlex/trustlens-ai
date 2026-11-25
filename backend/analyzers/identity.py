import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
from pypdf import PdfReader

from schemas import AnalysisResponse, ForensicDetail, compute_sha256, score_to_risk, utc_now_iso

router = APIRouter()


@router.post("/api/identity", response_model=AnalysisResponse)
async def analyze_identity(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded document is empty.")

    filename = (file.filename or "document").lower()
    sha256 = compute_sha256(data)
    details: list[ForensicDetail] = [
        ForensicDetail(label="SHA-256 Digest", value=sha256[:24] + "...", severity="ok"),
        ForensicDetail(label="Payload Size", value=f"{len(data) / 1024:.1f} KB", severity="ok"),
    ]

    penalties = 0
    doc_type = "pdf" if filename.endswith(".pdf") or data[:4] == b"%PDF" else "image"

    if doc_type == "pdf":
        if not data.startswith(b"%PDF"):
            penalties += 45
            details.append(ForensicDetail(
                label="Magic-Byte Header",
                value="Extension claims PDF but %PDF header is missing (spoofed file)",
                severity="danger",
            ))
        else:
            details.append(ForensicDetail(label="Magic-Byte Header", value="Valid %PDF signature", severity="ok"))

        try:
            reader = PdfReader(io.BytesIO(data))
            num_pages = len(reader.pages)
            details.append(ForensicDetail(label="Page Count", value=str(num_pages), severity="ok"))

            raw_lower = data.lower()
            if b"/javascript" in raw_lower or b"/js" in raw_lower or b"/openaction" in raw_lower:
                penalties += 45
                details.append(ForensicDetail(
                    label="Active Script / OpenAction",
                    value="Embedded JavaScript or auto-execute action detected in PDF",
                    severity="danger",
                ))
            else:
                details.append(ForensicDetail(
                    label="Active Script Check",
                    value="No embedded JavaScript or auto-actions",
                    severity="ok",
                ))

            if reader.metadata:
                producer = str(reader.metadata.get("/Producer", "Unknown"))
                details.append(ForensicDetail(label="PDF Producer", value=producer[:60], severity="ok"))
        except Exception as exc:
            penalties += 35
            details.append(ForensicDetail(
                label="PDF Structure Integrity",
                value=f"Malformed PDF structure: {str(exc)[:60]}",
                severity="danger",
            ))
    else:
        try:
            img = Image.open(io.BytesIO(data))
            img.verify()
            details.append(ForensicDetail(
                label="Image Format Integrity",
                value=f"Valid {img.format} container ({img.size[0]}x{img.size[1]})",
                severity="ok",
            ))
        except Exception:
            penalties += 50
            details.append(ForensicDetail(
                label="Image Format Integrity",
                value="Corrupted or mismatched image container",
                severity="danger",
            ))

    trust_score = max(10, min(98, 96 - penalties))
    risk = score_to_risk(trust_score)

    if risk == "HIGH_RISK":
        verdict = "Document Integrity Compromised"
        summary = "Suspicious embedded scripts, header mismatch, or structural corruption detected."
        child_tip = "This file might have hidden tricks inside. Do not open it without an adult!"
        elderly_en = "Warning: This document may be tampered with or unsafe. Do not open or trust it."
        elderly_ml = "മുന്നറിയിപ്പ്: ഈ രേഖയിൽ കൃത്രിമം നടന്നിരിക്കാം. ഇത് തുറക്കുകയോ വിശ്വസിക്കുകയോ ചെയ്യരുത്."
    elif risk == "CAUTION":
        verdict = "Partial Integrity Warnings"
        summary = "Minor structural anomalies found. Verify the issuer before relying on this document."
        child_tip = "Double-check who sent this document before opening."
        elderly_en = "Caution: Verify this document with the sender before using it."
        elderly_ml = "ജാഗ്രത: ഈ രേഖ ഉപയോഗിക്കുന്നതിന് മുമ്പ് അയച്ചയാളോട് ചോദിച്ചു ഉറപ്പാക്കുക."
    else:
        verdict = "Document Structure Verified"
        summary = "Valid file signature, clean container structure, and SHA-256 fingerprint generated."
        child_tip = "This document looks clean and safe!"
        elderly_en = "This document passed integrity checks and appears structurally valid."
        elderly_ml = "ഈ രേഖയുടെ ഘടന സുരക്ഷിതമാണെന്ന് പരിശോധനയിൽ സ്ഥിരീകരിച്ചു."

    return AnalysisResponse(
        trust_score=trust_score,
        risk_level=risk,
        endpoint_used="/api/identity",
        input_type=doc_type,
        verdict_title=verdict,
        summary=summary,
        child_tip=child_tip,
        elderly_summary_en=elderly_en,
        elderly_summary_ml=elderly_ml,
        confidence=0.91 if risk != "CAUTION" else 0.74,
        forensic_details=details,
        sha256_hash=sha256,
        analyzed_at=utc_now_iso(),
    )
