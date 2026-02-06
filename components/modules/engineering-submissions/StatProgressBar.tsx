import { Progress } from '@/components/ui/progress';

interface StatProgressBarProps {
  label: string;
  value: number;
  colorClass: string;
}

export function StatProgressBar({ label, value, colorClass }: StatProgressBarProps) {
  return (
    <div className="flex-1 space-y-1">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground/70">
        <span className="whitespace-nowrap">{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className={`h-1.5 ${colorClass}`} />
    </div>
  );
}
