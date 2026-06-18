import { useRef } from "react";

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
  const preview = file ? URL.createObjectURL(file) : null;

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
        className="cursor-pointer border-2 border-dashed border-gray-600 hover:border-brand-500 rounded-lg overflow-hidden transition-colors"
        style={{ minHeight: "100px" }}
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            className="w-full object-cover max-h-48"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-sm gap-1">
            <span className="text-2xl">📎</span>
            <span>Görsel seç veya sürükle</span>
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

      {file && (
        <div className="flex items-center justify-between mt-2 mb-1">
          <span className="text-xs text-gray-400 truncate max-w-[200px]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-xs text-red-400 hover:text-red-300 ml-2"
          >
            Kaldır
          </button>
        </div>
      )}

      <textarea
        className="textarea mt-2 text-sm"
        rows={2}
        placeholder={descPlaceholder}
        value={descValue}
        onChange={(e) => onDescChange(e.target.value)}
      />
    </div>
  );
}
