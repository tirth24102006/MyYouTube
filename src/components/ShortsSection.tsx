import React from 'react';
import { MoreVertical } from 'lucide-react';
import { MOCK_SHORTS } from '../constants';
import { Short } from '../types';
import { ShortsIcon } from './ShortsIcon';

interface ShortsSectionProps {
  onShortClick: (short: Short) => void;
}

export const ShortsSection: React.FC<ShortsSectionProps> = ({ onShortClick }) => {
  return (
    <div className="py-6 border-b dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-4 px-4">
        <ShortsIcon size={24} className="text-[#FF0000]" />
        <h2 className="text-xl font-bold dark:text-white">Shorts</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-4">
        {MOCK_SHORTS.map((short) => (
          <div 
            key={short.id} 
            className="flex-none w-[210px] cursor-pointer group"
            onClick={() => onShortClick(short)}
          >
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden mb-3">
              <img 
                src={short.thumbnailUrl} 
                alt={short.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            </div>
            
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-bold dark:text-white line-clamp-2 mb-1 leading-snug">
                  {short.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {short.views}
                </p>
              </div>
              <button className="p-1 h-fit hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <MoreVertical size={18} className="dark:text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
