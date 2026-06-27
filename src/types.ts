export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatarUrl: string;
  views: string;
  postedAt: string;
  duration: string;
  description?: string;
  category?: string;
  videoUrl?: string;
  channelDescription?: string;
  ownerUid?: string;
  createdAt?: any;
}

export interface Short {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  likes: string;
  comments: string;
  views: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userUid: string;
  userName: string;
  userAvatarUrl: string;
  text: string;
  createdAt: any;
}

export interface Playlist {
  id: string;
  userUid: string;
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  createdAt: any;
  videoCount?: number;
  thumbnailUrl?: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  videoId: string;
  addedAt: any;
}
