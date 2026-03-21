import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Eye, FileText, ListTree, CheckCircle2, Circle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { formatDateToString, isToday, isSameDay } from '../../utils/dateUtils';
import { colorMap } from '../ui/constants';
import DayPanel from '../overlays/DayPanel';
const ReadOnlyViewPanel = ({ date, data }) => {
  const tasks = data?.tasks || [];
  const notes = data?.notes || '';
  const dateTitle = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zen-dark-card">
      <div className="pb-6 border-b border-zinc-100 dark:border-zen-dark-border">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{dateTitle}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
          <Eye className="w-4 h-4 mr-1.5" /> โหมดอ่านอย่างเดียว
        </p>
        
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ความคืบหน้าของวัน</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zen-dark-border">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right">เสร็จ {completedTasks} จาก {tasks.length} งาน</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 space-y-8 pr-2 custom-scrollbar">
        {/* Notes View */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center">
            <FileText className="w-3.5 h-3.5 mr-2" /> บันทึกย่อ
          </h4>
          {notes ? (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zen-dark-border text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed italic">
              {notes}
            </div>
          ) : (
            <p className="text-sm text-zinc-300 dark:text-zinc-700 italic">ไม่มีบันทึกสำหรับวันนี้</p>
          )}
        </div>

        {/* Tasks View */}
        <div className="space-y-4 pb-8">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center">
            <ListTree className="w-3.5 h-3.5 mr-2" /> รายการงาน
          </h4>
          {tasks.length > 0 ? (
            <div className="space-y-2.5">
              {tasks.map(task => (
                <div key={task.id} className="flex gap-3 p-3 bg-white dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zen-dark-border shadow-sm">
                  {task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <Circle className="w-4 h-4 text-zinc-200 dark:text-zinc-500 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold dark:text-white ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>{task.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {task.time && <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded"><Clock className="w-2.5 h-2.5 mr-1" /> {task.time}</span>}
                      <div className={`w-1.5 h-1.5 rounded-full ${colorMap[task.color || 'zinc'].main}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zen-dark-border">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">ไม่มีงานในวันนี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
    <div className={`flex-1 overflow-hidden transition-all duration-300 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 dark:bg-zen-dark-bg ${viewMode === 'view' ? 'max-w-[1600px]' : 'max-w-7xl justify-center'}`}>
      <div className={`transition-all duration-300 h-full flex flex-col ${viewMode === 'view' ? 'w-2/3 max-w-5xl' : 'w-full'}`}>
        <div className="bg-white dark:bg-zen-dark-card rounded-xl border border-zinc-200 dark:border-zen-dark-border shadow-sm flex flex-col flex-1 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zen-dark-border flex-shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{monthYearStr}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 hidden sm:block">จัดการตารางเวลาและบล็อกเวลาของคุณ</p>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zen-dark-border">
              <Button variant="ghost" size="icon" onClick={() => setMonth(-1)} className="h-8 w-8 rounded-md dark:text-zinc-400 dark:hover:bg-zinc-800">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={setToday} className="h-8 font-semibold text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">วันนี้</Button>
              <Button variant="ghost" size="icon" onClick={() => setMonth(1)} className="h-8 w-8 rounded-md dark:text-zinc-400 dark:hover:bg-zinc-800">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-px mb-2">
              {weekDays.map(day => <div key={day} className="text-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pb-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {daysInMonth.map((date, index) => {
                if (!date) return <div key={`blank-${index}`} className="min-h-[80px] sm:min-h-[100px] p-2 bg-transparent" />;
                const dateStr = formatDateToString(date);
                const dayData = dayDataMap[dateStr] || { tasks: [], notes: '' };
                const hasTasks = dayData.tasks.length > 0;
                const hasNotes = dayData.notes.length > 0;
                const _isToday = isToday(date);
                const isActive = viewMode === 'view' ? isSameDay(date, displayViewDate) : (selectedDate && isSameDay(date, selectedDate));

                return (
                  <div 
                    key={index} onClick={() => setSelectedDate(date)} 
                    className={`relative min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 rounded-xl border transition-all cursor-pointer group flex flex-col ${_isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zen-dark-card border-zinc-100 dark:border-zen-dark-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'} ${isActive ? 'ring-2 ring-indigo-600 ring-offset-1 sm:ring-offset-2 dark:ring-offset-zen-dark-bg border-transparent z-10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-semibold rounded-full ${_isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-700 dark:text-zinc-200 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'} ${isActive && !_isToday ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasTasks && (
                        <div className="flex gap-0.5">
                          {Array.from(new Set(dayData.tasks.map(t => t.color || 'zinc'))).slice(0,3).map((c, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${colorMap[c].main} shadow-[0_0_4px_rgba(0,0,0,0.3)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-2 flex flex-col gap-1">
                      {hasTasks && (
                        <div className="text-[9px] sm:text-[10px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center bg-zinc-50 dark:bg-zinc-900/50 px-1 py-0.5 rounded border border-zinc-100 dark:border-zen-dark-border truncate">
                          <Check className="w-2.5 h-2.5 mr-0.5 sm:mr-1 text-emerald-500 flex-shrink-0" /> 
                          <span className="truncate">{dayData.tasks.filter(t=>t.completed).length}/{dayData.tasks.length}</span>
                        </div>
                      )}
                      {hasNotes && (
                        <div className="w-full h-1 bg-indigo-200 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
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
            transition={{ duration: 0.3, ease: "easeInOut" }} 
            className="h-[calc(100vh-8rem)] min-w-[320px] max-w-md hidden md:block"
          >
            <div className="bg-white dark:bg-zen-dark-card rounded-xl border border-zinc-200 dark:border-zen-dark-border shadow-sm h-full p-6 flex flex-col overflow-hidden">
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
        store={store}
      />
    </div>
  );
};

export default CalendarView;
