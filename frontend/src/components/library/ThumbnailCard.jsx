import { useState } from "react";
import { getImageUrl } from "../../hooks/useApi";

export default function ThumbnailCard({ thumbnail, onDelete }) {
  const [hover, setHover] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu thumbnail'ı kütüphaneden kaldır?")) return;
    setDeleting(true);
    await onDelete(thumbnail.id);
    setDeleting(false);
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-800 group cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={getImageUrl(thumbnail.filename)}
        alt=""
        className="w-full object-cover aspect-video"
        loading="lazy"
      />

      {/* Mode badge */}
      <div className="absolute top-2 left-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            thumbnail.mode === "night"
              ? "bg-indigo-900/80 border-indigo-600 text-indigo-200"
              : "bg-amber-900/80 border-amber-600 text-amber-200"
          }`}
        >
          {thumbnail.mode === "night" ? "🌙 Gece" : "☀️ Gündüz"}
        </span>
      </div>

      {/* Delete button on hover */}
      <div
        className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
          hover ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? "Siliniyor..." : "Kaldır"}
        </button>
      </div>
    </div>
  );
}
