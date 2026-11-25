import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from schemas import AnalysisResponse, ForensicDetail, compute_sha256, score_to_risk, utc_now_iso

router = APIRouter()

# Lightweight embedded training set for fast in-memory startup
_TRAINING_SAMPLES = [
    ("URGENT: Your bank KYC is suspended! Click http://sbi-kyc-update.xyz immediately to avoid account block.", 1),
    ("Congratulations! You won Rs 50,000 lottery. Scan UPI QR or pay Rs 499 processing fee now.", 1),
    ("upi://pay?pa=refund-desk@okaxis&pn=RBI%20Refund&am=4999&mode=02&purpose=00", 1),
    ("Dear customer, your electricity bill is overdue. Call 9876543210 tonight or power will be disconnected.", 1),
    ("Verify your Aadhaar PAN link urgently at bit.ly/verify-kyc-now or pay penalty.", 1),
    ("Hi Mom, my phone broke. Please send 15000 urgent to this new UPI ID asap.", 1),
    ("Claim free iPhone 16! Enter OTP and CVV to confirm shipping.", 1),
    ("Part time job earn 5000 daily liking YouTube videos, deposit Rs 1000 to unlock task.", 1),
    ("Hey, are we still meeting for coffee at 5pm near the library?", 0),
    ("Your Amazon order #402-19283 has been shipped and will arrive tomorrow by 8 PM.", 0),
    ("Team standup moved to 10:30 AM. Please review the sprint notes before joining.", 0),
    ("upi://pay?pa=merchant@okicici&pn=FreshMart%20Grocery&am=240.00&cu=INR", 0),
    ("Reminder: Dentist appointment scheduled for Friday at 3:00 PM.", 0),
    ("Here is the PDF of our quarterly project budget and timeline.", 0),
    ("Happy birthday! Wishing you a wonderful year ahead.", 0),
    ("Please find attached the class notes for tomorrow's lecture.", 0),
]

_vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
_X = _vectorizer.fit_transform([text for text, _ in _TRAINING_SAMPLES])
_y = [label for _, label in _TRAINING_SAMPLES]
_classifier = LogisticRegression(solver="liblinear", max_iter=200)
_classifier.fit(_X, _y)


class ScamRequest(BaseModel):
    text: str


@router.post("/api/scam", response_model=AnalysisResponse)
async def analyze_scam(req: ScamRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    lower = text.lower()
    details: list[ForensicDetail] = []
    penalties = 0

    # ML classifier probability
    vec = _vectorizer.transform([text])
    scam_prob = float(_classifier.predict_proba(vec)[0][1])
    details.append(ForensicDetail(
        label="ML Scam Classifier",
        value=f"{scam_prob * 100:.1f}% scam probability (TF-IDF + LogisticRegression)",
        severity="danger" if scam_prob > 0.65 else ("warn" if scam_prob > 0.4 else "ok"),
    ))
    penalties += int(scam_prob * 45)

    # UPI QR / Deep-link inspection
    if lower.startswith("upi://"):
        details.append(ForensicDetail(label="Payload Type", value="UPI Payment Deep-Link / QR", severity="warn"))
        if any(k in lower for k in ["refund", "prize", "lottery", "kyc", "verify", "reward", "cashback"]):
            penalties += 35
            details.append(ForensicDetail(
                label="UPI Social Engineering Trap",
                value="Suspicious 'refund/prize/KYC' payee claiming you must pay/approve to receive money",
                severity="danger",
            ))
        if "mode=02" in lower or "collect" in lower:
            penalties += 15
            details.append(ForensicDetail(
                label="UPI Intent Mode",
                value="Elevated risk intent/collect parameter detected",
                severity="warn",
            ))

    # Urgency & credential harvesting keywords
    urgency_hits = re.findall(
        r"\b(urgent|immediately|suspended|blocked|kyc|otp|cvv|pin|lottery|prize|overdue|disconnect|arrest|customs|refund)\b",
        lower,
    )
    if urgency_hits:
        unique_hits = sorted(set(urgency_hits))
        penalties += min(35, len(unique_hits) * 10)
        details.append(ForensicDetail(
            label="Urgency / Phishing Triggers",
            value=", ".join(unique_hits[:6]),
            severity="danger" if len(unique_hits) >= 2 else "warn",
        ))

    # Suspicious URLs / shorteners / risky TLDs
    urls = re.findall(r"https?://[^\s]+", lower)
    if urls:
        risky_url = any(
            any(bad in u for bad in [".xyz", ".top", ".click", ".tk", "bit.ly", "tinyurl", "ngrok", "verify-", "kyc-"])
            for u in urls
        )
        if risky_url:
            penalties += 30
            details.append(ForensicDetail(
                label="Suspicious URL / Shortener",
                value=urls[0][:80],
                severity="danger",
            ))
        else:
            details.append(ForensicDetail(
                label="URL Detected",
                value=urls[0][:80],
                severity="ok",
            ))

    trust_score = max(4, min(98, 96 - penalties))
    risk = score_to_risk(trust_score)
    confidence = round(min(0.97, max(0.65, scam_prob if risk != "SAFE" else 1.0 - scam_prob)), 2)

    if risk == "HIGH_RISK":
        verdict = "High-Risk Scam / Phishing Detected"
        summary = "Strong indicators of social engineering, phishing links, or fraudulent UPI payment traps. Do not click links or approve any payment."
        child_tip = "Stop! This looks like a trick to steal passwords or money. Never click it—tell a parent right away."
        elderly_en = "Danger: This message or QR code is very likely a scam. Do NOT click any link, share OTP, or scan to pay."
        elderly_ml = "അപകടം: ഈ സന്ദേശം അല്ലെങ്കിൽ QR കോഡ് തട്ടിപ്പാകാൻ സാധ്യതയുണ്ട്. ലിങ്കിൽ ക്ലിക്ക് ചെയ്യരുത്, OTP നൽകരുത്, പണം അയക്കരുത്."
    elif risk == "CAUTION":
        verdict = "Suspicious Patterns Found"
        summary = "Some urgency or unfamiliar link/payment patterns were flagged. Verify independently via official channels."
        child_tip = "Be careful! This message looks a little fishy. Ask an adult before replying."
        elderly_en = "Caution: Please verify this message directly with your bank or family before taking action."
        elderly_ml = "ജാഗ്രത: തുടർനടപടി എടുക്കുന്നതിന് മുമ്പ് ബാങ്കുമായോ കുടുംബാംഗങ്ങളുമായോ നേരിട്ട് സംസാരിച്ച് ഉറപ്പാക്കുക."
    else:
        verdict = "Looks Safe"
        summary = "No significant phishing, urgency, or fraudulent payment patterns detected."
        child_tip = "This message looks okay, but never share your secrets online!"
        elderly_en = "This message appears safe, with no common scam warning signs."
        elderly_ml = "ഈ സന്ദേശം സുരക്ഷിതമാണെന്ന് തോന്നുന്നു. തട്ടിപ്പ് ലക്ഷണങ്ങളൊന്നും കണ്ടെത്തിയില്ല."

    return AnalysisResponse(
        trust_score=trust_score,
        risk_level=risk,
        endpoint_used="/api/scam",
        input_type="upi_qr" if lower.startswith("upi://") else ("url" if urls else "text"),
        verdict_title=verdict,
        summary=summary,
        child_tip=child_tip,
        elderly_summary_en=elderly_en,
        elderly_summary_ml=elderly_ml,
        confidence=confidence,
        forensic_details=details,
        sha256_hash=compute_sha256(text.encode("utf-8")),
        analyzed_at=utc_now_iso(),
    )
