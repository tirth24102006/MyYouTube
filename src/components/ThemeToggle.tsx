import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-300 relative overflow-hidden group z-[60]"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative z-10 flex items-center justify-center w-6 h-6">
        {isDark ? (
          <Moon size={24} className="text-blue-400" />
        ) : (
          <Sun size={24} className="text-yellow-500" />
        )}
      </div>
      <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
};
