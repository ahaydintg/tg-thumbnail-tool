const BASE = "http://localhost:8000";

export async function generatePrompt(formData) {
  const res = await fetch(`${BASE}/api/prompt/generate`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Prompt üretimi başarısız");
  }
  return res.json();
}

export async function generateImageOpenAI(formData) {
  const res = await fetch(`${BASE}/api/generate/openai`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "OpenAI görsel üretimi başarısız");
  }
  return res.json();
}

export async function generateImageImagen(formData) {
  const res = await fetch(`${BASE}/api/generate/imagen`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Imagen görsel üretimi başarısız");
  }
  return res.json();
}

export async function getLibrary() {
  const res = await fetch(`${BASE}/api/library`);
  if (!res.ok) throw new Error("Kütüphane yüklenemedi");
  return res.json();
}

export async function addToLibrary(formData) {
  const res = await fetch(`${BASE}/api/library`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Thumbnail eklenemedi");
  }
  return res.json();
}

export async function deleteFromLibrary(id) {
  const res = await fetch(`${BASE}/api/library/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Thumbnail silinemedi");
  return res.json();
}

export function getImageUrl(filename) {
  return `${BASE}/api/library/image/${filename}`;
}
