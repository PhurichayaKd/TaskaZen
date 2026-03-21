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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zen-cream gap-6">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center animate-bounce shadow-xl shadow-zen-mint-dark/30 border-4 border-zen-mint">
          <FileText className="w-12 h-12 text-emerald-600" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">กำลังเตรียมพื้นที่ Zen ของคุณ...</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zen-mint-dark animate-pulse" />
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-[0.2em]">Zen Productivity is loading</p>
            <div className="w-2 h-2 rounded-full bg-zen-purple-dark animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zen-cream overflow-hidden font-sans text-zinc-900 selection:bg-zen-mint selection:text-emerald-900 relative">
      
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 88 }}
        className="bg-white/70 backdrop-blur-xl border-r border-zen-mint-dark/20 h-screen flex flex-col flex-shrink-0 relative overflow-hidden z-20 shadow-[8px_0_32px_-12px_rgba(0,0,0,0.05)]"
      >
        <div className="h-20 flex items-center px-6 border-b border-zen-mint-dark/10 shrink-0">
          <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-zen-mint to-zen-purple rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group shadow-lg shadow-emerald-100">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <FileText className="w-5 h-5 text-zinc-800 relative z-10" /> 
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-purple-600"
              >
                TaskaZen
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
          {isSidebarOpen && (
             <div className="px-4 pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">เมนูหลัก</div>
          )}
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-zen-mint text-emerald-800 font-black shadow-xl shadow-emerald-100/50 border border-white' 
                  : 'text-zinc-500 hover:bg-white/50 hover:text-zinc-900 border border-transparent'
              } ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400'}`} /> 
              {isSidebarOpen && (
                <span className="ml-4 truncate text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zen-mint-dark/10 shrink-0 space-y-3">
           <button className={`w-full flex items-center p-2.5 rounded-2xl text-zinc-500 hover:bg-white transition-all border border-transparent hover:border-white hover:shadow-lg ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-zen-mint-dark to-zen-purple-dark text-zinc-800 flex items-center justify-center flex-shrink-0 shadow-inner border-2 border-white overflow-hidden">
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black">ME</span>
                )}
              </div>
              {isSidebarOpen && (
                <div className="ml-4 flex flex-col items-start truncate">
                  <span className="text-sm font-black text-zinc-900">{session?.user?.user_metadata?.full_name || 'User'}</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Zen Pro ✨</span>
                </div>
              )}
           </button>
           
           {isSidebarOpen && (
             <button 
               onClick={() => supabase.auth.signOut()}
               className="w-full flex items-center p-3.5 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent group"
             >
               <LogOut className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
               <span className="text-sm font-bold">ออกจากระบบ</span>
             </button>
           )}
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 bg-zen-cream">
        
        {/* Header */}
        <header className="bg-white/60 backdrop-blur-md border-b border-zen-mint-dark/10 h-20 flex items-center justify-between px-6 sm:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-zinc-400 hover:bg-white hover:text-zinc-900 rounded-xl transition-all shadow-sm border border-transparent hover:border-zinc-100"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">{currentTabTitle}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {activeTab === 'calendar' && (
              <div className="flex bg-zinc-100/50 p-1.5 rounded-2xl border border-white shadow-inner">
                <button 
                  onClick={() => setViewMode('custom')} 
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'custom' ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-100/50 border border-zinc-100' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  <Edit3 className="w-4 h-4" /> แก้ไข
                </button>
                <button 
                  onClick={() => setViewMode('view')} 
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'view' ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-100/50 border border-zinc-100' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  <Layout className="w-4 h-4" /> ภาพรวม
                </button>
              </div>
            )}
            {activeTab === 'home' && (
               <div className="hidden sm:flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-white shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cloud Synced</span>
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
