import httpx
from typing import Any
from fastapi import HTTPException, status
from app.core.config import get_settings


class AzureFaceService:
    """
    Cliente real para Azure Cognitive Services - Face API v1.0
    Docs: https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236
    """

    def __init__(self):
        settings = get_settings()
        self.endpoint = settings.azure_face_endpoint.rstrip("/") if settings.azure_face_endpoint else ""
        self.key = settings.azure_face_key
        
        # Validar configuración de credenciales (nada es simulado, deben configurarse en .env)
        if not self.key or not self.endpoint or "TU_API_KEY" in self.key or "TU_REGION" in self.endpoint:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Las credenciales de Azure Face API no están configuradas o contienen valores de ejemplo en el archivo .env",
            )
            
        self.mock_mode = False
        
        self.headers = {
            "Ocp-Apim-Subscription-Key": self.key,
        }

    # ── DETECT ────────────────────────────────────────────────────────────────
    async def detect(
        self,
        image_url: str, 
        attributes: list[str] | None = None,
    ) -> list[dict]:
        """
        Detecta rostros en una imagen pública (URL) o en local (base64).
        """
        detection_model = "detection_01" if attributes else "detection_03"

        params: dict[str, Any] = {
            "detectionModel": detection_model,
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
        }
        if attributes:
            params["returnFaceAttributes"] = ",".join(attributes)

        is_binary = image_url.startswith("data:")
        headers = self.headers.copy()

        if is_binary:
            headers["Content-Type"] = "application/octet-stream"
            try:
                header, encoded = image_url.split(",", 1)
                import base64
                body = base64.b64decode(encoded)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error al decodificar base64 de la imagen: {str(e)}"
                )
        else:
            headers["Content-Type"] = "application/json"
            body = {"url": image_url}

        async with httpx.AsyncClient(timeout=30) as client:
            if is_binary:
                resp = await client.post(
                    f"{self.endpoint}/face/v1.0/detect",
                    headers=headers,
                    params=params,
                    content=body,
                )
            else:
                resp = await client.post(
                    f"{self.endpoint}/face/v1.0/detect",
                    headers=headers,
                    params=params,
                    json=body,
                )

        return self._parse(resp, "detect")

    # ── VERIFY ────────────────────────────────────────────────────────────────
    async def verify(self, face_id_1: str, face_id_2: str) -> dict:
        """Compara dos faceIds y retorna isIdentical + confidence (0.0–1.0)"""
        headers = self.headers.copy()
        headers["Content-Type"] = "application/json"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.endpoint}/face/v1.0/verify",
                headers=headers,
                json={"faceId": face_id_1, "faceId2": face_id_2},
            )
        return self._parse(resp, "verify")

    # ── HELPER ────────────────────────────────────────────────────────────────
    def _parse(self, resp: httpx.Response, op: str) -> Any:
        if resp.status_code == 200:
            return resp.json()

        try:
            error_body = resp.json()
            msg = error_body.get("error", {}).get("message", resp.text)
        except Exception:
            msg = resp.text

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Azure Face API [{op}] → {resp.status_code}: {msg}",
        )
