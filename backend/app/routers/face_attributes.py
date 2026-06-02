from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import AttributeRequest, AttributeResponse, FaceAttributes, FaceRectangle
from app.services.azure_face import AzureFaceService
from app.core.security import verify_api_key

router = APIRouter(prefix="/face-attributes", tags=["Face Attributes"])

REQUESTED_ATTRS = ["age", "gender", "smile", "glasses", "emotion", "headPose", "blur"]


@router.post(
    "/analyze",
    response_model=AttributeResponse,
    summary="Analizar atributos faciales",
    description=(
        "Detecta el primer rostro en la imagen y retorna sus atributos: "
        "edad estimada, género, sonrisa, tipo de gafas, emociones y pose de cabeza."
    ),
)
async def analyze_attributes(
    body: AttributeRequest,
    _: str = Depends(verify_api_key),
):
    svc = AzureFaceService()
    faces = await svc.detect(body.imageUrl, attributes=REQUESTED_ATTRS)

    if not faces:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se detectó ningún rostro en la imagen",
        )

    face = faces[0]
    raw_attrs = face.get("faceAttributes", {})

    return AttributeResponse(
        faceId=face["faceId"],
        faceRectangle=FaceRectangle(**face["faceRectangle"]),
        attributes=FaceAttributes(
            age=raw_attrs.get("age"),
            gender=raw_attrs.get("gender"),
            smile=raw_attrs.get("smile"),
            glasses=raw_attrs.get("glasses"),
            emotion=raw_attrs.get("emotion"),
            headPose=raw_attrs.get("headPose"),
            blur=raw_attrs.get("blur"),
        ),
    )
