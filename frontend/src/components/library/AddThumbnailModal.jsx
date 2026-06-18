import { useState, useRef } from "react";
import { addToLibrary } from "../../hooks/useApi";

function ModeButton({ value, current, onClick }) {
  const isDay = value === "day";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
        current === value
          ? isDay
            ? "bg-amber-500/20 border-amber-500 text-amber-300"
            : "bg-indigo-500/20 border-indigo-500 text-indigo-300"
          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
      }`}
    >
      {isDay ? "☀️ Gündüz" : "🌙 Gece"}
    </button>
  );
}

export default function AddThumbnailModal({ onClose, onAdded, initialFiles = [] }) {
  const [files, setFiles] = useState(initialFiles);
  const [mode, setMode] = useState("day");
  const [progress, setProgress] = useState(null); // "2/5" string
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const images = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...images.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (files.length === 0) { setError("En az bir görsel seçmelisin."); return; }
    setError("");
    let done = 0;
    const added = [];
    setProgress(`0/${files.length}`);
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("mode", mode);
        const result = await addToLibrary(fd);
        added.push(result);
      } catch {
        // devam et
      }
      done++;
      setProgress(`${done}/${files.length}`);
    }
    added.forEach(onAdded);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Thumbnail Ekle</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex-shrink-0 border-2 border-dashed rounded-xl cursor-pointer transition-colors p-6 text-center mb-4 ${
            dragging
              ? "border-brand-400 bg-brand-600/10"
              : "border-gray-600 hover:border-brand-500"
          }`}
        >
          <div className="text-3xl mb-1">{dragging ? "📂" : "🖼️"}</div>
          <p className="text-gray-300 text-sm font-medium">
            {dragging ? "Bırak!" : "Görselleri buraya sürükle veya tıkla"}
          </p>
          <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP — birden fazla seçebilirsin</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Preview grid */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4 min-h-0">
            <div className="text-xs text-gray-400 mb-2 font-medium">
              {files.length} görsel seçildi
            </div>
            <div className="grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-700 aspect-video bg-gray-800">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode selector */}
        <div className="flex-shrink-0">
          <label className="label">
            Tüm görseller için mod
            {files.length > 1 && (
              <span className="text-gray-500 font-normal ml-1">({files.length} görsel)</span>
            )}
          </label>
          <div className="flex gap-2 mb-4">
            <ModeButton value="day" current={mode} onClick={() => setMode("day")} />
            <ModeButton value="night" current={mode} onClick={() => setMode("night")} />
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg mb-4">{error}</div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={progress !== null}
              className="btn-primary flex-1"
            >
              {progress
                ? `Yükleniyor ${progress}...`
                : files.length > 1
                ? `${files.length} Görseli Ekle`
                : "Kütüphaneye Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
