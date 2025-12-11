"use client";

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded border-2 ${color}`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-gray-50 rounded-lg">
      <LegendItem
        color="bg-amber-100 border-amber-300"
        label="Business Class"
      />
      <LegendItem
        color="bg-sky-100 border-sky-300"
        label="Economy Class"
      />
      <LegendItem
        color="bg-emerald-500 border-emerald-600"
        label="Selected"
      />
      <LegendItem
        color="bg-gray-200 border-gray-300"
        label="Unavailable"
      />
    </div>
  );
}
