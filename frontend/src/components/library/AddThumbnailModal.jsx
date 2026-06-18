import { useState, useRef } from "react";
import { addToLibrary } from "../../hooks/useApi";

function ModeToggle({ value, onChange, small }) {
  return (
    <div className={`flex gap-1 ${small ? "" : "w-full"}`}>
      <button
        type="button"
        onClick={() => onChange("day")}
        className={`flex-1 rounded-md font-medium border transition-all ${
          small ? "px-2 py-1 text-xs" : "py-1.5 text-sm"
        } ${
          value === "day"
            ? "bg-amber-500/20 border-amber-500 text-amber-300"
            : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600"
        }`}
      >
        ☀️ {small ? "" : "Gündüz"}
      </button>
      <button
        type="button"
        onClick={() => onChange("night")}
        className={`flex-1 rounded-md font-medium border transition-all ${
          small ? "px-2 py-1 text-xs" : "py-1.5 text-sm"
        } ${
          value === "night"
            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
            : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600"
        }`}
      >
        🌙 {small ? "" : "Gece"}
      </button>
    </div>
  );
}

function toItems(files) {
  return Array.from(files).map((file) => ({
    file,
    mode: "day",
    preview: URL.createObjectURL(file),
  }));
}

export default function AddThumbnailModal({ onClose, onAdded, initialFiles = [] }) {
  const [items, setItems] = useState(() =>
    initialFiles.length ? toItems(initialFiles) : []
  );
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const newItems = toItems(files);
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const setItemMode = (index, mode) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, mode } : it)));
  };

  const setAllMode = (mode) => {
    setItems((prev) => prev.map((it) => ({ ...it, mode })));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("En az bir görsel ekle.");
      return;
    }
    setError("");
    let done = 0;
    setProgress({ done: 0, total: items.length });

    for (const item of items) {
      try {
        const fd = new FormData();
        fd.append("image", item.file);
        fd.append("mode", item.mode);
        const result = await addToLibrary(fd);
        onAdded(result);
      } catch (e) {
        setError(`"${item.file.name}" eklenirken hata: ${e.message}`);
      }
      done++;
      setProgress({ done, total: items.length });
    }

    setProgress(null);
    onClose();
  };

  const isUploading = progress !== null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Thumbnail Ekle</h2>
            {items.length > 0 && (
              <p className="text-gray-400 text-xs mt-0.5">{items.length} görsel seçildi</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {/* Bulk mode + add more */}
        {items.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-800 flex-shrink-0">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Tümünü:</span>
            <ModeToggle value={null} onChange={setAllMode} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
            >
              + Görsel Ekle
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 hover:border-brand-500 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                <span className="text-5xl">🖼️</span>
                <span className="font-medium">Görsel seç veya buraya sürükle</span>
                <span className="text-xs text-gray-600">PNG, JPG, WEBP — çoklu seçim desteklenir</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <div className="relative">
                    <img
                      src={item.preview}
                      alt=""
                      className="w-full object-cover aspect-video"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-700 rounded-full text-white text-xs flex items-center justify-center leading-none"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-400 truncate mb-1.5">{item.file.name}</p>
                    <ModeToggle value={item.mode} onChange={(m) => setItemMode(i, m)} small />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex-shrink-0 space-y-3">
          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">{error}</div>
          )}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Yükleniyor...</span>
                <span>{progress.done} / {progress.total}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={isUploading}>
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || items.length === 0}
              className="btn-primary flex-1"
            >
              {isUploading
                ? `Ekleniyor... (${progress.done}/${progress.total})`
                : `${items.length > 1 ? `${items.length} Görseli` : "Görseli"} Ekle`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
