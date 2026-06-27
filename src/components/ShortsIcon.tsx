import React from 'react';

export const ShortsIcon: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M17.77,10.32l-1.2-.5L17.77,9.32a3.67,3.67,0,0,0-2.09-6.6,3.62,3.62,0,0,0-1.49.31L5.41,7.33a3.67,3.67,0,0,0,2.09,6.6,3.62,3.62,0,0,0,1.49-.31l1.2.5-1.2.5a3.67,3.67,0,0,0,2.09,6.6,3.62,3.62,0,0,0,1.49-.31l8.78-4.3a3.67,3.67,0,0,0-2.09-6.6,3.62,3.62,0,0,0-1.49.31Z" />
      <polygon points="10 14.65 15 12 10 9.35 10 14.65" fill="white" />
    </svg>
  );
};
