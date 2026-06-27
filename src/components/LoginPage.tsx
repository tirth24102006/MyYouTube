import React, { useState } from 'react';
import { Youtube, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for sign-in. Please add this domain to your Firebase Console authorized domains.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, don't show an error
        return;
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in window was closed before completion. Please try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('A network error occurred. Please check your internet connection and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled for this project. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else if (err.code === 'auth/invalid-api-key') {
        setError('The Firebase API key is invalid. Please check your firebase-applet-config.json file.');
      } else if (err.code === 'auth/app-not-authorized') {
        setError('The app is not authorized to use Firebase Authentication. Please check your Firebase Console settings.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This user account has been disabled. Please contact support.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful sign-in attempts. Please try again later.');
      } else if (err.code === 'auth/web-storage-unsupported') {
        setError('Your browser does not support web storage, which is required for sign-in. Please try a different browser.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('The sign-in credential is no longer valid. Please try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.');
      } else if (err.code === 'auth/auth-domain-config-required') {
        setError('Firebase Auth domain configuration is missing. Please check your firebase-applet-config.json file.');
      } else if (err.code === 'auth/invalid-origin') {
        setError('This origin is not authorized for Firebase Authentication. Please add it to the authorized domains in the Firebase Console.');
      } else if (err.code === 'auth/unauthorized-continue-uri') {
        setError('The continue URI is not authorized. Please check your Firebase Console settings.');
      } else if (err.code === 'auth/missing-iframe-handler') {
        setError('The required iframe handler is missing. This can happen if the auth domain is not correctly configured.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('The project quota for Firebase Authentication has been exceeded. Please try again later.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is invalid.');
      } else if (err.code === 'auth/user-mismatch') {
        setError('The sign-in credentials do not match the currently signed-in user.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('This operation is sensitive and requires recent authentication. Please sign in again.');
      } else if (err.code === 'auth/provider-already-linked') {
        setError('This account is already linked to the selected provider.');
      } else if (err.code === 'auth/internal-error') {
        setError('An internal error occurred. Please try again later.');
      } else if (err.message?.includes('third-party cookies')) {
        setError('Sign-in failed due to blocked third-party cookies. Please enable them in your browser settings or try a different browser.');
      } else {
        setError(err.message || 'An error occurred during Google Sign-In. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-2xl shadow-xl overflow-hidden border dark:border-zinc-800">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-12 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={onClose}>
                <span className="text-3xl font-black text-white">T</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold dark:text-white">
              {isSignUp ? 'Create your account' : 'Sign in to YouTube'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              to continue to YouTube
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5 h-5" />
              <span className="dark:text-white">Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
