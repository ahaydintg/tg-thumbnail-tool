import { useState, useRef } from "react";
import ImageUploadBox from "./ImageUploadBox";

export default function SubjectSection({ subjects, onChange }) {
  const hasSecond = subjects.length > 1;

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addSecond = () => {
    onChange([...subjects, { file: null, description: "" }]);
  };

  const removeSecond = () => {
    onChange([subjects[0]]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">Subject Yüzü</span>
        <span className="text-xs bg-red-900/40 text-red-300 border border-red-700 px-2 py-0.5 rounded-full">
          Zorunlu
        </span>
      </div>

      <ImageUploadBox
        label="1. Subject — Yüz Görseli"
        description="Bu görsel her promptta kullanılır. Yüz detayları birebir korunur."
        descPlaceholder="Örn: Siyah saçlı, kahverengi gözlü, 25 yaşında Türk erkek, sert ifade..."
        file={subjects[0]?.file}
        onFileChange={(f) => updateSubject(0, "file", f)}
        descValue={subjects[0]?.description || ""}
        onDescChange={(v) => updateSubject(0, "description", v)}
        accent={true}
      />

      {hasSecond && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">2. Subject (isteğe bağlı)</span>
            <button
              type="button"
              onClick={removeSecond}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Kaldır
            </button>
          </div>
          <ImageUploadBox
            label="2. Subject — Yüz Görseli"
            description="İkinci subject varsa buraya ekle."
            descPlaceholder="Örn: Sarışın, mavi gözlü kadın, mutlu ifade..."
            file={subjects[1]?.file}
            onFileChange={(f) => updateSubject(1, "file", f)}
            descValue={subjects[1]?.description || ""}
            onDescChange={(v) => updateSubject(1, "description", v)}
          />
        </div>
      )}

      {!hasSecond && (
        <button
          type="button"
          onClick={addSecond}
          className="mt-3 w-full py-2 border border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          + 2. Subject ekle
        </button>
      )}
    </div>
  );
}
