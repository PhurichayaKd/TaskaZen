import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Button from '../ui/Button';
import { formatDateToString, isToday, isSameDay } from '../../utils/dateUtils';
import { colorMap } from '../ui/constants';
import DayPanel from '../overlays/DayPanel';
import ReadOnlyViewPanel from '../overlays/ReadOnlyViewPanel';

const CalendarView = ({ store, viewMode }) => {
  const { currentDate, selectedDate, setSelectedDate, setMonth, setToday, dayDataMap, saveData } = store;

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: firstDay }, (_, i) => null);
    const daysArray = Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    return [...blanks, ...daysArray];
  }, [currentDate]);

  const monthYearStr = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(currentDate);
  const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const displayViewDate = selectedDate || new Date();
  const displayViewData = dayDataMap[formatDateToString(displayViewDate)];

  return (
    <div className={`flex-1 overflow-hidden transition-all duration-300 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 bg-zen-cream ${viewMode === 'view' ? 'max-w-[1600px]' : 'max-w-7xl justify-center'}`}>
      <div className={`transition-all duration-300 h-full flex flex-col ${viewMode === 'view' ? 'w-2/3 max-w-5xl' : 'w-full'}`}>
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] border border-white shadow-2xl shadow-zinc-200/50 flex flex-col flex-1 h-[calc(100vh-10rem)] overflow-hidden">
          <div className="flex items-center justify-between p-8 border-b border-zen-mint-dark/10 flex-shrink-0">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{monthYearStr}</h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1 hidden sm:block">จัดการตารางเวลาและบล็อกเวลาของคุณ</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-2xl border border-white shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => setMonth(-1)} className="h-10 w-10 rounded-xl hover:bg-zen-mint hover:text-emerald-600 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={setToday} className="h-10 px-4 font-black text-zinc-700 hover:bg-zen-mint hover:text-emerald-600 rounded-xl">วันนี้</Button>
              <Button variant="ghost" size="icon" onClick={() => setMonth(1)} className="h-10 w-10 rounded-xl hover:bg-zen-mint hover:text-emerald-600 transition-all">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-px mb-4">
              {weekDays.map(day => <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pb-3">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-3 sm:gap-4">
              {daysInMonth.map((date, index) => {
                if (!date) return <div key={`blank-${index}`} className="min-h-[90px] sm:min-h-[110px] p-2 bg-transparent" />;
                const dateStr = formatDateToString(date);
                const dayData = dayDataMap[dateStr] || { tasks: [], notes: '' };
                const hasTasks = dayData.tasks.length > 0;
                const hasNotes = dayData.notes.length > 0;
                const _isToday = isToday(date);
                const isActive = viewMode === 'view' ? isSameDay(date, displayViewDate) : (selectedDate && isSameDay(date, selectedDate));

                return (
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    key={index} onClick={() => setSelectedDate(date)} 
                    className={`relative min-h-[90px] sm:min-h-[110px] p-3 sm:p-4 rounded-[2rem] border transition-all cursor-pointer group flex flex-col ${_isToday ? 'bg-zen-mint/40 border-zen-mint-dark text-emerald-900 shadow-lg shadow-emerald-100/30' : 'bg-white border-zinc-100 hover:border-zen-mint-dark hover:shadow-xl'} ${isActive ? 'ring-4 ring-zen-mint-dark/30 border-zen-mint shadow-2xl z-10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-black rounded-2xl transition-all ${_isToday ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-700 group-hover:bg-zen-mint group-hover:text-emerald-600'} ${isActive && !_isToday ? 'bg-zen-mint text-emerald-700' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasTasks && (
                        <div className="flex gap-1 pt-1">
                          {Array.from(new Set(dayData.tasks.map(t => t.color || 'zinc'))).slice(0,3).map((c, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${colorMap[c].main} shadow-sm`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-3 flex flex-col gap-1.5">
                      {hasTasks && (
                        <div className="text-[10px] font-black text-zinc-500 flex items-center bg-zinc-50/50 px-2 py-1 rounded-xl border border-zinc-100/50 truncate backdrop-blur-sm">
                          <Check className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" /> 
                          <span className="truncate">{dayData.tasks.filter(t=>t.completed).length}/{dayData.tasks.length}</span>
                        </div>
                      )}
                      {hasNotes && (
                        <div className="w-full h-1.5 bg-zen-purple rounded-full overflow-hidden shadow-inner">
                          <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-full bg-purple-400 rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {viewMode === 'view' && (
          <motion.div 
            initial={{ opacity: 0, width: 0, x: 20 }} 
            animate={{ opacity: 1, width: '33.333333%', x: 0 }} 
            exit={{ opacity: 0, width: 0, x: 20 }} 
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
            className="h-[calc(100vh-10rem)] min-w-[360px] max-w-md hidden md:block"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-[3rem] border border-white shadow-2xl shadow-zinc-200/50 h-full p-8 flex flex-col overflow-hidden">
              <ReadOnlyViewPanel date={displayViewDate} data={displayViewData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DayPanel 
        isOpen={!!selectedDate && viewMode === 'custom'} 
        onClose={() => setSelectedDate(null)} 
        date={selectedDate} 
        initialData={selectedDate ? dayDataMap[formatDateToString(selectedDate)] : null} 
        onSave={(data) => { if (selectedDate) saveData(formatDateToString(selectedDate), data); }} 
      />
    </div>
  );
};

export default CalendarView;
