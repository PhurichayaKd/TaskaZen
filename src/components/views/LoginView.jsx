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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-zinc-100 flex flex-col items-center gap-8">
          {/* Logo Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-indigo-50/50 rounded-3xl flex items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <FileText className="w-10 h-10 text-indigo-600 relative z-10" /> 
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_auto] animate-shimmer">
                TaskaZen
              </h1>
              <p className="text-zinc-400 font-medium text-sm mt-2 uppercase tracking-[0.2em]">Zen Productivity</p>
            </div>
          </div>

          {/* Intro Text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-zinc-800">ยินดีต้อนรับกลับมา</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              จัดการชีวิตอย่างมีสติและสนุกเหมือนเล่นเกม<br/>เข้าสู่ระบบเพื่อซิงค์ข้อมูลของคุณได้ทุกที่
            </p>
          </div>

          {/* Login Button */}
          <div className="w-full space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-white border-2 border-zinc-100 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group relative overflow-hidden shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-bold text-zinc-700 group-hover:text-indigo-600 transition-colors">เข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Footer */}
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Built for Creators
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
