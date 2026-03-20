import React from 'react';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${className}`}>
    {children}
  </span>
);

export default Badge;
