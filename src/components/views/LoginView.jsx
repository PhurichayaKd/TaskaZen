import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { FileText, LogIn, Loader2, Sparkles, Target } from 'lucide-react';
import Button from '../ui/Button';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans selection:bg-zen-blue selection:text-zen-navy">
      
      {/* IMMERSIVE ANIMATED BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large Floating Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-zen-blue/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-zen-purple/30 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 40, 0],
            y: [0, -60, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-zen-matcha/30 rounded-full blur-[100px]"
        />

        {/* Animated Grid / Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1E3A8A_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* MAIN CONTENT - CENTERED & FLOATING */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center text-center space-y-12"
      >
        {/* Logo & Brand */}
        <div className="space-y-6 flex flex-col items-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-24 h-24 bg-zen-navy rounded-[2.5rem] flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(30,58,138,0.25)] relative group cursor-default"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] scale-0 group-hover:scale-100 transition-transform duration-500 blur-xl" />
            <FileText className="w-12 h-12 text-white relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-2 border-dashed border-zen-navy/20 rounded-[3rem] opacity-50"
            />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-8xl font-black text-zinc-900 tracking-tighter leading-none select-none">
              Taska<span className="text-zen-navy">Zen</span>
            </h1>
            <p className="text-xl font-bold text-zinc-400 tracking-widest uppercase">
              Production Level <span className="text-zen-navy/40">Productivity</span>
            </p>
          </div>
        </div>

        {/* Login Action Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-md bg-white/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8"
        >
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">ยินดีต้อนรับกลับมา</h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed px-4">
              เข้าถึงพื้นที่ทำงานส่วนตัวของคุณ เพื่อการจัดการที่มีประสิทธิภาพสูงสุด
            </p>
          </div>

          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-20 bg-white hover:bg-zinc-50 text-zinc-900 rounded-[2rem] flex items-center justify-center gap-6 transition-all border border-zinc-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:border-zen-blue group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zen-blue/10 to-zen-purple/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-zen-navy" />
              ) : (
                <>
                  <div className="bg-white p-2.5 rounded-xl shadow-sm border border-zinc-50 relative z-10 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span className="font-black text-lg relative z-10">ดำเนินการต่อด้วย Google</span>
                </>
              )}
            </motion.button>
            
            <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] select-none">
              Enterprise Grade Security
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="pt-8 flex items-center gap-12 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-t border-zinc-100 w-full justify-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-zen-blue-dark" />
            <span>Smart Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zen-matcha-dark" />
            <span>Eco-Friendly UX</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3 text-zen-purple-dark" />
            <span>Precision Tools</span>
          </div>
        </div>
      </motion.div>

      {/* FLOATING DECORATIONS */}
      <motion.div 
        animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] opacity-20 hidden lg:block"
      >
        <div className="w-32 h-32 border-4 border-zen-navy rounded-full border-dashed" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 50, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[5%] opacity-20 hidden lg:block"
      >
        <div className="w-48 h-48 bg-zen-matcha rounded-[3rem] rotate-45" />
      </motion.div>
    </div>
  );
};



export default LoginView;
