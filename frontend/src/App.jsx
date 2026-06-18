import { useState, useEffect } from "react";
import PromptTab from "./components/prompt/PromptTab";
import LibraryTab from "./components/library/LibraryTab";
import SettingsModal from "./components/SettingsModal";
import { getSettings } from "./hooks/useApi";

const TABS = [
  { id: "prompt", label: "Prompt Builder" },
  { id: "library", label: "Thumbnail Kutuphanesi" },
];

function App() {
  const [activeTab, setActiveTab] = useState("prompt");
  const [showSettings, setShowSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const refreshStatus = () => {
    getSettings()
      .then(setApiStatus)
      .catch(() => setApiStatus(null));
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const missingKeys = apiStatus
    ? Object.values(apiStatus).filter((v) => !v.set).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            TG
          </div>
          <h1 className="text-white font-bold text-lg tracking-tight">
            Thumbnail Tool
          </h1>
        </div>

        <div className="flex items-center gap-3">
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

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              missingKeys > 0
                ? "bg-yellow-900/30 border-yellow-700 text-yellow-300 hover:bg-yellow-900/50"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
            title="API Ayarları"
          >
            <span>⚙</span>
            <span>API Ayarları</span>
            {missingKeys > 0 && (
              <span className="w-4 h-4 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
                {missingKeys}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "prompt" ? <PromptTab /> : <LibraryTab />}
      </main>

      {showSettings && (
        <SettingsModal
          onClose={() => {
            setShowSettings(false);
            refreshStatus();
          }}
        />
      )}
    </div>
  );
}

export default App;
