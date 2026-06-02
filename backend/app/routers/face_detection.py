from fastapi import APIRouter, Depends
from app.models.schemas import DetectRequest, DetectResponse, DetectedFace, FaceRectangle
from app.services.azure_face import AzureFaceService
from app.core.security import verify_api_key

router = APIRouter(prefix="/face-detection", tags=["Face Detection"])


@router.post(
    "/detect",
    response_model=DetectResponse,
    summary="Detectar rostros en una imagen",
    description="Recibe la URL pública de una imagen y retorna todos los rostros detectados con su posición.",
)
async def detect_faces(
    body: DetectRequest,
    _: str = Depends(verify_api_key),
):
    svc = AzureFaceService()
    raw_faces = await svc.detect(body.imageUrl)

    faces = [
        DetectedFace(
            faceId=f["faceId"],
            faceRectangle=FaceRectangle(**f["faceRectangle"]),
        )
        for f in raw_faces
    ]

    n = len(faces)
    return DetectResponse(
        totalFaces=n,
        faces=faces,
        message=f"Se detectaron {n} rostro(s)" if n else "No se detectaron rostros",
    )
