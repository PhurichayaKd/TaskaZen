import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar as CalendarIcon, Tag, Loader2, Sparkles, ListTree, Settings2, 
  Flag, Target, Flame, Feather, Zap, Palette, Clock, CornerDownRight, Check, Plus
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { colorMap, categoriesConfig } from '../ui/constants';
import TaskBadges from '../ui/TaskBadges';
import { formatDisplayDate } from '../../utils/dateUtils';
import { fetchWithRetry } from '../../utils/apiUtils';
import { AI_CONFIG, getAiUrl } from '../../utils/aiConfig';
import { supabase } from '../../utils/supabaseClient';

const DayPanel = ({ isOpen, onClose, date, initialData, onSave, store }) => {
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('work');
  const [tasks, setTasks] = useState([]);
  
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('medium');
  const [newTaskLevel, setNewTaskLevel] = useState('1');
  const [newTaskColor, setNewTaskColor] = useState('zinc');
  
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const [editingTask, setEditingTask] = useState(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editSubtaskText, setEditSubtaskText] = useState('');

  useEffect(() => {
    if (isOpen && date) {
      setNotes(initialData?.notes || '');
      setCategory(initialData?.category || 'work');
      setTasks(initialData?.tasks || []);
      setAiMessage('');
      setShowAdvanced(false);
      resetNewTaskForm();
      setEditingTask(null);
      setEditingSubtaskId(null);
    }
  }, [isOpen, date, initialData]);

  useEffect(() => {
    if (editingTask) {
      setNewTaskText(editingTask.text);
      setNewTaskTime(editingTask.time || '');
      setNewTaskPriority(editingTask.priority || 'medium');
      setNewTaskDifficulty(editingTask.difficulty || 'medium');
      setNewTaskLevel(editingTask.level || '1');
      setNewTaskColor(editingTask.color || 'zinc');
      setShowAdvanced(true);
    }
  }, [editingTask]);

  const resetNewTaskForm = () => {
    setNewTaskText('');
    setNewTaskTime('');
    setNewTaskPriority('medium');
    setNewTaskDifficulty('medium');
    setNewTaskLevel('1');
    setNewTaskColor('zinc');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? {
        ...t,
        text: newTaskText,
        time: newTaskTime,
        priority: newTaskPriority,
        difficulty: newTaskDifficulty,
        level: newTaskLevel,
        color: newTaskColor,
        category: category
      } : t));
      setEditingTask(null);
    } else {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        text: newTaskText, 
        time: newTaskTime, 
        priority: newTaskPriority,
        difficulty: newTaskDifficulty,
        level: newTaskLevel,
        color: newTaskColor,
        category: category,
        completed: false,
        subtasks: []
      }]);
    }
    resetNewTaskForm();
  };

  const cancelEditing = () => {
    setEditingTask(null);
    resetNewTaskForm();
    setShowAdvanced(false);
  };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const removeTask = (id) => setTasks(tasks.filter(t => t.id !== id));

  const addSubtask = (taskId, text) => {
    if (!text.trim()) return;
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: [...(t.subtasks || []), { id: Date.now().toString(), text, completed: false }] };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s) };
      }
      return t;
    }));
  };

  const removeSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) };
      }
      return t;
    }));
  };

  const startEditingTask = (task) => setEditingTask({ ...task });
  
  const handleSave = () => {
    onSave({ notes, category, tasks });
    onClose();
  };

  const handleAITaskBreakdown = async () => {
    if (!notes.trim()) {
      setAiMessage('กรุณาจดโน้ตก่อนให้ AI ช่วยวิเคราะห์ครับ');
      setTimeout(() => setAiMessage(''), 3000);
      return;
    }
    
    setIsGeneratingTasks(true);
    setAiMessage('');
    
    try {
      const systemPrompt = `คุณคือผู้ช่วยจัดการเวลาอัจฉริยะ จงอ่านข้อความ (Brain dump) และสกัดรายการสิ่งที่ต้องทำ (Tasks) ออกมาเป็น Checklist ย่อยๆ อย่างชาญฉลาด
      ข้อกำหนดในการวิเคราะห์:
      - text: ชื่องาน สั้นกระชับ เข้าใจง่าย
      - time: ต้องเป็นรูปแบบ HH:MM เท่านั้น (เช่น 09:00, 14:30) ห้ามใช้ตัวอักษรบรรยาย
      - priority: ประเมินจากบริบท (เช่น ด่วนมาก, ต้องเสร็จ, ลูกค้า -> ให้ตั้งค่าเป็น high, งานทั่วไป -> medium, ชิลๆ -> low)
      - difficulty: ประเมินความยากจากบริบท (เช่น งานซับซ้อน, โปรเจกต์ -> hard, งานทั่วไป -> medium, งานง่ายๆ, ซื้อของ -> easy)
      - level: ประเมินระดับพลังงานที่ต้องใช้ เป็นตัวเลข 1 ถึง 5 (1=น้อยสุด, 5=มากสุด)
      - color: เลือกสีให้สะท้อนถึงตัวงานอัตโนมัติ
      ตอบกลับมาในรูปแบบ JSON ตาม Schema ที่กำหนดเท่านั้น`;

      let generatedText = '';

      if (AI_CONFIG.USE_BACKEND) {
        // Option A: Backend Call - Using Supabase SDK for better security and URL handling
        const { data, error: invokeError } = await supabase.functions.invoke('gemini-ai', {
          method: 'POST', // Explicitly specify POST
          body: { 
            prompt: notes,
            systemInstruction: systemPrompt,
            useJson: true 
          }
        });

        if (invokeError) {
          console.error("AI Function Error:", invokeError);
          throw new Error(invokeError.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
        }

        if (!data || !data.text) {
          throw new Error("AI ไม่ได้ตอบกลับข้อมูลที่ต้องการ");
        }

        generatedText = data.text;
      } else {
        // Option B: Direct Client Call (Frontend - Less Secure)
        const apiKey = AI_CONFIG.GEMINI_API_KEY;
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
          setAiMessage('กรุณาใส่ API Key ในไฟล์ src/utils/aiConfig.js ก่อนครับ');
          setTimeout(() => setAiMessage(''), 4000);
          setIsGeneratingTasks(false);
          return;
        }
        
        const url = getAiUrl();
        console.log("Calling AI URL (Direct):", url.split('key=')[0] + 'key=HIDDEN'); // Log URL safely
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: notes }] }],
            system_instruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        };
        const res = await fetchWithRetry(url, options);
        generatedText = res.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
      
      if (generatedText) {
        const parsed = JSON.parse(generatedText);
        if (parsed.tasks && parsed.tasks.length > 0) {
          const newTasks = parsed.tasks.map(t => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(),
            time: t.time || '',
            priority: t.priority || 'medium',
            difficulty: t.difficulty || 'medium',
            level: t.level || '1',
            color: t.color || 'zinc',
            category: category, 
            completed: false,
            subtasks: []
          }));
          setTasks(prev => [...prev, ...newTasks]);
          setAiMessage('✨ สกัดงานและประเมินระดับสำเร็จ!');
        } else {
           setAiMessage('ไม่พบงานที่ชัดเจนจากโน้ตนี้');
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      if (error.message.includes('404')) {
        setAiMessage('ไม่พบ API Endpoint หรือ Model (404)');
      } else if (error.message.includes('403') || error.message.includes('401')) {
        setAiMessage('API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึง (403/401)');
      } else {
        setAiMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ' + error.message);
      }
    } finally {
      setIsGeneratingTasks(false);
      setTimeout(() => setAiMessage(''), 4000);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => (a.time || '2400').localeCompare(b.time || '2400'));
  const groupedTasks = categoriesConfig.map(cat => ({
    ...cat,
    items: sortedTasks.filter(t => (t.category || 'work') === cat.id)
  })).filter(cat => cat.items.length > 0);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60 z-40"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zen-dark-card shadow-2xl z-50 flex flex-col border-l border-zinc-200 dark:border-zen-dark-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zen-dark-border bg-white dark:bg-zen-dark-card flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{formatDisplayDate(date)}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5" /> รายละเอียดและแผนงาน
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full dark:text-zinc-400 dark:hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zen-dark-bg custom-scrollbar relative">
              <div className="p-6 pb-24 flex flex-col gap-8">
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" /> หมวดหมู่หลัก
                  </label>
                  <div className="flex gap-2">
                    {categoriesConfig.map((cat) => (
                      <button
                        key={cat.id} onClick={() => setCategory(cat.id)}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          category === cat.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zen-dark-border hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <cat.icon className="w-4 h-4 mr-2" /> <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300">บันทึกความคิดและโน้ต</label>
                  <textarea 
                    value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="วันนี้มีอะไรในหัวบ้าง จดไว้เลย..."
                    className="w-full h-24 p-3 text-sm border border-zinc-200 dark:border-zen-dark-border rounded-md bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleAITaskBreakdown} disabled={isGeneratingTasks} className="text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                      {isGeneratingTasks ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {isGeneratingTasks ? 'AI กำลังวิเคราะห์...' : '✨ ให้ AI สกัดงานจากโน้ต'}
                    </Button>
                    {aiMessage && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">{aiMessage}</span>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zen-dark-border pt-6">
                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center">
                      <ListTree className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" /> งานที่ต้องทำ (Tasks)
                    </label>
                    <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zen-dark-border">{tasks.length} รายการ</Badge>
                  </div>
                  
                  {/* Add Task Form */}
                  <form onSubmit={handleAddTask} className={`flex flex-col gap-3 p-4 border rounded-xl shadow-sm transition-all ${editingTask ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zen-dark-border'}`}>
                    {editingTask && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center"><Settings2 className="w-3 h-3 mr-1" /> กำลังแก้ไขงาน</span>
                        <button type="button" onClick={cancelEditing} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">ยกเลิก</button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input 
                        type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-28 p-2 text-sm border border-zinc-200 dark:border-zen-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                      />
                      <input 
                        type="text" placeholder="เพิ่มงานใหม่..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} required
                        className="flex-1 p-2 text-sm border border-zinc-200 dark:border-zen-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className={`text-xs flex items-center font-medium transition-colors ${showAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                        <Settings2 className="w-3 h-3 mr-1" /> {showAdvanced ? 'ซ่อนการตั้งค่า' : 'ตั้งค่าเพิ่มเติม (สี, ความยาก, ระดับพลังงาน)'}
                      </button>
                      <Button type="submit" size="sm" className={`h-8 shadow-sm ${editingTask ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}>
                        {editingTask ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />} 
                        {editingTask ? 'บันทึกการแก้ไข' : 'เพิ่มงาน'}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                           <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zen-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center"><Flag className="w-3 h-3 mr-1" /> ความสำคัญ</label>
                              <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-900/80 p-1 rounded-md border border-zinc-200 dark:border-zen-dark-border">
                                {[
                                  { id: 'high', label: 'สูง', activeClass: 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm border-red-200 dark:border-red-900/50' },
                                  { id: 'medium', label: 'กลาง', activeClass: 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm border-amber-200 dark:border-amber-900/50' },
                                  { id: 'low', label: 'ต่ำ', activeClass: 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border-blue-200 dark:border-blue-900/50' },
                                ].map(opt => (
                                  <button
                                    key={opt.id} type="button" onClick={() => setNewTaskPriority(opt.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded border transition-all ${newTaskPriority === opt.id ? opt.activeClass : 'border-transparent text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                                  >
                                    {newTaskPriority === opt.id && <Flag className="w-3 h-3" />} {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center"><Target className="w-3 h-3 mr-1" /> ความยาก</label>
                              <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-900/80 p-1 rounded-md border border-zinc-200 dark:border-zen-dark-border">
                                {[
                                  { id: 'hard', label: 'ยาก', icon: Flame, activeClass: 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm border-orange-200 dark:border-orange-900/50' },
                                  { id: 'medium', label: 'กลาง', icon: Target, activeClass: 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm border-amber-200 dark:border-amber-900/50' },
                                  { id: 'easy', label: 'ง่าย', icon: Feather, activeClass: 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border-emerald-200 dark:border-emerald-900/50' },
                                ].map(opt => (
                                  <button
                                    key={opt.id} type="button" onClick={() => setNewTaskDifficulty(opt.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded border transition-all ${newTaskDifficulty === opt.id ? opt.activeClass : 'border-transparent text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                                  >
                                    <opt.icon className="w-3 h-3" /> {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center"><Zap className="w-3 h-3 mr-1" /> ระดับพลังงาน (1-5)</label>
                              <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-900/80 p-1 rounded-md border border-zinc-200 dark:border-zen-dark-border">
                                {['1', '2', '3', '4', '5'].map(lvl => (
                                  <button
                                    key={lvl} type="button" onClick={() => setNewTaskLevel(lvl)}
                                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-bold rounded border transition-all ${newTaskLevel === lvl ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-indigo-200 dark:border-indigo-900/50' : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-600 dark:hover:text-zinc-400'}`}
                                  >
                                    {lvl}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center"><Palette className="w-3 h-3 mr-1" /> สีแท็ก</label>
                              <div className="flex items-center gap-2 h-[34px] px-2 bg-zinc-50 dark:bg-zinc-900/80 rounded-md border border-zinc-200 dark:border-zen-dark-border w-full justify-between">
                                {Object.keys(colorMap).map(colorKey => (
                                  <button 
                                    key={colorKey} type="button" onClick={() => setNewTaskColor(colorKey)}
                                    className={`w-5 h-5 rounded-full flex-shrink-0 transition-all ${colorMap[colorKey].main} ${newTaskColor === colorKey ? 'ring-2 ring-offset-1 ring-zinc-400 dark:ring-offset-zinc-900 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                                  />
                                ))}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* Task List */}
                  <div className="space-y-6 mt-4">
                    {groupedTasks.length === 0 ? (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8 border border-dashed border-zinc-200 dark:border-zen-dark-border rounded-xl bg-white dark:bg-zinc-900/30">ไม่มีงานที่กำหนดไว้สำหรับวันนี้</p>
                    ) : (
                      groupedTasks.map(group => (
                        <div key={group.id} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${group.color}`}>
                              <group.icon className="w-3 h-3 mr-1.5" /> {group.label}
                            </span>
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zen-dark-border" />
                          </div>

                          <div className="space-y-3">
                            {group.items.map(task => {
                              const colorTheme = colorMap[task.color || 'zinc'];
                              return (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={task.id} 
                                  className={`relative flex flex-col p-3 rounded-xl border-l-4 overflow-hidden transition-all group
                                    ${task.completed ? 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zen-dark-border border-l-zinc-300 dark:border-l-zinc-700' : `bg-white dark:bg-zen-dark-card shadow-sm border-y border-r border-y-zinc-200 border-r-zinc-200 dark:border-y-zen-dark-border dark:border-r-zen-dark-border border-l-${colorTheme.main.replace('bg-', '')}`}
                                  `}
                                >
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.completed ? 'bg-zinc-300' : colorTheme.main}`} />
                                  <div className="flex items-start justify-between pl-2">
                                    <div className="flex items-start gap-3 w-full">
                                      <button 
                                        onClick={() => toggleTask(task.id)}
                                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-600 dark:hover:border-indigo-500'}`}
                                      >
                                        {task.completed && <Check className="w-3 h-3" />}
                                      </button>
                                      <div className="flex-1 w-full min-w-0">
                                        <div className="flex justify-between items-start gap-2 w-full">
                                          <p 
                                            onClick={() => startEditingTask(task)} title="คลิกเพื่อแก้ไขรายละเอียด"
                                            className={`text-sm font-bold flex-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-1 -mx-1 rounded transition-colors ${task.completed ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}
                                          >
                                            {task.text}
                                          </p>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {task.time && (
                                              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-full flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> {task.time}
                                              </span>
                                            )}
                                            <button onClick={() => removeTask(task.id)} className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-1">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                        
                                        {!task.completed && <TaskBadges task={task} />}

                                        <div className="mt-2 pl-1 space-y-1.5">
                                          {(task.subtasks || []).map(sub => (
                                            <div key={sub.id} className="flex items-center gap-2 group/sub">
                                              <CornerDownRight className="w-3 h-3 text-zinc-300 flex-shrink-0" /> 
                                              <input 
                                                type="checkbox" checked={sub.completed} onChange={() => toggleSubtask(task.id, sub.id)}
                                                className="w-3.5 h-3.5 rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer flex-shrink-0"
                                              />
                                              <span className={`text-xs flex-1 ${sub.completed ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-600 dark:text-zinc-300'}`}>{sub.text}</span>
                                              <button onClick={() => removeSubtask(task.id, sub.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 flex-shrink-0"><X className="w-3 h-3" /></button>
                                            </div>
                                          ))}
                                          {!task.completed && (
                                            <div className="flex items-center gap-2 mt-1">
                                              <CornerDownRight className="w-3 h-3 text-zinc-200" /> 
                                              <input 
                                                type="text" placeholder="เพิ่มงานย่อย... (กด Enter)" 
                                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSubtask(task.id, e.target.value); e.target.value = ''; } }}
                                                className="text-xs bg-transparent border-none p-0 focus:ring-0 text-zinc-500 placeholder:text-zinc-300 w-full"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zen-dark-border bg-white dark:bg-zen-dark-card flex justify-end gap-3 z-10 shrink-0">
              <Button variant="outline" onClick={onClose} className="dark:text-zinc-400 dark:hover:bg-zinc-800">ปิด</Button>
              <Button variant="primary" onClick={handleSave}>บันทึกข้อมูล</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DayPanel;
