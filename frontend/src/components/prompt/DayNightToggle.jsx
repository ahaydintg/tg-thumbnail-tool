export default function DayNightToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("day")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm border transition-all ${
          value === "day"
            ? "bg-amber-500/20 border-amber-500 text-amber-300"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
        }`}
      >
        <span className="text-lg">☀️</span> Gündüz
      </button>
      <button
        type="button"
        onClick={() => onChange("night")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm border transition-all ${
          value === "night"
            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
        }`}
      >
        <span className="text-lg">🌙</span> Gece
      </button>
    </div>
  );
}
