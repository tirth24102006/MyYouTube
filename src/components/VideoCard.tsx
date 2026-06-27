import React from 'react';
import { Video } from '../types';
import { MoreVertical, Bell } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="flex flex-col gap-3 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <img 
            src={video.channelAvatarUrl} 
            alt={video.channelName}
            className="w-9 h-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold leading-tight line-clamp-2 mb-1 dark:text-white">
            {video.title}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-col">
            <span className="hover:text-black dark:hover:text-white transition-colors">{video.channelName}</span>
            <div className="flex items-center gap-1">
              <span>{video.views}</span>
              <span>•</span>
              <span>{video.postedAt}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-white">
            <MoreVertical size={18} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              alert('Notification set for this video!');
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-white"
            title="Notify me"
          >
            <Bell size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
