import { FlameIcon } from "@/components/icons";

export function StreakBadge({ streak }: { streak: number }) {
  return (
    <span
      title="Текущий стрик"
      className="animate-pop inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400"
    >
      <FlameIcon className="h-3.5 w-3.5" /> {streak}
    </span>
  );
}
