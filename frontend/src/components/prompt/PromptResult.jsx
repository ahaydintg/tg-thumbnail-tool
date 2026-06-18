import { useState } from "react";

const SECTIONS = [
  "SUBJECT", "SCENE", "COMPOSITION", "CAMERA", "SETTINGS",
  "LIGHTING", "COLOR", "STYLE", "NIGHT_NOTES", "FINAL_PROMPT", "NEGATIVE_PROMPT",
];

function parsePrompt(text) {
  const sections = {};
  let remaining = text;

  for (let i = 0; i < SECTIONS.length; i++) {
    const tag = `[${SECTIONS[i]}]`;
    const nextTag = SECTIONS[i + 1] ? `[${SECTIONS[i + 1]}]` : null;
    const start = remaining.indexOf(tag);
    if (start === -1) continue;
    const contentStart = start + tag.length;
    const end = nextTag ? remaining.indexOf(nextTag, contentStart) : remaining.length;
    sections[SECTIONS[i]] = remaining.slice(contentStart, end === -1 ? undefined : end).trim();
  }

  return sections;
}

function SectionBlock({ title, content, accent }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!content) return null;
  return (
    <div className={`rounded-lg border mb-2 overflow-hidden ${accent ? "border-brand-600 bg-brand-600/10" : "border-gray-700 bg-gray-800/40"}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className={`text-xs font-bold tracking-widest ${accent ? "text-brand-400" : "text-gray-400"}`}>
          [{title}]
        </span>
        <span className="text-gray-500 text-xs">{collapsed ? "▼" : "▲"}</span>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}

export default function PromptResult({ prompt, onChange }) {
  const [mode, setMode] = useState("structured");
  const sections = parsePrompt(prompt);
  const hasSections = Object.keys(sections).length > 0;

  const copyFinalPrompt = () => {
    const fp = sections["FINAL_PROMPT"] || prompt;
    navigator.clipboard.writeText(fp);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">Üretilen Prompt</span>
        <div className="flex gap-2 items-center">
          {hasSections && (
            <div className="flex gap-1 bg-gray-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode("structured")}
                className={`px-2 py-1 rounded ${mode === "structured" ? "bg-gray-700 text-white" : "text-gray-400"}`}
              >
                Yapısal
              </button>
              <button
                type="button"
                onClick={() => setMode("raw")}
                className={`px-2 py-1 rounded ${mode === "raw" ? "bg-gray-700 text-white" : "text-gray-400"}`}
              >
                Ham
              </button>
            </div>
          )}
          <button type="button" onClick={copyFinalPrompt} className="btn-secondary text-xs py-1 px-2">
            Final Promptu Kopyala
          </button>
          <button type="button" onClick={copyAll} className="btn-secondary text-xs py-1 px-2">
            Tümünü Kopyala
          </button>
        </div>
      </div>

      {mode === "structured" && hasSections ? (
        <div>
          {SECTIONS.map((s) => (
            <SectionBlock
              key={s}
              title={s}
              content={sections[s]}
              accent={s === "FINAL_PROMPT"}
            />
          ))}
        </div>
      ) : (
        <textarea
          className="textarea text-sm font-mono leading-relaxed"
          rows={20}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
