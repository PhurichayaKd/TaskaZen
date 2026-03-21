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
    className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 relative group 
      ${disabled ? 'bg-zinc-50 border-zinc-100 opacity-40 grayscale' : `${bgColor} border-white shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-95`}
    `} 
    onClick={!disabled ? onClick : undefined}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${color} ${!disabled && 'animate-pulse-slow'}`}>
      {isShield ? <StarShield className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
    </div>
    <div className="text-center">
      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black text-zinc-800 tabular-nums">{count}</div>
    </div>
    {!disabled && requirement && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
        แลก {requirement}
      </div>
    )}
    {disabled && requirement && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
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
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-purple-50/30 font-sans">
      
      {/* Celebration Animation Overlay */}
      <AnimatePresence>
        {celebration && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 1.5, opacity: 0 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-indigo-100 flex flex-col items-center gap-6 relative"
            >
              <div className="absolute -top-12 -left-12 text-yellow-400 animate-bounce"><Sparkles className="w-24 h-24" /></div>
              <div className="absolute -bottom-12 -right-12 text-indigo-400 animate-pulse"><Gift className="w-24 h-24" /></div>
              
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-4 transform rotate-6">
                {celebration.isShield ? <StarShield className="w-16 h-16 text-white" /> : <celebration.icon className="w-16 h-16 text-white" />}
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-black text-zinc-900 mb-2 uppercase tracking-tight">ยินดีด้วย!</h2>
                <p className="text-xl font-bold text-indigo-600">คุณได้รับ {celebration.label} ใหม่!</p>
              </div>
              <motion.div 
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-4"
              >
                <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-lg font-black flex items-center gap-2">
                  <Check className="w-6 h-6" /> เก็บเข้าคอลเลกชันแล้ว
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Tasks & Missions */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <Gamepad2 className="w-8 h-8 text-white" /> 
              </div>
              <div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase leading-none mb-1">Missions</h2>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Time Challenge Mode</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white border-2 border-indigo-50 px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active: {store.workspaceTasks.filter(t => t.status === 'running').length}</span>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-purple-100 relative overflow-hidden">
            <form onSubmit={handleAddTimer} className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2"><Target className="w-3 h-3" /> Mission Objective</label>
                <input 
                  type="text" value={taskText} onChange={e => setTaskText(e.target.value)} required
                  placeholder="What is your next challenge?"
                  className="w-full p-4 border-2 border-zinc-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-zinc-50/50 text-lg font-black transition-all placeholder:text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Clock className="w-3 h-3" /> Time Protocol</label>
                  <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl">
                    <button type="button" onClick={() => setMode('minutes')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === 'minutes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                      Countdown
                    </button>
                    <button type="button" onClick={() => setMode('range')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === 'range' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                      Schedule
                    </button>
                  </div>
                  
                  {mode === 'minutes' ? (
                    <div className="flex items-center gap-3 bg-zinc-50/50 p-2 rounded-2xl border-2 border-zinc-100">
                      <input 
                        type="number" min="1" value={minutesStr} onChange={e => setMinutesStr(e.target.value)} required
                        className="w-full p-2 bg-white border-0 rounded-xl text-center text-xl font-black focus:ring-0 text-indigo-600 shadow-sm"
                      />
                      <span className="text-zinc-400 font-black pr-4 uppercase text-[10px] tracking-widest">Mins</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-zinc-50/50 p-2 rounded-2xl border-2 border-zinc-100">
                      <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} required className="w-full p-2 bg-white border-0 rounded-xl text-center text-sm font-black focus:ring-0 shadow-sm" /> 
                      <span className="text-zinc-300 font-black px-1">-</span>
                      <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} required className="w-full p-2 bg-white border-0 rounded-xl text-center text-sm font-black focus:ring-0 shadow-sm" /> 
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="w-3 h-3" /> Expected XP</label>
                  <div className="bg-zinc-50/50 p-4 rounded-2xl border-2 border-zinc-100 h-[104px] flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" min="1" value={expectedXpInput} onChange={e => setExpectedXpInput(e.target.value)} required
                        className="w-20 p-2 bg-white border-0 rounded-xl text-center text-xl font-black focus:ring-0 text-indigo-600 shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-zinc-900 font-black uppercase text-xs tracking-widest">XP Points</span>
                        <span className="text-zinc-400 font-bold text-[9px]">Max allowed: {Math.min(100, Math.max(5, Math.floor((mode === 'minutes' ? parseInt(minutesStr) || 0 : 30) * 60 / 60)))} XP</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-2 font-medium leading-tight">
                      *หากทำภารกิจไม่สำเร็จ คะแนนจะถูกหักตามจำนวน XP ที่ตั้งไว้
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 border-0 transition-all active:scale-[0.98] uppercase tracking-[0.2em] group/btn">
                <Plus className="w-5 h-5 mr-3 stroke-[3] group-hover:rotate-90 transition-transform duration-300" /> Accept Mission
              </Button>
            </form>
          </motion.div>

          {/* List of Tasks */}
          {store.workspaceTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <ListTree className="w-3 h-3" /> Mission Log
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {store.workspaceTasks.map(task => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id} className={`p-5 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between transition-all duration-300 group relative overflow-hidden
                    ${task.status === 'running' ? 'bg-indigo-50 border-indigo-200 shadow-md' : 
                      task.status === 'idle' ? 'bg-white border-zinc-100 shadow-sm hover:border-indigo-100' : 'bg-white/50 border-zinc-100 opacity-70 grayscale-[0.2]'}
                  `}>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'success' ? 'bg-emerald-500' : task.status === 'failed' ? 'bg-red-500' : task.status === 'running' ? 'bg-indigo-500 animate-ping' : 'bg-zinc-300'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${task.status === 'running' ? 'text-indigo-600' : 'text-zinc-400'}`}>
                          {task.status === 'running' ? 'Active Protocol' : task.status === 'idle' ? 'Standby' : 'Terminated'}
                        </span>
                      </div>
                      <h4 className={`text-lg font-black tracking-tight mb-2 ${task.status === 'running' ? 'text-indigo-900' : task.status === 'success' ? 'text-emerald-700' : task.status === 'failed' ? 'text-red-700' : 'text-zinc-800'}`}>{task.text}</h4>
                      <div className={`flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest ${task.status === 'running' ? 'text-indigo-500' : 'text-zinc-500'}`}>
                        <span className="flex items-center bg-black/5 px-2 py-1 rounded-lg"><Clock className="w-3 h-3 mr-1" /> {Math.floor(task.totalSeconds / 60)} MINS</span>
                        {task.status === 'idle' && <span className="flex items-center bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Target: {task.expectedXp} XP</span>}
                        {task.status === 'success' && <span className="flex items-center bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Earned: +{task.xpEarned} XP</span>}
                        {task.status === 'failed' && <span className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-lg">Penalty: {task.xpEarned} XP</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 md:mt-0 relative z-10">
                      {task.status === 'idle' && store.activeTimerId !== task.id && (
                        <button 
                          onClick={() => store.startTimer(task.id)} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Play className="w-3 h-3 fill-white" /> Start
                        </button>
                      )}
                      {task.status === 'running' && (
                        <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-3 border border-indigo-100 shadow-sm">
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          <span className="text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em]">Running</span>
                        </div>
                      )}
                      {(task.status === 'success' || task.status === 'failed') && (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${task.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {task.status === 'success' ? <Trophy className="w-6 h-6" /> : <FrownIcon className="w-6 h-6" />}
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
      <div className="w-full lg:w-[380px] bg-white border-l border-zinc-200 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
        
        {/* Collection Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Gift className="w-4 h-4" /> คอลเลกชันรางวัล
            </h3>
            <span className="text-[10px] font-black text-indigo-500 uppercase">แลกเปลี่ยนรางวัลได้ที่นี่</span>
          </div>

          <div className="flex flex-col gap-4 items-center">
            {/* Row 1: Bronze Coin */}
            <div className="w-48">
              <RewardItem 
                icon={Coins} label="เหรียญทองแดง" count={rewards.bronzeCoins} 
                color="text-orange-600" bgColor="bg-orange-50" requirement="10 ถ้วย"
                onClick={() => handleExchange('bronzeCoin', 'เหรียญทองแดง', Coins)}
                disabled={rewards.trophies < 10 && rewards.bronzeCoins === 0}
              />
            </div>
            
            {/* Row 2: Silver & Gold */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <RewardItem 
                icon={Coins} label="เหรียญเงิน" count={rewards.silverCoins} 
                color="text-zinc-400" bgColor="bg-zinc-100" requirement="3 ทองแดง"
                onClick={() => handleExchange('silverCoin', 'เหรียญเงิน', Coins)}
                disabled={rewards.bronzeCoins < 3 && rewards.silverCoins === 0}
              />
              <RewardItem 
                icon={Coins} label="เหรียญทอง" count={rewards.goldCoins} 
                color="text-yellow-500" bgColor="bg-yellow-50" requirement="5 เงิน"
                onClick={() => handleExchange('goldCoin', 'เหรียญทอง', Coins)}
                disabled={rewards.silverCoins < 5 && rewards.goldCoins === 0}
              />
            </div>

            {/* Row 3: Silver Star Shield */}
            <div className="w-48">
              <RewardItem 
                icon={Shield} label="โล่ดาวเงิน" count={rewards.silverShields} 
                color="text-indigo-400" bgColor="bg-indigo-50" requirement="7 ทอง"
                onClick={() => handleExchange('silverShield', 'โล่ดาวสีเงิน', Shield, true)}
                disabled={rewards.goldCoins < 7 && rewards.silverShields === 0}
                isShield={true}
              />
            </div>

            {/* Row 4: Gold Crown */}
            <div className="w-48">
              <RewardItem 
                icon={Crown} label="มงกุฏทอง" count={rewards.goldCrowns} 
                color="text-yellow-600" bgColor="bg-yellow-100" requirement="3 ดาวเงิน"
                onClick={() => handleExchange('goldCrown', 'มงกุฏสีทอง', Crown)}
                disabled={rewards.silverShields < 3 && rewards.goldCrowns === 0}
              />
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="mt-auto space-y-4 pt-6 border-t border-zinc-100">
           <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4" /> ประวัติความสำเร็จ
            </h3>
            <div className="space-y-3">
              {rewards.history.slice(0, 5).map(log => {
                let LogIcon = Check;
                let iconColor = "text-indigo-600 bg-indigo-100";
                if (log.item === "เหรียญทองแดง") { LogIcon = Coins; iconColor = "text-orange-600 bg-orange-100"; }
                else if (log.item === "เหรียญเงิน") { LogIcon = Coins; iconColor = "text-zinc-500 bg-zinc-200"; }
                else if (log.item === "เหรียญทอง") { LogIcon = Coins; iconColor = "text-yellow-600 bg-yellow-100"; }
                else if (log.item === "โล่ดาวสีเงิน") { LogIcon = Shield; iconColor = "text-indigo-500 bg-indigo-100"; }
                else if (log.item === "มงกุฏสีทอง") { LogIcon = Crown; iconColor = "text-yellow-600 bg-yellow-100"; }

                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                      {log.item === "โล่ดาวสีเงิน" ? <StarShield className="w-4 h-4" /> : <LogIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-800">แลก {log.item} สำเร็จ!</div>
                      <div className="text-[9px] text-zinc-400 font-medium uppercase tracking-tighter">{new Date(log.timestamp).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                );
              })}
              {rewards.history.length === 0 && (
                <div className="text-center py-6 text-[10px] font-bold text-zinc-300 uppercase tracking-widest border-2 border-dashed border-zinc-100 rounded-3xl">
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
