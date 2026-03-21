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
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 custom-scrollbar bg-zen-bg">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* TOP GREETING & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-2xl bg-white shadow-sm border border-zinc-50 ${greeting.color}`}>
                <greeting.icon className="w-5 h-5" /> 
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px] leading-none mb-1">{greeting.text}</span>
                <span className="text-zinc-900 font-black text-sm tracking-tight">ยินดีต้อนรับกลับมา, Zen Operator</span>
              </div>
            </motion.div>
            <h2 className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tighter leading-none">
              วันนี้, {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long' }).format(new Date())}
            </h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-zinc-50 shadow-sm"
          >
            <div className="w-12 h-12 bg-zen-navy rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="pr-4">
              <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Current Status</div>
              <div className="text-sm font-black text-zen-navy tracking-tight">Focus Protocol Active</div>
            </div>
          </motion.div>
        </div>

        {/* STATS OVERVIEW - RESTORED ORIGINAL LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Today's Tasks Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-center relative overflow-hidden group hover:border-zen-blue/40 transition-colors"
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-zen-blue/20 rounded-full blur-3xl group-hover:bg-zen-blue/40 transition-all duration-700" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-zen-blue/30 text-zen-blue-dark rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                <ListTree className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">รายการงานวันนี้</h3>
            </div>
            
            <div className="flex items-baseline gap-4 relative z-10">
              <span className="text-7xl font-black text-zinc-900 tracking-tighter">{completedTasks} / {totalTasks}</span>
            </div>
            <p className="mt-3 text-[11px] font-black text-zinc-300 uppercase tracking-[0.25em]">รายการที่เสร็จแล้ว</p>
            
            <div className="mt-10 h-3 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 shadow-inner p-0.5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercent}%` }} 
                className="h-full bg-gradient-to-r from-zen-blue-dark to-sky-400 rounded-full shadow-lg"
              />
            </div>
          </motion.div>

          {/* XP Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-center relative overflow-hidden group hover:border-zen-matcha/40 transition-colors"
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-zen-matcha/20 rounded-full blur-3xl group-hover:bg-zen-matcha/40 transition-all duration-700" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-zen-matcha/30 text-zen-matcha-dark rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">คะแนนความโปร่งใส</h3>
            </div>
            
            <div className="flex items-baseline gap-4 relative z-10">
              <span className={`text-7xl font-black tracking-tighter ${globalScore < 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                {globalScore.toLocaleString()}
              </span>
              <span className="text-2xl font-black text-zen-matcha-dark tracking-tighter">XP</span>
            </div>
            <p className="mt-3 text-[11px] font-black text-zinc-300 uppercase tracking-[0.25em]">Total Experience Points</p>
          </motion.div>

          {/* Trophies Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-center relative overflow-hidden group hover:border-zen-purple/40 transition-colors"
          >
            <div className="absolute -left-4 -top-4 w-32 h-32 bg-zen-purple/20 rounded-full blur-3xl group-hover:bg-zen-purple/40 transition-all duration-700" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-zen-purple/30 text-zen-purple-dark rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">ความสำเร็จสะสม</h3>
            </div>
            
            <div className="flex items-baseline gap-4 relative z-10">
              <span className="text-7xl font-black text-zinc-900 tracking-tighter">{store.rewards.trophies}</span>
              <span className="text-xl font-black text-zinc-300 uppercase tracking-widest">Rewards</span>
            </div>
            
            <div className="mt-10 flex items-center gap-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${i <= store.rewards.trophies ? 'bg-zen-purple-dark shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-zinc-100 opacity-50'}`} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          
          {/* FOCUS SECTION */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zen-navy uppercase tracking-[0.4em] mb-2">Priority Missions</span>
                <h3 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                  <div className="w-3 h-10 bg-zen-navy rounded-full" />
                  ภารกิจที่ต้องโฟกัสวันนี้
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-zinc-400 font-black hover:text-zen-navy uppercase tracking-[0.2em] text-[10px] bg-white border border-zinc-50 px-6 py-3 rounded-2xl shadow-sm">
                View Protocol <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <AnimatePresence mode='popLayout'>
                {sortedTasks.length > 0 ? (
                  sortedTasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                      className={`group p-8 rounded-[3rem] border transition-all flex items-center gap-8 ${
                        task.completed 
                        ? 'bg-zinc-50/50 border-zinc-100 opacity-60' 
                        : 'bg-white border-white hover:border-zen-blue shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-1'
                      }`}
                    >
                      <button 
                        onClick={() => toggleTaskToday(task.id)}
                        className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all shadow-inner ${
                          task.completed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-zinc-50 text-zinc-300 hover:bg-zen-blue hover:text-zen-blue-dark'
                        }`}
                      >
                        {task.completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                      </button>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          {task.time && (
                            <span className="text-[10px] font-black text-zinc-400 flex items-center gap-2 bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-100 uppercase tracking-widest">
                              <Clock className="w-4 h-4" /> {task.time}
                            </span>
                          )}
                          <TaskBadges task={task} compact />
                        </div>
                        <h4 className={`text-2xl font-bold tracking-tight truncate ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                          {task.text}
                        </h4>
                      </div>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="hidden sm:flex items-center gap-3 bg-zinc-50/80 px-5 py-3 rounded-[1.5rem] border border-zinc-100 shadow-inner">
                          <ListTree className="w-4 h-4 text-zinc-400" />
                          <span className="text-[11px] font-black text-zinc-500 tabular-nums uppercase tracking-widest">
                            {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white/40 backdrop-blur-sm border-4 border-dashed border-zinc-100 rounded-[4rem] p-24 text-center space-y-8">
                    <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-zinc-200/50">
                      <Target className="w-14 h-14 text-zinc-100" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">Zen State: Empty</p>
                      <p className="text-zinc-300 text-lg font-bold tracking-tight">ไม่มีภารกิจค้างในรายการ วันนี้คือพื้นที่ว่างของคุณ</p>
                    </div>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-calendar'))} className="bg-zen-navy text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_-10px_rgba(30,58,138,0.3)] hover:scale-105 transition-all">
                      <Plus className="w-5 h-5 mr-3" /> Initialize Protocol
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SIDEBAR ANALYSIS */}
          <div className="lg:col-span-4 space-y-12">
             
             {/* Category Performance */}
             <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] space-y-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-zen-navy uppercase tracking-[0.4em]">Resource Analysis</span>
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-3 tracking-tight">
                    <Palette className="w-6 h-6 text-zen-blue-dark" /> Performance Metrics
                  </h3>
                </div>

                <div className="space-y-8">
                  {categoryStats.length > 0 ? categoryStats.map(cat => (
                    <div key={cat.id} className="space-y-4">
                      <div className="flex justify-between items-end px-2">
                        <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${cat.fill}`} />
                          {cat.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-zinc-900 tabular-nums">{cat.done}</span>
                          <span className="text-[10px] font-black text-zinc-300 uppercase">/ {cat.total}</span>
                        </div>
                      </div>
                      <div className="h-3 bg-zinc-50 rounded-full overflow-hidden p-0.5 border border-zinc-100 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.done / cat.total) * 100}%` }}
                          className={`h-full rounded-full ${cat.fill} shadow-lg shadow-black/5`}
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="py-16 text-center border-2 border-dashed border-zinc-50 rounded-[2.5rem] bg-zinc-50/30">
                      <p className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.3em]">Telemetry Unavailable</p>
                    </div>
                  )}
                </div>
             </div>

             {/* DEEP WORK INTEGRATION */}
             <div className="bg-gradient-to-br from-zen-navy via-blue-900 to-indigo-950 p-12 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(30,58,138,0.4)] text-white space-y-10 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 group-hover:scale-125 transition-all duration-1000">
                  <Timer className="w-48 h-48" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-400/10 rounded-full blur-[60px]" />

                <div className="relative z-10 space-y-8">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-sky-200">System Ready</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter leading-tight">
                      Deep Work <br/> Environment
                    </h3>
                  </div>

                  <p className="text-sm font-medium text-sky-100/60 leading-relaxed">
                    มี {activeWorkspaceTasks.length} ภารกิจที่กำลังรอดำเนินการในโหมดโฟกัสแบบเต็มประสิทธิภาพ
                  </p>
                  
                  {activeWorkspaceTasks.length > 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl group-hover:bg-white/15 transition-colors">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-3">Primary Target</div>
                      <div className="font-black text-xl truncate tracking-tight mb-2">{activeWorkspaceTasks[0].text}</div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-sky-200/50 uppercase tracking-widest">
                        <Timer className="w-3.5 h-3.5" /> High Precision Mode
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center border border-white/5 rounded-[2rem] bg-white/5 backdrop-blur-sm">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Active Targets</span>
                    </div>
                  )}

                  <Button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-workspace'))} className="w-full bg-white text-zen-navy hover:bg-sky-50 rounded-[2rem] font-black py-6 shadow-2xl transition-all uppercase tracking-[0.3em] text-[10px] border-0 hover:scale-[1.02]">
                    Enter Workspace <ChevronRight className="w-4 h-4 ml-2" />
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
