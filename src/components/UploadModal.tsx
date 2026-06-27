import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Film, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Video } from '../types';
import { cn } from '../lib/utils';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressRef = React.useRef(0);
  const [uploadTask, setUploadTask] = useState<any>(null);
  const isUserCanceling = React.useRef(false);
  const taskRef = React.useRef<any>(null);
  const [uploadError, setUploadError] = useState<{ message: string; advice: string } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    taskRef.current = uploadTask;
  }, [uploadTask]);

  useEffect(() => {
    if (!isOpen && isUploading && uploadTask) {
      console.log('Modal closed while uploading, canceling task...');
      handleCancelUpload();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (taskRef.current) {
        console.log('Unmounting UploadModal, canceling active upload task...');
        taskRef.current.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (!title) setTitle(file.name.split('.')[0]);
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    setVideoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to upload videos.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    progressRef.current = 0;
    isUserCanceling.current = false;

    if (!videoFile && !videoUrl) {
      alert('Please select a video file or provide a video URL.');
      setIsUploading(false);
      return;
    }

    try {
      console.log('Starting upload process...', { title, videoFile: videoFile?.name, videoUrl });
      let finalVideoUrl = videoUrl;
      const videoId = `v-${Date.now()}`;

      const getStorageErrorMessage = (error: any) => {
        switch (error.code) {
          case 'storage/unauthorized':
            return {
              message: 'Permission Denied',
              advice: 'You do not have permission to upload files. This might be due to security rules or your account status. Please check if you are signed in correctly.'
            };
          case 'storage/quota-exceeded':
            return {
              message: 'Storage Quota Exceeded',
              advice: 'The storage limit for this project has been reached. Please try again later or contact the administrator.'
            };
          case 'storage/unauthenticated':
            return {
              message: 'Authentication Required',
              advice: 'Your session might have expired. Please sign out and sign back in to continue.'
            };
          case 'storage/retry-limit-exceeded':
            return {
              message: 'Network Timeout',
              advice: 'The upload took too long due to a poor connection. Please check your internet and try again.'
            };
          case 'storage/invalid-checksum':
            return {
              message: 'File Corrupted',
              advice: 'The file was corrupted during transmission. Please try uploading the file again.'
            };
          case 'storage/canceled':
            return {
              message: 'Upload Canceled',
              advice: 'The upload was canceled.'
            };
          default:
            return {
              message: 'Upload Failed',
              advice: error.message || 'An unexpected error occurred. Please try again.'
            };
        }
      };

      // If we have a local file, upload it to Firebase Storage
      if (videoFile) {
        console.log('Video file details:', { name: videoFile.name, size: videoFile.size, type: videoFile.type });
        if (videoFile.size > 100 * 1024 * 1024) { // 100MB limit
          alert('Video file is too large. Please upload a file smaller than 100MB.');
          setIsUploading(false);
          return;
        }

        console.log('Storage instance:', storage);
        const storageRef = ref(storage, `videos/${user.uid}/${videoId}-${videoFile.name}`);
        console.log('Storage ref created:', storageRef.fullPath);
        
        const task = uploadBytesResumable(storageRef, videoFile);
        console.log('Upload task started:', task);
        setUploadTask(task);

        // Stall detection
        let lastBytesTransferred = 0;
        let lastProgressTime = Date.now();
        const STALL_TIMEOUT = 45000; // 45 seconds of no progress is a stall

        finalVideoUrl = await new Promise((resolve, reject) => {
          const stallCheckInterval = setInterval(() => {
            if (Date.now() - lastProgressTime > STALL_TIMEOUT) {
              console.error('Upload stalled: No progress for 45 seconds');
              clearInterval(stallCheckInterval);
              task.cancel();
              reject(new Error('Upload stalled due to network inactivity. Please check your connection and try again.'));
            }
          }, 5000);

          task.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              
              if (snapshot.bytesTransferred > lastBytesTransferred) {
                lastBytesTransferred = snapshot.bytesTransferred;
                lastProgressTime = Date.now();
              }

              console.log(`Upload progress: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes) - State: ${snapshot.state}`);
              setUploadProgress(progress);
              progressRef.current = progress;
            }, 
            (error) => {
              clearInterval(stallCheckInterval);
              if (error.code === 'storage/canceled') {
                console.log('Storage upload was canceled.');
                reject(new Error('Upload canceled'));
                return;
              }

              console.error('Storage upload error details:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              
              if (!isUserCanceling.current) {
                const errorDetails = getStorageErrorMessage(error);
                setUploadError(errorDetails);
              }
              
              reject(error);
            }, 
            async () => {
              clearInterval(stallCheckInterval);
              try {
                console.log('Upload complete, getting download URL...');
                const downloadURL = await getDownloadURL(task.snapshot.ref);
                console.log('Download URL obtained:', downloadURL);
                resolve(downloadURL);
              } catch (error: any) {
                console.error('Error getting download URL:', error);
                reject(error);
              }
            }
          );
        });
      }

      if (!finalVideoUrl) {
        throw new Error('No video URL obtained. Please provide a URL or upload a file.');
      }

      console.log('Saving metadata to Firestore...', { videoId, finalVideoUrl });
      const newVideo: any = {
        id: videoId,
        title,
        thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/1280/720`,
        channelName: user?.displayName || 'My Channel',
        channelAvatarUrl: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        views: '0 views',
        postedAt: 'Just now',
        duration: '0:00',
        description: description || 'No description provided.',
        videoUrl: finalVideoUrl,
        ownerUid: user.uid,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'videos', videoId), newVideo);
      
      setIsUploading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setTitle('');
        setDescription('');
        setThumbnailUrl('');
        setVideoUrl('');
        setVideoFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (error: any) {
      if (error.message === 'Upload canceled') {
        console.log('Upload was canceled by user');
      } else {
        console.error('Upload error:', error);
        setUploadError({
          message: 'Upload Failed',
          advice: error.message || 'An unknown error occurred during upload. Please try again.'
        });
      }
      setIsUploading(false);
      setUploadTask(null);
    }
  };

  const handleCancelUpload = () => {
    console.log('User initiated upload cancellation');
    isUserCanceling.current = true;
    if (uploadTask) {
      uploadTask.cancel();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadTask(null);
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-black w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold dark:text-white">Upload video</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={24} className="dark:text-white" />
          </button>
        </div>

        <div className="p-8">
          {isUploading && !isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {uploadError ? (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                    <X size={32} />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">{uploadError.message}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                    {uploadError.advice}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadError(null);
                        setIsUploading(false);
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full max-w-md bg-gray-100 dark:bg-zinc-800 rounded-full h-4 mb-6 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold dark:text-white mb-2">
                    {uploadProgress < 100 ? 'Uploading video...' : 'Finalizing...'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {Math.round(uploadProgress)}% complete
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-6 max-w-xs">
                    Please keep this window open until the upload is complete. Large videos may take several minutes depending on your connection.
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    Cancel Upload
                  </button>
                </>
              )}
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold dark:text-white mb-2">Upload complete!</h3>
              <p className="text-gray-500 dark:text-gray-400">Your video is now live on your channel.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (required)</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="Add a title that describes your video"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                      placeholder="Tell viewers about your video"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL (MP4)</label>
                    <div className="relative">
                      <Film className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        disabled={!!videoFile}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white disabled:opacity-50"
                        placeholder={videoFile ? "File selected" : "https://example.com/video.mp4"}
                      />
                    </div>
                  </div>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !videoFile && fileInputRef.current?.click()}
                    className={cn(
                      "mt-4 p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative",
                      isDragging 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700",
                      videoFile && "cursor-default"
                    )}
                  >
                    {videoFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearVideoFile();
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload size={32} className={cn("mb-2", isDragging ? "text-blue-500" : "text-gray-400")} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {videoFile ? `Selected: ${videoFile.name}` : "Drag and drop video files to upload"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {videoFile 
                        ? "Local file selected. It will be uploaded to our servers for global sharing." 
                        : "Your video will be shared globally."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-8 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : 'Upload'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
