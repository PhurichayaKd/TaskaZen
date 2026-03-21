import { Briefcase, User, Users } from 'lucide-react';

export const colorMap = {
  zinc: { bg: 'bg-zen-cream', border: 'border-zinc-200', text: 'text-zinc-600', main: 'bg-zinc-400' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', main: 'bg-red-400' },
  amber: { bg: 'bg-zen-peach', border: 'border-zen-peach-dark', text: 'text-orange-800', main: 'bg-zen-peach-dark' },
  green: { bg: 'bg-zen-mint', border: 'border-zen-mint-dark', text: 'text-emerald-800', main: 'bg-zen-mint-dark' },
  blue: { bg: 'bg-zen-blue', border: 'border-zen-blue-dark', text: 'text-sky-800', main: 'bg-zen-blue-dark' },
  purple: { bg: 'bg-zen-purple', border: 'border-zen-purple-dark', text: 'text-purple-800', main: 'bg-zen-purple-dark' },
};

export const categoriesConfig = [
  { id: 'work', label: 'งาน', icon: Briefcase, color: 'text-emerald-800 border-zen-mint-dark bg-zen-mint', fill: 'bg-zen-mint-dark' },
  { id: 'personal', label: 'ส่วนตัว', icon: User, color: 'text-purple-800 border-zen-purple-dark bg-zen-purple', fill: 'bg-zen-purple-dark' },
  { id: 'meeting', label: 'ประชุม', icon: Users, color: 'text-sky-800 border-zen-blue-dark bg-zen-blue', fill: 'bg-zen-blue-dark' }
];
