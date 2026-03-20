import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Trophy, Wind } from 'lucide-react';

const CompletionAnimationOverlay = ({ data, onComplete }) => {
  if (!data) return null;
  const { type, xp, taskName, timeSpent, totalExpected } = data;
  
  useEffect(() => {
    const timer = setTimeout(() => { onComplete(); }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const minsSpent = Math.floor(timeSpent / 60);
  const secsSpent = timeSpent % 60;
  const timeSpentStr = `${minsSpent > 0 ? `${minsSpent} นาที ` : ''}${secsSpent} วินาที`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Effect */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`absolute inset-0 backdrop-blur-sm ${type === 'success' ? 'bg-emerald-900/30' : 'bg-zinc-900/60'}`}
      />

      {/* Confetti / Leaves Particles */}
      {type === 'success' && (
         <div className="absolute inset-0 flex justify-center items-center">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * window.innerWidth, 
                  y: (Math.random() - 0.5) * window.innerHeight,
                  scale: Math.random() * 1.5 + 0.5,
                  rotate: Math.random() * 360,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5] }}
              />
            ))}
         </div>
      )}

      {type === 'failed' && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, y: Math.random() * window.innerHeight, rotate: 0, opacity: 0.7 }}
              animate={{ 
                x: window.innerWidth + 100, 
                y: Math.random() * window.innerHeight + (Math.random() * 200 - 100),
                rotate: Math.random() * 360,
                opacity: [0, 0.7, 0]
              }}
              transition={{ duration: 3 + Math.random() * 2, ease: "linear" }}
              className="absolute text-amber-800/40"
            >
              <Wind className="w-8 h-8" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Card */}
      <motion.div 
        initial={{ scale: 0.5, y: 100, opacity: 0 }} 
        animate={{ 
          scale: 1, y: 0, opacity: 1,
          rotate: type === 'success' ? [-2, 2, -2, 2, 0] : [0, 0, 0]
        }} 
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className={`relative z-10 w-80 sm:w-96 rounded-3xl p-8 text-center shadow-2xl border-4 
          ${type === 'success' ? 'bg-white border-emerald-400' : 'bg-zinc-100 border-red-900/20'}
        `}
      >
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner
          ${type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}
        `}>
          {type === 'success' ? <PartyPopper className="w-10 h-10" /> : <Trophy className="w-10 h-10 opacity-50" />}
        </div>

        <h3 className={`text-2xl font-black mb-2 ${type === 'success' ? 'text-emerald-600' : 'text-zinc-800'}`}>
          {type === 'success' ? 'ยอดเยี่ยมมาก!' : 'น่าเสียดาย!'}
        </h3>
        
        <p className="text-zinc-600 font-medium mb-6 line-clamp-2">{taskName}</p>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">เป้าหมายเวลา</span>
            <span className="font-mono font-bold">{Math.floor(totalExpected / 60)} นาที</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">เวลาที่ใช้ไป</span>
            <span className={`font-mono font-bold ${type === 'failed' ? 'text-red-500' : 'text-emerald-600'}`}>{timeSpentStr}</span>
          </div>
        </div>

        {/* Floating XP Text */}
        <motion.div 
          initial={{ y: 0, scale: 0.5, opacity: 0 }}
          animate={{ y: -40, scale: 1.2, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className={`absolute -top-16 left-12 transform -translate-x-12 text-5xl font-black drop-shadow-lg
            ${type === 'success' ? 'text-amber-400' : 'text-red-500'}
          `}
        >
          {xp >= 0 ? '+' : ''}{xp} XP
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompletionAnimationOverlay;
