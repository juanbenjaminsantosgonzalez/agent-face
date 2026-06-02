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
        self.endpoint = settings.azure_face_endpoint.rstrip("/")
        self.key = settings.azure_face_key
        self.headers = {
            "Ocp-Apim-Subscription-Key": self.key,
            "Content-Type": "application/json",
        }

    # ── DETECT ────────────────────────────────────────────────────────────────
    async def detect(
        self,
        image_url: str,
        attributes: list[str] | None = None,
    ) -> list[dict]:
        """
        Detecta rostros en una imagen pública.
        - Si se piden atributos: usa detection_01 (compatible con face attributes)
        - Si solo faceId: usa detection_03 (más preciso, sin atributos)
        """
        detection_model = "detection_01" if attributes else "detection_03"

        params: dict[str, Any] = {
            "detectionModel": detection_model,
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
        }
        if attributes:
            params["returnFaceAttributes"] = ",".join(attributes)

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.endpoint}/face/v1.0/detect",
                headers=self.headers,
                params=params,
                json={"url": image_url},
            )

        return self._parse(resp, "detect")

    # ── VERIFY ────────────────────────────────────────────────────────────────
    async def verify(self, face_id_1: str, face_id_2: str) -> dict:
        """Compara dos faceIds y retorna isIdentical + confidence (0.0–1.0)"""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.endpoint}/face/v1.0/verify",
                headers=self.headers,
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
