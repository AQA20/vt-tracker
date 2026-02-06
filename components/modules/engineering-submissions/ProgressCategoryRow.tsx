import { STATUS_STATES, CategoryStats } from './constants';
import { StatProgressBar } from './StatProgressBar';

interface ProgressCategoryRowProps {
  label: string;
  stats: CategoryStats;
}

export function ProgressCategoryRow({ label, stats }: ProgressCategoryRowProps) {
  return (
    <div className="space-y-3 pb-4 last:pb-0 border-b last:border-0 border-zinc-100 dark:border-zinc-800/50">
      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{label}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:gap-4">
        <StatProgressBar 
          label={STATUS_STATES.submitted} 
          value={stats.submitted || 0} 
          colorClass="bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-500" 
        />
        <StatProgressBar 
          label={STATUS_STATES.in_progress} 
          value={stats.in_progress || 0} 
          colorClass="bg-yellow-100 dark:bg-yellow-900/30 [&>div]:bg-yellow-500" 
        />
        <StatProgressBar 
          label={STATUS_STATES.rejected} 
          value={stats.rejected || 0} 
          colorClass="bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-500" 
        />
        <StatProgressBar 
          label={STATUS_STATES.approved} 
          value={stats.approved || 0} 
          colorClass="bg-green-100 dark:bg-green-900/30 [&>div]:bg-green-500" 
        />
      </div>
    </div>
  );
}
