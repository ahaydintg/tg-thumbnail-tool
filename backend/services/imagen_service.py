import base64
from google import genai
from google.genai import types
from config import GOOGLE_API_KEY

_client = None

def get_client():
    global _client
    if _client is None:
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY .env dosyasında tanımlanmamış.")
        _client = genai.Client(api_key=GOOGLE_API_KEY)
    return _client


def extract_final_prompt(full_prompt: str) -> str:
    if "[FINAL_PROMPT]" in full_prompt:
        parts = full_prompt.split("[FINAL_PROMPT]")
        after = parts[1]
        if "[NEGATIVE_PROMPT]" in after:
            after = after.split("[NEGATIVE_PROMPT]")[0]
        return after.strip()
    return full_prompt.strip()


def extract_negative_prompt(full_prompt: str) -> str:
    if "[NEGATIVE_PROMPT]" in full_prompt:
        return full_prompt.split("[NEGATIVE_PROMPT]")[1].strip()
    return ""


async def generate_image(prompt: str, model: str = "imagen-3.0-generate-001") -> str:
    final_prompt = extract_final_prompt(prompt)
    negative_prompt = extract_negative_prompt(prompt)

    response = get_client().models.generate_images(
        model=model,
        prompt=final_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="16:9",
            negative_prompt=negative_prompt if negative_prompt else None,
            safety_filter_level="block_only_high",
            person_generation="allow_adult",
        ),
    )

    image_bytes = response.generated_images[0].image.image_bytes
    return base64.b64encode(image_bytes).decode("utf-8")
