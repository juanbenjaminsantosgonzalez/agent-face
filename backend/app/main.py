import os
import shutil

# Autocreate .env from .env.example if missing
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
env_example_path = os.path.join(backend_dir, ".env.example")

if not os.path.exists(env_path) and os.path.exists(env_example_path):
    try:
        shutil.copy(env_example_path, env_path)
        print(f"Created .env file from .env.example at: {env_path}")
    except Exception as e:
        print(f"Could not copy .env.example to .env: {e}")

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
    settings = get_settings()
    configured = (
        bool(settings.azure_face_key) 
        and bool(settings.azure_face_endpoint) 
        and "TU_API_KEY" not in settings.azure_face_key 
        and "TU_REGION" not in settings.azure_face_endpoint
    )
    return {
        "status": "online",
        "agent": "Face Agent API",
        "version": "1.0.0",
        "docs": "/docs",
        "azure_configured": configured,
        "mock_mode": False,
        "modules": [
            "POST /face-detection/detect",
            "POST /identity-verification/verify",
            "POST /face-attributes/analyze",
        ],
    }


@app.get("/health", tags=["Health"])
async def health():
    settings = get_settings()
    configured = (
        bool(settings.azure_face_key) 
        and bool(settings.azure_face_endpoint) 
        and "TU_API_KEY" not in settings.azure_face_key 
        and "TU_REGION" not in settings.azure_face_endpoint
    )
    return {
        "status": "ok",
        "azure_configured": configured,
        "mock_mode": False
    }
