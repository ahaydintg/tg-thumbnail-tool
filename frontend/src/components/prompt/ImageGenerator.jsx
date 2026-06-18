import { useState, useRef } from "react";
import { generateImageOpenAI, generateImageImagen } from "../../hooks/useApi";

function GeneratedImage({ data, provider, onDownload }) {
  if (!data) return null;
  const src = `data:image/png;base64,${data}`;
  const label = provider === "openai" ? "OpenAI (GPT-Image-1)" : "Google Imagen 3";
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <a
          href={src}
          download={`thumbnail-${provider}-${Date.now()}.png`}
          className="btn-secondary text-xs py-1 px-2"
        >
          İndir
        </a>
      </div>
      <img src={src} alt="Generated thumbnail" className="w-full rounded-lg" />
    </div>
  );
}

export default function ImageGenerator({ prompt }) {
  const [openaiImg, setOpenaiImg] = useState(null);
  const [imagenImg, setImagenImg] = useState(null);
  const [loadingOpenai, setLoadingOpenai] = useState(false);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [errorOpenai, setErrorOpenai] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [extraFiles, setExtraFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleExtraFiles = (e) => {
    setExtraFiles(Array.from(e.target.files));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("prompt", prompt);
    extraFiles.forEach((f) => fd.append("extra_images", f));
    return fd;
  };

  const runOpenAI = async () => {
    setLoadingOpenai(true);
    setErrorOpenai("");
    try {
      const res = await generateImageOpenAI(buildFormData());
      setOpenaiImg(res.image);
    } catch (e) {
      setErrorOpenai(e.message);
    } finally {
      setLoadingOpenai(false);
    }
  };

  const runImagen = async () => {
    setLoadingImagen(true);
    setErrorImagen("");
    try {
      const fd = new FormData();
      fd.append("prompt", prompt);
      fd.append("model", "imagen-3.0-generate-001");
      const res = await generateImageImagen(fd);
      setImagenImg(res.image);
    } catch (e) {
      setErrorImagen(e.message);
    } finally {
      setLoadingImagen(false);
    }
  };

  const runBoth = () => {
    runOpenAI();
    runImagen();
  };

  return (
    <div>
      <span className="section-title">Görsel Üret</span>

      {/* Extra images for generation */}
      <div className="card mb-4">
        <label className="label">Görsel Üretimine Ek Dosyalar (isteğe bağlı)</label>
        <p className="text-xs text-gray-500 mb-2">
          Subject yüzü, renk referansı gibi görselleri ekleyebilirsin. Bunlar doğrudan görsel üretim API'sine gönderilir.
        </p>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-gray-600 hover:border-brand-500 rounded-lg p-4 cursor-pointer text-center text-sm text-gray-400 transition-colors"
        >
          {extraFiles.length > 0
            ? `${extraFiles.length} dosya seçildi: ${extraFiles.map((f) => f.name).join(", ")}`
            : "Eklemek istediğin görselleri seç..."}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleExtraFiles}
        />
        {extraFiles.length > 0 && (
          <button
            type="button"
            onClick={() => setExtraFiles([])}
            className="text-xs text-red-400 hover:text-red-300 mt-1"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={runOpenAI}
          disabled={loadingOpenai}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loadingOpenai ? (
            <>
              <Spinner /> OpenAI üretiyor...
            </>
          ) : (
            "OpenAI ile Üret"
          )}
        </button>
        <button
          type="button"
          onClick={runImagen}
          disabled={loadingImagen}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
          style={{ background: loadingImagen ? undefined : "#1a73e8" }}
        >
          {loadingImagen ? (
            <>
              <Spinner /> Imagen üretiyor...
            </>
          ) : (
            "Imagen ile Üret"
          )}
        </button>
        <button
          type="button"
          onClick={runBoth}
          disabled={loadingOpenai || loadingImagen}
          className="btn-secondary flex-1"
        >
          İkisini de Üret
        </button>
      </div>

      {/* Errors */}
      {errorOpenai && <div className="text-red-400 text-sm mb-2 p-3 bg-red-900/20 rounded-lg">{errorOpenai}</div>}
      {errorImagen && <div className="text-red-400 text-sm mb-2 p-3 bg-red-900/20 rounded-lg">{errorImagen}</div>}

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {openaiImg && <GeneratedImage data={openaiImg} provider="openai" />}
        {imagenImg && <GeneratedImage data={imagenImg} provider="imagen" />}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
