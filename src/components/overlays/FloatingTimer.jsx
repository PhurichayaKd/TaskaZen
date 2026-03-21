import React, { useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import { formatTimer } from '../../utils/uiUtils';

const FloatingTimer = ({ store, triggerAnimation }) => {
  const dragControls = useDragControls();
  const activeTask = store.workspaceTasks.find(t => t.id === store.activeTimerId);

  useEffect(() => {
    if (!activeTask || activeTask.status !== 'running') return;
    
    const interval = setInterval(() => {
      store.updateTaskTime(activeTask.id, activeTask.currentSeconds - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask?.id, activeTask?.status, activeTask?.currentSeconds]);

  if (!activeTask) return null;

  const isNegative = activeTask.currentSeconds < 0;

  const handleComplete = () => {
    const isSuccess = activeTask.currentSeconds >= 0;
    const finalTimeSpent = activeTask.totalSeconds - activeTask.currentSeconds;
    
    const xpEarned = isSuccess ? activeTask.expectedXp : -(activeTask.expectedXp);
    
    store.completeWorkspaceTask(activeTask.id, activeTask.currentSeconds, xpEarned, isSuccess ? 'success' : 'failed');
    triggerAnimation({ 
      type: isSuccess ? 'success' : 'failed', 
      xp: xpEarned, 
      taskName: activeTask.text,
      timeSpent: finalTimeSpent,
      totalExpected: activeTask.totalSeconds
    });
  };

  return (
    <motion.div
      drag dragMomentum={false} dragControls={dragControls} dragListener={false}
      initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`fixed bottom-8 right-8 z-50 min-w-[320px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 backdrop-blur-xl overflow-auto transition-colors duration-500 resize both
        ${isNegative ? 'bg-red-50/90 dark:bg-red-950/90 border-red-500' : 'bg-white/90 dark:bg-zinc-800/90 border-indigo-500'}
      `}
      style={{ minHeight: '300px' }}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={`h-10 w-full cursor-grab active:cursor-grabbing flex justify-center items-center relative overflow-hidden ${isNegative ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
      >
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
        <div className="w-16 h-1.5 bg-white/30 rounded-full relative z-10" />
      </div>
      
      <div className="p-8 flex flex-col items-center text-center space-y-6 relative h-full min-h-[inherit]">
        {/* Gaming Style Mission Badge */}
        <div className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg z-20 shrink-0">
          ACTIVE
        </div>

        <div className="space-y-1 shrink-0">
          <h4 className="font-black text-zinc-900 dark:text-white leading-tight text-xl tracking-tight uppercase line-clamp-2">{activeTask.text}</h4>
          <div className="flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-md uppercase tracking-widest">
              Reward: +{activeTask.expectedXp} XP
            </span>
          </div>
        </div>
        
        <div className="relative group flex-1 flex items-center justify-center min-h-0">
          <div className={`absolute inset-0 blur-2xl opacity-20 ${isNegative ? 'bg-red-500' : 'bg-indigo-500'}`} />
          <div className={`font-mono font-black tracking-tighter tabular-nums relative z-10 transition-all duration-300 ${isNegative ? 'text-red-600 animate-pulse' : 'text-zinc-900 dark:text-white drop-shadow-sm'} text-[min(15vw,6rem)]`}>
            {formatTimer(activeTask.currentSeconds)}
          </div>
        </div>
        
        {isNegative && (
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="flex items-center text-red-600 dark:text-red-400 text-[10px] font-black bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-2xl border-2 border-red-200 dark:border-red-800 shrink-0">
            <AlertCircle className="w-3 h-3 mr-2" /> OVERTIME PENALTY
          </motion.div>
        )}

        <Button onClick={handleComplete} className={`w-full font-black text-lg h-16 rounded-[1.5rem] shadow-xl transform transition-all active:scale-95 uppercase tracking-widest shrink-0 ${isNegative ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none text-white'}`}>
           <CheckCircle2 className="w-6 h-6 mr-3 stroke-[3]" /> Finish Mission
        </Button>
      </div>
    </motion.div>
  );
};

export default FloatingTimer;
