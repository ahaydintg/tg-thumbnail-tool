from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import base64
from services.openai_service import generate_image as openai_generate
from services.imagen_service import generate_image as imagen_generate

router = APIRouter(prefix="/api/generate", tags=["generate"])


def read_attachments(files: list[UploadFile]) -> list[dict]:
    result = []
    for f in files:
        if f and f.filename:
            data = f.file.read()
            result.append({
                "data": base64.b64encode(data).decode("utf-8"),
                "media_type": f.content_type,
            })
    return result


@router.post("/openai")
async def generate_openai(
    prompt: str = Form(...),
    extra_images: list[UploadFile] = File(default=[]),
):
    try:
        attachments = []
        for f in extra_images:
            if f and f.filename:
                data = await f.read()
                attachments.append({
                    "data": base64.b64encode(data).decode("utf-8"),
                    "media_type": f.content_type,
                })
        image_b64 = await openai_generate(prompt, attachments if attachments else None)
        return JSONResponse({"image": image_b64, "provider": "openai"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/imagen")
async def generate_imagen(
    prompt: str = Form(...),
    model: str = Form("imagen-3.0-generate-001"),
):
    try:
        image_b64 = await imagen_generate(prompt, model)
        return JSONResponse({"image": image_b64, "provider": "imagen"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
