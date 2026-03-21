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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-zen-cream">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-1">
              <greeting.icon className={`w-5 h-5 ${greeting.color}`} /> 
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">{greeting.text}</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              วันนี้, {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long' }).format(new Date())}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-xl shadow-zinc-200/50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zen-mint rounded-bl-full -z-10 opacity-30 group-hover:scale-110 transition-transform" />
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={circleRadius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-50" />
                <motion.circle 
                  cx="50" cy="50" r={circleRadius} stroke="currentColor" strokeWidth="10" fill="transparent" 
                  strokeDasharray={circleCircumference} 
                  initial={{ strokeDashoffset: circleCircumference }} animate={{ strokeDashoffset: circleOffset }} transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round" className={`${progressPercent === 100 ? 'text-emerald-400' : 'text-zen-mint-dark'}`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-zinc-800">{progressPercent}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-zinc-800 text-lg">ความคืบหน้า</h3>
              <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">{completedTasks}/{totalTasks} งานสำเร็จ</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-xl shadow-zinc-200/50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zen-purple rounded-bl-full -z-10 opacity-30 group-hover:scale-110 transition-transform" />
            <div className="w-20 h-20 bg-zen-purple rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner">
               <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h3 className="font-black text-zinc-800 text-lg">คะแนนรวม</h3>
              <p className="text-3xl font-black text-purple-600 tabular-nums">{globalScore.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">EXP POINTS</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-xl shadow-zinc-200/50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zen-peach rounded-bl-full -z-10 opacity-30 group-hover:scale-110 transition-transform" />
            <div className="w-20 h-20 bg-zen-peach rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner">
               <Sparkles className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h3 className="font-black text-zinc-800 text-lg">ความสำเร็จ</h3>
              <p className="text-3xl font-black text-orange-600 tabular-nums">{store.rewards.trophies}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">TROPHIES EARNED</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-zinc-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-zen-mint-dark" /> รายการวันนี้
              </h3>
              <Button variant="ghost" size="sm" className="text-zinc-400 font-bold hover:text-zen-mint-dark">
                ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {sortedTasks.length > 0 ? (
                  sortedTasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                      className={`group p-5 rounded-[2rem] border transition-all flex items-center gap-5 ${
                        task.completed 
                        ? 'bg-zinc-50/50 border-zinc-100 opacity-60' 
                        : 'bg-white border-zinc-100 hover:border-zen-mint-dark hover:shadow-lg hover:-translate-y-1 shadow-sm'
                      }`}
                    >
                      <button 
                        onClick={() => toggleTaskToday(task.id)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                          task.completed ? 'bg-emerald-500 text-white' : 'bg-zinc-50 text-zinc-300 hover:bg-zen-mint hover:text-zen-mint-dark'
                        }`}
                      >
                        {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {task.time && (
                            <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-100">
                              <Clock className="w-3 h-3" /> {task.time}
                            </span>
                          )}
                          <TaskBadges task={task} compact />
                        </div>
                        <h4 className={`text-lg font-bold truncate ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                          {task.text}
                        </h4>
                      </div>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-2xl border border-zinc-100">
                          <ListTree className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-black text-zinc-500">
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white/50 border-2 border-dashed border-zinc-200 rounded-[3rem] p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-100 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                      <Target className="w-10 h-10 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">ยังไม่มีงานสำหรับวันนี้</p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-calendar'))} className="bg-zen-mint text-emerald-800 border-2 border-white rounded-2xl font-black">
                      <Plus className="w-5 h-5 mr-2" /> เพิ่มงานแรกของคุณ
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-8">
             {/* Stats Cards */}
             <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-xl shadow-zinc-200/50 space-y-6">
                <h3 className="text-lg font-black text-zinc-800 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-zen-peach-dark" /> สถิติแยกหมวด
                </h3>
                <div className="space-y-4">
                  {categoryStats.length > 0 ? categoryStats.map(cat => (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <cat.icon className="w-3 h-3" /> {cat.label}
                        </span>
                        <span className="text-xs font-black text-zinc-800">{cat.done}/{cat.total}</span>
                      </div>
                      <div className="h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-50 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.done / cat.total) * 100}%` }}
                          className={`h-full rounded-full ${cat.fill}`}
                        />
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-zinc-400 text-center py-4 font-bold uppercase tracking-widest">ยังไม่มีข้อมูล</p>
                  )}
                </div>
             </div>

             {/* Workspace Preview */}
             <div className="bg-gradient-to-br from-zen-mint to-zen-purple p-8 rounded-[3rem] border border-white shadow-xl text-zinc-800 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                  <Timer className="w-24 h-24" />
                </div>
                <div className="relative">
                  <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5" /> พื้นที่ทำงาน
                  </h3>
                  <p className="text-sm font-bold opacity-70 mb-6">มี {activeWorkspaceTasks.length} งานที่กำลังรอดำเนินการ</p>
                  
                  {activeWorkspaceTasks.length > 0 ? (
                    <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 mb-6">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">งานล่าสุด</div>
                      <div className="font-black truncate">{activeWorkspaceTasks[0].text}</div>
                    </div>
                  ) : null}

                  <Button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-workspace'))} className="w-full bg-white text-zinc-800 rounded-2xl font-black py-4 shadow-lg hover:shadow-xl transition-all border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1">
                    เข้าสู่พื้นที่ทำงาน <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeView;
