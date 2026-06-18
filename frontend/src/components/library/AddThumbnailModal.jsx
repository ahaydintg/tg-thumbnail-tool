import { useState, useRef, useEffect, useCallback } from "react";
import { addToLibrary } from "../../hooks/useApi";

let _id = 0;
const uid = () => ++_id;

export default function AddThumbnailModal({ onClose, onAdded }) {
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const newItems = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: uid(),
        file,
        mode: "day",
        preview: URL.createObjectURL(file),
      }));
    if (newItems.length > 0) setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Ctrl+V / sağ tık kopyala-yapıştır
  useEffect(() => {
    const onPaste = (e) => {
      const imageFiles = Array.from(e.clipboardData?.items || [])
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter(Boolean);
      if (imageFiles.length > 0) addFiles(imageFiles);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const setItemMode = (id, mode) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mode } : item))
    );

  const removeItem = (id) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const setAllMode = (mode) =>
    setItems((prev) => prev.map((item) => ({ ...item, mode })));

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("En az bir görsel ekle.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      for (const item of items) {
        const fd = new FormData();
        fd.append("image", item.file);
        fd.append("mode", item.mode);
        const result = await addToLibrary(fd);
        onAdded(result);
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">Thumbnail Ekle</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Sürükle-bırak + tıkla + yapıştır alanı */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDragEnd={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 cursor-pointer text-center select-none transition-all ${
              dragging
                ? "border-brand-500 bg-brand-600/10"
                : "border-gray-600 hover:border-brand-500 hover:bg-gray-800/40"
            }`}
          >
            <div className="text-4xl mb-2">{dragging ? "📂" : "🖼️"}</div>
            <p className="text-gray-200 font-semibold">
              {dragging ? "Bırak!" : "Görselleri buraya sürükle"}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              veya tıkla · <kbd className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+V</kbd> ile yapıştır
            </p>
            <p className="text-gray-600 text-xs mt-1">PNG · JPG · WEBP · Çoklu seçim desteklenir</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />

          {/* Toplu mod butonu */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">
                {items.length} görsel —
              </span>
              <button
                type="button"
                onClick={() => setAllMode("day")}
                className="text-xs px-3 py-1 rounded-lg border border-amber-600 text-amber-300 hover:bg-amber-900/30 transition-colors"
              >
                ☀️ Tümünü Gündüz yap
              </button>
              <button
                type="button"
                onClick={() => setAllMode("night")}
                className="text-xs px-3 py-1 rounded-lg border border-indigo-600 text-indigo-300 hover:bg-indigo-900/30 transition-colors"
              >
                🌙 Tümünü Gece yap
              </button>
            </div>
          )}

          {/* Önizleme grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                >
                  {/* Önizleme */}
                  <div className="relative">
                    <img
                      src={item.preview}
                      alt=""
                      className="w-full object-cover aspect-video"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Gündüz / Gece toggle */}
                  <div className="p-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setItemMode(item.id, "day")}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        item.mode === "day"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      ☀️ Gündüz
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemMode(item.id, "night")}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        item.mode === "night"
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      🌙 Gece
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt bar */}
        <div className="p-5 border-t border-gray-800">
          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg mb-3 border border-red-800">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className="btn-primary flex-1"
            >
              {loading
                ? "Ekleniyor..."
                : items.length > 0
                ? `${items.length} Görseli Kütüphaneye Ekle`
                : "Kütüphaneye Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
