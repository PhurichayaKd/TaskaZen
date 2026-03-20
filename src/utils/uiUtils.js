import { Sun, Coffee, Moon } from 'lucide-react';

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'อรุณสวัสดิ์', icon: Sun, color: 'text-amber-500' };
  if (hour < 18) return { text: 'สวัสดีตอนบ่าย', icon: Coffee, color: 'text-orange-500' };
  return { text: 'สวัสดีตอนเย็น', icon: Moon, color: 'text-indigo-500' };
};

export const formatTimer = (totalSeconds) => {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '-' : ''}${mins}:${String(secs).padStart(2, '0')}`;
};
