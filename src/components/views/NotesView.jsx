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
    <div className="flex-1 flex flex-col h-full bg-zen-bg relative overflow-hidden font-sans">
      
      {/* Top Toolbar */}
      <div className="h-24 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)} 
            className={`h-12 px-6 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all ${showHistory ? 'bg-zen-navy text-white shadow-2xl' : 'bg-white text-zinc-400 hover:bg-zinc-50 border border-zinc-100 shadow-sm'}`}
          >
            <History className="w-4 h-4" /> Timeline
          </motion.button>
          
          {showHistory && (
            <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 ml-4 shadow-inner">
              {['all', ...templates.map(t => t.id)].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-5 py-2.5 text-[9px] font-black uppercase rounded-xl transition-all ${historyFilter === filter ? 'bg-white text-zen-navy shadow-lg border border-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          <div className="h-10 w-px bg-zinc-100 mx-4" />
          
          {!showHistory && (
              <div className="flex items-center gap-2">
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Bold"><Bold className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Italic"><Italic className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Underline"><Underline className="w-4 h-4" /></button>
                
                <div className="relative">
                  <button onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Text Color"><Palette className="w-5 h-5" /></button>
                  {showColorPicker === 'text' && (
                    <div className="absolute top-full left-0 mt-4 p-4 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-[2rem] shadow-2xl flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {colors.map(c => (
                        <button key={c.name} onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', c.hex); setShowColorPicker(null); }} className={`w-8 h-8 rounded-full ${c.bg} hover:scale-125 transition-all shadow-md ring-4 ring-white`} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Highlight"><Highlighter className="w-5 h-5" /></button>
                  {showColorPicker === 'highlight' && (
                    <div className="absolute top-full left-0 mt-4 p-4 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-[2rem] shadow-2xl flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {highlights.map(c => (
                        <button key={c.name} onMouseDown={(e) => { e.preventDefault(); execCommand('hiliteColor', c.hex); setShowColorPicker(null); }} className={`w-8 h-8 rounded-full ${c.bg} hover:scale-125 transition-all shadow-md ring-4 ring-white`} />
                      ))}
                    </div>
                  )}
                </div>

              <div className="relative">
                <button onClick={() => setShowFontSizePicker(!showFontSizePicker)} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Font Size"><Type className="w-5 h-5" /></button>
                {showFontSizePicker && (
                  <div className="absolute top-full left-0 mt-4 p-3 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-[2rem] shadow-2xl z-50 flex flex-col min-w-[120px] max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    {fontSizes.map(size => (
                      <button key={size} onMouseDown={(e) => { e.preventDefault(); applyFontSize(size); }} className="px-6 py-3 text-[10px] text-left hover:bg-zen-bg hover:text-zen-navy rounded-xl font-black transition-all border-b border-zinc-50/50 last:border-0">{size}px</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-10 w-px bg-zinc-100 mx-2" />
              <div className="relative group">
                <button onClick={handleAddFloatingBox} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Floating Box">
                  <div className="w-6 h-6 border-2 border-zinc-400 rounded-lg flex items-center justify-center text-[10px] font-black bg-white group-hover:bg-zen-blue group-hover:border-zen-navy transition-colors">A</div>
                </button>
              </div>
              
              <AnimatePresence>
                {activeBoxId && showBoxMenu && currentNote.floatingBoxes.find(b => b.id === activeBoxId) && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2 ml-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-zinc-100 shadow-2xl">
                    {boxColors.map(bc => (
                      <button key={bc.name} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); updateFloatingBox(activeBoxId, { color: bc.bg }); }} className={`w-7 h-7 rounded-lg ${bc.bg} border-2 ${currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.color === bc.bg ? 'border-zen-navy' : 'border-zinc-100'} hover:scale-110 transition-all shadow-sm`} />
                    ))}
                    <div className="w-px h-8 bg-zinc-100 mx-1" />
                    <button onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const box = currentNote.floatingBoxes.find(b => b.id === activeBoxId);
                      if (box) updateFloatingBox(activeBoxId, { isLocked: !box.isLocked });
                    }} className={`p-2.5 rounded-xl transition-all ${currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? 'text-zen-navy bg-zen-blue shadow-inner' : 'text-zinc-400 hover:text-zinc-600'}`} title={currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? "Unlock" : "Lock"}>
                      {currentNote.floatingBoxes.find(b => b.id === activeBoxId)?.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="p-3 rounded-xl text-zinc-200 transition-all cursor-not-allowed" title="Connector"><ArrowUpRight className="w-5 h-5" /></button>
              
              <div className="relative">
                <button onClick={() => setShowBoxImageGallery(!showImageGallery)} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Archive"><ImageIcon className="w-5 h-5" /></button>
                {showImageGallery && (
                  <div className="absolute top-full left-0 mt-4 p-8 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] z-50 w-[480px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-8 px-2">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Asset Archive</span>
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-2xl bg-zen-navy text-white hover:scale-105 transition-all shadow-xl shadow-blue-900/20"><Plus className="w-5 h-5" /></button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                      {images.map(img => (
                        <div key={img.id} className="relative group/img aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-zinc-50">
                          <img 
                            src={img.url} 
                            onClick={() => { insertImage(img.url); setShowBoxImageGallery(false); }}
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500" 
                          />
                          <button 
                            onClick={() => deleteImage(img.id)}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 opacity-0 group-hover/img:opacity-100 transition-all shadow-2xl hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {images.length === 0 && (
                        <div className="col-span-3 py-20 text-center text-[10px] font-black text-zinc-200 uppercase tracking-[0.4em] border-4 border-dashed border-zinc-50 rounded-[2.5rem]">Void</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowLinkDialog(!showLinkDialog)} className="p-3 rounded-xl hover:bg-zen-blue hover:text-zen-navy text-zinc-400 transition-all" title="Link"><LinkIcon className="w-5 h-5" /></button>
                {showLinkDialog && (
                  <div className="absolute top-full left-0 mt-4 p-8 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] z-50 w-[320px] space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Protocol Link</div>
                    <input 
                      type="text" placeholder="URL Endpoint" 
                      value={linkData.url} onChange={e => setLinkData({...linkData, url: e.target.value})}
                      className="w-full p-5 text-xs border-2 border-zinc-50 rounded-2xl focus:ring-8 focus:ring-zen-blue/20 focus:border-zen-blue outline-none bg-zinc-50/50 font-black transition-all"
                    />
                    <input 
                      type="text" placeholder="Link Alias" 
                      value={linkData.text} onChange={e => setLinkData({...linkData, text: e.target.value})}
                      className="w-full p-5 text-xs border-2 border-zinc-50 rounded-2xl focus:ring-8 focus:ring-zen-blue/20 focus:border-zen-blue outline-none bg-zinc-50/50 font-black transition-all"
                    />
                    <Button onClick={insertLink} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-zen-navy text-white hover:scale-[1.02] transition-transform shadow-2xl shadow-blue-900/20 border-0">Connect Link</Button>
                  </div>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleExportPDF} disabled={isExporting} className="p-3 rounded-xl hover:bg-zen-purple hover:text-zen-purple-dark text-purple-400 transition-all shadow-sm bg-white border border-zinc-50" title="Export PDF">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              </motion.button>

              <div className="h-10 w-px bg-zinc-100 mx-4" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAiSummarize} disabled={isAnalyzing} 
                className="h-12 px-6 rounded-2xl bg-white text-zinc-900 transition-all flex items-center gap-3 border-2 border-zinc-100 shadow-xl hover:border-zen-blue hover:shadow-blue-900/5" 
                title="AI Engine"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-zen-blue-dark" />}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:inline">Zen Intel</span>
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100 shadow-inner">
            <div className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Syncing...' : 'Encrypted'}</span>
          </div>
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTemplatePicker(!showTemplatePicker)} 
              className="h-12 px-8 rounded-2xl bg-zen-navy text-white flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> New Protocol
            </motion.button>
            {showTemplatePicker && (
              <div className="absolute top-full right-0 mt-6 w-[360px] bg-white border border-zinc-100 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] p-6 z-50 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-6 pb-4 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Blueprint Selector</div>
                {templates.map(t => (
                  <button key={t.id} onMouseDown={(e) => { e.preventDefault(); handleAddPage(t.id); }} className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-zen-blue/30 text-left group transition-all border border-transparent hover:border-white hover:shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center group-hover:text-zen-navy shadow-xl group-hover:scale-110 transition-all border border-zinc-50"><t.icon className="w-8 h-8" /></div>
                    <div><p className="text-sm font-black text-zinc-900 group-hover:text-zen-navy transition-colors">{t.label}</p><p className="text-[10px] text-zinc-400 font-bold group-hover:text-zen-navy/60 transition-colors mt-1">{t.desc}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 shadow-inner">
            <button onMouseDown={(e) => { e.preventDefault(); handlePrevPage(); }} disabled={currentIndex === 0} className="p-2.5 rounded-xl hover:bg-white disabled:opacity-20 transition-all text-zinc-400 hover:text-zinc-900 shadow-none hover:shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-6 flex items-center">
              <span className="text-xs font-black text-zinc-900 tracking-tighter tabular-nums">{currentIndex + 1}</span>
              <span className="mx-2 text-zinc-200 font-black">/</span>
              <span className="text-xs font-black text-zinc-300 tracking-tighter tabular-nums">{notes.length}</span>
            </div>
            <button onMouseDown={(e) => { e.preventDefault(); handleNextPage(); }} disabled={currentIndex === notes.length - 1} className="p-2.5 rounded-xl hover:bg-white disabled:opacity-20 transition-all text-zinc-400 hover:text-zinc-900 shadow-none hover:shadow-sm"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar bg-zen-bg p-6 sm:p-20 lg:p-32" 
        onMouseDown={() => { setActiveBoxId(null); setShowBoxMenu(false); }}
      >
        <div className="max-w-[1100px] mx-auto min-h-full relative" onMouseDown={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait" custom={direction}>
            {!showHistory ? (
              <motion.div
                key={currentNote.id} ref={paperRef} custom={direction} initial="initial" animate="animate" exit="exit"
                variants={pageVariants}
                className={`w-full flex-1 bg-white shadow-[0_50px_120px_-30px_rgba(0,0,0,0.06)] rounded-[1.5rem] relative flex flex-col transition-all duration-700 border border-zinc-100
                  ${currentNote.template === 'slide' ? 'aspect-[16/9] min-h-0' : 'min-h-[1600px]'}
                  ${currentNote.template === 'notebook' ? 'bg-[linear-gradient(#f1f5f9_1px,transparent_1px)] bg-[size:100%_3.5rem] !leading-[3.5rem]' : ''}
                `}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {currentNote.template === 'notebook' && <div className="absolute left-28 top-0 bottom-0 w-1 bg-red-50/50 z-0" />}
                
                <div className={`p-24 sm:p-40 flex-1 flex flex-col z-10 ${currentNote.template === 'notebook' ? 'pl-48 pt-[4.8rem]' : ''}`}>
                  {/* Unified Content Area (Title + Body) */}
                  <div 
                    ref={editorRef} contentEditable onInput={handleEditorChange}
                    onFocus={() => { setActiveBoxId(null); setShowBoxMenu(false); }}
                    className={`flex-1 outline-none min-h-[1200px] leading-relaxed font-medium text-zinc-800 ${currentNote.template === 'notebook' ? '!leading-[3.5rem]' : ''}`}
                    style={{ fontSize: '22px' }}
                  />

                  {/* Floating Boxes */}
                  {(currentNote.floatingBoxes || []).map(box => (
                    <motion.div
                      key={box.id}
                      drag={!box.isLocked}
                      dragMomentum={false}
                      dragElastic={0}
                      whileDrag={{ scale: 1.05, zIndex: 100 }}
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
                      className={`absolute p-8 ${box.color} border-4 ${activeBoxId === box.id ? 'border-zen-navy shadow-2xl z-40' : 'border-white shadow-xl z-20'} rounded-[3rem] min-w-[300px] group/box cursor-grab transition-all duration-500`}
                      style={{ left: box.x, top: box.y }}
                    >
                      <div 
                        id={`box-content-${box.id}`} contentEditable 
                        onInput={(e) => handleBoxContentChange(box.id, e.target.innerHTML)}
                        onFocus={() => { setActiveBoxId(box.id); setShowBoxMenu(true); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        dangerouslySetInnerHTML={{ __html: box.content }}
                        className="outline-none text-lg font-black leading-relaxed min-h-[1.5em] empty:before:content-[attr(placeholder)] empty:before:text-zinc-300 text-zinc-900"
                        placeholder="System input..."
                      />
                      
                      {!box.isLocked && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/box:opacity-100 transition-all bg-white border border-zinc-100 rounded-full p-2.5 shadow-2xl">
                          <MousePointer2 className="w-5 h-5 text-zen-navy fill-zen-blue" />
                        </div>
                      )}

                      <button 
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteFloatingBox(box.id); }}
                        className="absolute -top-4 -right-4 w-10 h-10 bg-white border border-zinc-50 text-zinc-300 hover:text-red-500 rounded-[1.25rem] flex items-center justify-center opacity-0 group-hover/box:opacity-100 transition-all shadow-2xl hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {box.isLocked && (
                        <div className="absolute top-6 right-6 text-zinc-200">
                          <Lock className="w-5 h-5" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* AI Summary Panel */}
                  <AnimatePresence>
                    {aiSummary && (
                      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="mt-20 p-12 bg-zinc-900 text-white rounded-[4rem] border-[12px] border-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] relative group">
                        <button onClick={() => setAiSummary('')} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
                        <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase tracking-[0.5em] text-zen-blue-dark"><Sparkles className="w-6 h-6" /> Zen Intel Summary</div>
                        <p className="text-2xl text-zinc-100 leading-relaxed font-black tracking-tight italic opacity-90">{aiSummary}</p>
                        <div className="absolute inset-0 bg-gradient-to-tr from-zen-blue-dark/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[3.5rem]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                {filteredNotes.map((note, index) => {
                  const originalIndex = notes.findIndex(n => n.id === note.id);
                  return (
                    <motion.div 
                      whileHover={{ y: -12, scale: 1.02 }}
                      key={note.id} className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] hover:shadow-blue-900/5 transition-all group h-[560px] flex flex-col relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-zen-blue group-hover:text-zen-navy transition-all duration-500 border border-zinc-100">
                            {templates.find(t => t.id === note.template)?.icon && React.createElement(templates.find(t => t.id === note.template).icon, { className: "w-7 h-7" })}
                          </div>
                          <span className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.4em] group-hover:text-zen-navy/30 transition-colors">Protocol {originalIndex + 1}</span>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-6 group-hover:translate-x-0 duration-500">
                          <button onClick={() => { setCurrentIndex(originalIndex); setShowHistory(false); }} className="p-4 bg-white hover:bg-zen-blue hover:text-zen-navy rounded-2xl transition-all shadow-xl border border-zinc-50"><Edit3 className="w-6 h-6" /></button>
                          <button onClick={() => deleteNote(note.id)} className="p-4 bg-white hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all shadow-xl border border-zinc-50"><Trash2 className="w-6 h-6" /></button>
                        </div>
                      </div>
                      <div className="text-lg text-zinc-400 line-clamp-[10] font-medium italic flex-1 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: note.content }} />
                      <div className="mt-10 pt-10 border-t border-zinc-50 text-[10px] font-black text-zinc-200 uppercase tracking-[0.3em] flex items-center justify-between group-hover:text-zinc-400 transition-colors">
                        <span>{new Date(note.updatedAt).toLocaleDateString('th-TH')}</span>
                        <span className="text-zen-blue-dark/20 font-black tracking-[0.5em]">{note.template}</span>
                      </div>
                    </motion.div>
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
