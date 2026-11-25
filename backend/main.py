from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analyzers.authenticity import router as authenticity_router
from analyzers.deepfake import router as deepfake_router
from analyzers.identity import router as identity_router
from analyzers.prompt_injection import router as prompt_injection_router
from analyzers.scam import router as scam_router

app = FastAPI(
    title="TrustLens AI API",
    description="In-memory privacy-first digital trust & threat detection backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deepfake_router)
app.include_router(scam_router)
app.include_router(identity_router)
app.include_router(authenticity_router)
app.include_router(prompt_injection_router)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "TrustLens AI",
        "privacy_mode": "in-memory-only",
    }
