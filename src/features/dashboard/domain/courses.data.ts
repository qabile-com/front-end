export type PartStatus = 'done' | 'partial' | 'none';

export interface CoursePart {
  title: string;
  duration: string;
  status: PartStatus;
  progress?: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  gradient: string;
  duration: string;
  views: string;
  xp: number;
  parts: CoursePart[];
}

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: '۵ قدم تا سلامتی',
    category: 'سلامت',
    gradient: 'linear-gradient(135deg,#1f8a5b,#2bd4a8)',
    duration: '۴۵:۲۰',
    views: '۲،۳۴۰',
    xp: 250,
    parts: [
      { title: 'قدم اول: ذهن‌آگاهی', duration: '۸:۳۰', status: 'done' },
      { title: 'قدم دوم: تغذیه سالم', duration: '۱۰:۱۵', status: 'partial', progress: 40 },
      { title: 'قدم سوم: ورزش روزانه', duration: '۹:۴۵', status: 'none' },
      { title: 'قدم چهارم: خواب کافی', duration: '۷:۲۰', status: 'none' },
      { title: 'قدم پنجم: مدیریت استرس', duration: '۹:۵۰', status: 'none' },
    ],
  },
  {
    id: 'c2',
    title: 'مدیریت ذهن در بازار',
    category: 'معامله‌گری',
    gradient: 'linear-gradient(135deg,#ff6200,#f3ba63)',
    duration: '۱:۱۲:۰۰',
    views: '۴،۸۲۰',
    xp: 400,
    parts: [
      { title: 'روانشناسی ترس و طمع', duration: '۱۴:۲۰', status: 'done' },
      { title: 'اثر لنگر ذهنی', duration: '۱۲:۴۵', status: 'partial', progress: 65 },
      { title: 'تله‌های تصمیم‌گیری', duration: '۱۱:۳۰', status: 'none' },
      { title: 'ساخت قوانین شخصی', duration: '۱۳:۲۵', status: 'none' },
    ],
  },
  {
    id: 'c3',
    title: 'عادت‌سازی اتمی',
    category: 'رشد فردی',
    gradient: 'linear-gradient(135deg,#5b7cfa,#9b6bff)',
    duration: '۳۸:۱۰',
    views: '۶،۱۰۰',
    xp: 300,
    parts: [
      { title: 'چرخه عادت', duration: '۸:۰۰', status: 'done' },
      { title: 'قانون دو دقیقه', duration: '۶:۳۰', status: 'done' },
      { title: 'محیط‌سازی برای موفقیت', duration: '۷:۴۰', status: 'none' },
      { title: 'هویت‌محوری', duration: '۸:۰۰', status: 'none' },
      { title: 'سیستم‌سازی روزانه', duration: '۸:۰۰', status: 'none' },
    ],
  },
  {
    id: 'c4',
    title: 'هوش مالی پایه',
    category: 'سواد مالی',
    gradient: 'linear-gradient(135deg,#ffb347,#cc7a08)',
    duration: '۵۵:۴۵',
    views: '۳،۲۷۰',
    xp: 350,
    parts: [
      { title: 'درآمد فعال و غیرفعال', duration: '۱۲:۰۰', status: 'none' },
      { title: 'قانون ۵۰-۳۰-۲۰', duration: '۱۰:۳۰', status: 'none' },
      { title: 'صندوق اضطراری', duration: '۱۱:۱۵', status: 'none' },
      { title: 'مقدمه سرمایه‌گذاری', duration: '۱۱:۰۰', status: 'none' },
      { title: 'اشتباهات رایج مالی', duration: '۱۰:۰۰', status: 'none' },
    ],
  },
  {
    id: 'c5',
    title: 'مبانی ذهنیت رشد',
    category: 'رشد فردی',
    gradient: 'linear-gradient(135deg,#cc4308,#ff6200)',
    duration: '۵۰:۰۰',
    views: '۸،۴۰۰',
    xp: 450,
    parts: [
      { title: 'ذهنیت ثابت در برابر ذهنیت رشد', duration: '۱۲:۰۰', status: 'done' },
      { title: 'توانایی مغز برای تغییر', duration: '۱۰:۳۰', status: 'partial', progress: 55 },
      { title: 'ابزارهای بازسازی ذهن', duration: '۱۱:۰۰', status: 'none' },
      { title: 'عادت‌سازی آگاهانه', duration: '۹:۴۵', status: 'none' },
    ],
  },
  {
    id: 'c6',
    title: 'نوشتن موثر',
    category: 'مهارت',
    gradient: 'linear-gradient(135deg,#2bd4a8,#1f8a5b)',
    duration: '۴۲:۰۰',
    views: '۱،۹۸۰',
    xp: 280,
    parts: [
      { title: 'استراتژی محتوا', duration: '۱۰:۰۰', status: 'none' },
      { title: 'ساختار پست جذاب', duration: '۸:۰۰', status: 'none' },
      { title: 'نگارش تخصصی', duration: '۹:۳۰', status: 'none' },
      { title: 'ویرایش و بهینه‌سازی', duration: '۷:۰۰', status: 'none' },
    ],
  },
];
