import React from 'react';
import { Flag, Flame, Target, Feather, Zap } from 'lucide-react';
import Badge from './Badge';

export const TaskBadges = ({ task }) => {
  const priorityConfig = {
    high: { color: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50', label: 'สูง', Icon: Flag },
    medium: { color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50', label: 'กลาง', Icon: Flag },
    low: { color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50', label: 'ต่ำ', Icon: Flag },
  };
  const pConf = priorityConfig[task.priority] || priorityConfig.medium;

  const diffConfig = {
    hard: { color: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50', label: 'ยาก', Icon: Flame },
    medium: { color: 'text-zinc-700 bg-zinc-100 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50', label: 'ปานกลาง', Icon: Target },
    easy: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50', label: 'ง่าย', Icon: Feather },
  };
  const dConf = diffConfig[task.difficulty] || diffConfig.medium;

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      <Badge className={`border ${pConf.color}`}>
        <pConf.Icon className="w-2.5 h-2.5 mr-1" /> ความสำคัญ {pConf.label}
      </Badge>
      <Badge className={`border ${dConf.color}`}>
        <dConf.Icon className="w-2.5 h-2.5 mr-1" /> ความยาก {dConf.label}
      </Badge>
      <Badge className="border text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50">
        <Zap className="w-2.5 h-2.5 mr-1" /> พลังงาน Lv.{task.level || '1'}
      </Badge>
    </div>
  );
};

export default TaskBadges;
