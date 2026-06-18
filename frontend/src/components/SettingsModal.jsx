import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../hooks/useApi";

const KEY_META = [
  {
    key: "ANTHROPIC_API_KEY",
    label: "Anthropic API Key",
    hint: "Claude prompt üretimi için",
    prefix: "sk-ant-",
    url: "https://console.anthropic.com/",
  },
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    hint: "GPT-Image-1 görsel üretimi için",
    prefix: "sk-",
    url: "https://platform.openai.com/api-keys",
  },
  {
    key: "GOOGLE_API_KEY",
    label: "Google API Key",
    hint: "Imagen 3 görsel üretimi için",
    prefix: "AI",
    url: "https://aistudio.google.com/app/apikey",
  },
];

function StatusDot({ isSet }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        isSet ? "bg-green-400" : "bg-gray-600"
      }`}
    />
  );
}

export default function SettingsModal({ onClose }) {
  const [status, setStatus] = useState(null);
  const [values, setValues] = useState({
    ANTHROPIC_API_KEY: "",
    OPENAI_API_KEY: "",
    GOOGLE_API_KEY: "",
  });
  const [show, setShow] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => setStatus(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await saveSettings(values);
      setSuccess(true);
      // Refresh status
      const updated = await getSettings();
      setStatus(updated);
      setValues({ ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", GOOGLE_API_KEY: "" });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const allSet = status && KEY_META.every((m) => status[m.key]?.set);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-white font-bold text-lg">API Ayarları</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Anahtarlar yerel <code className="text-gray-300 bg-gray-800 px-1 rounded">.env</code> dosyasına kaydedilir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {loading && (
            <p className="text-gray-500 text-sm text-center py-4">Yükleniyor...</p>
          )}

          {/* Status summary */}
          {status && !loading && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              allSet ? "bg-green-900/30 border border-green-800 text-green-300" : "bg-yellow-900/20 border border-yellow-800 text-yellow-300"
            }`}>
              <span>{allSet ? "✓ Tüm API anahtarları tanımlı" : "⚠ Eksik API anahtarları var"}</span>
            </div>
          )}

          {/* Key inputs */}
          {KEY_META.map(({ key, label, hint, url }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {status && <StatusDot isSet={status[key]?.set} />}
                  <label className="text-sm font-medium text-gray-200">{label}</label>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {status?.[key]?.set && (
                    <span className="text-gray-500 font-mono">{status[key].masked}</span>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Anahtar al ↗
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1.5">{hint}</p>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  className="input pr-16 font-mono text-sm"
                  placeholder={
                    status?.[key]?.set
                      ? "Değiştirmek için yeni anahtarı gir..."
                      : "API anahtarını gir..."
                  }
                  value={values[key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
                >
                  {show[key] ? "Gizle" : "Göster"}
                </button>
              </div>
            </div>
          ))}

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm p-3 bg-green-900/20 rounded-lg border border-green-800">
              ✓ API anahtarları kaydedildi ve aktif edildi.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 pb-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Kapat
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || Object.values(values).every((v) => !v)}
            className="btn-primary flex-1"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
