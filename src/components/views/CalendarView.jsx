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
    <div className={`flex-1 overflow-hidden transition-all duration-300 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 ${viewMode === 'view' ? 'max-w-[1600px]' : 'max-w-7xl justify-center'}`}>
      <div className={`transition-all duration-300 h-full flex flex-col ${viewMode === 'view' ? 'w-2/3 max-w-5xl' : 'w-full'}`}>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col flex-1 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 flex-shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">{monthYearStr}</h2>
              <p className="text-sm text-zinc-500 mt-1 hidden sm:block">จัดการตารางเวลาและบล็อกเวลาของคุณ</p>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-50 p-1 rounded-lg border border-zinc-200">
              <Button variant="ghost" size="icon" onClick={() => setMonth(-1)} className="h-8 w-8 rounded-md">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={setToday} className="h-8 font-semibold text-zinc-700">วันนี้</Button>
              <Button variant="ghost" size="icon" onClick={() => setMonth(1)} className="h-8 w-8 rounded-md">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-px mb-2">
              {weekDays.map(day => <div key={day} className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2">{day}</div>)}
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
                    className={`relative min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 rounded-xl border transition-all cursor-pointer group flex flex-col ${_isToday ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm'} ${isActive ? 'ring-2 ring-indigo-600 ring-offset-1 sm:ring-offset-2 border-transparent z-10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-semibold rounded-full ${_isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-700 group-hover:bg-zinc-100'} ${isActive && !_isToday ? 'bg-indigo-100 text-indigo-700' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasTasks && (
                        <div className="flex gap-0.5">
                          {Array.from(new Set(dayData.tasks.map(t => t.color || 'zinc'))).slice(0,3).map((c, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${colorMap[c].main}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-2 flex flex-col gap-1">
                      {hasTasks && (
                        <div className="text-[9px] sm:text-[10px] font-medium text-zinc-500 flex items-center bg-zinc-50 px-1 py-0.5 rounded border border-zinc-100 truncate">
                          <Check className="w-2.5 h-2.5 mr-0.5 sm:mr-1 text-emerald-500 flex-shrink-0" /> 
                          <span className="truncate">{dayData.tasks.filter(t=>t.completed).length}/{dayData.tasks.length}</span>
                        </div>
                      )}
                      {hasNotes && (
                        <div className="w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
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
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm h-full p-6 flex flex-col overflow-hidden">
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
