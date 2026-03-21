import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
    outline: "border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900 dark:border-zen-dark-border dark:bg-zen-dark-card dark:hover:bg-zinc-800 dark:text-white",
    ghost: "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    icon: "h-10 w-10",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
