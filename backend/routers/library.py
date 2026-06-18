from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import aiosqlite
import aiofiles
import os
import uuid
from config import DATABASE_PATH, STORAGE_DIR

router = APIRouter(prefix="/api/library", tags=["library"])


@router.get("")
async def list_thumbnails():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT id, filename, mode, created_at FROM library ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
    return JSONResponse([dict(row) for row in rows])


@router.post("")
async def add_thumbnail(
    mode: str = Form(...),
    image: UploadFile = File(...),
):
    if mode not in ("day", "night"):
        raise HTTPException(status_code=400, detail="mode must be 'day' or 'night'")

    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(STORAGE_DIR, filename)

    data = await image.read()
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(data)

    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO library (filename, mode) VALUES (?, ?)",
            (filename, mode),
        )
        await db.commit()
        thumbnail_id = cursor.lastrowid

    return JSONResponse({"id": thumbnail_id, "filename": filename, "mode": mode})


@router.delete("/{thumbnail_id}")
async def delete_thumbnail(thumbnail_id: int):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT filename FROM library WHERE id = ?", (thumbnail_id,)) as cursor:
            row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")
        filepath = os.path.join(STORAGE_DIR, row["filename"])
        if os.path.exists(filepath):
            os.remove(filepath)
        await db.execute("DELETE FROM library WHERE id = ?", (thumbnail_id,))
        await db.commit()
    return JSONResponse({"ok": True})


@router.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
