import { DEFAULT_AVATAR_GRADIENT } from './dashboard.types';
import type {
  Achievement,
  ChatMessage,
  CurrentUser,
  LbRow,
  NavItem,
  PodiumPlace,
  RoadmapItem,
  SettingItem,
  StatCard,
} from './dashboard.types';

export const USER: CurrentUser = {
  name: 'آرش',
  lastName: 'آرش کریمی',
  initial: 'آ',
  title: 'ققنوس طلایی',
  level: 24,
  xp: 6800,
  xpMax: 10000,
  streak: 23,
  avatar: DEFAULT_AVATAR_GRADIENT,
};

export const NAV: NavItem[] = [
  // { id: 'home', label: 'خانه', icon: 'home-m' },
  // { id: 'lb', label: 'پرچم داران', icon: 'leaderboard' },
  // { id: 'social', label: 'انجمن', icon: 'community' },
  { id: 'courses', label: 'تالار دانش', icon: 'social' },
  { id: 'profile', label: 'پروفایل', icon: 'profile' },
];

export const TAB_TITLES: Record<string, string> = {
  home: 'خانه',
  lb: 'پرچم داران',
  social: 'انجمن',
  courses: 'تالار دانش',
  profile: 'پروفایل',
};

export const STATS: StatCard[] = [
  { icon: 'flame', tone: 'fire', value: '۳۱', label: 'روز زنجیره' },
  { icon: 'star', tone: 'gold', value: '۶٬۸۰۰', label: 'XP امروز' },
  { icon: 'medal', tone: 'ok', value: '۴۸', label: 'دستاورد' },
  { icon: 'trophy', tone: 'blue', value: 'رتبه ۵', label: 'لیگ طلایی' },
];

export const ROADMAP: RoadmapItem[] = [
  { num: 1, type: 'ویدیو', title: 'مبانی ذهنیت رشد', xp: 50, status: 'done' },
  { num: 2, type: 'مهارت', title: 'تمرین تمرکز عمیق', xp: 100, status: 'current' },
  { num: 3, type: 'اینستاگرام', title: 'فالو کردن پیج قبیله', xp: 30, status: 'next' },
  { num: 4, type: 'درس', title: 'انضباط و عادت‌سازی', xp: 150, status: 'next' },
  { num: 5, type: 'صوت', title: 'مدیتیشن صبح‌گاهی', xp: 75, status: 'next' },
];

export const PODIUM: PodiumPlace[] = [
  {
    rank: 2,
    name: 'سارا محمدی',
    points: '۱۸٬۹۴۰',
    avatar: 'linear-gradient(135deg,#5b7cfa,#9b6bff)',
  },
  {
    rank: 1,
    name: 'آرش کریمی',
    points: '۲۴٬۷۲۰',
    avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
  },
  {
    rank: 3,
    name: 'نیلوفر رضایی',
    points: '۱۶٬۳۱۰',
    avatar: 'linear-gradient(135deg,#2bd4a8,#1f8a5b)',
  },
];

export const LEADERBOARD: LbRow[] = [
  {
    rank: 4,
    name: 'مهدی عباسی',
    points: '۱۵٬۱۲۰',
    streak: '۲۸',
    avatar: 'linear-gradient(135deg,#ffb347,#cc7a08)',
  },
  {
    rank: 5,
    name: 'تو',
    points: '۲۴٬۷۲۰',
    streak: '۳۱',
    avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
    isYou: true,
  },
  {
    rank: 6,
    name: 'زهرا کاظمی',
    points: '۱۳٬۶۴۰',
    streak: '۱۴',
    avatar: 'linear-gradient(135deg,#5b7cfa,#9b6bff)',
  },
  {
    rank: 7,
    name: 'علی نوری',
    points: '۱۲٬۹۱۰',
    streak: '۹',
    avatar: 'linear-gradient(135deg,#2bd4a8,#1f8a5b)',
  },
  {
    rank: 8,
    name: 'پریسا احمدی',
    points: '۱۲٬۲۳۰',
    streak: '۲۲',
    avatar: 'linear-gradient(135deg,#ff5a5a,#c01616)',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    icon: 'users',
    label: 'وارث آتش',
    unlocked: true,
    slug: 'vares-ghabile',
    count: 1,
  },
  {
    icon: 'trophy',
    label: 'قهرمان',
    unlocked: true,
    slug: 'gahreman',
    count: 2,
  },
  {
    icon: 'bell',
    label: 'سفیر قبیله',
    unlocked: true,
    slug: 'safir-ghabile',
    count: 1,
  },
  {
    icon: 'medal',
    label: 'تیزبال',
    unlocked: true,
    slug: 'tizbaal',
    count: 1,
  },
  {
    icon: 'bolt',
    label: 'فرزند قبیله',
    unlocked: true,
    slug: 'farzand-ghabile',
    count: 1,
  },
  {
    icon: 'star',
    label: 'ستاره',
    unlocked: true,
    slug: 'setare',
    count: 1,
  },
  {
    icon: 'flame',
    label: 'آتش‌افروز',
    unlocked: false,
    slug: 'atash-afrooz',
  },
  {
    icon: 'medal',
    label: 'قلب قبیله',
    unlocked: true,
    slug: 'ghalb-ghabile',
    count: 2,
  },
  {
    icon: 'medal',
    label: 'صدای قبیله',
    unlocked: true,
    slug: 'seda-qabile',
    count: 1,
  },
];

export const SETTINGS: SettingItem[] = [
  { icon: 'user-f', label: 'ویرایش پروفایل' },
  // { icon: 'bell', label: 'اعلان‌ها' },
  { icon: 'settings', label: 'تنظیمات' },
  // { icon: 'lock', label: 'حریم خصوصی' },
];

export const PROFILE_STATS = [
  { value: '۴۸۴۸۴۸', label: 'امتیاز' },
  { value: '۴۸', label: 'روز زنجیره' },
  { value: '۱۲', label: 'هم پرواز شده' },
  { value: '۳۱', label: 'هم پرواز' },
];

export const AI_SEED: ChatMessage = {
  from: 'bot',
  text: 'سلام آرش! امروز چی می‌خوای یاد بگیری؟ من اینجام که کمکت کنم 💪',
};

export const AI_QUICK = [
  { label: 'چطور انضباطم رو حفظ کنم؟', send: 'چطور انضباطم رو در یادگیری حفظ کنم؟' },
  { label: 'بهترین زمان مطالعه؟', send: 'بهترین زمان مطالعه چه وقته؟' },
  { label: 'تمرکز بیشتر', send: 'چطور تمرکزم رو بیشتر کنم؟' },
  { label: 'مرحله بعدی من چیه؟', send: 'مرحله بعدی من توی نقشه راه چیه؟' },
];

export const AI_REPLIES = [
  'سوال خوبیه! بیا از یه قدم کوچیک شروع کنیم. هر روز فقط ۲۰ دقیقه برنامه داشته باش 🔥',
  'این دقیقاً همون چیزیه که اعضای موفق قبیله بهش رسیدن. راز اصلی ثبات روزانه‌ست!',
  'عالیه که اینو پرسیدی! بر اساس پیشرفتت پیشنهادم اینه که نقشه راه رشد فردی رو ادامه بدی.',
];
