import React from 'react';
import { Flag, Flame, Target, Feather, Zap } from 'lucide-react';
import Badge from './Badge';

export const TaskBadges = ({ task }) => {
  const priorityConfig = {
    high: { color: 'text-red-700 bg-red-50 border-red-200', label: 'สูง', Icon: Flag },
    medium: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'กลาง', Icon: Flag },
    low: { color: 'text-blue-700 bg-blue-50 border-blue-200', label: 'ต่ำ', Icon: Flag },
  };
  const pConf = priorityConfig[task.priority] || priorityConfig.medium;

  const diffConfig = {
    hard: { color: 'text-orange-700 bg-orange-50 border-orange-200', label: 'ยาก', Icon: Flame },
    medium: { color: 'text-zinc-700 bg-zinc-100 border-zinc-200', label: 'ปานกลาง', Icon: Target },
    easy: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'ง่าย', Icon: Feather },
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
      <Badge className="border text-indigo-700 bg-indigo-50 border-indigo-200">
        <Zap className="w-2.5 h-2.5 mr-1" /> พลังงาน Lv.{task.level || '1'}
      </Badge>
    </div>
  );
};

export default TaskBadges;
