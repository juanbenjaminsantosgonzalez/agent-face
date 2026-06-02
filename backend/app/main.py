from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import face_detection, identity_verification, face_attributes

settings = get_settings()

app = FastAPI(
    title="Face Agent API",
    description=(
        "Agente de reconocimiento facial con Azure Cognitive Services.\n\n"
        "**Módulos:**\n"
        "- `/face-detection` — Detecta rostros y retorna faceId + coordenadas\n"
        "- `/identity-verification` — Verificación 1:1 entre dos imágenes\n"
        "- `/face-attributes` — Edad, género, emociones, sonrisa y más\n\n"
        "**Auth:** header `x-api-key`"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — permite peticiones del frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(face_detection.router)
app.include_router(identity_verification.router)
app.include_router(face_attributes.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "agent": "Face Agent API",
        "version": "1.0.0",
        "docs": "/docs",
        "modules": [
            "POST /face-detection/detect",
            "POST /identity-verification/verify",
            "POST /face-attributes/analyze",
        ],
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
