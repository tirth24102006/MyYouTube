import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryBar } from './components/CategoryBar';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { AuthModal } from './components/AuthModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MOCK_VIDEOS } from './constants';
import { Video } from './types';
import { cn } from './lib/utils';
import { 
  History as HistoryIcon, 
  PlaySquare, 
  Users, 
  Library, 
  Clock, 
  ThumbsUp, 
  Youtube 
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LoginPage } from './components/LoginPage';
import { ChannelPage } from './components/ChannelPage';
import { UploadModal } from './components/UploadModal';
import { ShortsPage } from './components/ShortsPage';
import { ShortsSection } from './components/ShortsSection';
import { Short } from './types';

type Page = 'home' | 'watch' | 'login' | 'channel' | 'history' | 'shorts' | 'subscriptions' | 'library' | 'videos' | 'later' | 'liked' | 'trending' | 'shopping' | 'music' | 'live' | 'gaming' | 'news' | 'sports' | 'learning' | 'fashion';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');
  const [history, setHistory] = useState<Video[]>(() => {
    const saved = localStorage.getItem('video_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('video_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (video: Video) => {
    setHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      return [video, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userVideos, setUserVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('user_videos');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedVideos, setLikedVideos] = useState<string[]>(() => {
    const saved = localStorage.getItem('liked_videos');
    return saved ? JSON.parse(saved) : [];
  });
  const [dbVideos, setDbVideos] = useState<Video[]>([]);

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videos = snapshot.docs.map(doc => {
        const data = doc.data() as Video;
        return {
          ...data,
          postedAt: formatRelativeTime(data.createdAt)
        };
      });
      setDbVideos(videos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('user_videos', JSON.stringify(userVideos));
  }, [userVideos]);

  useEffect(() => {
    localStorage.setItem('liked_videos', JSON.stringify(likedVideos));
  }, [likedVideos]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync user to SQL backend
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          })
        }).catch(err => console.error('SQL Sync error:', err));

        // Sync user to Firestore with a small delay and retry to handle race conditions
        const syncToFirestore = async (retryCount = 0) => {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                createdAt: serverTimestamp()
              });
            }
          } catch (error: any) {
            if (retryCount < 3 && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
              console.log(`Retrying Firestore sync (attempt ${retryCount + 1})...`);
              setTimeout(() => syncToFirestore(retryCount + 1), 1000);
            } else {
              console.error('Error syncing user to Firestore:', error);
            }
          }
        };

        setTimeout(() => syncToFirestore(), 500);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const allVideos = [...dbVideos, ...MOCK_VIDEOS];

  const filteredVideos = allVideos.filter(video => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      video.title.toLowerCase().includes(searchLower) || 
      video.channelName.toLowerCase().includes(searchLower) ||
      (video.description?.toLowerCase().includes(searchLower)) ||
      (video.category?.toLowerCase().includes(searchLower)) ||
      (video.channelDescription?.toLowerCase().includes(searchLower));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    return matchesSearch && video.category === selectedCategory;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setCurrentPage('watch');
    addToHistory(video);
    window.scrollTo(0, 0);
  };

  const handleShortClick = (short: Short) => {
    setCurrentPage('shorts');
    setActiveSidebarItem('shorts');
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setSelectedVideo(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setCurrentPage('home');
    setActiveSidebarItem('home');
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
    setCurrentPage('home');
  };

  const navigateToChannel = () => {
    setCurrentPage('channel');
    setActiveSidebarItem('channel');
    setSelectedVideo(null);
    setIsSidebarOpen(false);
  };

  const handleSidebarItemClick = (item: string) => {
    setActiveSidebarItem(item);
    
    // List of categories that should trigger filtering on the home page
    const categories = ['music', 'gaming', 'live', 'news', 'sports', 'learning', 'fashion', 'trending', 'shopping'];
    
    if (item === 'home') {
      goHome();
    } else if (item === 'channel') {
      navigateToChannel();
    } else if (categories.includes(item)) {
      setSelectedCategory(item);
      setCurrentPage('home');
      setSelectedVideo(null);
      window.scrollTo(0, 0);
      if (isMobile) setIsSidebarOpen(false);
    } else {
      setCurrentPage(item as Page);
      setSelectedVideo(null);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  if (currentPage === 'login') {
    return <LoginPage onClose={() => setCurrentPage('home')} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
        <Header 
          onMenuClick={toggleSidebar} 
          onLogoClick={goHome} 
          onSearch={handleSearch}
          isDark={isDark}
          toggleTheme={toggleTheme}
          user={user}
          onSignInClick={() => setCurrentPage('login')}
          onCreateChannelClick={() => setIsCreateChannelModalOpen(true)}
          onChannelClick={navigateToChannel}
          onUploadClick={() => setIsUploadModalOpen(true)}
        />
        
        <div className="flex pt-14">
          {isSidebarOpen && (isMobile || currentPage === 'watch') && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {(currentPage === 'home' || currentPage === 'history' || currentPage === 'shorts' || currentPage === 'subscriptions' || currentPage === 'library' || currentPage === 'videos' || currentPage === 'later' || currentPage === 'liked' || currentPage === 'trending' || currentPage === 'shopping' || currentPage === 'music' || currentPage === 'live' || currentPage === 'gaming' || currentPage === 'news' || currentPage === 'sports' || currentPage === 'learning' || currentPage === 'fashion') && (
            <Sidebar 
              isOpen={isSidebarOpen} 
              activeItem={activeSidebarItem}
              onItemClick={handleSidebarItemClick}
            />
          )}

          {currentPage === 'watch' && isSidebarOpen && (
            <Sidebar 
              isOpen={isSidebarOpen} 
              activeItem={activeSidebarItem}
              onItemClick={handleSidebarItemClick}
            />
          )}

          <main className={cn(
            "flex-1 transition-all duration-200",
            (currentPage === 'home' || currentPage === 'history' || currentPage === 'shorts' || currentPage === 'subscriptions' || currentPage === 'library' || currentPage === 'videos' || currentPage === 'later' || currentPage === 'liked' || currentPage === 'trending' || currentPage === 'shopping' || currentPage === 'music' || currentPage === 'live' || currentPage === 'gaming' || currentPage === 'news' || currentPage === 'sports' || currentPage === 'learning' || currentPage === 'fashion') && (isSidebarOpen ? "sm:ml-60" : "sm:ml-20"),
            (currentPage === 'watch' || currentPage === 'channel') && "ml-0"
          )}>
            {currentPage === 'watch' && selectedVideo ? (
              <WatchPage 
                video={selectedVideo} 
                relatedVideos={allVideos.filter(v => v.id !== selectedVideo.id)}
                onVideoClick={handleVideoClick}
                likedVideos={likedVideos}
                onLikeToggle={(id) => {
                  setLikedVideos(prev => 
                    prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
                  );
                }}
                user={user}
              />
            ) : currentPage === 'channel' ? (
              <ChannelPage user={user} userVideos={userVideos} />
            ) : currentPage === 'shorts' ? (
              <ShortsPage />
            ) : currentPage === 'home' ? (
              <>
                <CategoryBar 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={setSelectedCategory} 
                />
                
                {filteredVideos.length > 0 ? (
                  <>
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                      {filteredVideos.slice(0, 8).map((video) => (
                        <VideoCard 
                          key={video.id} 
                          video={video} 
                          onClick={() => handleVideoClick(video)}
                        />
                      ))}
                    </div>
                    
                    <ShortsSection onShortClick={handleShortClick} />
                    
                    {filteredVideos.length > 8 && (
                      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                        {filteredVideos.slice(8).map((video) => (
                          <VideoCard 
                            key={video.id} 
                            video={video} 
                            onClick={() => handleVideoClick(video)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-xl font-medium text-gray-500">No videos found for "{searchQuery}"</p>
                    <button 
                      onClick={goHome}
                      className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                      Clear search and go home
                    </button>
                  </div>
                )}
              </>
            ) : currentPage === 'history' ? (
              <div className="p-4 sm:p-6">
                <h2 className="text-2xl font-bold dark:text-white mb-6">Watch history</h2>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                    {history.map((video) => (
                      <VideoCard 
                        key={`${video.id}-history`} 
                        video={video} 
                        onClick={() => handleVideoClick(video)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <HistoryIcon size={64} className="text-gray-300 mb-4" />
                    <p className="text-xl font-medium text-gray-500">Your watch history is empty</p>
                    <button 
                      onClick={goHome}
                      className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                      Go watch some videos
                    </button>
                  </div>
                )}
              </div>
            ) : currentPage === 'liked' ? (
              <div className="p-4 sm:p-6">
                <h2 className="text-2xl font-bold dark:text-white mb-6">Liked videos</h2>
                {allVideos.filter(v => likedVideos.includes(v.id)).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                    {allVideos.filter(v => likedVideos.includes(v.id)).map((video) => (
                      <VideoCard 
                        key={`${video.id}-liked`} 
                        video={video} 
                        onClick={() => handleVideoClick(video)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <ThumbsUp size={64} className="text-gray-300 mb-4" />
                    <p className="text-xl font-medium text-gray-500">You haven't liked any videos yet</p>
                    <button 
                      onClick={goHome}
                      className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                      Go watch some videos
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
                <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <Youtube size={48} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white mb-2 capitalize">{currentPage.replace(/([A-Z])/g, ' $1').trim()}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                  This page is currently under development. Soon you'll be able to see your {currentPage} here!
                </p>
                {!user && (
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign in to see your {currentPage}
                  </button>
                )}
              </div>
            )}
          </main>
        </div>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
        
        <CreateChannelModal 
          isOpen={isCreateChannelModalOpen} 
          onClose={() => setIsCreateChannelModalOpen(false)}
          onSuccess={() => {
            navigateToChannel();
          }}
        />

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          user={user}
        />
      </div>
    </ErrorBoundary>
  );
}
