import { useState } from "react";
import PromptTab from "./components/prompt/PromptTab";
import LibraryTab from "./components/library/LibraryTab";

const TABS = [
  { id: "prompt", label: "Prompt Builder" },
  { id: "library", label: "Thumbnail Kutuphanesi" },
];

const THEMES = [
  { id: "blue",   label: "Mavi",  swatch: "#3b5bdb" },
  { id: "purple", label: "Mor",   swatch: "#9333ea" },
  { id: "yellow", label: "Sarı",  swatch: "#d97706" },
  { id: "black",  label: "Siyah", swatch: "#475569" },
];

function App() {
  const [activeTab, setActiveTab] = useState("prompt");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tg-theme") || "blue"
  );

  const changeTheme = (id) => {
    setTheme(id);
    localStorage.setItem("tg-theme", id);
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            TG
          </div>
          <h1 className="text-white font-bold text-lg tracking-tight">
            Thumbnail Tool
          </h1>
        </div>

        <nav className="flex gap-1 bg-gray-800 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Theme picker */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:block">Tema:</span>
          <div className="flex gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                title={t.label}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  theme === t.id
                    ? "border-white scale-110"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
                style={{ background: t.swatch }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "prompt" ? <PromptTab /> : <LibraryTab />}
      </main>
    </div>
  );
}

export default App;
