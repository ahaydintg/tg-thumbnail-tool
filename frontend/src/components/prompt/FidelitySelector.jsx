const OPTIONS = [
  {
    value: "low",
    label: "Az Sadık",
    desc: "Rough draft'tan ilham alır, serbest yorumlama",
  },
  {
    value: "medium",
    label: "Oldukça Sadık",
    desc: "Kompozisyon ve temel öğeleri takip eder",
  },
  {
    value: "exact",
    label: "Birebir Aynı",
    desc: "Rough draft'ı plan olarak kullan, aynen üret",
  },
];

export default function FidelitySelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 p-3 rounded-lg border text-left transition-all ${
            value === opt.value
              ? "bg-brand-600/20 border-brand-500 text-white"
              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          <div className="font-medium text-sm">{opt.label}</div>
          <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}
