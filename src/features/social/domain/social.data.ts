import type { IconKey } from '@/features/dashboard/domain/dashboard.types';

export interface PostComment {
  name: string;
  text: string;
  time: string;
}

export interface AchievementCard {
  title: string;
  sub: string;
  icon: IconKey;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  badge?: string;
  isAdam?: boolean;
  verified?: boolean;
  time: string;
  text: string;
  achievement?: AchievementCard;
  hasImage?: boolean;
  attachment?: {
    id: string;
    kind: string;
    url: string;
  };
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  location?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
  isPinned: boolean;
  canFollowAuthor?: boolean;
  isAuthorFollowedByMe?: boolean;
}

export interface ActiveUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAdam?: boolean;
  canFollow?: boolean;
  isFollowedByMe?: boolean;
}

const FIRE_3 = 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)';

export const POSTS: Post[] = [
  {
    id: 'p1',
    author: 'آدم',
    authorId: 'adam',
    avatar: FIRE_3,
    badge: 'ققنوس',
    isAdam: true,
    verified: true,
    time: '۳ ساعت پیش',
    text: 'به همه اعضای قبیله خوش آمد می‌گم 🔥 مسیر رشد شما از همین لحظه شروع شده. هر روز یه قدم، هر قدم یه تحول.',
    likes: 142,
    comments: [
      { name: 'آرش کریمی', text: 'ممنون آدم 🙏', time: '۲ ساعت پیش' },
      { name: 'سارا محمدی', text: 'عالیه! منتظر محتوا هستیم', time: '۱ ساعت پیش' },
    ],
    likedByMe: false,
    isPinned: false,
    canFollowAuthor: false,
    isAuthorFollowedByMe: false,
  },
  {
    id: 'p2',
    author: 'آرش کریمی',
    authorId: 'arash',
    avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
    badge: 'ققنوس طلایی',
    time: '۵ ساعت پیش',
    text: 'روز ۳۱ زنجیره‌ام رو کامل کردم! 🔥 این عادت واقعاً جزئی از هویتم شده.',
    achievement: { title: 'دستاورد: ۳۰ روز پیوسته', sub: 'نشان آتشین دریافت شد', icon: 'flame' },
    likes: 48,
    comments: [{ name: 'سارا محمدی', text: 'مبارک باشه! 🎉', time: '۴ ساعت پیش' }],
    likedByMe: true,
    isPinned: false,
    canFollowAuthor: false,
    isAuthorFollowedByMe: false,
  },
  {
    id: 'p3',
    author: 'آدم',
    authorId: 'adam',
    avatar: FIRE_3,
    badge: 'ققنوس',
    isAdam: true,
    verified: true,
    time: 'دیروز',
    text: 'نکته روز 💡\n«انضباط قوی‌تر از انگیزه‌ست. انگیزه می‌آد و می‌ره، ولی انضباط می‌مونه.»\nامروز چند دقیقه روی نقشه راهت کار کن، حتی اگه حوصله نداری.',
    likes: 231,
    comments: [
      { name: 'نیلوفر رضایی', text: 'دقیقاً همین رو نیاز داشتم بشنوم 🙏', time: 'دیروز' },
      { name: 'مهدی عباسی', text: 'عالی بود آدم جان', time: 'دیروز' },
    ],
    likedByMe: false,
    isPinned: false,
    canFollowAuthor: false,
    isAuthorFollowedByMe: false,
  },
  {
    id: 'p4',
    author: 'سارا محمدی',
    authorId: 'sara',
    avatar: 'linear-gradient(135deg,#5b7cfa,#9b6bff)',
    badge: 'ققنوس نقره‌ای',
    time: 'دیروز',
    text: 'دوره «تمرکز عمیق» رو تموم کردم! آدم کمکم کرد برنامه مطالعه‌ام رو کاملاً سازمان‌دهی کنم. پیشنهاد می‌کنم همه امتحان کنین.',
    hasImage: true,
    likes: 31,
    comments: [],
    likedByMe: false,
    isPinned: false,
    canFollowAuthor: true,
    isAuthorFollowedByMe: false,
  },
];

export const TRENDING_TAGS = [
  '#رشد_فردی',
  '#ققنوس',
  '#هدف‌گذاری',
  '#یادگیری',
  '#انضباط',
  '#موفقیت',
];

export const ACTIVE_USERS: ActiveUser[] = [
  { id: 'adam', name: 'آدم', role: 'مؤسس', avatar: FIRE_3, isAdam: true, canFollow: false, isFollowedByMe: false },
  { id: 'arash', name: 'آرش کریمی', role: 'ققنوس طلایی', avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)', canFollow: false, isFollowedByMe: false },
  {
    id: 'sara',
    name: 'سارا محمدی',
    role: 'ققنوس نقره‌ای',
    avatar: 'linear-gradient(135deg,#5b7cfa,#9b6bff)',
    canFollow: true,
    isFollowedByMe: false,
  },
];
