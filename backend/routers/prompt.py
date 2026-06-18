from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import json
import base64
import aiosqlite
from services.claude_service import generate_prompt
from config import DATABASE_PATH, STORAGE_DIR
import os

router = APIRouter(prefix="/api/prompt", tags=["prompt"])


def file_to_base64(data: bytes, content_type: str) -> dict:
    return {
        "data": base64.b64encode(data).decode("utf-8"),
        "media_type": content_type,
    }


@router.post("/generate")
async def generate(
    description: str = Form(...),
    mode: str = Form(...),
    fidelity: str = Form("medium"),
    subject_description: str = Form(""),
    subject2_description: str = Form(""),
    rough_draft_description: str = Form(""),
    reference_descriptions: str = Form("[]"),
    subject_image: Optional[UploadFile] = File(None),
    subject2_image: Optional[UploadFile] = File(None),
    rough_draft_image: Optional[UploadFile] = File(None),
    reference_images: list[UploadFile] = File(default=[]),
):
    attachments = []

    if subject_image and subject_image.filename:
        data = await subject_image.read()
        att = file_to_base64(data, subject_image.content_type)
        att["role"] = "subject_face"
        attachments.append(att)

    if subject2_image and subject2_image.filename:
        data = await subject2_image.read()
        att = file_to_base64(data, subject2_image.content_type)
        att["role"] = "subject2_face"
        attachments.append(att)

    if rough_draft_image and rough_draft_image.filename:
        data = await rough_draft_image.read()
        att = file_to_base64(data, rough_draft_image.content_type)
        att["role"] = "rough_draft"
        attachments.append(att)

    ref_descs = json.loads(reference_descriptions)
    for i, ref_file in enumerate(reference_images):
        if ref_file and ref_file.filename:
            data = await ref_file.read()
            att = file_to_base64(data, ref_file.content_type)
            att["role"] = f"reference_{i+1}"
            attachments.append(att)

    library_examples = []
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT filename, mode FROM library WHERE mode = ? ORDER BY RANDOM() LIMIT 4",
                (mode,)
            ) as cursor:
                rows = await cursor.fetchall()
                for row in rows:
                    path = os.path.join(STORAGE_DIR, row["filename"])
                    if os.path.exists(path):
                        with open(path, "rb") as f:
                            img_data = base64.b64encode(f.read()).decode("utf-8")
                        library_examples.append({"data": img_data, "media_type": "image/jpeg"})
                        attachments.append({"data": img_data, "media_type": "image/jpeg", "role": "style_reference"})
    except Exception:
        pass

    result = await generate_prompt(
        description=description,
        mode=mode,
        fidelity=fidelity,
        subject_description=subject_description,
        subject2_description=subject2_description,
        rough_draft_description=rough_draft_description,
        reference_descriptions=ref_descs,
        library_examples=library_examples,
        attachments=attachments,
    )

    return JSONResponse({"prompt": result})
