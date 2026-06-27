import React from 'react';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-14 bg-white dark:bg-black py-3 px-4 z-30 flex gap-3 overflow-x-auto no-scrollbar transition-colors duration-300">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            selectedCategory === category.id
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-black dark:text-white"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
