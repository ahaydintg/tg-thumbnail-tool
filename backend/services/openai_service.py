import openai
import base64
from config import OPENAI_API_KEY

client = openai.OpenAI(api_key=OPENAI_API_KEY)


def extract_final_prompt(full_prompt: str) -> str:
    if "[FINAL_PROMPT]" in full_prompt:
        parts = full_prompt.split("[FINAL_PROMPT]")
        after = parts[1]
        if "[NEGATIVE_PROMPT]" in after:
            after = after.split("[NEGATIVE_PROMPT]")[0]
        return after.strip()
    return full_prompt.strip()


async def generate_image(prompt: str, attachments: list[dict] | None = None) -> str:
    final_prompt = extract_final_prompt(prompt)

    input_images = []
    if attachments:
        for att in attachments:
            if att.get("data") and att.get("media_type"):
                input_images.append({
                    "type": "input_image",
                    "image_url": f"data:{att['media_type']};base64,{att['data']}",
                })

    if input_images:
        messages = [
            {
                "role": "user",
                "content": input_images + [{"type": "text", "text": final_prompt}],
            }
        ]
        response = client.responses.create(
            model="gpt-image-1",
            input=messages,
            modalities=["image"],
        )
        image_data = response.output[0].result[0].b64_json
    else:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=final_prompt,
            n=1,
            size="1792x1024",
            response_format="b64_json",
        )
        image_data = response.data[0].b64_json

    return image_data
