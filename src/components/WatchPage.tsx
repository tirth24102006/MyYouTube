import React, { useState, useEffect } from 'react';
import { Video, Comment, Playlist } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Bell, BellRing, MessageSquare, ListPlus, X, Check, Lock, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  deleteDoc, 
  setDoc,
  getDoc,
  increment,
  updateDoc
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface WatchPageProps {
  video: Video;
  relatedVideos: Video[];
  onVideoClick: (video: Video) => void;
  likedVideos: string[];
  onLikeToggle: (id: string) => void;
  user: FirebaseUser | null;
}

export const WatchPage: React.FC<WatchPageProps> = ({ 
  video, 
  relatedVideos, 
  onVideoClick,
  likedVideos,
  onLikeToggle,
  user
}) => {
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBellActive, setIsBellActive] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [playlistMemberships, setPlaylistMemberships] = useState<Record<string, boolean>>({});

  // Fetch video data (likes, views)
  useEffect(() => {
    const videoRef = doc(db, 'videos', video.id);
    
    // Increment views on mount
    const incrementViews = async () => {
      try {
        await setDoc(videoRef, { 
          views: increment(1),
          title: video.title,
          ownerUid: video.ownerUid || 'system',
          id: video.id
        }, { merge: true });
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };
    incrementViews();

    const unsubscribe = onSnapshot(videoRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLikesCount(data.likesCount || 0);
        setViewsCount(data.views || 0);
      }
    });

    return () => unsubscribe();
  }, [video.id]);

  // Fetch channel data (subscribers)
  useEffect(() => {
    const channelId = video.ownerUid || video.channelName;
    const channelRef = doc(db, 'channels', channelId);

    const unsubscribe = onSnapshot(channelRef, (doc) => {
      if (doc.exists()) {
        setSubscribersCount(doc.data().subscribersCount || 0);
      } else {
        setSubscribersCount(1200000);
      }
    });

    return () => unsubscribe();
  }, [video.ownerUid, video.channelName]);

  // Fetch comments
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('videoId', '==', video.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });

    return () => unsubscribe();
  }, [video.id]);

  // Fetch user's like status
  useEffect(() => {
    if (user) {
      const userLikeRef = doc(db, 'likes', `${video.id}_${user.uid}`);
      const unsubscribeUserLike = onSnapshot(userLikeRef, (doc) => {
        setIsLiked(doc.exists());
      });
      return () => unsubscribeUserLike();
    }
  }, [video.id, user]);

  // Fetch user's subscription status
  useEffect(() => {
    if (user) {
      const channelId = video.ownerUid || video.channelName;
      const subRef = doc(db, 'subscriptions', `${channelId}_${user.uid}`);
      const unsubscribeUserSub = onSnapshot(subRef, (doc) => {
        setIsSubscribed(doc.exists());
      });
      return () => unsubscribeUserSub();
    }
  }, [video.ownerUid, video.channelName, user]);

  // Fetch user's playlists and check memberships
  useEffect(() => {
    if (user) {
      const playlistsQuery = query(collection(db, 'playlists'), where('userUid', '==', user.uid));
      const unsubscribePlaylists = onSnapshot(playlistsQuery, (snapshot) => {
        const fetchedPlaylists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Playlist[];
        setUserPlaylists(fetchedPlaylists);
      });

      const itemsQuery = query(collection(db, 'playlistItems'), where('videoId', '==', video.id));
      const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
        const memberships: Record<string, boolean> = {};
        snapshot.docs.forEach(doc => {
          memberships[doc.data().playlistId] = true;
        });
        setPlaylistMemberships(memberships);
      });

      return () => {
        unsubscribePlaylists();
        unsubscribeItems();
      };
    }
  }, [user, video.id]);

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like videos');
      return;
    }

    const likeId = `${video.id}_${user.uid}`;
    const likeRef = doc(db, 'likes', likeId);
    const videoRef = doc(db, 'videos', video.id);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(videoRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, {
          videoId: video.id,
          userUid: user.uid,
          createdAt: serverTimestamp()
        });
        await setDoc(videoRef, { 
          likesCount: increment(1),
          title: video.title,
          ownerUid: video.ownerUid || 'system',
          id: video.id
        }, { merge: true });
        if (isDisliked) setIsDisliked(false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'likes');
    }
  };

  const handleDislike = () => {
    if (!user) {
      alert('Please sign in to dislike videos');
      return;
    }
    setIsDisliked(!isDisliked);
    if (isLiked) handleLike();
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    const channelId = video.ownerUid || video.channelName;
    const subId = `${channelId}_${user.uid}`;
    const subRef = doc(db, 'subscriptions', subId);
    const channelRef = doc(db, 'channels', channelId);

    try {
      if (isSubscribed) {
        await deleteDoc(subRef);
        await updateDoc(channelRef, { subscribersCount: increment(-1) });
        setIsBellActive(false);
      } else {
        await setDoc(subRef, {
          channelId,
          userUid: user.uid,
          createdAt: serverTimestamp()
        });
        await setDoc(channelRef, { 
          subscribersCount: increment(1),
          name: video.channelName,
          ownerUid: video.ownerUid || 'system',
          id: channelId
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'subscriptions');
    }
  };

  const handleComment = async () => {
    if (!user) {
      alert('Please sign in to comment');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const commentRef = doc(collection(db, 'comments'));
      await setDoc(commentRef, {
        id: commentRef.id,
        videoId: video.id,
        userUid: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatarUrl: user.photoURL || '',
        text: commentText,
        createdAt: serverTimestamp()
      });
      setCommentText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  };

  const togglePlaylistMembership = async (playlistId: string) => {
    if (!user) return;
    const itemId = `${playlistId}_${video.id}`;
    const itemRef = doc(db, 'playlistItems', itemId);
    const playlistRef = doc(db, 'playlists', playlistId);

    try {
      if (playlistMemberships[playlistId]) {
        await deleteDoc(itemRef);
        await updateDoc(playlistRef, { videoCount: increment(-1) });
      } else {
        await setDoc(itemRef, {
          id: itemId,
          playlistId,
          videoId: video.id,
          addedAt: serverTimestamp()
        });
        await updateDoc(playlistRef, { 
          videoCount: increment(1),
          thumbnailUrl: video.thumbnailUrl // Update thumbnail to the latest added video
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'playlistItems');
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeIdFromUrl = getYoutubeId(video.videoUrl || '');
  const finalYoutubeId = youtubeIdFromUrl || (!video.videoUrl ? video.id : null);

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1700px] mx-auto transition-colors duration-300">
      {/* Main Content */}
      <div className="flex-1">
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
          {finalYoutubeId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : video.videoUrl ? (
            <video 
              src={video.videoUrl} 
              className="w-full h-full" 
              controls 
              autoPlay 
              poster={video.thumbnailUrl}
            />
          ) : null}
        </div>

        <h1 className="text-xl font-bold mt-4 line-clamp-2 dark:text-white">{video.title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <img 
              src={video.channelAvatarUrl} 
              alt={video.channelName}
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base dark:text-white">{video.channelName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatSubscribers(subscribersCount)} subscribers</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={handleSubscribe}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                  isSubscribed 
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700" 
                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                )}
              >
                {!isSubscribed && <Bell size={16} />}
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
              {isSubscribed && (
                <button 
                  onClick={() => setIsBellActive(!isBellActive)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
                  title="Notifications"
                >
                  {isBellActive ? <BellRing size={20} className="text-blue-600 dark:text-blue-400" /> : <Bell size={20} />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full">
              <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-l-full border-r border-gray-300 dark:border-zinc-700 transition-colors",
                  isLiked ? "text-blue-600 dark:text-blue-400" : "dark:text-white"
                )}
              >
                <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                <span className="text-sm font-medium">{likesCount > 0 ? formatSubscribers(likesCount) : 'Like'}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={cn(
                  "px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-r-full transition-colors",
                  isDisliked ? "text-blue-600 dark:text-blue-400" : "dark:text-white"
                )}
              >
                <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
              </button>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors dark:text-white"
            >
              <Share2 size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  alert('Please sign in to save videos');
                  return;
                }
                setIsPlaylistModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors dark:text-white"
            >
              <ListPlus size={18} />
              <span className="text-sm font-medium">Save</span>
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors hidden md:flex dark:text-white"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button 
              className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors dark:text-white"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-3 mt-4 text-sm transition-colors">
          <div className="font-bold mb-1 dark:text-white">
            {formatSubscribers(viewsCount)} views • {video.postedAt}
          </div>
          <p className="whitespace-pre-wrap dark:text-gray-300">
            {video.description || "No description available for this video."}
          </p>
          <button className="font-bold mt-2 hover:text-gray-600 dark:hover:text-gray-400 dark:text-white">Show more</button>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 dark:text-white">{comments.length} Comments</h3>
          <div className="flex gap-4 mb-8">
            {user ? (
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                ?
              </div>
            )}
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full border-b border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none py-1 text-sm transition-colors bg-transparent dark:text-white"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={() => {
                  if (!user) alert('Please sign in to comment');
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => setCommentText('')}
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleComment}
                  disabled={!commentText.trim() || !user}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Comments */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="flex gap-4">
                  {c.userAvatarUrl ? (
                    <img 
                      src={c.userAvatarUrl} 
                      alt={c.userName} 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-sm font-bold flex-shrink-0">
                      {c.userName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold dark:text-white">{c.userName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm dark:text-gray-300">{c.text}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={14} className="cursor-pointer hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
                      </div>
                      <ThumbsDown size={14} className="cursor-pointer hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" />
                      <span className="text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-full dark:text-white">Reply</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <MessageSquare size={48} className="mb-2 opacity-20" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar / Related Videos */}
      <div className="lg:w-[400px] flex flex-col gap-3">
        {relatedVideos.map((v) => (
          <div 
            key={v.id} 
            className="flex gap-2 cursor-pointer group"
            onClick={() => onVideoClick(v)}
          >
            <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800">
              <img 
                src={v.thumbnailUrl} 
                alt={v.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                {v.duration}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {v.title}
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="hover:text-black dark:hover:text-white">{v.channelName}</div>
                <div>{v.views} • {v.postedAt}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
              <h3 className="text-sm font-bold dark:text-white">Save to...</h3>
              <button onClick={() => setIsPlaylistModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto no-scrollbar">
              {userPlaylists.length > 0 ? (
                userPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => togglePlaylistMembership(playlist.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        playlistMemberships[playlist.id] 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-300 dark:border-zinc-700"
                      )}>
                        {playlistMemberships[playlist.id] && <Check size={14} />}
                      </div>
                      <span className="text-sm font-medium dark:text-white">{playlist.title}</span>
                    </div>
                    {playlist.visibility === 'private' ? <Lock size={14} className="text-gray-400" /> : <Globe size={14} className="text-gray-400" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No playlists found. Create one on your channel page.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
