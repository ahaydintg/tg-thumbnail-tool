import { useState, useRef } from "react";
import { addToLibrary } from "../../hooks/useApi";

export default function AddThumbnailModal({ onClose, onAdded }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const preview = file ? URL.createObjectURL(file) : null;

  const handleSubmit = async () => {
    if (!file) {
      setError("Görsel seçmelisin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("mode", mode);
      const result = await addToLibrary(fd);
      onAdded(result);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Thumbnail Ekle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* File upload */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 hover:border-brand-500 rounded-xl overflow-hidden cursor-pointer transition-colors mb-4"
          style={{ minHeight: "160px" }}
        >
          {preview ? (
            <img src={preview} alt="" className="w-full object-cover max-h-56" />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
              <span className="text-4xl">🖼️</span>
              <span className="text-sm">Thumbnail görselini seç</span>
              <span className="text-xs text-gray-600">PNG, JPG, WEBP</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        {/* Mode selector */}
        <div className="mb-4">
          <label className="label">Thumbnail Modu</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("day")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === "day"
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              ☀️ Gündüz
            </button>
            <button
              type="button"
              onClick={() => setMode("night")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === "night"
                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              🌙 Gece
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "Ekleniyor..." : "Kütüphaneye Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
