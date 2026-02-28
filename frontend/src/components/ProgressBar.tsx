"use client";

interface ProgressBarProps {
  funded: number;
  total: number;
}

export default function ProgressBar({ funded, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((funded / total) * 100, 100) : 0;

  let barColor = "bg-indigo-500";
  if (pct >= 100) barColor = "bg-green-500";
  else if (pct > 50) barColor = "bg-yellow-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
