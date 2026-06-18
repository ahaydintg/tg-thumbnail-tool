from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from config import DATABASE_PATH

router = APIRouter(prefix="/api/settings", tags=["settings"])

ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

KEYS = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY"]


def read_env() -> dict:
    values = {k: "" for k in KEYS}
    if not os.path.exists(ENV_PATH):
        return values
    with open(ENV_PATH, "r") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, _, val = line.partition("=")
                key = key.strip()
                if key in KEYS:
                    values[key] = val.strip()
    return values


def write_env(values: dict):
    existing = read_env()
    existing.update({k: v for k, v in values.items() if k in KEYS})
    lines = [f"{k}={v}\n" for k, v in existing.items()]
    with open(ENV_PATH, "w") as f:
        f.writelines(lines)


def mask(val: str) -> str:
    if not val:
        return ""
    if len(val) <= 8:
        return "*" * len(val)
    return val[:6] + "..." + val[-4:]


@router.get("")
async def get_settings():
    values = read_env()
    return JSONResponse({
        k: {"set": bool(v), "masked": mask(v)}
        for k, v in values.items()
    })


class SettingsPayload(BaseModel):
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""


@router.post("")
async def save_settings(payload: SettingsPayload):
    new_vals = payload.model_dump()
    existing = read_env()
    # Only overwrite non-empty submissions
    merged = {k: (new_vals[k] if new_vals[k] else existing[k]) for k in KEYS}
    write_env(merged)

    # Reset cached clients so new keys take effect
    import services.claude_service as cs
    import services.openai_service as os_svc
    import services.imagen_service as img
    import config
    from dotenv import load_dotenv
    load_dotenv(ENV_PATH, override=True)
    config.ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    config.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    config.GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    cs._client = None
    os_svc._client = None
    img._client = None

    return JSONResponse({"ok": True})
