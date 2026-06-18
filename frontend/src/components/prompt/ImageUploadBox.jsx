import { useRef, useState } from "react";

async function readClipboardImage() {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((t) => t.startsWith("image/"));
      if (imageType) {
        const blob = await item.getType(imageType);
        return new File([blob], `pasted-${Date.now()}.png`, { type: imageType });
      }
    }
  } catch {
    // Clipboard API erişim reddedildi veya görsel yok
  }
  return null;
}

export default function ImageUploadBox({
  label,
  description,
  descPlaceholder = "Bu görsel hakkında açıklama...",
  file,
  onFileChange,
  descValue,
  onDescChange,
  accent = false,
  multiple = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) onFileChange(dropped);
  };

  const handlePaste = async () => {
    const f = await readClipboardImage();
    if (f) onFileChange(f);
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-brand-500 bg-brand-600/10"
          : "border-gray-700 bg-gray-800/50"
      }`}
    >
      <div className="label mb-2">{label}</div>
      {description && (
        <p className="text-xs text-gray-400 mb-3">{description}</p>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer border-2 border-dashed rounded-lg overflow-hidden transition-colors ${
          dragging
            ? "border-brand-400 bg-brand-600/10"
            : "border-gray-600 hover:border-brand-500"
        }`}
        style={{ minHeight: "100px" }}
      >
        {preview ? (
          <img src={preview} alt="" className="w-full object-cover max-h-48" />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-sm gap-1">
            <span className="text-2xl">📎</span>
            <span>{dragging ? "Bırak!" : "Görsel seç veya sürükle"}</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0] || null)}
      />

      <div className="flex items-center justify-between mt-2 mb-1">
        <button
          type="button"
          onClick={handlePaste}
          className="text-xs text-brand-400 hover:text-brand-300 font-medium"
        >
          📋 Panodan Yapıştır
        </button>
        {file && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 truncate max-w-[160px]">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Kaldır
            </button>
          </div>
        )}
      </div>

      <textarea
        className="textarea mt-1 text-sm"
        rows={2}
        placeholder={descPlaceholder}
        value={descValue}
        onChange={(e) => onDescChange(e.target.value)}
      />
    </div>
  );
}
