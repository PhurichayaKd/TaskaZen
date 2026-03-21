import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { 
  FileText, LogIn, Loader2, Sparkles, LayoutDashboard, 
  Calendar, PenLine, Trophy, Target, Zap, Clock, Shield,
  Mail, Gamepad2
} from 'lucide-react';
import Button from '../ui/Button';

const featureItems = [
  { 
    id: 1, 
    icon: LayoutDashboard, 
    title: "Dynamic Missions", 
    desc: "Transform your daily tasks into epic gaming missions.",
    color: "from-blue-400 to-indigo-600"
  },
  { 
    id: 2, 
    icon: Calendar, 
    title: "Visual Planning", 
    desc: "Visualize your journey with our intuitive calendar system.",
    color: "from-indigo-400 to-purple-600"
  },
  { 
    id: 3, 
    icon: PenLine, 
    title: "Creative Notes", 
    desc: "Capture sparks of inspiration in a distraction-free space.",
    color: "from-purple-400 to-pink-600"
  },
  { 
    id: 4, 
    icon: Trophy, 
    title: "Reward System", 
    desc: "Earn XP and collect rare trophies as you conquer goals.",
    color: "from-amber-400 to-orange-600"
  },
  { 
    id: 5, 
    icon: Shield, 
    title: "Mindful Focus", 
    desc: "Maintain deep focus with our specialized zen timers.",
    color: "from-emerald-400 to-teal-600"
  }
];

const FeatureSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featureItems.length);
    }, 4000); // 4 seconds per feature
    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = featureItems[index].icon;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex flex-col items-center gap-8"
        >
          <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${featureItems[index].color} flex items-center justify-center shadow-2xl relative`}>
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl animate-pulse" />
            <ActiveIcon className="w-14 h-14 text-white relative z-10" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center space-y-4 px-12"
          >
            <h3 className="text-3xl font-black text-white tracking-tight">
              {featureItems[index].title}
            </h3>
            <p className="text-indigo-100/80 text-lg font-medium leading-relaxed max-w-sm">
              {featureItems[index].desc}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const LoginView = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error.message);
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-50 font-sans selection:bg-indigo-100 overflow-hidden">
      
      {/* Left Side: Brand & Login */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-16 relative bg-white overflow-hidden">
        {/* Abstract Background for Left Side */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 rounded-full blur-[100px] opacity-60" />
           
           {/* Floating Pastel Icons Background */}
           <div className="absolute inset-0 opacity-40">
             {[...Array(15)].map((_, i) => {
               const icons = [Mail, FileText, Gamepad2, Trophy, Sparkles];
               const colors = ['text-blue-200', 'text-purple-200', 'text-pink-200', 'text-amber-200', 'text-emerald-200'];
               const Icon = icons[i % icons.length];
               const color = colors[i % colors.length];
               
               // Generate random initial positions
               const left = (i * 7 + Math.random() * 20) % 100;
               const top = (i * 13 + Math.random() * 20) % 100;
               
               return (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ 
                     y: [0, -30, 0],
                     opacity: [0.3, 0.6, 0.3],
                     scale: [0.8, 1.1, 0.8],
                     rotate: [0, 180, 360]
                   }}
                   transition={{ 
                     duration: Math.random() * 10 + 15, 
                     repeat: Infinity, 
                     ease: "linear"
                   }}
                   className={`absolute ${color}`}
                   style={{ left: `${left}%`, top: `${top}%` }}
                 >
                   <Icon className="w-12 h-12" />
                 </motion.div>
               );
             })}
           </div>
        </div>

        <nav className="relative z-10 flex items-center justify-between mb-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-zinc-900">TaskaZen</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-2 border-zinc-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400" /> V2.0 PRODUCTION
          </div>
        </nav>

        <div className="relative z-10 max-w-md mx-auto w-full mb-auto mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tight">
                Master your life <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">with Zen flow.</span>
              </h1>
              <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-sm">
                The production-grade productivity ecosystem designed to turn your goals into an immersive game-like experience.
              </p>
            </div>

            <div className="space-y-6">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-16 bg-white border-2 border-zinc-100 hover:border-indigo-100 text-zinc-900 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center shadow-inner group-hover:bg-white transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <span className="font-black text-sm uppercase tracking-[0.1em]">Continue with Google</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                By signing in, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>

        <footer className="relative z-10 flex items-center justify-center gap-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-auto">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400" /> MINIMALIST</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-400" /> POWERFUL</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" /> GAMIFIED</div>
        </footer>
      </div>

      {/* Right Side: Visual Showcase */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]" 
        />

        <div className="relative z-10 w-full h-full">
           <FeatureSlider />
        </div>
      </div>
    </div>
  );
};

export default LoginView;
