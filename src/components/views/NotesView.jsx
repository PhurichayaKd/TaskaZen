import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronLeft, ChevronRight, History, Trash2, Edit3, Sparkles, Loader2, 
  Type, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, List,
  Highlighter, ArrowUpRight, Image as ImageIcon, Link as LinkIcon, Download,
  Layout, FileText, Monitor, Bell, Check, X, MoreHorizontal, Square, Circle as CircleIcon,
  MousePointer2, Type as TypeIcon, Lock, Unlock, Underline
} from 'lucide-react';
import Button from '../ui/Button';
import { fetchWithRetry } from '../../utils/apiUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const templates = [
  { id: 'blank', label: 'หน้าว่าง (Blank)', desc: 'เริ่มต้นจากความว่างเปล่า', icon: FileText },
  { id: 'notebook', label: 'สมุดมีเส้น (Notebook)', desc: 'มีเส้นบรรทัดสำหรับจดบันทึก', icon: List },
  { id: 'slide', label: 'สไลด์ (Slide)', desc: 'รูปแบบการนำเสนอแนวนอน', icon: Monitor },
  { id: 'reminder', label: 'การแจ้งเตือน (Reminder)', desc: 'บันทึกที่จะแสดงในหน้าหลัก', icon: Bell },
];

const NotesView = ({ store }) => {
  const { notes, addNote, updateNote, deleteNote, images, addImage, deleteImage } = store;
  const [currentIndex, setCurrentIndex] = useState(notes.length - 1);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [aiSummary, setAiSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [direction, setDirection] = useState(0);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [showColorPicker, setShowColorPicker] = useState(null); // 'text' | 'highlight' | 'box'
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showBoxMenu, setShowBoxMenu] = useState(false);
  const [showImageGallery, setShowBoxImageGallery] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '' });
  
  const paperRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentNote = notes[currentIndex] || notes[0];

  const filteredNotes = notes.filter(n => historyFilter === 'all' || n.template === historyFilter);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      addImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const insertImage = (url) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const imgHtml = `<img src="${url}" style="max-width: 100%; border-radius: 12px; margin: 12px 0;" />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleEditorChange();
    }
  };

  const insertLink = () => {
    if (!linkData.url) return;
    if (editorRef.current) {
      editorRef.current.focus();
      const linkHtml = `<a href="${linkData.url}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: bold;">${linkData.text || linkData.url}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      handleEditorChange();
      setShowLinkDialog(false);
      setLinkData({ url: '', text: '' });
    }
  };

  useEffect(() => {
    if (currentIndex >= notes.length) {
      setCurrentIndex(notes.length - 1);
    }
  }, [notes.length]);

  // Keep editor content in sync with store
  useEffect(() => {
    if (editorRef.current && !showHistory) {
      if (editorRef.current.innerHTML !== currentNote.content) {
        editorRef.current.innerHTML = currentNote.content;
      }
    }
  }, [currentNote.id, showHistory]);

  const execCommand = (command, value = null) => {
    // Focus back to editor or active floating box before executing
    if (activeBoxId) {
      const boxElement = document.getElementById(`box-content-${activeBoxId}`);
      if (boxElement) boxElement.focus();
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
    
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, value);
    handleEditorChange();
  };

  const applyFontSize = (size) => {
    if (activeBoxId) {
      const boxElement = document.getElementById(`box-content-${activeBoxId}`);
      if (boxElement) boxElement.focus();
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
    
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    
    try {
      // Use extractContents to handle multi-node selection better than surroundContents
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
      
      // Reselect the span to keep focus
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch (e) {
      console.error('Failed to apply font size', e);
      // Fallback: wrap in span manually if possible
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach(f => {
        f.removeAttribute('size');
        f.style.fontSize = `${size}px`;
        // Change tag from font to span
        const newSpan = document.createElement('span');
        newSpan.style.fontSize = `${size}px`;
        newSpan.innerHTML = f.innerHTML;
        f.parentNode.replaceChild(newSpan, f);
      });
    }
    
    handleEditorChange();
    setShowFontSizePicker(false);
  };

  const handleEditorChange = () => {
    setSaveStatus('saving');
    const content = editorRef.current?.innerHTML || "";
    updateNote(currentNote.id, { content });
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleBoxContentChange = (boxId, newContent) => {
    setSaveStatus('saving');
    const updatedBoxes = currentNote.floatingBoxes.map(b => b.id === boxId ? { ...b, content: newContent } : b);
    updateNote(currentNote.id, { floatingBoxes: updatedBoxes });
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleNextPage = () => {
    if (currentIndex < notes.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAddPage = async (template = 'blank') => {
    const newId = await addNote(template);
    if (newId) {
      setDirection(1);
      // Find index of the newly added note
      const newIndex = notes.findIndex(n => n.id === newId);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      } else {
        // Fallback if not found yet (though addNote updates state)
        setCurrentIndex(notes.length);
      }
    }
    setShowTemplatePicker(false);
  };

  const handleExportPDF = async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TaskaZen-Note-${currentNote.id}.pdf`);
    } catch (error) {
      console.error('PDF Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddFloatingBox = () => {
    const newBox = {
      id: Date.now().toString(),
      x: 150, y: 150, content: 'พิมพ์ข้อความในกล่อง...', color: 'bg-white', isLocked: false
    };
    updateNote(currentNote.id, { floatingBoxes: [...(currentNote.floatingBoxes || []), newBox] });
    setActiveBoxId(newBox.id);
  };

  const updateFloatingBox = (boxId, updates) => {
    const updatedBoxes = currentNote.floatingBoxes.map(b => b.id === boxId ? { ...b, ...updates } : b);
    updateNote(currentNote.id, { floatingBoxes: updatedBoxes });
  };

  const deleteFloatingBox = (boxId) => {
    const updatedBoxes = currentNote.floatingBoxes.filter(b => b.id !== boxId);
    updateNote(currentNote.id, { floatingBoxes: updatedBoxes });
    if (activeBoxId === boxId) setActiveBoxId(null);
  };

  const toggleActiveBox = (boxId) => {
    if (activeBoxId === boxId) {
      setShowBoxMenu(!showBoxMenu);
    } else {
      setActiveBoxId(boxId);
      setShowBoxMenu(true);
    }
  };

  const handleAiSummarize = async () => {
    const text = editorRef.current?.innerText || "";
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setAiSummary('');
    try {
      const apiKey = localStorage.getItem('GEMINI_API_KEY') || "YOUR_API_KEY_HERE";
      const prompt = `ช่วยสรุปเนื้อหาในโน้ตนี้ให้สั้น กระชับ และได้ใจความสำคัญ: "${text}"`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const options = {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      };
      const data = await fetchWithRetry(url, options);
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setAiSummary(data.candidates[0].content.parts[0].text);
      }
    } catch (error) {
      setAiSummary('เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const colors = [
    { name: 'Black', hex: '#18181b', bg: 'bg-zinc-900' },
    { name: 'Indigo', hex: '#4f46e5', bg: 'bg-indigo-600' },
    { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-600' },
    { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-600' },
    { name: 'Red', hex: '#ef4444', bg: 'bg-red-600' },
  ];

  const highlights = [
    { name: 'None', hex: 'transparent', bg: 'bg-zinc-100 border' },
    { name: 'Yellow', hex: '#fef08a', bg: 'bg-yellow-200' },
    { name: 'Green', hex: '#bbf7d0', bg: 'bg-emerald-200' },
    { name: 'Blue', hex: '#bfdbfe', bg: 'bg-blue-200' },
    { name: 'Pink', hex: '#fbcfe8', bg: 'bg-pink-200' },
  ];

  const boxColors = [
    { name: 'White', bg: 'bg-white' },
    { name: 'Indigo', bg: 'bg-indigo-50' },
    { name: 'Yellow', bg: 'bg-yellow-50' },
    { name: 'Green', bg: 'bg-emerald-50' },
    { name: 'Pink', bg: 'bg-pink-50' },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 32, 48, 64];

  const pageVariants = {
    initial: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.98 }),
    animate: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.98, transition: { duration: 0.1, ease: "easeIn" } })
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 relative overflow-hidden font-sans">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-1">
          <Button variant={showHistory ? 'primary' : 'ghost'} size="sm" onClick={() => setShowHistory(!showHistory)} className="h-9 gap-2">
            <History className="w-4 h-4" /> ดูย้อนหลัง
          </Button>
          
          {showHistory && (
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 ml-4">
              {['all', ...templates.map(t => t.id)].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${historyFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          <div className="h-6 w-px bg-zinc-200 mx-2" />
          
          {!showHistory && (
              <div className="flex items-center gap-1">
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600" title="ตัวหนา"><Bold className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600" title="ตัวเอียง"><Italic className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600" title="ขีดเส้นใต้"><Underline className="w-4 h-4" /></button>
                
                <div className="relative">
                  <button onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" title="สีตัวอักษร"><Palette className="w-5 h-5" /></button>
                  {showColorPicker === 'text' && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl flex gap-2 z-50">
                      {colors.map(c => (
                        <button key={c.name} onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', c.hex); setShowColorPicker(null); }} className={`w-6 h-6 rounded-full ${c.bg} hover:scale-110 transition-all`} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" title="ไฮไลท์"><Highlighter className="w-5 h-5" /></button>
                  {showColorPicker === 'highlight' && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl flex gap-2 z-50">
                      {highlights.map(c => (
                        <button key={c.name} onMouseDown={(e) => { e.preventDefault(); execCommand('hiliteColor', c.hex); setShowColorPicker(null); }} className={`w-6 h-6 rounded-full ${c.bg} hover:scale-110 transition-all`} />
                      ))}
                    </div>
                  )}
                </div>

              <div className="relative">
                <button onClick={() => setShowFontSizePicker(!showFontSizePicker)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" title="ขนาดตัวอักษร"><Type className="w-5 h-5" /></button>
                {showFontSizePicker && (
                  <div className="absolute top-full left-0 mt-2 p-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 flex flex-col min-w-[70px] max-h-64 overflow-y-auto custom-scrollbar">
                    {fontSizes.map(size => (
                      <button key={size} onMouseDown={(e) => { e.preventDefault(); applyFontSize(size); }} className="px-3 py-2 text-xs text-left hover:bg-zinc-50 rounded-md font-medium border-b border-zinc-50 last:border-0">{size}px</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-zinc-100 mx-1" />
              <div className="relative group">
                <button onClick={handleAddFloatingBox} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600" title="เพิ่มกล่องข้อความ">
                  <div className="w-5 h-5 border-2 border-zinc-500 rounded-md flex items-center justify-center text-[11px] font-black bg-white group-hover:bg-zinc-50 transition-colors">A</div>
                </button>
              </div>
              
              {/* Box Color Picker (Only visible when box is active) */}
              <AnimatePresence>
                {activeBoxId && showBoxMenu && currentNote.floatingBoxes.find(b => b.id === activeBoxId) && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-1 ml-1 bg-zinc-50 p-1 rounded-xl border border-zinc-200 shadow-sm">
                    {boxColors.map(bc => (
                      <button key={bc.name} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); updateFloatingBox(activeBoxId, { color: bc.bg }); }} className={`w-5 h-5 rounded-lg ${bc.bg} border-2 ${currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.color === bc.bg ? 'border-indigo-400' : 'border-zinc-200'} hover:scale-110 transition-all`} />
                    ))}
                    <div className="w-px h-5 bg-zinc-200 mx-1" />
                    <button onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const box = currentNote.floatingBoxes.find(b => b.id === activeBoxId);
                      if (box) updateFloatingBox(activeBoxId, { isLocked: !box.isLocked });
                    }} className={`p-1.5 rounded-lg transition-all ${currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? 'text-indigo-600 bg-indigo-50 shadow-inner' : 'text-zinc-400 hover:text-zinc-600'}`} title={currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? "Unlock" : "Lock"}>
                      {currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400" title="ลูกศร (Coming Soon)"><ArrowUpRight className="w-5 h-5" /></button>
              
              <div className="relative">
                <button onClick={() => setShowBoxImageGallery(!showImageGallery)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" title="คลังภาพ"><ImageIcon className="w-5 h-5" /></button>
                {showImageGallery && (
                  <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-zinc-200 rounded-3xl shadow-2xl z-50 w-80">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Image Gallery</span>
                      <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"><Plus className="w-4 h-4" /></button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {images.map(img => (
                        <div key={img.id} className="relative group/img aspect-square rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                          <img 
                            src={img.url} 
                            onClick={() => { insertImage(img.url); setShowBoxImageGallery(false); }}
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" 
                          />
                          <button 
                            onClick={() => deleteImage(img.id)}
                            className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-md text-red-500 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {images.length === 0 && (
                        <div className="col-span-3 py-8 text-center text-[10px] font-bold text-zinc-300 uppercase">No Images</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowLinkDialog(!showLinkDialog)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" title="เพิ่มลิงก์"><LinkIcon className="w-5 h-5" /></button>
                {showLinkDialog && (
                  <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-zinc-200 rounded-3xl shadow-2xl z-50 w-72 space-y-3">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Add Link</div>
                    <input 
                      type="text" placeholder="URL (เช่น https://...)" 
                      value={linkData.url} onChange={e => setLinkData({...linkData, url: e.target.value})}
                      className="w-full p-2 text-xs border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input 
                      type="text" placeholder="ชื่อเรียก (ถ้ามี)" 
                      value={linkData.text} onChange={e => setLinkData({...linkData, text: e.target.value})}
                      className="w-full p-2 text-xs border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Button onClick={insertLink} variant="primary" size="sm" className="w-full h-8 rounded-xl text-[10px] font-black uppercase">Insert Link</Button>
                  </div>
                )}
              </div>

              <button onClick={handleExportPDF} disabled={isExporting} className="p-2 rounded-lg hover:bg-zinc-100 text-indigo-600" title="ส่งออก PDF">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              </button>

              <div className="h-6 w-px bg-zinc-200 mx-2" />
              <button onClick={handleAiSummarize} disabled={isAnalyzing} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100" title="AI สรุปใจความ">
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">AI ASSIST</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400 font-medium">{saveStatus === 'saving' ? 'Saving...' : 'Autosaved'}</div>
          <div className="relative">
            <Button variant="primary" size="sm" onClick={() => setShowTemplatePicker(!showTemplatePicker)} className="gap-2 h-9 rounded-xl shadow-md hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> เพิ่มหน้า
            </Button>
            {showTemplatePicker && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-zinc-200 rounded-3xl shadow-2xl p-4 z-50 grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {templates.map(t => (
                  <button key={t.id} onMouseDown={(e) => { e.preventDefault(); handleAddPage(t.id); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50/50 text-left group transition-all border border-transparent hover:border-indigo-100">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 shadow-sm group-hover:shadow transition-all"><t.icon className="w-6 h-6" /></div>
                    <div><p className="text-sm font-black text-zinc-800 group-hover:text-indigo-700">{t.label}</p><p className="text-[11px] text-zinc-400 font-medium group-hover:text-indigo-400">{t.desc}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-sm">
            <button onMouseDown={(e) => { e.preventDefault(); handlePrevPage(); }} disabled={currentIndex === 0} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 text-xs font-black text-zinc-500 flex items-center tracking-tighter">{currentIndex + 1} / {notes.length}</span>
            <button onMouseDown={(e) => { e.preventDefault(); handleNextPage(); }} disabled={currentIndex === notes.length - 1} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50 p-4 sm:p-12" 
        onMouseDown={() => { setActiveBoxId(null); setShowBoxMenu(false); }} // Close when clicking anywhere on background
      >
        <div className="max-w-[1400px] mx-auto min-h-full relative" onMouseDown={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait" custom={direction}>
            {!showHistory ? (
              <motion.div
                key={currentNote.id} ref={paperRef} custom={direction} initial="initial" animate="animate" exit="exit"
                variants={pageVariants}
                className={`w-full flex-1 bg-white shadow-2xl rounded-sm relative flex flex-col transition-all duration-500
                  ${currentNote.template === 'slide' ? 'aspect-[16/9] min-h-0' : 'min-h-[1400px]'}
                  ${currentNote.template === 'notebook' ? 'bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:100%_2.5rem] !leading-[2.5rem]' : ''}
                `}
                onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking on the paper
              >
                {currentNote.template === 'notebook' && <div className="absolute left-20 top-0 bottom-0 w-px bg-red-200 z-0" />}
                
                <div className={`p-16 sm:p-24 flex-1 flex flex-col z-10 ${currentNote.template === 'notebook' ? 'pl-32 pt-[3.8rem]' : ''}`}>
                  {/* Unified Content Area (Title + Body) */}
                  <div 
                    ref={editorRef} contentEditable onInput={handleEditorChange}
                    onFocus={() => { setActiveBoxId(null); setShowBoxMenu(false); }}
                    className={`flex-1 outline-none min-h-[800px] leading-relaxed ${currentNote.template === 'notebook' ? '!leading-[2.5rem]' : ''}`}
                    style={{ fontSize: '18px' }}
                  />

                  {/* Floating Boxes */}
                  {(currentNote.floatingBoxes || []).map(box => (
                    <motion.div
                      key={box.id}
                      drag={!box.isLocked}
                      dragMomentum={false}
                      dragElastic={0}
                      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                      onDragStart={() => setActiveBoxId(box.id)}
                      onDragEnd={(e, info) => {
                        const newX = box.x + info.offset.x;
                        const newY = box.y + info.offset.y;
                        updateFloatingBox(box.id, { x: newX, y: newY });
                      }}
                      onMouseDown={(e) => { 
                        e.stopPropagation(); 
                        toggleActiveBox(box.id);
                      }}
                      className={`absolute p-5 ${box.color} border-2 ${activeBoxId === box.id ? 'border-indigo-400 shadow-2xl z-40' : 'border-dashed border-zinc-200 z-20'} rounded-3xl shadow-xl min-w-[220px] group/box cursor-grab transition-all duration-200`}
                      style={{ left: box.x, top: box.y }}
                    >
                      <div 
                        id={`box-content-${box.id}`} contentEditable 
                        onInput={(e) => handleBoxContentChange(box.id, e.target.innerHTML)}
                        onFocus={() => { setActiveBoxId(box.id); setShowBoxMenu(true); }}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking text
                        dangerouslySetInnerHTML={{ __html: box.content }}
                        className="outline-none text-sm leading-relaxed min-h-[1.5em] empty:before:content-[attr(placeholder)] empty:before:text-zinc-300"
                        placeholder="พิมพ์ข้อความ..."
                      />
                      
                      {/* Drag Handle Indicator */}
                      {!box.isLocked && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/box:opacity-100 transition-all bg-white border border-zinc-200 rounded-full p-1 shadow-sm">
                          <MousePointer2 className="w-3 h-3 text-indigo-500 fill-indigo-50" />
                        </div>
                      )}

                      {/* Delete Button */}
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteFloatingBox(box.id); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center opacity-0 group-hover/box:opacity-100 transition-all shadow-sm hover:shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Lock Indicator Overlay */}
                      {box.isLocked && (
                        <div className="absolute top-2 right-2 text-zinc-300">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* AI Summary Panel */}
                  <AnimatePresence>
                    {aiSummary && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 relative">
                        <button onClick={() => setAiSummary('')} className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-500"><X className="w-5 h-5" /></button>
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-indigo-500"><Sparkles className="w-4 h-4" /> AI Summary</div>
                        <p className="text-sm text-indigo-900 leading-relaxed italic">{aiSummary}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredNotes.map((note, index) => {
                  const originalIndex = notes.findIndex(n => n.id === note.id);
                  return (
                    <div key={note.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-2xl transition-all group h-96 flex flex-col relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            {templates.find(t => t.id === note.template)?.icon && React.createElement(templates.find(t => t.id === note.template).icon, { className: "w-5 h-5" })}
                          </div>
                          <span className="text-[10px] font-black text-zinc-300 uppercase">PAGE {originalIndex + 1}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setCurrentIndex(originalIndex); setShowHistory(false); }} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => deleteNote(note.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 line-clamp-[10] italic flex-1" dangerouslySetInnerHTML={{ __html: note.content }} />
                      <div className="mt-6 pt-6 border-t border-zinc-50 text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                        {new Date(note.updatedAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotesView;
