from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import VerifyRequest, VerifyResponse, FaceRectangle
from app.services.azure_face import AzureFaceService
from app.core.security import verify_api_key

router = APIRouter(prefix="/identity-verification", tags=["Identity Verification"])


@router.post(
    "/verify",
    response_model=VerifyResponse,
    summary="Verificación de identidad 1:1",
    description=(
        "Compara dos imágenes para determinar si pertenecen a la misma persona. "
        "Internamente detecta el primer rostro de cada imagen y llama a Face Verify."
    ),
)
async def verify_identity(
    body: VerifyRequest,
    _: str = Depends(verify_api_key),
):
    svc = AzureFaceService()

    # Detectar rostros en ambas imágenes en paralelo
    import asyncio
    faces1, faces2 = await asyncio.gather(
        svc.detect(body.imageUrl1),
        svc.detect(body.imageUrl2),
    )

    if not faces1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se detectó ningún rostro en la primera imagen",
        )
    if not faces2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se detectó ningún rostro en la segunda imagen",
        )

    # Verificar con los primeros rostros de cada imagen
    result = await svc.verify(faces1[0]["faceId"], faces2[0]["faceId"])

    confidence = result["confidence"]
    is_identical = result["isIdentical"]
    pct = round(confidence * 100)

    if is_identical and pct >= 80:
        verdict = "Identidad confirmada con alta confianza"
    elif is_identical:
        verdict = "Posible coincidencia — confianza moderada"
    elif pct >= 40:
        verdict = "No coincide — similitud parcial detectada"
    else:
        verdict = "Personas distintas"

    return VerifyResponse(
        isIdentical=is_identical,
        confidence=round(confidence, 4),
        confidencePercent=pct,
        verdict=verdict,
        faceRectangle1=FaceRectangle(**faces1[0]["faceRectangle"]),
        faceRectangle2=FaceRectangle(**faces2[0]["faceRectangle"]),
    )
