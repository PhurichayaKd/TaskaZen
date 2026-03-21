import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Coffee, Moon, Plus, ListTree, Star, TrendingUp, Timer, 
  CheckCircle2, X, Target, Clock, Circle, CornerDownRight, Palette, Sparkles, Quote,
  Bell, ChevronRight, PenLine
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import TaskBadges from '../ui/TaskBadges';
import { formatDateToString } from '../../utils/dateUtils';
import { getGreeting, formatTimer } from '../../utils/uiUtils';
import { categoriesConfig } from '../ui/constants';

const HomeView = ({ store }) => {
  const todayStr = formatDateToString(new Date());
  const todayData = store.dayDataMap[todayStr] || { tasks: [], notes: '' };
  const calendarTasks = todayData.tasks || [];
  
  // Workspace Integration
  const activeWorkspaceTasks = store.workspaceTasks.filter(t => t.status === 'idle' || t.status === 'running');
  const completedWorkspaceTasks = store.workspaceTasks.filter(t => t.status === 'success' || t.status === 'failed');
  
  const totalTasks = calendarTasks.length;
  const completedTasks = calendarTasks.filter(t => t.completed).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  // Calculate Global XP (Calendar + Workspace)
  const calendarScore = calendarTasks.reduce((acc, t) => {
    if (!t.completed) return acc;
    let pts = 10;
    if (t.priority === 'high') pts += 5;
    if (t.difficulty === 'hard') pts += 5;
    if (t.level) pts += parseInt(t.level);
    return acc + pts;
  }, 0);
  
  const workspaceScore = completedWorkspaceTasks.reduce((acc, t) => acc + (t.xpEarned || 0), 0);
  const globalScore = calendarScore + workspaceScore;

  const greeting = getGreeting();
  const sortedTasks = [...calendarTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.time || '2400').localeCompare(b.time || '2400');
  });

  const toggleTaskToday = (taskId) => {
    const updatedTasks = calendarTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    store.saveData(todayStr, { ...todayData, tasks: updatedTasks });
  };

  const toggleSubtaskToday = (taskId, subId) => {
    const updatedTasks = calendarTasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s) };
      }
      return t;
    });
    store.saveData(todayStr, { ...todayData, tasks: updatedTasks });
  };

  const circleRadius = 36;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  const categoryStats = categoriesConfig.map(cat => {
    const catTasks = calendarTasks.filter(t => (t.category || 'work') === cat.id);
    const catTotal = catTasks.length;
    const catDone = catTasks.filter(t => t.completed).length;
    const percent = totalTasks === 0 ? 0 : Math.round((catTotal / totalTasks) * 100);
    return { ...cat, total: catTotal, done: catDone, percent };
  }).filter(c => c.total > 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-1">
              <greeting.icon className={`w-6 h-6 ${greeting.color}`} /> 
              <span className="text-zinc-500 font-bold text-lg">{greeting.text}</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-3">
              วันนี้, {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long' }).format(new Date())}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50" />
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={circleRadius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100" />
                <motion.circle 
                  cx="50" cy="50" r={circleRadius} stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={circleCircumference} 
                  initial={{ strokeDashoffset: circleCircumference }} animate={{ strokeDashoffset: circleOffset }} transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round" className={`${progressPercent === 100 ? 'text-emerald-500' : 'text-indigo-600'}`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-zinc-900">{progressPercent}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">ความคืบหน้า</h3>
              <p className="text-lg font-bold text-zinc-900 mt-0.5">
                {progressPercent === 100 ? 'ยอดเยี่ยม! เสร็จหมดแล้ว 🎉' : 'มาลุยกันต่อเลย!'}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ListTree className="w-5 h-5" /></div>
               <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">รายการงานวันนี้</h3>
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-bold text-zinc-900">{completedTasks}</span>
               <span className="text-lg text-zinc-400 font-medium">/ {totalTasks}</span>
               <span className="text-sm text-zinc-500 ml-2">รายการที่เสร็จแล้ว</span>
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10"><TrendingUp className="w-32 h-32 text-amber-500" /></div>
             <div className="flex items-center gap-3 mb-3 relative z-10">
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Star className="w-5 h-5" /></div>
               <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">คะแนนความโปร่งใส</h3>
             </div>
             <div className="flex items-baseline gap-2 relative z-10">
               <span className={`text-3xl font-bold ${globalScore < 0 ? 'text-red-600' : 'text-zinc-900'}`}>{globalScore}</span>
               <span className="text-sm text-zinc-500 ml-1">XP</span>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* NEW Workspace Tasks Section on Home */}
            {(activeWorkspaceTasks.length > 0 || completedWorkspaceTasks.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center">
                  <Timer className="w-5 h-5 mr-2 text-purple-500" /> ภารกิจจับเวลา (Workspace)
                </h3>
                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden divide-y divide-purple-50">
                  {/* Active Workspace Tasks */}
                  {activeWorkspaceTasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between bg-purple-50/30">
                      <div className="flex items-center gap-3">
                        {task.status === 'running' ? (
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                        )}
                        <span className="font-semibold text-purple-900">{task.text}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold ${task.currentSeconds < 0 ? 'text-red-500' : 'text-purple-600'}`}>
                          {formatTimer(task.currentSeconds)}
                        </span>
                        {task.status === 'idle' && (
                          <Button size="sm" onClick={() => store.startTimer(task.id)} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs">
                            เริ่มจับเวลา
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Completed Workspace Tasks */}
                  {completedWorkspaceTasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between bg-zinc-50/50 opacity-70">
                      <div className="flex items-center gap-3">
                        {task.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
                        <span className="font-medium text-zinc-600 line-through">{task.text}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${task.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {task.status === 'success' ? '+' : ''}{task.xpEarned} XP
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          เหลือ {formatTimer(task.currentSeconds)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-indigo-500" /> สิ่งที่ต้องโฟกัสวันนี้
                </h3>
                {totalTasks > 0 && (
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">เหลืออีก {totalTasks - completedTasks} งาน</span>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                {calendarTasks.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                      <Coffee className="w-8 h-8 text-zinc-400" /> 
                    </div>
                    <h4 className="text-zinc-900 font-medium mb-1">วันนี้ยังไม่มีรายการงาน</h4>
                    <p className="text-zinc-500 text-sm mb-4">เพิ่มงานลงในปฏิทินเพื่อเริ่มต้นจัดการวันของคุณ</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    <AnimatePresence>
                      {sortedTasks.map((task, i) => (
                        <motion.div 
                          key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.05 }}
                          className={`p-4 flex gap-4 transition-colors hover:bg-zinc-50/50 ${task.completed ? 'opacity-60 bg-zinc-50' : ''}`}
                        >
                          <button onClick={() => toggleTaskToday(task.id)} className="mt-0.5 flex-shrink-0 group focus:outline-none">
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" /> 
                            ) : (
                              <Circle className="w-6 h-6 text-zinc-300 group-hover:text-indigo-400 transition-colors" /> 
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 w-full">
                              <p className={`text-sm font-bold flex-1 ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                                {task.text}
                              </p>
                              {task.time && (
                                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" /> {task.time}
                                </span>
                              )}
                            </div>
                            {!task.completed && <TaskBadges task={task} />}
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-3 pl-1 space-y-2">
                                {task.subtasks.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 group/sub">
                                    <CornerDownRight className="w-3 h-3 text-zinc-300 flex-shrink-0" /> 
                                    <input 
                                      type="checkbox" checked={sub.completed} onChange={() => toggleSubtaskToday(task.id, sub.id)}
                                      className="w-3.5 h-3.5 rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer flex-shrink-0"
                                    />
                                    <span className={`text-xs flex-1 transition-colors ${sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>
                                      {sub.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                          </div>
                          {task.category && (
                             <div className="flex-shrink-0 pt-0.5">
                               {categoriesConfig.map(c => c.id === task.category && (
                                 <span key={c.id} className="text-xs text-zinc-400 flex items-center" title={c.label}>
                                   <c.icon className="w-3.5 h-3.5" /> 
                                 </span>
                               ))}
                             </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center">
                <Palette className="w-4 h-4 mr-2 text-zinc-500" /> สัดส่วนงานวันนี้
              </h3>
              
              {categoryStats.length === 0 ? (
                 <p className="text-xs text-zinc-500 text-center py-4">ไม่มีข้อมูลหมวดหมู่</p>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-zinc-100">
                    {categoryStats.map(cat => (
                      <div key={`bar-${cat.id}`} style={{ width: `${cat.percent}%` }} className={`h-full ${cat.fill}`} title={cat.label} /> 
                    ))}
                  </div>
                  
                  <div className="space-y-2.5">
                    {categoryStats.map(cat => (
                      <div key={`legend-${cat.id}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${cat.fill}`} /> 
                           <span className="text-zinc-600">{cat.label}</span>
                        </div>
                        <span className="text-zinc-900 font-medium">{cat.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 relative overflow-hidden">
               <Quote className="w-12 h-12 text-indigo-500/10 absolute -top-2 -left-2" /> 
               <h3 className="text-sm font-bold text-indigo-900 mb-2 relative z-10 flex items-center">
                 <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" /> ข้อคิดประจำวัน
               </h3>
               <p className="text-sm text-indigo-800/80 italic relative z-10 leading-relaxed">
                 ความสำเร็จไม่ได้มาจากการทำสิ่งที่ยิ่งใหญ่เพียงครั้งเดียว แต่มาจากการทำสิ่งเล็กๆ อย่างสม่ำเสมอในทุกๆ วัน
               </p>
            </div>

            {/* Reminder Notes Section */}
            {store.notes.filter(n => n.template === 'reminder').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center px-1">
                  <Bell className="w-4 h-4 mr-2 text-indigo-500" /> บันทึกเตือนความจำ
                </h3>
                <div className="space-y-2">
                  {store.notes.filter(n => n.template === 'reminder').slice(0, 2).map(note => (
                    <div key={note.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm group hover:border-indigo-200 transition-all">
                      <div className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-tighter">
                        {new Date(note.updatedAt).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-sm text-zinc-600 line-clamp-2 mb-3 prose-sm" dangerouslySetInnerHTML={{ __html: note.content }} />
                      <button 
                        onClick={() => {
                          // Logic to navigate to notes view with filter
                          // Since we don't have a direct navigation function passed, we rely on App state
                          // For now, just a placeholder or instruction
                          window.dispatchEvent(new CustomEvent('nav-to-notes', { detail: { filter: 'reminder' } }));
                        }}
                        className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                      >
                        ดูเพิ่มเติม <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
