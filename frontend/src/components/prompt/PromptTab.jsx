import { useState } from "react";
import DayNightToggle from "./DayNightToggle";
import SubjectSection from "./SubjectSection";
import AttachmentSection from "./AttachmentSection";
import PromptResult from "./PromptResult";
import ImageGenerator from "./ImageGenerator";
import { generatePrompt } from "../../hooks/useApi";

const STEPS = ["form", "prompt", "generate"];

export default function PromptTab() {
  const [step, setStep] = useState("form");
  const [mode, setMode] = useState("day");
  const [description, setDescription] = useState("");
  const [subjects, setSubjects] = useState([{ file: null, description: "" }]);
  const [roughDraft, setRoughDraft] = useState(null);
  const [roughDraftDesc, setRoughDraftDesc] = useState("");
  const [fidelity, setFidelity] = useState("medium");
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("description", description);
    fd.append("mode", mode);
    fd.append("fidelity", fidelity);
    fd.append("subject_description", subjects[0]?.description || "");
    fd.append("subject2_description", subjects[1]?.description || "");
    fd.append("rough_draft_description", roughDraftDesc);
    fd.append(
      "reference_descriptions",
      JSON.stringify(references.map((r) => r.description))
    );

    if (subjects[0]?.file) fd.append("subject_image", subjects[0].file);
    if (subjects[1]?.file) fd.append("subject2_image", subjects[1].file);
    if (roughDraft) fd.append("rough_draft_image", roughDraft);
    references.forEach((ref) => {
      if (ref.file) fd.append("reference_images", ref.file);
    });

    return fd;
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Görsel açıklaması boş olamaz.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await generatePrompt(buildFormData());
      setPrompt(res.prompt);
      setStep("prompt");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("form");
    setPrompt("");
    setError("");
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar - form */}
      <div className="w-[420px] flex-shrink-0 border-r border-gray-800 overflow-y-auto p-5 space-y-6">
        {/* Step indicator */}
        <div className="flex gap-1 text-xs">
          {["Girdi", "Prompt", "Üret"].map((label, i) => {
            const stepId = STEPS[i];
            const isActive = step === stepId;
            const isDone =
              (stepId === "form" && (step === "prompt" || step === "generate")) ||
              (stepId === "prompt" && step === "generate");
            return (
              <div key={stepId} className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : isDone
                      ? "bg-green-800/40 text-green-400"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {i + 1}. {label}
                </span>
                {i < 2 && <span className="text-gray-600">›</span>}
              </div>
            );
          })}
        </div>

        {/* Mode */}
        <div>
          <label className="section-title">Zaman Modu</label>
          <DayNightToggle value={mode} onChange={setMode} />
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="desc">
            Görsel Açıklaması
            <span className="text-gray-500 font-normal ml-1 text-xs">
              (ekler için @subject, @ref1 kullanabilirsin)
            </span>
          </label>
          <textarea
            id="desc"
            className="textarea"
            rows={5}
            placeholder="Örn: Stüdyoda kameraya bakan ciddi bir adam. @subject suratı net görünsün. Arka plan karanlık ve dramatik..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Subject */}
        <SubjectSection subjects={subjects} onChange={setSubjects} />

        {/* Attachments */}
        <AttachmentSection
          roughDraft={roughDraft}
          onRoughDraftChange={setRoughDraft}
          roughDraftDesc={roughDraftDesc}
          onRoughDraftDescChange={setRoughDraftDesc}
          fidelity={fidelity}
          onFidelityChange={setFidelity}
          references={references}
          onReferencesChange={setReferences}
        />

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Claude prompt yazıyor...
            </span>
          ) : (
            "Prompt Üret"
          )}
        </button>
      </div>

      {/* Right main area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {step === "form" && (
          <div className="flex items-center justify-center h-full text-gray-600 flex-col gap-3">
            <div className="text-5xl">✍️</div>
            <p className="text-lg font-medium">Sol taraftaki formu doldurun</p>
            <p className="text-sm">Prompt ürettikten sonra burada görüntülenecek</p>
          </div>
        )}

        {(step === "prompt" || step === "generate") && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Üretilen Prompt</h2>
              <div className="flex gap-2">
                <button type="button" onClick={reset} className="btn-secondary text-sm">
                  ← Başa Dön
                </button>
                {step === "prompt" && (
                  <button
                    type="button"
                    onClick={() => setStep("generate")}
                    className="btn-primary text-sm"
                  >
                    Görsel Üret →
                  </button>
                )}
              </div>
            </div>

            <PromptResult prompt={prompt} onChange={setPrompt} />

            {step === "generate" && (
              <ImageGenerator prompt={prompt} />
            )}

            {step === "prompt" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep("generate")}
                  className="btn-primary px-8 py-3 text-base"
                >
                  Görsel Üretimine Geç →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
