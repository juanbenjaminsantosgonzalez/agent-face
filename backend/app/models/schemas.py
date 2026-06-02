from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional


# ── SHARED ────────────────────────────────────────────────────────────────────
class FaceRectangle(BaseModel):
    top: int
    left: int
    width: int
    height: int


# ── DETECT ────────────────────────────────────────────────────────────────────
class DetectRequest(BaseModel):
    imageUrl: str

    @field_validator("imageUrl")
    @classmethod
    def must_be_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://", "data:image/")):
            raise ValueError("imageUrl debe ser una URL válida (http/https) o una imagen codificada en base64")
        return v


class DetectedFace(BaseModel):
    faceId: str
    faceRectangle: FaceRectangle


class DetectResponse(BaseModel):
    success: bool = True
    totalFaces: int
    faces: list[DetectedFace]
    message: str


# ── VERIFY ────────────────────────────────────────────────────────────────────
class VerifyRequest(BaseModel):
    imageUrl1: str
    imageUrl2: str

    @field_validator("imageUrl1", "imageUrl2")
    @classmethod
    def must_be_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://", "data:image/")):
            raise ValueError("Debe ser una URL válida (http/https) o una imagen codificada en base64")
        return v


class VerifyResponse(BaseModel):
    success: bool = True
    isIdentical: bool
    confidence: float
    confidencePercent: int
    verdict: str
    faceRectangle1: Optional[FaceRectangle] = None
    faceRectangle2: Optional[FaceRectangle] = None


# ── ATTRIBUTES ────────────────────────────────────────────────────────────────
class AttributeRequest(BaseModel):
    imageUrl: str

    @field_validator("imageUrl")
    @classmethod
    def must_be_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://", "data:image/")):
            raise ValueError("imageUrl debe ser una URL válida o una imagen codificada en base64")
        return v


class FaceAttributes(BaseModel):
    age: Optional[float] = None
    gender: Optional[str] = None
    smile: Optional[float] = None
    glasses: Optional[str] = None
    emotion: Optional[dict[str, float]] = None
    headPose: Optional[dict[str, float]] = None
    blur: Optional[dict] = None


class AttributeResponse(BaseModel):
    success: bool = True
    faceId: str
    faceRectangle: FaceRectangle
    attributes: FaceAttributes
