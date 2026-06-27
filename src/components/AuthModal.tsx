import React from 'react';
import { Youtube, X } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Successfully signed in:', result.user.displayName);
      onClose();
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      let errorMessage = error.message;
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for sign-in. Please add this domain to your Firebase Console authorized domains.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        return;
      }
      alert(`Sign in failed: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X size={20} className="dark:text-white" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <Youtube size={48} color="#FF0000" fill="#FF0000" />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Sign in to YouTube</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to upload videos, like, and subscribe to your favorite channels.
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 py-3 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5 h-5" />
            <span className="dark:text-white">Sign in with Google</span>
          </button>

          <div className="mt-8 text-xs text-gray-500 dark:text-gray-500">
            By continuing, you agree to YouTube's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};
