import { Briefcase, User, Users } from 'lucide-react';

export const colorMap = {
  zinc: { bg: 'bg-zinc-50', border: 'border-zinc-300', text: 'text-zinc-700', main: 'bg-zinc-500' },
  red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', main: 'bg-red-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', main: 'bg-amber-500' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', main: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', main: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', main: 'bg-purple-500' },
};

export const categoriesConfig = [
  { id: 'work', label: 'งาน', icon: Briefcase, color: 'text-blue-600 border-blue-200 bg-blue-50', fill: 'bg-blue-500' },
  { id: 'personal', label: 'ส่วนตัว', icon: User, color: 'text-emerald-600 border-emerald-200 bg-emerald-50', fill: 'bg-emerald-500' },
  { id: 'meeting', label: 'ประชุม', icon: Users, color: 'text-purple-600 border-purple-200 bg-purple-50', fill: 'bg-purple-500' }
];