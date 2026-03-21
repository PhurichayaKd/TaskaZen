import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sun, Moon, Save, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Button from '../ui/Button';

const SettingsModal = ({ isOpen, onClose, store }) => {
  const { profile, updateUserProfile } = store;
  const [name, setName] = useState(profile.fullName || '');
  const [theme, setTheme] = useState(profile.theme || 'light');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.fullName || '');
      setTheme(profile.theme || 'light');
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ fullName: name, theme });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/60" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-zen-dark-card rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zen-dark-border overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-zinc-50 dark:border-zen-dark-border flex items-center justify-between">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 dark:text-zinc-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Name Setting */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <User className="w-3 h-3" /> Display Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-14 px-5 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zen-dark-border rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-bold text-zinc-900 dark:text-white"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address (Immutable)
              </label>
              <div className="w-full h-14 px-5 flex items-center bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zen-dark-border rounded-2xl font-bold text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
                {store.session?.user?.email || 'user@example.com'}
              </div>
            </div>

            {/* Theme Setting */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Sun className="w-3 h-3" /> Visual Theme
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    theme === 'light' 
                      ? 'bg-white border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' 
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Light Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    theme === 'dark' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dark Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zen-dark-border">
            <Button 
              onClick={handleSave}
              disabled={isSaving || showSuccess}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : showSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Saved Successfully
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;