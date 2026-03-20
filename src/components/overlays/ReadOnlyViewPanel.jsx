import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, Check, CornerDownRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';
import { colorMap, categoriesConfig } from '../ui/constants';
import TaskBadges from '../ui/TaskBadges';

const ReadOnlyViewPanel = ({ date, data }) => {
  const notes = data?.notes || '';
  const tasks = data?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const sortedTasks = [...tasks].sort((a, b) => (a.time || '2400').localeCompare(b.time || '2400'));
  
  const groupedTasks = categoriesConfig.map(cat => ({
    ...cat, 
    items: sortedTasks.filter(t => (t.category || 'work') === cat.id)
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="pb-6 border-b border-zinc-100">
        <h3 className="text-lg font-bold text-zinc-900">{formatDisplayDate(date)}</h3>
        <p className="text-sm text-zinc-500 mt-1 flex items-center">
          <Eye className="w-4 h-4 mr-1.5" /> โหมดอ่านอย่างเดียว
        </p>
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-semibold text-zinc-600">ความคืบหน้าของวัน</span>
            <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 0.5, ease: "easeOut" }} 
              className={`h-full rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            />
          </div>
          <p className="text-[10px] text-zinc-400 text-right">เสร็จ {completedTasks} จาก {totalTasks} งาน</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 space-y-8 pr-2 custom-scrollbar">
        {notes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">บันทึกความคิด</h4>
            <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-xl text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{notes}</div>
          </motion.div>
        )}
        <div className="space-y-4 pb-8">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">รายการงาน</h4>
          {groupedTasks.length === 0 ? (
            <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
              <p className="text-sm text-zinc-400">ไม่มีงานในวันนี้</p>
            </div>
          ) : (
            groupedTasks.map((group, groupIndex) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (groupIndex * 0.1) }} className="space-y-3">
                <div className="flex items-center gap-2">
                  <group.icon className={`w-3.5 h-3.5 ${group.color.split(' ')[0]}`} /> 
                  <span className="text-xs font-semibold text-zinc-600">{group.label}</span>
                </div>
                <div className="space-y-2.5">
                  {group.items.map((task, taskIndex) => {
                    const colorTheme = colorMap[task.color || 'zinc'];
                    return (
                      <motion.div 
                        key={task.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.3 + (groupIndex * 0.1) + (taskIndex * 0.05) }} 
                        className={`p-3 rounded-lg border-l-2 transition-opacity ${task.completed ? 'bg-zinc-50/50 border-zinc-200 opacity-60' : `bg-white border-y border-r border-y-zinc-100 border-r-zinc-100 shadow-sm border-l-${colorTheme.main.replace('bg-', '')}`}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-zinc-300">
                            {task.completed ? <Check className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />}
                          </div>
                          <div className="flex-1 w-full min-w-0">
                            <div className="flex justify-between items-start gap-2 w-full">
                              <p className={`text-sm flex-1 ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-800 font-bold'}`}>{task.text}</p>
                              {task.time && (
                                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center">
                                  <Clock className="w-2.5 h-2.5 mr-1" /> {task.time}
                                </span>
                              )}
                            </div>
                            {!task.completed && <TaskBadges task={task} />}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-3 pl-1 space-y-2">
                                {task.subtasks.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2">
                                    <CornerDownRight className="w-3 h-3 text-zinc-300 flex-shrink-0" /> 
                                    <input type="checkbox" readOnly checked={sub.completed} className="w-3.5 h-3.5 rounded-sm border-zinc-300 text-indigo-600 flex-shrink-0" /> 
                                    <span className={`text-xs flex-1 ${sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{sub.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyViewPanel;
