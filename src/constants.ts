import { Video, Category, Short } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'music', name: 'Music' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'live', name: 'Live' },
  { id: 'news', name: 'News' },
  { id: 'sports', name: 'Sports' },
  { id: 'learning', name: 'Learning' },
  { id: 'fashion', name: 'Fashion & Beauty' },
  { id: 'podcasts', name: 'Podcasts' },
  { id: 'movies', name: 'Movies' },
  { id: 'tech', name: 'Technology' },
  { id: 'coding', name: 'Coding' },
  { id: 'cooking', name: 'Cooking' },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelName: 'Rick Astley',
    channelAvatarUrl: 'https://picsum.photos/seed/rick/48/48',
    views: '1.4B views',
    postedAt: '14 years ago',
    duration: '3:33',
    description: 'The official video for "Never Gonna Give You Up" by Rick Astley.',
    category: 'music',
    channelDescription: 'Official Rick Astley channel. Singer, songwriter, and internet legend.'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    channelName: 'jawed',
    channelAvatarUrl: 'https://picsum.photos/seed/jawed/48/48',
    views: '310M views',
    postedAt: '18 years ago',
    duration: '0:19',
    description: 'The first video on YouTube.',
    category: 'all',
    channelDescription: 'Co-founder of YouTube.'
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(ê°•ë‚¨ìŠ¤íƒ€ì¼) M/V',
    thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    channelName: 'officialpsy',
    channelAvatarUrl: 'https://picsum.photos/seed/psy/48/48',
    views: '5.1B views',
    postedAt: '11 years ago',
    duration: '4:12',
    category: 'music'
  },
  {
    id: 'gaming1',
    title: 'Minecraft Speedrun World Record (Simulated)',
    thumbnailUrl: 'https://picsum.photos/seed/minecraft/640/360',
    channelName: 'Dreamer',
    channelAvatarUrl: 'https://picsum.photos/seed/dream/48/48',
    views: '12M views',
    postedAt: '2 days ago',
    duration: '15:42',
    category: 'gaming'
  },
  {
    id: 'live1',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    thumbnailUrl: 'https://picsum.photos/seed/lofi/640/360',
    channelName: 'Lofi Girl',
    channelAvatarUrl: 'https://picsum.photos/seed/lofigirl/48/48',
    views: '50K watching',
    postedAt: 'LIVE',
    duration: 'LIVE',
    category: 'live'
  },
  {
    id: 'news1',
    title: 'Breaking News: Major Scientific Discovery in Space',
    thumbnailUrl: 'https://picsum.photos/seed/news/640/360',
    channelName: 'Global News',
    channelAvatarUrl: 'https://picsum.photos/seed/newschan/48/48',
    views: '1.2M views',
    postedAt: '5 hours ago',
    duration: '10:15',
    category: 'news'
  },
  {
    id: 'sports1',
    title: 'Top 10 Goals of the Season | Football Highlights',
    thumbnailUrl: 'https://picsum.photos/seed/sports/640/360',
    channelName: 'Sports Central',
    channelAvatarUrl: 'https://picsum.photos/seed/sportchan/48/48',
    views: '8.5M views',
    postedAt: '1 day ago',
    duration: '12:30',
    category: 'sports'
  },
  {
    id: 'fashion1',
    title: 'Summer Fashion Trends 2026 | Lookbook',
    thumbnailUrl: 'https://picsum.photos/seed/fashion/640/360',
    channelName: 'Style Icon',
    channelAvatarUrl: 'https://picsum.photos/seed/style/48/48',
    views: '450K views',
    postedAt: '3 days ago',
    duration: '08:45',
    category: 'fashion'
  },
  {
    id: 'learning1',
    title: 'Quantum Physics Explained in 10 Minutes',
    thumbnailUrl: 'https://picsum.photos/seed/science/640/360',
    channelName: 'Science Simplified',
    channelAvatarUrl: 'https://picsum.photos/seed/sciencechan/48/48',
    views: '2.1M views',
    postedAt: '1 week ago',
    duration: '10:00',
    category: 'learning'
  },
  {
    id: 'trending1',
    title: 'Why Everyone is Talking About This New AI Tool',
    thumbnailUrl: 'https://picsum.photos/seed/ai/640/360',
    channelName: 'Tech Insider',
    channelAvatarUrl: 'https://picsum.photos/seed/techchan/48/48',
    views: '3.4M views',
    postedAt: '12 hours ago',
    duration: '15:20',
    category: 'trending'
  },
  {
    id: 'shopping1',
    title: 'Unboxing the Latest Smartphone | Worth the Hype?',
    thumbnailUrl: 'https://picsum.photos/seed/phone/640/360',
    channelName: 'Gadget Review',
    channelAvatarUrl: 'https://picsum.photos/seed/gadget/48/48',
    views: '890K views',
    postedAt: '1 day ago',
    duration: '18:10',
    category: 'shopping'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito - Luis Fonsi ft. Daddy Yankee',
    thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    channelName: 'Luis Fonsi',
    channelAvatarUrl: 'https://picsum.photos/seed/fonsi/48/48',
    views: '8.4B views',
    postedAt: '7 years ago',
    duration: '4:42',
    category: 'music'
  }
];

export const MOCK_SHORTS: Short[] = [
  {
    id: 's1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-alone-34887-large.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/short1/400/700',
    title: 'Food & Fun at an Epic North Indian Wedding!! ðŸ’ ðŸ¹ ðŸ›',
    channelName: 'DanceMaster',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dance',
    likes: '1.2M',
    comments: '12K',
    views: '2M views'
  },
  {
    id: 's2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-a-street-lamp-at-night-34889-large.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/short2/400/700',
    title: 'Rating Goa\'s New Mcd Menu ðŸ˜ Mexican Burger ðŸ” Fried ...',
    channelName: 'UrbanVibe',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urban',
    likes: '850K',
    comments: '8.4K',
    views: '1.1M views'
  },
  {
    id: 's3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-park-34890-large.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/short3/400/700',
    title: 'ìœë§ˆì´ ë‹ˆ AC ë‹ˆ ë§ ì„œì„œ íŒŒ ðŸ¤£ ðŸ¤£ ðŸ¤£...#gujaraticomedy ...',
    channelName: 'NatureFlow',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature',
    likes: '2.4M',
    comments: '45K',
    views: '2.1K views'
  },
  {
    id: 's4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-alone-34887-large.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/short4/400/700',
    title: 'India vs Australia- The Gripping Match ðŸ”¥ | The Test | ...',
    channelName: 'SportsHub',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    likes: '3.1M',
    comments: '50K',
    views: '2.7M views'
  },
  {
    id: 's5',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-a-street-lamp-at-night-34889-large.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/short5/400/700',
    title: 'Lucknow Wedding Vibes! ðŸŽ‰',
    channelName: 'TravelVlog',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel',
    likes: '500K',
    comments: '5K',
    views: '1.5M views'
  }
];
