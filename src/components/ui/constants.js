import { Briefcase, User, Users } from 'lucide-react';

export const colorMap = {
  zinc: { bg: 'bg-white', border: 'border-zinc-200', text: 'text-zinc-600', main: 'bg-zinc-400' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', main: 'bg-red-400' },
  amber: { bg: 'bg-zen-blue', border: 'border-zen-blue-dark/20', text: 'text-sky-800', main: 'bg-zen-blue-dark' },
  green: { bg: 'bg-zen-matcha', border: 'border-zen-matcha-dark/20', text: 'text-lime-900', main: 'bg-zen-matcha-dark' },
  blue: { bg: 'bg-zen-navy/10', border: 'border-zen-navy/20', text: 'text-blue-900', main: 'bg-zen-navy' },
  purple: { bg: 'bg-zen-purple', border: 'border-zen-purple-dark/20', text: 'text-purple-900', main: 'bg-zen-purple-dark' },
};

export const categoriesConfig = [
  { id: 'work', label: 'งาน', icon: Briefcase, color: 'text-lime-900 border-zen-matcha-dark/20 bg-zen-matcha', fill: 'bg-zen-matcha-dark' },
  { id: 'personal', label: 'ส่วนตัว', icon: User, color: 'text-purple-900 border-zen-purple-dark/20 bg-zen-purple', fill: 'bg-zen-purple-dark' },
  { id: 'meeting', label: 'ประชุม', icon: Users, color: 'text-sky-900 border-zen-blue-dark/20 bg-zen-blue', fill: 'bg-zen-blue-dark' }
];
