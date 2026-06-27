import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { VideoCard } from './VideoCard';
import { Video, Playlist } from '../types';
import { MOCK_VIDEOS } from '../constants';
import { User, Settings, Edit3, Plus, Trash2, Lock, Globe, PlaySquare, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChannelPageProps {
  user: any;
  userVideos: Video[];
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ user, userVideos }) => {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState<'public' | 'private'>('public');

  useEffect(() => {
    if (!user) return;

    // Fetch Channel
    const channelQuery = query(collection(db, 'channels'), where('ownerUid', '==', user.uid));
    const unsubscribeChannel = onSnapshot(channelQuery, (snapshot) => {
      if (!snapshot.empty) {
        setChannel(snapshot.docs[0].data());
      }
      setLoading(false);
    });

    // Fetch Playlists
    const playlistsQuery = query(collection(db, 'playlists'), where('userUid', '==', user.uid));
    const unsubscribePlaylists = onSnapshot(playlistsQuery, (snapshot) => {
      const fetchedPlaylists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];
      setPlaylists(fetchedPlaylists);
    });

    return () => {
      unsubscribeChannel();
      unsubscribePlaylists();
    };
  }, [user]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPlaylistTitle.trim()) return;

    try {
      const playlistRef = doc(collection(db, 'playlists'));
      await setDoc(playlistRef, {
        id: playlistRef.id,
        userUid: user.uid,
        title: newPlaylistTitle,
        visibility: newPlaylistVisibility,
        createdAt: serverTimestamp(),
        videoCount: 0
      });
      setNewPlaylistTitle('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-4 text-center">
        <User size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white mb-2">You don't have a channel yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create a channel to start uploading videos and building your community.</p>
      </div>
    );
  }

  const displayVideos = userVideos.length > 0 ? userVideos : MOCK_VIDEOS.slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Banner */}
      <div className="w-full h-32 sm:h-48 lg:h-64 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <img 
          src={channel.bannerUrl || `https://picsum.photos/seed/${channel.id}/1200/300`} 
          alt="Banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Channel Info */}
      <div className="max-w-[1284px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-6">
          <img 
            src={channel.avatarUrl || user.photoURL} 
            alt={channel.name} 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold dark:text-white">{channel.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
              <span>@{channel.name.toLowerCase().replace(/\s+/g, '')}</span>
              <span>•</span>
              <span>{channel.subscribersCount} subscribers</span>
              <span>•</span>
              <span>{displayVideos.length} videos</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl line-clamp-2">
              {channel.description || "No description provided."}
            </p>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-sm font-medium transition-colors dark:text-white flex items-center gap-2">
                <Edit3 size={16} />
                Customize channel
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-sm font-medium transition-colors dark:text-white flex items-center gap-2">
                <Settings size={16} />
                Manage videos
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-zinc-800 flex items-center gap-8 overflow-x-auto no-scrollbar">
          {['Home', 'Videos', 'Playlists', 'About'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.toLowerCase() 
                  ? 'text-black dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-8">
          {activeTab === 'home' || activeTab === 'videos' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {displayVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onClick={() => {}} 
                />
              ))}
            </div>
          ) : activeTab === 'playlists' ? (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">Created playlists</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <Plus size={18} />
                  New playlist
                </button>
              </div>

              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="group cursor-pointer">
                      <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden mb-3">
                        {playlist.thumbnailUrl ? (
                          <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <PlaySquare size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <PlaySquare size={32} className="text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <PlaySquare size={12} />
                          {playlist.videoCount || 0} videos
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold dark:text-white line-clamp-1">{playlist.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            {playlist.visibility === 'private' ? <Lock size={12} /> : <Globe size={12} />}
                            <span>{playlist.visibility.charAt(0).toUpperCase() + playlist.visibility.slice(1)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(playlist.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <PlaySquare size={48} className="mb-4 opacity-20" />
                  <p>You haven't created any playlists yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold dark:text-white mb-4">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {channel.description || "No description provided."}
              </p>
              <div className="mt-8">
                <h3 className="text-lg font-bold dark:text-white mb-4">Stats</h3>
                <div className="border-t dark:border-zinc-800 py-4 flex flex-col gap-4 text-sm dark:text-gray-300">
                  <div>Joined {new Date(channel.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                  <div>{channel.subscribersCount} subscribers</div>
                  <div>{displayVideos.length} videos</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
              <h3 className="text-lg font-bold dark:text-white">New playlist</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input 
                  type="text" 
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Enter playlist title"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
                <select 
                  value={newPlaylistVisibility}
                  onChange={(e) => setNewPlaylistVisibility(e.target.value as 'public' | 'private')}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
