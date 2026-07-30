export type PartStatus = 'done' | 'partial' | 'none';
export type CoursePartMediaType = 'video' | 'audio';

export interface CoursePart {
  id: string;
  courseId?: string;
  isUnlocked?: boolean;
  requiresPurchase?: boolean;
  previousSectionId?: string | null;
  previousEpisodeId?: string | null;
  nextSectionId?: string | null;
  nextEpisodeId?: string | null;
  mediaType?: CoursePartMediaType;
  mediaUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
  duration?: string;
  title: string;
  durationSeconds?: number;
  xp?: number;
  status: PartStatus;
  progress?: number;
  watchedSeconds?: number;
  completedAt?: string | null;
  xpGrantedAt?: string | null;
  steps?: { id: string; text: string; isCompleted: boolean }[];
  views?: number;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  duration: string;
  durationSeconds?: number;
  views: string;
  xp: number;
  priceInFire?: number;
  isPurchased?: boolean;
  isUnlocked?: boolean;
  isFree?: boolean;
  episodes: CoursePart[];
}

const RAW_COURSES: Course[] = [
  {
    id: 'c1',
    title: '۵ قدم تا سلامتی',
    category: 'سلامت',
    imageUrl: null,
    duration: '۴۵:۲۰',
    views: '۲،۳۴۰',
    xp: 250,
    priceInFire: 0,
    isFree: true,
    isPurchased: true,
    episodes: [
      { id: 'c1-s1', title: 'قدم اول: ذهن‌آگاهی', duration: '۸:۳۰', status: 'done' },
      {
        id: 'c1-s2',
        title: 'قدم دوم: تغذیه سالم',
        duration: '۱۰:۱۵',
        status: 'partial',
        progress: 40,
      },
      { id: 'c1-s3', title: 'قدم سوم: ورزش روزانه', duration: '۹:۴۵', status: 'none' },
      { id: 'c1-s4', title: 'قدم چهارم: خواب کافی', duration: '۷:۲۰', status: 'none' },
      { id: 'c1-s5', title: 'قدم پنجم: مدیریت استرس', duration: '۹:۵۰', status: 'none' },
    ],
  },
  {
    id: 'c2',
    title: 'مدیریت ذهن در بازار',
    category: 'معامله‌گری',
    imageUrl: null,
    duration: '۱:۱۲:۰۰',
    views: '۴،۸۲۰',
    xp: 400,
    priceInFire: 900,
    isPurchased: false,
    episodes: [
      {
        id: 'c2-s1',
        title: 'روانشناسی ترس و طمع',
        duration: '۱۴:۲۰',
        status: 'done',
        steps: [
          { id: 's1', text: 'تعریف ترس و طمع در معاملات', isCompleted: true },
          { id: 's2', text: 'شناسایی الگوهای رفتاری', isCompleted: true },
          { id: 's3', text: 'تمرین تنفس و مدیریت هیجان', isCompleted: false },
        ],
      },
      { id: 'c2-s2', title: 'اثر لنگر ذهنی', duration: '۱۲:۴۵', status: 'partial', progress: 65 },
      { id: 'c2-s3', title: 'تله‌های تصمیم‌گیری', duration: '۱۱:۳۰', status: 'none' },
      { id: 'c2-s4', title: 'ساخت قوانین شخصی', duration: '۱۳:۲۵', status: 'none' },
    ],
  },
  {
    id: 'c3',
    title: 'عادت‌سازی اتمی',
    category: 'رشد فردی',
    imageUrl: null,
    duration: '۳۸:۱۰',
    views: '۶،۱۰۰',
    xp: 300,
    priceInFire: 650,
    isPurchased: true,
    episodes: [
      { id: 'c3-s1', title: 'چرخه عادت', duration: '۸:۰۰', status: 'done' },
      { id: 'c3-s2', title: 'قانون دو دقیقه', duration: '۶:۳۰', status: 'done' },
      { id: 'c3-s3', title: 'محیط‌سازی برای موفقیت', duration: '۷:۴۰', status: 'none' },
      { id: 'c3-s4', title: 'هویت‌محوری', duration: '۸:۰۰', status: 'none' },
      { id: 'c3-s5', title: 'سیستم‌سازی روزانه', duration: '۸:۰۰', status: 'none' },
    ],
  },
  {
    id: 'c4',
    title: 'هوش مالی پایه',
    category: 'سواد مالی',
    imageUrl: null,
    duration: '۵۵:۴۵',
    views: '۳،۲۷۰',
    xp: 350,
    priceInFire: 750,
    isPurchased: false,
    episodes: [
      { id: 'c4-s1', title: 'درآمد فعال و غیرفعال', duration: '۱۲:۰۰', status: 'none' },
      { id: 'c4-s2', title: 'قانون ۵۰-۳۰-۲۰', duration: '۱۰:۳۰', status: 'none' },
      { id: 'c4-s3', title: 'صندوق اضطراری', duration: '۱۱:۱۵', status: 'none' },
      { id: 'c4-s4', title: 'مقدمه سرمایه‌گذاری', duration: '۱۱:۰۰', status: 'none' },
      { id: 'c4-s5', title: 'اشتباهات رایج مالی', duration: '۱۰:۰۰', status: 'none' },
    ],
  },
  {
    id: 'c5',
    title: 'مبانی ذهنیت رشد',
    category: 'رشد فردی',
    imageUrl: null,
    duration: '۵۰:۰۰',
    views: '۸،۴۰۰',
    xp: 450,
    priceInFire: 1100,
    isPurchased: false,
    episodes: [
      { id: 'c5-s1', title: 'ذهنیت ثابت در برابر ذهنیت رشد', duration: '۱۲:۰۰', status: 'done' },
      {
        id: 'c5-s2',
        title: 'توانایی مغز برای تغییر',
        duration: '۱۰:۳۰',
        status: 'partial',
        progress: 55,
      },
      { id: 'c5-s3', title: 'ابزارهای بازسازی ذهن', duration: '۱۱:۰۰', status: 'none' },
      { id: 'c5-s4', title: 'عادت‌سازی آگاهانه', duration: '۹:۴۵', status: 'none' },
    ],
  },
  {
    id: 'c6',
    title: 'نوشتن موثر',
    category: 'مهارت',
    imageUrl: null,
    duration: '۴۲:۰۰',
    views: '۱،۹۸۰',
    xp: 280,
    priceInFire: 520,
    isPurchased: false,
    episodes: [
      {
        id: 'c6-s1',
        title: 'استراتژی محتوا',
        duration: '۱۰:۰۰',
        status: 'none',
        mediaType: 'audio',
        audioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
      { id: 'c6-s2', title: 'ساختار پست جذاب', duration: '۸:۰۰', status: 'none' },
      { id: 'c6-s3', title: 'نگارش تخصصی', duration: '۹:۳۰', status: 'none' },
      { id: 'c6-s4', title: 'ویرایش و بهینه‌سازی', duration: '۷:۰۰', status: 'none' },
    ],
  },
];

export function withCourseSectionNavigation(course: Course): Course {
  const episodes = course.episodes.map((part, index, parts) => {
    const mediaType = normalizeCoursePartMediaType(part);

    return {
      ...part,
      courseId: part.courseId ?? course.id,
      xp: part.xp ?? Math.round(course.xp / Math.max(1, parts.length)),
      durationSeconds: part.durationSeconds ?? parseDurationToSeconds(part.duration),
      previousSectionId: part.previousSectionId ?? parts[index - 1]?.id ?? null,
      nextSectionId: part.nextSectionId ?? parts[index + 1]?.id ?? null,
      mediaType,
      videoUrl: part.videoUrl ?? (mediaType === 'video' ? part.mediaUrl : null),
      audioUrl: part.audioUrl ?? (mediaType === 'audio' ? part.mediaUrl : null),
    };
  });

  return {
    ...course,
    durationSeconds:
      course.durationSeconds ??
      parseDurationToSeconds(course.duration) ??
      episodes.reduce((sum, part) => sum + (part.durationSeconds ?? 0), 0),
    episodes,
  };
}

export const COURSES: Course[] = RAW_COURSES.map(withCourseSectionNavigation);

function parseDurationToSeconds(duration: string) {
  const normalized = duration.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
  const parts = normalized.split(':').map((part) => Number(part.trim()));
  if (parts.some((part) => Number.isNaN(part))) return undefined;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  return undefined;
}

function normalizeCoursePartMediaType(part: CoursePart): CoursePartMediaType {
  if (part.mediaType === 'audio' || part.audioUrl) return 'audio';
  return 'video';
}
