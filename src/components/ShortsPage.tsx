import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  MoreVertical,
  Music2,
  ChevronUp,
  ChevronDown,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Short } from '../types';
import { MOCK_SHORTS } from '../constants';

export const ShortsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < MOCK_SHORTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleScroll('up');
      if (e.key === 'ArrowDown') handleScroll('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="h-[calc(100vh-56px)] bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20 flex gap-2">
        <button 
          onClick={() => handleScroll('up')}
          disabled={currentIndex === 0}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30 transition-colors"
        >
          <ChevronUp size={24} />
        </button>
        <button 
          onClick={() => handleScroll('down')}
          disabled={currentIndex === MOCK_SHORTS.length - 1}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30 transition-colors"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="relative h-full aspect-[9/16] max-h-[90vh] w-full max-w-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={MOCK_SHORTS[currentIndex].id}
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="absolute inset-0"
          >
            <video 
              src={MOCK_SHORTS[currentIndex].videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={MOCK_SHORTS[currentIndex].channelAvatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="text-white font-bold">@{MOCK_SHORTS[currentIndex].channelName}</span>
                <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5">
                  <Bell size={14} />
                  Subscribe
                </button>
              </div>
              <h3 className="text-white text-lg font-medium mb-4 line-clamp-2">
                {MOCK_SHORTS[currentIndex].title}
              </h3>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Music2 size={16} />
                <span>Original Sound - {MOCK_SHORTS[currentIndex].channelName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <ThumbsUp size={24} />
                </button>
                <span className="text-white text-xs font-medium">{MOCK_SHORTS[currentIndex].likes}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <ThumbsDown size={24} />
                </button>
                <span className="text-white text-xs font-medium">Dislike</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <MessageSquare size={24} />
                </button>
                <span className="text-white text-xs font-medium">{MOCK_SHORTS[currentIndex].comments}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <Share2 size={24} />
                </button>
                <span className="text-white text-xs font-medium">Share</span>
              </div>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <MoreVertical size={24} />
              </button>
              <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border-2 border-white/20">
                <img src={MOCK_SHORTS[currentIndex].channelAvatar} alt="Sound" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
