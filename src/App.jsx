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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 gap-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center animate-pulse">
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-800 animate-pulse">กำลังเตรียมพื้นที่ทำงานของคุณ...</h2>
          <p className="text-sm text-zinc-400">Zen Productivity is loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="bg-white border-r border-zinc-200 h-screen flex flex-col flex-shrink-0 relative overflow-hidden z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
      >
        <div className="h-16 flex items-center px-4 border-b border-zinc-100 shrink-0">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-indigo-50/50 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <FileText className="w-4 h-4 text-indigo-600 relative z-10" /> 
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-lg font-bold tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_auto] animate-shimmer"
              >
                TaskaZen
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {isSidebarOpen && (
             <div className="px-3 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">เมนูหลัก</div>
          )}
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-2.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
              } ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-indigo-600' : 'text-zinc-400'}`} /> 
              {isSidebarOpen && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 shrink-0 space-y-2">
           <button className={`w-full flex items-center p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors border border-transparent ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white overflow-hidden">
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">ME</span>
                )}
              </div>
              {isSidebarOpen && (
                <div className="ml-3 flex flex-col items-start truncate">
                  <span className="text-sm font-bold text-zinc-900">{session?.user?.user_metadata?.full_name || 'User'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Pro Plan ✨</span>
                </div>
              )}
           </button>
           
           {isSidebarOpen && (
             <button 
               onClick={() => supabase.auth.signOut()}
               className="w-full flex items-center p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors border border-transparent"
             >
               <LogOut className="w-5 h-5 mr-3" />
               <span className="text-sm font-bold">ออกจากระบบ</span>
             </button>
           )}
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-md transition-colors focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">{currentTabTitle}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'calendar' && (
              <div className="flex bg-zinc-100/80 p-1 rounded-lg border border-zinc-200/60 shadow-inner">
                <button 
                  onClick={() => setViewMode('custom')} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> แก้ไข (Custom)
                </button>
                <button 
                  onClick={() => setViewMode('view')} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'view' ? 'bg-white text-indigo-600 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <Layout className="w-3.5 h-3.5" /> ภาพรวม (View)
                </button>
              </div>
            )}
            {activeTab === 'home' && (
               <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 ระบบซิงค์ข้อมูลล่าสุดแล้ว
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
