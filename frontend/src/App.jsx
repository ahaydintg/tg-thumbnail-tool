import { useState } from "react";
import PromptTab from "./components/prompt/PromptTab";
import LibraryTab from "./components/library/LibraryTab";

const TABS = [
  { id: "prompt", label: "Prompt Builder" },
  { id: "library", label: "Thumbnail Kutuphanesi" },
];

function App() {
  const [activeTab, setActiveTab] = useState("prompt");

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
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "prompt" ? <PromptTab /> : <LibraryTab />}
      </main>
    </div>
  );
}

export default App;
