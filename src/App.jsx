import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar as CalendarIcon, LayoutDashboard, FileText, Menu, Edit3, Layout, PenLine, Sparkles, LogOut
} from 'lucide-react';
import { useStore } from './hooks/useStore';
import { supabase } from './utils/supabaseClient';
import HomeView from './components/views/HomeView';
import CalendarView from './components/views/CalendarView';
import WorkspaceView from './components/views/WorkspaceView';
import NotesView from './components/views/NotesView';
import LoginView from './components/views/LoginView';
import FloatingTimer from './components/overlays/FloatingTimer';
import CompletionAnimationOverlay from './components/overlays/CompletionAnimationOverlay';

export default function App() {
  const [session, setSession] = useState(null);
  const store = useStore(session);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('custom');
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleNav = (e) => {
      if (e.detail?.filter) {
        setActiveTab('notes');
        // We might need to pass this filter to NotesView, but for now just switching tab is a good start
      }
    };
    window.addEventListener('nav-to-notes', handleNav);
    return () => window.removeEventListener('nav-to-notes', handleNav);
  }, []);

  useEffect(() => {
    store.setSelectedDate(null);
  }, [viewMode, activeTab]);

  const menuItems = [
    { id: 'home', label: 'หน้าแรก', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'workspace', label: 'พื้นที่ทำงาน', icon: LayoutDashboard },
    { id: 'notes', label: 'จดบันทึก', icon: PenLine },
  ];

  const currentTabTitle = menuItems.find(item => item.id === activeTab)?.label || 'TaskaZen';

  if (!session) {
    return <LoginView />;
  }

  if (store.isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zen-bg gap-8">
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-2xl shadow-blue-900/10 border-4 border-zen-blue">
            <FileText className="w-12 h-12 text-zen-navy" />
          </div>
          <div className="absolute -top-4 -right-4">
            <Sparkles className="w-8 h-8 text-zen-blue-dark animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">กำลังเตรียมพื้นที่ Zen...</h2>
          <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-zinc-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-zen-blue-dark animate-ping" />
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">Securely Synchronizing Data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zen-bg overflow-hidden font-sans text-zinc-900 selection:bg-zen-blue selection:text-zen-navy relative">
      
      {/* SIDEBAR - REFINED FOR PRODUCTION */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 120 }}
        className="bg-white border-r border-zinc-100 h-screen flex flex-col flex-shrink-0 relative overflow-hidden z-20 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)]"
      >
        {/* Sidebar Brand */}
        <div className="h-32 flex items-center px-10 shrink-0">
          <div className={`flex items-center gap-6 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 bg-zen-navy rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl shadow-blue-900/20"
            >
              <FileText className="w-7 h-7 text-white" /> 
            </motion.div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex flex-col"
              >
                <span className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">
                  Taska<span className="text-zen-navy">Zen</span>
                </span>
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] mt-1">Version 2.0</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-12 px-6 space-y-4 custom-scrollbar">
          {isSidebarOpen && (
             <div className="px-6 pb-6 text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Main Protocol</div>
          )}
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-5 rounded-[2rem] transition-all duration-500 group relative ${
                activeTab === item.id 
                  ? 'bg-zen-blue text-zen-navy font-black shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]' 
                  : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
              } ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? item.label : ''}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/40 rounded-[2rem] border border-white/60"
                />
              )}
              <item.icon className={`w-7 h-7 flex-shrink-0 transition-all duration-500 relative z-10 ${activeTab === item.id ? 'text-zen-navy scale-110' : 'group-hover:text-zinc-900 group-hover:scale-110'}`} /> 
              {isSidebarOpen && (
                <span className="ml-6 truncate text-base font-bold tracking-tight relative z-10">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer / Profile */}
        <div className="p-10 border-t border-zinc-50 shrink-0 space-y-6">
           <button className={`w-full flex items-center p-4 rounded-[2rem] text-zinc-500 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-14 h-14 rounded-[1.5rem] bg-zen-bg text-zinc-800 flex items-center justify-center flex-shrink-0 shadow-inner border border-zinc-100 overflow-hidden relative group">
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-xs font-black">ME</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              {isSidebarOpen && (
                <div className="ml-5 flex flex-col items-start truncate">
                  <span className="text-base font-black text-zinc-900 tracking-tight leading-none mb-1">{session?.user?.user_metadata?.full_name || 'User'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zen-matcha-dark animate-pulse" />
                    <span className="text-[9px] text-zen-navy font-black uppercase tracking-[0.2em] opacity-60">Zen Operator</span>
                  </div>
                </div>
              )}
           </button>
           
           {isSidebarOpen && (
             <button 
               onClick={() => supabase.auth.signOut()}
               className="w-full flex items-center p-5 rounded-[1.5rem] text-zinc-300 hover:text-red-500 hover:bg-red-50/50 transition-all group"
             >
               <LogOut className="w-5 h-5 mr-5 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Terminate Session</span>
             </button>
           )}
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* HEADER - REFINED */}
        <header className="bg-white/70 backdrop-blur-2xl border-b border-zinc-50 h-32 flex items-center justify-between px-12 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-10">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-4 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 rounded-[1.5rem] transition-all shadow-sm border border-zinc-50"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] mb-1">Active Module</span>
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">{currentTabTitle}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            {activeTab === 'calendar' && (
              <div className="flex bg-zinc-50/50 p-2 rounded-[2rem] border border-zinc-100 shadow-inner backdrop-blur-md">
                <button 
                  onClick={() => setViewMode('custom')} 
                  className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-widest ${viewMode === 'custom' ? 'bg-white text-zen-navy shadow-xl border border-zinc-100' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  <Edit3 className="w-4 h-4" /> Edit Mode
                </button>
                <button 
                  onClick={() => setViewMode('view')} 
                  className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-widest ${viewMode === 'view' ? 'bg-white text-zen-navy shadow-xl border border-zinc-100' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  <Layout className="w-4 h-4" /> Overview
                </button>
              </div>
            )}
            {activeTab === 'home' && (
               <div className="hidden sm:flex items-center gap-5 bg-white px-8 py-4 rounded-[1.5rem] border border-zinc-50 shadow-sm">
                 <div className="relative">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                   <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-900 leading-none mb-0.5">PROTOCOL ONLINE</span>
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest leading-none">Security Active</span>
                 </div>
               </div>
            )}
          </div>
        </header>

        {/* Dynamic Views Rendering */}
        <main className="flex-1 overflow-hidden flex flex-col relative z-0">
          {activeTab === 'home' && <HomeView store={store} />}
          {activeTab === 'calendar' && <CalendarView store={store} viewMode={viewMode} />}
          {activeTab === 'workspace' && <WorkspaceView store={store} />}
          {activeTab === 'notes' && <NotesView store={store} />}
        </main>
      </div>

      {/* GLOBAL OVERLAYS (Floating Timer & Animations) */}
      <FloatingTimer store={store} triggerAnimation={setAnimationData} />
      <AnimatePresence>
        {animationData && <CompletionAnimationOverlay data={animationData} onComplete={() => setAnimationData(null)} />}
      </AnimatePresence>
    </div>
  );
}
