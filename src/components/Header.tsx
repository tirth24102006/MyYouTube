import React, { useState } from 'react';
import { Menu, Search, Mic, Video, Bell, User, Youtube, LogOut, PlusCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { auth } from '../firebase';
import { signOut, User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
  onSearch: (query: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  user: FirebaseUser | null;
  onSignInClick: () => void;
  onCreateChannelClick: () => void;
  onChannelClick: () => void;
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onLogoClick, 
  onSearch, 
  isDark, 
  toggleTheme,
  user,
  onSignInClick,
  onCreateChannelClick,
  onChannelClick,
  onUploadClick
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-black flex items-center justify-between px-4 z-50 border-b dark:border-zinc-800 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
        >
          <Menu size={24} />
        </button>
        <div 
          onClick={onLogoClick}
          className="flex items-center cursor-pointer group"
          title="Home"
        >
          <div className="w-10 h-7 bg-[#FF0000] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-[#CC0000] transition-colors">
            <span className="text-white font-black text-xl leading-none select-none">T</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[720px] flex items-center gap-4 ml-10">
        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <div className="flex flex-1 items-center border border-gray-300 dark:border-zinc-700 rounded-l-full px-4 py-1.5 focus-within:border-blue-500 shadow-inner bg-white dark:bg-zinc-800">
            <Search size={18} className="text-gray-400 mr-2 hidden sm:block" />
            <input
              type="text"
              placeholder="Search"
              className="w-full outline-none text-base dark:text-white bg-transparent"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-gray-50 dark:bg-zinc-700 border border-l-0 border-gray-300 dark:border-zinc-700 rounded-r-full px-5 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors">
            <Search size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </form>
        <button className="p-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors hidden sm:block">
          <Mic size={20} className="dark:text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle isDark={isDark} toggle={toggleTheme} />
        
        <button 
          onClick={user ? onUploadClick : onSignInClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden md:block dark:text-white"
          title="Create"
        >
          <Video size={24} />
        </button>

        {user ? (
          <>
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden md:block dark:text-white" title="Notifications">
              <Bell size={24} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-12 right-0 w-64 bg-white dark:bg-black border dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b dark:border-zinc-800 flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold dark:text-white truncate">{user.displayName}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        onChannelClick();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <User size={20} className="dark:text-white" />
                      <span className="text-sm dark:text-white">Your channel</span>
                    </button>
                    <button 
                      onClick={() => {
                        onCreateChannelClick();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <PlusCircle size={20} className="dark:text-white" />
                      <span className="text-sm dark:text-white">Create a channel</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <LogOut size={20} className="dark:text-white" />
                      <span className="text-sm dark:text-white">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button 
            onClick={onSignInClick}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-full text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <User size={20} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
