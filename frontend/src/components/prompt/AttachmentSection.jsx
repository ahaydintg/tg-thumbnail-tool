import { useRef } from "react";
import ImageUploadBox from "./ImageUploadBox";
import FidelitySelector from "./FidelitySelector";

export default function AttachmentSection({
  roughDraft,
  onRoughDraftChange,
  roughDraftDesc,
  onRoughDraftDescChange,
  fidelity,
  onFidelityChange,
  references,
  onReferencesChange,
}) {
  const addReference = () => {
    onReferencesChange([...references, { file: null, description: "" }]);
  };

  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onReferencesChange(updated);
  };

  const removeReference = (index) => {
    onReferencesChange(references.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Rough Draft */}
      <div>
        <span className="section-title">Rough Draft</span>
        <ImageUploadBox
          label="Rough Draft Görseli"
          description="Kabataslak çizim veya referans kompozisyon. Boş bırakabilirsin."
          descPlaceholder="Bu rough draft'ın amacını açıkla..."
          file={roughDraft}
          onFileChange={onRoughDraftChange}
          descValue={roughDraftDesc}
          onDescChange={onRoughDraftDescChange}
        />
        {roughDraft && (
          <div className="mt-3">
            <label className="label">Rough Draft'a Sadakat</label>
            <FidelitySelector value={fidelity} onChange={onFidelityChange} />
          </div>
        )}
      </div>

      {/* Referans Görseller */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="section-title">Referans Görseller</span>
          <button
            type="button"
            onClick={addReference}
            className="text-xs text-brand-500 hover:text-brand-400 font-medium"
          >
            + Referans ekle
          </button>
        </div>

        {references.length === 0 && (
          <div className="text-center py-6 border border-dashed border-gray-700 rounded-lg text-gray-500 text-sm">
            Referans görsel yok.{" "}
            <button
              type="button"
              onClick={addReference}
              className="text-brand-500 hover:underline"
            >
              Ekle
            </button>
          </div>
        )}

        <div className="space-y-3">
          {references.map((ref, i) => (
            <div key={i} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 font-medium">
                  Referans {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeReference(i)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Kaldır
                </button>
              </div>
              <ImageUploadBox
                label={`Referans Görsel ${i + 1}`}
                descPlaceholder={`Bu referansın ne için kullanılacağını açıkla... (ör: kompozisyon için, renk paleti için)`}
                file={ref.file}
                onFileChange={(f) => updateReference(i, "file", f)}
                descValue={ref.description}
                onDescChange={(v) => updateReference(i, "description", v)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
