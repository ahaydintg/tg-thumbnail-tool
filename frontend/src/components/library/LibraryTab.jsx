import { useState, useEffect, useRef } from "react";
import ThumbnailCard from "./ThumbnailCard";
import AddThumbnailModal from "./AddThumbnailModal";
import { getLibrary, deleteFromLibrary } from "../../hooks/useApi";

export default function LibraryTab() {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState("all");
  const dragCounter = useRef(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLibrary();
      setThumbnails(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteFromLibrary(id);
    setThumbnails((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdded = (thumbnail) => {
    setThumbnails((prev) => [thumbnail, ...prev]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setDroppedFiles(files);
    setShowModal(true);
  };

  const openModal = () => {
    setDroppedFiles([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDroppedFiles([]);
  };

  const filtered =
    filter === "all"
      ? thumbnails
      : thumbnails.filter((t) => t.mode === filter);

  const dayCount = thumbnails.filter((t) => t.mode === "day").length;
  const nightCount = thumbnails.filter((t) => t.mode === "night").length;

  return (
    <div
      className="p-6 h-full overflow-y-auto relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragging && (
        <div className="absolute inset-0 z-40 bg-brand-600/20 border-4 border-dashed border-brand-500 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <p className="text-white font-bold text-xl">Görselleri bırak</p>
            <p className="text-brand-300 text-sm mt-1">Tüm görseller kütüphaneye eklenecek</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Thumbnail Kütüphanesi</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Prompt üretiminde visual style referansı olarak kullanılır.
            <span className="ml-3 text-amber-400">☀️ {dayCount} gündüz</span>
            <span className="ml-2 text-indigo-400">🌙 {nightCount} gece</span>
            <span className="ml-3 text-gray-600 text-xs">— görselleri sürükleyip bırakarak da ekleyebilirsin</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="btn-primary"
        >
          + Thumbnail Ekle
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: "all", label: "Tümü" },
          { id: "day", label: "☀️ Gündüz" },
          { id: "night", label: "🌙 Gece" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f.id
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            {f.label} {f.id !== "all" && `(${f.id === "day" ? dayCount : nightCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          Yükleniyor...
        </div>
      )}

      {error && (
        <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
          <span className="text-5xl">🖼️</span>
          <p className="font-medium">Kütüphanede thumbnail yok</p>
          <p className="text-sm text-gray-600">
            Görselleri sürükleyip bırak ya da butona tıkla
          </p>
          <button
            type="button"
            onClick={openModal}
            className="btn-primary mt-2"
          >
            İlk Thumbnail'ı Ekle
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((t) => (
          <ThumbnailCard key={t.id} thumbnail={t} onDelete={handleDelete} />
        ))}
      </div>

      {showModal && (
        <AddThumbnailModal
          onClose={closeModal}
          onAdded={handleAdded}
          initialFiles={droppedFiles}
        />
      )}
    </div>
  );
}
