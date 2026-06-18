import anthropic
import base64
from config import ANTHROPIC_API_KEY

_client = None

def get_client():
    global _client
    if _client is None:
        if not ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY .env dosyasında tanımlanmamış.")
        _client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client

SYSTEM_PROMPT = """You are an expert AI image prompt engineer specializing in creating highly detailed, technically precise prompts for thumbnail generation. Your prompts must be comprehensive, covering every visual and technical aspect needed to produce a stunning, click-worthy thumbnail.

ALWAYS structure your output in these exact sections:

[SUBJECT]
Describe the primary subject in exhaustive detail: facial features (eye color, shape, eyebrows, nose, lips, skin tone, complexion), hair (color, texture, length, style), expression (emotion, intensity), body posture, clothing (style, color, fabric, fit), accessories, any makeup or grooming details.

[SCENE]
Describe the environment: location type, background elements, props, depth, atmosphere, weather (if outdoor), architectural details, any secondary elements that support the narrative.

[COMPOSITION]
Specify the framing precisely: rule of thirds placement, camera-to-subject distance (extreme close-up / close-up / medium / wide), focal point, leading lines, symmetry or asymmetry, negative space usage, layering (foreground / midground / background).

[CAMERA]
Specify exact camera setup: camera body (e.g., Sony A7R V, Canon R5, Nikon Z9), lens focal length (e.g., 85mm, 50mm, 35mm), aperture (e.g., f/1.8 for shallow DOF or f/8 for deep DOF), shooting angle (eye-level / slightly low angle / bird's eye), distance from subject.

[SETTINGS]
Technical exposure settings: ISO (e.g., ISO 100 for clean studio, ISO 3200 for dramatic night), shutter speed (e.g., 1/200s), aperture (f/1.4–f/16), white balance (e.g., 5500K daylight / 3200K tungsten), RAW quality, any in-camera picture style.

[LIGHTING]
Complete lighting setup: primary light source (type, position, size, quality — hard vs. soft), fill light, rim/hair light, any practical lights visible in scene, light color temperature, shadows (direction, hardness), overall mood lighting description. Be specific: "large octabox at 45° camera left, silver reflector camera right as fill."

[COLOR]
Color grading and palette: overall color temperature (warm/cool/neutral), dominant hues, saturation level, contrast curve (flat/standard/punchy), specific color grade style (e.g., cinematic teal-orange, desaturated filmic, vivid YouTube style), highlights and shadows treatment.

[STYLE]
Visual style descriptor combining: photographic style (editorial, cinematic, commercial, documentary), any artistic influences from the style references provided, rendering quality descriptors (hyperrealistic, photorealistic, ultra-detailed, 8K, shot on Phase One), thumbnail-specific considerations (high contrast, bold colors, immediate visual impact).

[NIGHT_NOTES]
(Include ONLY in night mode) Specific instructions for night execution: motivated light sources (neon signs, street lamps, phone screens, car headlights), strong rim lighting on subject to separate from dark background, catchlights in eyes mandatory, face must be at least 60% properly exposed despite dark environment, use dramatic chiaroscuro lighting, ensure sufficient ambient detail to establish nighttime context without losing subject visibility.

[FINAL_PROMPT]
Write the complete, unified image generation prompt combining all sections into one fluid, detailed paragraph. This is what gets sent to the image AI. Start with the most important visual elements and build outward. Include quality boosters: "photorealistic, ultra-detailed, 8K resolution, professional photography, sharp focus, high contrast, visually striking thumbnail."

[NEGATIVE_PROMPT]
List elements to avoid: blurry, low quality, pixelated, distorted face, extra fingers, bad anatomy, watermark, text overlay, oversaturated, washed out, dark and muddy, flat lighting, amateur photography, stock photo style."""


def build_user_message(
    description: str,
    mode: str,
    fidelity: str,
    subject_description: str,
    subject2_description: str,
    rough_draft_description: str,
    reference_descriptions: list[str],
    library_examples: list[dict],
    attachments: list[dict],
) -> list:
    text_parts = []

    text_parts.append(f"## MODE: {'NIGHTTIME' if mode == 'night' else 'DAYTIME'}")
    text_parts.append(f"## ROUGH DRAFT FIDELITY: {fidelity}")
    text_parts.append(f"\n## USER DESCRIPTION:\n{description}")

    if subject_description:
        text_parts.append(f"\n## PRIMARY SUBJECT FACE (MANDATORY - reproduce exactly):\n{subject_description}")

    if subject2_description:
        text_parts.append(f"\n## SECONDARY SUBJECT FACE (reproduce exactly):\n{subject2_description}")

    if rough_draft_description:
        fidelity_instruction = {
            "low": "Use the rough draft as loose inspiration only — feel free to deviate significantly in composition and style.",
            "medium": "Follow the rough draft's composition and key elements fairly closely, but improve quality and details.",
            "exact": "Reproduce the rough draft's composition, framing, and layout as precisely as possible — treat it as a blueprint.",
        }.get(fidelity, "")
        text_parts.append(f"\n## ROUGH DRAFT: {rough_draft_description}\nFidelity instruction: {fidelity_instruction}")

    for i, desc in enumerate(reference_descriptions, 1):
        if desc:
            text_parts.append(f"\n## REFERENCE IMAGE {i}:\n{desc}")

    if library_examples:
        mode_label = "nighttime" if mode == "night" else "daytime"
        text_parts.append(f"\n## STYLE REFERENCES (match visual style of these {mode_label} thumbnails):")
        for ex in library_examples:
            text_parts.append(f"- Style reference thumbnail attached")

    text_parts.append(
        "\n\nNow generate the complete, highly detailed thumbnail prompt following the exact section structure defined in your instructions."
    )

    content = [{"type": "text", "text": "\n".join(text_parts)}]

    for att in attachments:
        if att.get("data") and att.get("media_type"):
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": att["media_type"],
                    "data": att["data"],
                },
            })

    return content


async def generate_prompt(
    description: str,
    mode: str,
    fidelity: str,
    subject_description: str,
    subject2_description: str,
    rough_draft_description: str,
    reference_descriptions: list[str],
    library_examples: list[dict],
    attachments: list[dict],
) -> str:
    content = build_user_message(
        description=description,
        mode=mode,
        fidelity=fidelity,
        subject_description=subject_description,
        subject2_description=subject2_description,
        rough_draft_description=rough_draft_description,
        reference_descriptions=reference_descriptions,
        library_examples=library_examples,
        attachments=attachments,
    )

    response = get_client().messages.create(
        model="claude-opus-4-8",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": content}],
    )

    return response.content[0].text
