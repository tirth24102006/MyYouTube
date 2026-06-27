import React from 'react';
import { 
  Home, 
  PlaySquare, 
  Users, 
  Library, 
  History, 
  Clock, 
  ThumbsUp,
  Flame,
  ShoppingBag,
  Music2,
  Gamepad2,
  Newspaper,
  Trophy,
  Lightbulb,
  Shirt,
  Radio,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ShortsIcon } from './ShortsIcon';

interface SidebarProps {
  isOpen: boolean;
  activeItem: string;
  onItemClick: (item: string) => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center gap-5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
      active 
        ? "bg-gray-100 dark:bg-zinc-800 font-medium dark:text-white" 
        : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300 dark:hover:text-white"
    )}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className="text-sm truncate">{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeItem, onItemClick }) => {
  if (!isOpen) {
    return (
      <aside className="fixed top-14 left-0 bottom-0 w-20 bg-white dark:bg-black flex flex-col items-center py-2 z-40 hidden sm:flex transition-colors duration-300">
        <div 
          onClick={() => onItemClick('home')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 w-full rounded-lg cursor-pointer transition-colors",
            activeItem === 'home' ? "dark:text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <Home size={22} strokeWidth={activeItem === 'home' ? 2.5 : 2} />
          <span className="text-[10px] w-full text-center truncate px-1">Home</span>
        </div>
        <div 
          onClick={() => onItemClick('shorts')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 w-full rounded-lg cursor-pointer transition-colors",
            activeItem === 'shorts' ? "dark:text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <ShortsIcon size={22} className={activeItem === 'shorts' ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"} />
          <span className="text-[10px] w-full text-center truncate px-1">Shorts</span>
        </div>
        <div 
          onClick={() => onItemClick('subscriptions')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 w-full rounded-lg cursor-pointer transition-colors",
            activeItem === 'subscriptions' ? "dark:text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <Users size={22} strokeWidth={activeItem === 'subscriptions' ? 2.5 : 2} />
          <span className="text-[10px] w-full text-center truncate px-1">Subscriptions</span>
        </div>
        <div 
          onClick={() => onItemClick('library')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 w-full rounded-lg cursor-pointer transition-colors",
            activeItem === 'library' ? "dark:text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <Library size={22} strokeWidth={activeItem === 'library' ? 2.5 : 2} />
          <span className="text-[10px] w-full text-center truncate px-1">You</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-60 bg-white dark:bg-black overflow-y-auto px-3 py-2 z-40 custom-scrollbar transition-colors duration-300">
      <div className="space-y-1">
        <SidebarItem icon={Home} label="Home" active={activeItem === 'home'} onClick={() => onItemClick('home')} />
        <SidebarItem icon={ShortsIcon} label="Shorts" active={activeItem === 'shorts'} onClick={() => onItemClick('shorts')} />
        <SidebarItem icon={Users} label="Subscriptions" active={activeItem === 'subscriptions'} onClick={() => onItemClick('subscriptions')} />
        <SidebarItem icon={Bell} label="Notifications" active={activeItem === 'notifications'} onClick={() => onItemClick('notifications')} />
      </div>

      <hr className="my-3 border-gray-200 dark:border-zinc-800" />

      <div className="space-y-1">
        <div className="px-3 py-2 flex items-center gap-2 font-medium dark:text-white">
          <span>You</span>
          <span className="text-xs text-gray-500">{'>'}</span>
        </div>
        <SidebarItem icon={History} label="History" active={activeItem === 'history'} onClick={() => onItemClick('history')} />
        <SidebarItem icon={PlaySquare} label="Your videos" active={activeItem === 'channel'} onClick={() => onItemClick('channel')} />
        <SidebarItem icon={Clock} label="Watch later" active={activeItem === 'later'} onClick={() => onItemClick('later')} />
        <SidebarItem icon={ThumbsUp} label="Liked videos" active={activeItem === 'liked'} onClick={() => onItemClick('liked')} />
      </div>

      <hr className="my-3 border-gray-200 dark:border-zinc-800" />

      <div className="space-y-1">
        <h3 className="px-3 py-2 text-base font-medium dark:text-white">Explore</h3>
        <SidebarItem icon={Flame} label="Trending" active={activeItem === 'trending'} onClick={() => onItemClick('trending')} />
        <SidebarItem icon={ShoppingBag} label="Shopping" active={activeItem === 'shopping'} onClick={() => onItemClick('shopping')} />
        <SidebarItem icon={Music2} label="Music" active={activeItem === 'music'} onClick={() => onItemClick('music')} />
        <SidebarItem icon={Radio} label="Live" active={activeItem === 'live'} onClick={() => onItemClick('live')} />
        <SidebarItem icon={Gamepad2} label="Gaming" active={activeItem === 'gaming'} onClick={() => onItemClick('gaming')} />
        <SidebarItem icon={Newspaper} label="News" active={activeItem === 'news'} onClick={() => onItemClick('news')} />
        <SidebarItem icon={Trophy} label="Sports" active={activeItem === 'sports'} onClick={() => onItemClick('sports')} />
        <SidebarItem icon={Lightbulb} label="Learning" active={activeItem === 'learning'} onClick={() => onItemClick('learning')} />
        <SidebarItem icon={Shirt} label="Fashion & Beauty" active={activeItem === 'fashion'} onClick={() => onItemClick('fashion')} />
      </div>
    </aside>
  );
};
