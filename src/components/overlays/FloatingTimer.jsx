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
      className={`fixed bottom-8 right-8 z-50 w-72 rounded-2xl shadow-2xl border-2 backdrop-blur-md overflow-hidden
        ${isNegative ? 'bg-red-50/90 border-red-500' : 'bg-white/90 border-purple-500'}
      `}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={`h-8 w-full cursor-grab active:cursor-grabbing flex justify-center items-center ${isNegative ? 'bg-red-500' : 'bg-purple-600'}`}
      >
        <div className="w-12 h-1.5 bg-white/40 rounded-full" />
      </div>
      
      <div className="p-5 flex flex-col items-center text-center space-y-4">
        <h4 className="font-bold text-zinc-900 leading-tight line-clamp-2">{activeTask.text}</h4>
        
        <div className={`text-4xl font-mono font-black tracking-tighter tabular-nums ${isNegative ? 'text-red-600 animate-pulse' : 'text-purple-600'}`}>
          {formatTimer(activeTask.currentSeconds)}
        </div>
        
        {isNegative && (
          <div className="flex items-center text-red-600 text-xs font-bold bg-red-100 px-3 py-1 rounded-full animate-bounce">
            <AlertCircle className="w-3 h-3 mr-1" /> เกินเวลา! คะแนนกำลังติดลบ
          </div>
        )}

        <Button onClick={handleComplete} className={`w-full font-bold text-base h-12 shadow-md ${isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
           <CheckCircle2 className="w-5 h-5 mr-2" /> สำเร็จแล้ว!
        </Button>
      </div>
    </motion.div>
  );
};

export default FloatingTimer;
