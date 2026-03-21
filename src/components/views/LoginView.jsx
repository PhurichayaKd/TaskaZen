import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { FileText, LogIn, Loader2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-zen-cream relative overflow-hidden font-sans">
      {/* Dynamic Background Elements inspired by the image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-zen-mint/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -120, 0],
            x: [0, -80, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[15%] -right-[10%] w-[70%] h-[70%] bg-zen-purple/40 rounded-full blur-[120px]" 
        />
        <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-zen-peach/30 rounded-full blur-[60px] animate-pulse-slow" />
        <div className="absolute bottom-[30%] left-[20%] w-48 h-48 bg-zen-blue/20 rounded-full blur-[80px] animate-float" />
        
        {/* Floating Shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: 45 }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-10 w-12 h-12 border-4 border-zen-mint-dark/30 rounded-xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: -15 }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/4 right-10 w-16 h-16 border-4 border-zen-purple-dark/30 rounded-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] p-6 relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl p-10 sm:p-14 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col items-center gap-10 relative overflow-hidden group">
          {/* Subtle Shimmer Effect on Card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Logo Area */}
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-24 h-24 bg-gradient-to-br from-zen-mint to-zen-purple rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-12 h-12 text-zinc-800 relative z-10" /> 
            </motion.div>
            <div className="text-center space-y-1">
              <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                Taska<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-600">Zen</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-zinc-200" />
                <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Zen Productivity</p>
                <div className="h-px w-8 bg-zinc-200" />
              </div>
            </div>
          </div>

          {/* Intro Text */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-800">ยินดีต้อนรับสู่โลกใบใหม่</h2>
            <p className="text-base text-zinc-500 font-medium leading-relaxed">
              จัดการชีวิตให้เรียบง่ายและสนุกสนาน<br/>
              เริ่มต้นการเดินทางของคุณได้แล้ววันนี้
            </p>
          </div>

          {/* Login Button */}
          <div className="w-full">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-16 bg-zen-peach hover:bg-zen-peach-dark text-orange-900 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-[0_12px_24px_-8px_rgba(255,216,177,0.5)] border-2 border-white/50 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span className="font-black text-lg">เข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Decorative Footer */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-zen-mint${i === 2 ? '-dark' : ''}`} />
              ))}
            </div>
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-zen-peach-dark" /> 
              Trusted by 10k+ Zen Users
            </div>
          </div>
        </div>
        
        {/* Bottom Tag */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zen-mint animate-pulse" />
          Professional Productivity Suite
        </motion.p>
      </motion.div>
    </div>
  );
};


export default LoginView;
