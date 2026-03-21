import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Plus, ListTree, Clock, Play, Trophy, Star, Shield, 
  Coins, TrendingUp, Calendar, Gift, ChevronRight, Sparkles, Check, Crown,
  Gamepad2, Target, Zap
} from 'lucide-react';
import Button from '../ui/Button';

// Star Shield Component
const StarShield = ({ className }) => (
  <div className={`relative ${className}`}>
    <Shield className="w-full h-full" />
    <Star className="w-1/2 h-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-current" />
  </div>
);

const FrownIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>
  </svg>
);

const RewardItem = ({ icon: Icon, label, count, color, bgColor, onClick, disabled, requirement, isShield }) => (
  <div 
    className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-3 relative group 
      ${disabled ? 'bg-zinc-50 border-zinc-100 opacity-40 grayscale' : `${bgColor} border-white shadow-xl hover:shadow-2xl hover:-translate-y-2 cursor-pointer active:scale-95`}
    `} 
    onClick={!disabled ? onClick : undefined}
  >
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${color} ${!disabled && 'animate-float'}`}>
      {isShield ? <StarShield className="w-10 h-10" /> : <Icon className="w-10 h-10" />}
    </div>
    <div className="text-center">
      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="text-3xl font-black text-zinc-800 tabular-nums leading-none">{count}</div>
    </div>
    {!disabled && requirement && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:translate-y-[-4px] group-hover:scale-100">
        แลก {requirement}
      </div>
    )}
    {disabled && requirement && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-zinc-400">ขาด {requirement}</span>
      </div>
    )}
  </div>
);

const WorkspaceView = ({ store }) => {
  const { rewards, exchangeReward } = store;
  const [taskText, setTaskText] = useState('');
  const [mode, setMode] = useState('minutes'); 
  const [minutesStr, setMinutesStr] = useState('25');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [expectedXpInput, setExpectedXpInput] = useState('10'); // New state for user expected XP
  const [celebration, setCelebration] = useState(null);

  const handleAddTimer = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    let totalSeconds = 0;
    if (mode === 'minutes') {
      const m = parseInt(minutesStr);
      if (isNaN(m) || m <= 0) return;
      totalSeconds = m * 60;
    } else {
      if (!timeStart || !timeEnd) return;
      const [sh, sm] = timeStart.split(':').map(Number);
      const [eh, em] = timeEnd.split(':').map(Number);
      let sDate = new Date(); sDate.setHours(sh, sm, 0, 0);
      let eDate = new Date(); eDate.setHours(eh, em, 0, 0);
      if (eDate <= sDate) eDate.setDate(eDate.getDate() + 1);
      totalSeconds = Math.floor((eDate - sDate) / 1000);
    }

    // Calculate system max XP based on time (e.g., 1 XP per minute, max 100)
    const systemMaxXp = Math.min(100, Math.max(5, Math.floor(totalSeconds / 60)));
    const userExpectedXp = parseInt(expectedXpInput) || 10;
    
    // Final expected XP is bounded by system max
    const finalExpectedXp = Math.min(userExpectedXp, systemMaxXp);

    store.addWorkspaceTask({
      text: taskText,
      totalSeconds,
      currentSeconds: totalSeconds,
      expectedXp: finalExpectedXp,
      systemMaxXp: systemMaxXp
    });

    setTaskText('');
    setExpectedXpInput('10');
  };

  const handleExchange = (type, label, icon, isShield = false) => {
    let canExchange = false;
    switch(type) {
      case 'bronzeCoin': canExchange = rewards.trophies >= 10; break;
      case 'silverCoin': canExchange = rewards.bronzeCoins >= 3; break;
      case 'goldCoin': canExchange = rewards.silverCoins >= 5; break;
      case 'silverShield': canExchange = rewards.goldCoins >= 7; break;
      case 'goldCrown': canExchange = rewards.silverShields >= 3; break;
    }

    if (canExchange) {
      exchangeReward(type);
      setCelebration({ label, icon, isShield });
      setTimeout(() => setCelebration(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-zen-cream font-sans">
      
      {/* Celebration Animation Overlay */}
      <AnimatePresence>
        {celebration && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 1.5, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl p-16 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white flex flex-col items-center gap-8 relative"
            >
              <div className="absolute -top-16 -left-16 text-zen-peach animate-float"><Sparkles className="w-32 h-32" /></div>
              <div className="absolute -bottom-16 -right-16 text-zen-blue animate-pulse-slow"><Gift className="w-32 h-32" /></div>
              
              <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-zen-mint to-zen-purple flex items-center justify-center shadow-2xl mb-4 transform rotate-6 border-4 border-white">
                {celebration.isShield ? <StarShield className="w-20 h-20 text-zinc-800" /> : <celebration.icon className="w-20 h-20 text-zinc-800" />}
              </div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-zinc-900 mb-2 tracking-tighter uppercase">ยินดีด้วย!</h2>
                <p className="text-2xl font-black text-emerald-600">คุณได้รับ {celebration.label} ใหม่!</p>
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-4"
              >
                <div className="bg-zen-mint text-emerald-800 px-8 py-3 rounded-full text-xl font-black flex items-center gap-3 border-2 border-white shadow-lg">
                  <Check className="w-8 h-8" /> เก็บเข้าคอลเลกชันแล้ว
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Tasks & Missions */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-16 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-zen-mint to-zen-purple rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-all border-4 border-white">
                <Gamepad2 className="w-10 h-10 text-zinc-800" /> 
              </div>
              <div>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none mb-2">Missions</h2>
                <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.3em]">Time Challenge Protocol</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-md border-2 border-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active: {store.workspaceTasks.filter(t => t.status === 'running').length}</span>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-2xl border border-white relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-zen-mint/30 rounded-full blur-3xl group-hover:bg-zen-mint/50 transition-colors" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-zen-purple/30 rounded-full blur-3xl group-hover:bg-zen-purple/50 transition-colors" />

            <form onSubmit={handleAddTimer} className="space-y-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 pl-2"><Target className="w-4 h-4" /> Mission Objective</label>
                <input 
                  type="text" value={taskText} onChange={e => setTaskText(e.target.value)} required
                  placeholder="What is your next challenge?"
                  className="w-full p-6 border-2 border-zinc-50 rounded-[2rem] focus:ring-8 focus:ring-zen-mint/30 focus:border-zen-mint-dark bg-zinc-50/50 text-xl font-black transition-all placeholder:text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 pl-2"><Clock className="w-4 h-4" /> Time Protocol</label>
                  <div className="flex gap-2 p-2 bg-zinc-100/50 rounded-[2rem] border border-white">
                    <button type="button" onClick={() => setMode('minutes')} className={`flex-1 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-widest ${mode === 'minutes' ? 'bg-white text-emerald-600 shadow-xl border border-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}>
                      Countdown
                    </button>
                    <button type="button" onClick={() => setMode('range')} className={`flex-1 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-widest ${mode === 'range' ? 'bg-white text-emerald-600 shadow-xl border border-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}>
                      Schedule
                    </button>
                  </div>
                  
                  {mode === 'minutes' ? (
                    <div className="flex items-center gap-4 bg-zinc-50/50 p-3 rounded-[2rem] border-2 border-zinc-50">
                      <input 
                        type="number" min="1" value={minutesStr} onChange={e => setMinutesStr(e.target.value)} required
                        className="w-full p-3 bg-white border-0 rounded-[1.5rem] text-center text-2xl font-black focus:ring-0 text-emerald-600 shadow-lg"
                      />
                      <span className="text-zinc-400 font-black pr-6 uppercase text-[10px] tracking-widest">Mins</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-zinc-50/50 p-3 rounded-[2rem] border-2 border-zinc-50">
                      <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} required className="w-full p-3 bg-white border-0 rounded-[1.5rem] text-center text-sm font-black focus:ring-0 shadow-lg" /> 
                      <span className="text-zinc-300 font-black px-2">-</span>
                      <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} required className="w-full p-3 bg-white border-0 rounded-[1.5rem] text-center text-sm font-black focus:ring-0 shadow-lg" /> 
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 pl-2"><Zap className="w-4 h-4" /> Expected XP Reward</label>
                  <div className="bg-zinc-50/50 p-6 rounded-[2.5rem] border-2 border-zinc-50 h-[120px] flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" min="1" value={expectedXpInput} onChange={e => setExpectedXpInput(e.target.value)} required
                        className="w-24 p-3 bg-white border-0 rounded-[1.5rem] text-center text-2xl font-black focus:ring-0 text-orange-600 shadow-lg"
                      />
                      <div className="flex flex-col">
                        <span className="text-zinc-900 font-black uppercase text-xs tracking-widest">XP Points</span>
                        <span className="text-zinc-400 font-bold text-[9px]">Limit: {Math.min(100, Math.max(5, Math.floor((mode === 'minutes' ? parseInt(minutesStr) || 0 : 30) * 60 / 60)))} XP</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-3 font-black uppercase tracking-wider leading-tight">
                      *หักคะแนนหากทำภารกิจไม่สำเร็จ
                    </p>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full h-20 text-base font-black bg-zen-peach hover:bg-zen-peach-dark text-orange-900 rounded-[2rem] shadow-2xl shadow-zen-peach/30 border-4 border-white transition-all uppercase tracking-[0.3em] group/btn flex items-center justify-center"
              >
                <Plus className="w-6 h-6 mr-4 stroke-[3] group-hover:rotate-90 transition-transform duration-300" /> Accept Mission
              </motion.button>
            </form>
          </motion.div>

          {/* List of Tasks */}
          {store.workspaceTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-2">
                  <ListTree className="w-4 h-4" /> Mission Log
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {store.workspaceTasks.map(task => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={task.id} className={`p-8 rounded-[3rem] border-4 flex flex-col md:flex-row md:items-center justify-between transition-all duration-500 group relative overflow-hidden
                    ${task.status === 'running' ? 'bg-zen-mint/40 border-zen-mint shadow-2xl' : 
                      task.status === 'idle' ? 'bg-white border-zinc-50 shadow-xl hover:border-zen-mint-dark' : 'bg-white/50 border-zinc-50 opacity-70 grayscale-[0.4]'}
                  `}>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : task.status === 'failed' ? 'bg-red-500 shadow-lg shadow-red-200' : task.status === 'running' ? 'bg-emerald-500 animate-ping' : 'bg-zinc-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'running' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          {task.status === 'running' ? 'Protocol Active' : task.status === 'idle' ? 'Standby' : 'Mission Terminated'}
                        </span>
                      </div>
                      <h4 className={`text-2xl font-black tracking-tighter mb-4 ${task.status === 'running' ? 'text-zinc-900' : task.status === 'success' ? 'text-emerald-800' : task.status === 'failed' ? 'text-red-800' : 'text-zinc-800'}`}>{task.text}</h4>
                      <div className={`flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${task.status === 'running' ? 'text-emerald-700' : 'text-zinc-500'}`}>
                        <span className="flex items-center bg-white/60 px-4 py-2 rounded-2xl border border-white shadow-sm"><Clock className="w-4 h-4 mr-2" /> {Math.floor(task.totalSeconds / 60)} MINS</span>
                        {task.status === 'idle' && <span className="flex items-center bg-zen-mint text-emerald-800 px-4 py-2 rounded-2xl border border-white shadow-sm">Target: {task.expectedXp} XP</span>}
                        {task.status === 'success' && <span className="flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl border border-white shadow-sm">Earned: +{task.xpEarned} XP</span>}
                        {task.status === 'failed' && <span className="flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-2xl border border-white shadow-sm">Penalty: {task.xpEarned} XP</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-8 md:mt-0 relative z-10">
                      {task.status === 'idle' && store.activeTimerId !== task.id && (
                        <motion.button 
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => store.startTimer(task.id)} 
                          className="bg-zinc-900 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3"
                        >
                          <Play className="w-4 h-4 fill-white" /> Start
                        </motion.button>
                      )}
                      {task.status === 'running' && (
                        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] px-6 py-3 flex items-center gap-4 border-2 border-white shadow-xl">
                          <div className="w-5 h-5 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em]">Executing</span>
                        </div>
                      )}
                      {(task.status === 'success' || task.status === 'failed') && (
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner border-2 border-white ${task.status === 'success' ? 'bg-zen-mint text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {task.status === 'success' ? <Trophy className="w-8 h-8" /> : <FrownIcon className="w-8 h-8" />}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Rewards Sidebar */}
      <div className="w-full lg:w-[420px] bg-white/70 backdrop-blur-xl border-l border-zen-mint-dark/10 overflow-y-auto custom-scrollbar p-10 flex flex-col gap-10">
        
        {/* Collection Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <Gift className="w-5 h-5" /> Collection
            </h3>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-zen-mint px-3 py-1 rounded-full">Exchange</span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <RewardItem 
              icon={Coins} label="เหรียญทองแดง" count={rewards.bronzeCoins} 
              color="text-orange-600" bgColor="bg-zen-peach/40" requirement="10 ถ้วย"
              onClick={() => handleExchange('bronzeCoin', 'เหรียญทองแดง', Coins)}
              disabled={rewards.trophies < 10 && rewards.bronzeCoins === 0}
            />
            <div className="grid grid-cols-2 gap-5">
              <RewardItem 
                icon={Coins} label="เหรียญเงิน" count={rewards.silverCoins} 
                color="text-zinc-500" bgColor="bg-zinc-100" requirement="3 ทองแดง"
                onClick={() => handleExchange('silverCoin', 'เหรียญเงิน', Coins)}
                disabled={rewards.bronzeCoins < 3 && rewards.silverCoins === 0}
              />
              <RewardItem 
                icon={Coins} label="เหรียญทอง" count={rewards.goldCoins} 
                color="text-yellow-600" bgColor="bg-yellow-50" requirement="5 เงิน"
                onClick={() => handleExchange('goldCoin', 'เหรียญทอง', Coins)}
                disabled={rewards.silverCoins < 5 && rewards.goldCoins === 0}
              />
            </div>
            <RewardItem 
              icon={Shield} label="โล่ดาวเงิน" count={rewards.silverShields} 
              color="text-blue-600" bgColor="bg-zen-blue/40" requirement="7 ทอง"
              onClick={() => handleExchange('silverShield', 'โล่ดาวสีเงิน', Shield, true)}
              disabled={rewards.goldCoins < 7 && rewards.silverShields === 0}
              isShield={true}
            />
            <RewardItem 
              icon={Crown} label="มงกุฏทอง" count={rewards.goldCrowns} 
              color="text-purple-600" bgColor="bg-zen-purple/40" requirement="3 ดาวเงิน"
              onClick={() => handleExchange('goldCrown', 'มงกุฏสีทอง', Crown)}
              disabled={rewards.silverShields < 3 && rewards.goldCrowns === 0}
            />
          </div>
        </div>

        {/* Recent History */}
        <div className="mt-auto space-y-6 pt-10 border-t border-zen-mint-dark/10">
           <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <Calendar className="w-5 h-5" /> Achievement Log
            </h3>
            <div className="space-y-4">
              {rewards.history.slice(0, 5).map(log => {
                let LogIcon = Check;
                let iconColor = "text-emerald-600 bg-zen-mint";
                if (log.item === "เหรียญทองแดง") { LogIcon = Coins; iconColor = "text-orange-600 bg-zen-peach/40"; }
                else if (log.item === "เหรียญเงิน") { LogIcon = Coins; iconColor = "text-zinc-500 bg-zinc-100"; }
                else if (log.item === "เหรียญทอง") { LogIcon = Coins; iconColor = "text-yellow-600 bg-yellow-50"; }
                else if (log.item === "โล่ดาวสีเงิน") { LogIcon = Shield; iconColor = "text-blue-600 bg-zen-blue/40"; }
                else if (log.item === "มงกุฏสีทอง") { LogIcon = Crown; iconColor = "text-purple-600 bg-zen-purple/40"; }

                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={log.id} className="flex items-center gap-4 p-4 bg-white/50 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${iconColor}`}>
                      {log.item === "โล่ดาวสีเงิน" ? <StarShield className="w-5 h-5" /> : <LogIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-zinc-800">แลก {log.item} สำเร็จ!</div>
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">{new Date(log.timestamp).toLocaleDateString('th-TH')}</div>
                    </div>
                  </motion.div>
                );
              })}
              {rewards.history.length === 0 && (
                <div className="text-center py-10 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] border-4 border-dashed border-zinc-50 rounded-[3rem]">
                  ยังไม่มีประวัติการแลกรางวัล
                </div>
              )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default WorkspaceView;
