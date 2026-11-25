import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import ExifTags, Image

from schemas import AnalysisResponse, ForensicDetail, compute_sha256, score_to_risk, utc_now_iso

router = APIRouter()

_EDITING_SIGNATURES = [
    "photoshop", "gimp", "canva", "midjourney", "dall-e", "stable diffusion",
    "comfyui", "lightroom", "snapseed", "picsart", "firefly",
]


@router.post("/api/authenticity", response_model=AnalysisResponse)
async def analyze_authenticity(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        img = Image.open(io.BytesIO(data))
        exif_raw = img.getexif()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    details: list[ForensicDetail] = [
        ForensicDetail(label="Container Format", value=f"{img.format} ({img.size[0]}x{img.size[1]})", severity="ok")
    ]
    penalties = 0

    exif_map = {}
    if exif_raw:
        for tag_id, val in exif_raw.items():
            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
            exif_map[tag_name] = str(val)

    # Also check PNG text chunks for AI generation parameters
    png_info = {str(k).lower(): str(v) for k, v in (img.info or {}).items()}
    if any(k in png_info for k in ["parameters", "prompt", "workflow", "dream"]):
        penalties += 45
        details.append(ForensicDetail(
            label="AI Generation Metadata",
            value="Embedded AI prompt/workflow chunk found in PNG metadata",
            severity="danger",
        ))

    if not exif_map:
        penalties += 35
        details.append(ForensicDetail(
            label="EXIF Origin Data",
            value="Stripped or missing EXIF metadata (common in re-saved/AI images)",
            severity="warn",
        ))
    else:
        make = exif_map.get("Make", "Missing")
        model = exif_map.get("Model", "Missing")
        software = exif_map.get("Software", "")
        dt = exif_map.get("DateTimeOriginal") or exif_map.get("DateTime") or "Missing"

        details.append(ForensicDetail(
            label="Camera Make / Model",
            value=f"{make} / {model}",
            severity="ok" if make != "Missing" else "warn",
        ))
        details.append(ForensicDetail(
            label="Capture Timestamp",
            value=dt,
            severity="ok" if dt != "Missing" else "warn",
        ))

        if software:
            is_editor = any(sig in software.lower() for sig in _EDITING_SIGNATURES)
            if is_editor:
                penalties += 35
                details.append(ForensicDetail(
                    label="Editing / AI Software Tag",
                    value=software[:60],
                    severity="danger",
                ))
            else:
                details.append(ForensicDetail(label="Software Tag", value=software[:60], severity="ok"))

    trust_score = max(10, min(98, 95 - penalties))
    risk = score_to_risk(trust_score)

    if risk == "HIGH_RISK":
        verdict = "Origin Metadata Altered or AI-Tagged"
        summary = "Editing software or AI generation metadata detected. Origin authenticity cannot be confirmed."
        child_tip = "This picture was edited or made by a computer app. Don't believe everything it shows!"
        elderly_en = "Warning: This photo shows signs of editing or AI creation. Verify before trusting."
        elderly_ml = "മുന്നറിയിപ്പ്: ഈ ചിത്രം എഡിറ്റ് ചെയ്തതോ AI നിർമ്മിച്ചതോ ആകാൻ സാധ്യതയുണ്ട്."
    elif risk == "CAUTION":
        verdict = "Missing Camera Origin Data"
        summary = "EXIF camera origin tags are stripped or incomplete. Common on social media forwards and edited files."
        child_tip = "We can't see which camera took this photo. Ask an adult if it looks suspicious."
        elderly_en = "Caution: Camera details are missing from this photo. Treat forwarded images carefully."
        elderly_ml = "ജാഗ്രത: ഈ ചിത്രത്തിന്റെ ഉറവിട വിവരങ്ങൾ ലഭ്യമല്ല. ഫോർവേഡ് ചെയ്ത ചിത്രങ്ങൾ സൂക്ഷിച്ച് വിശ്വസിക്കുക."
    else:
        verdict = "Original Camera Metadata Present"
        summary = "Authentic camera make/model and timestamp metadata found with no editing software signatures."
        child_tip = "This photo has real camera details, which is a good sign!"
        elderly_en = "This photo contains original camera details and appears authentic."
        elderly_ml = "ഈ ചിത്രത്തിൽ യഥാർത്ഥ ക്യാമറ വിവരങ്ങൾ കണ്ടെത്തി. ഇത് വിശ്വസനീയമാണെന്ന് തോന്നുന്നു."

    return AnalysisResponse(
        trust_score=trust_score,
        risk_level=risk,
        endpoint_used="/api/authenticity",
        input_type="image_metadata",
        verdict_title=verdict,
        summary=summary,
        child_tip=child_tip,
        elderly_summary_en=elderly_en,
        elderly_summary_ml=elderly_ml,
        confidence=0.88 if exif_map else 0.76,
        forensic_details=details,
        sha256_hash=compute_sha256(data),
        analyzed_at=utc_now_iso(),
    )
