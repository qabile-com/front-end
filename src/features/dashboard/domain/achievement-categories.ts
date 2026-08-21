export type AchievementCategoryType =
  | 'public_general'
  | 'public_course_english'
  | 'public_course_writing'
  | 'public_course_finance'
  | 'public_course_year_good_money_good'
  | 'public_course_cosmos'
  | 'public_course_money_factory'
  | 'public_course_bodybuilding'
  | 'public_social'
  | 'public_combo_rare'
  | 'hidden_level_1'
  | 'hidden_level_2'
  | 'hidden_level_3'
  | 'hidden_level_4'
  | 'hidden_level_5'
  | 'hidden_combo'
  | 'hidden_legendary';

export const ACHIEVEMENT_CATEGORY_TITLES: Record<AchievementCategoryType, string> = {
  public_general: 'عمومی',
  public_course_english: 'دوره زبان انگلیسی',
  public_course_writing: 'دوره نویسندگی',
  public_course_finance: 'دوره بازار مالی',
  public_course_year_good_money_good: 'دوره سال خوب، مال خوب',
  public_course_cosmos: 'دوره کیهان',
  public_course_money_factory: 'دوره کارخانه پول',
  public_course_bodybuilding: 'دوره بدنسازی',
  public_social: 'اجتماعی',
  public_combo_rare: 'دستاوردهای ترکیبی نادر',
  hidden_level_1: 'سطح ۱ — نسبتا قابل دسترس',
  hidden_level_2: 'سطح ۲ — متوسط',
  hidden_level_3: 'سطح ۳ — سخت',
  hidden_level_4: 'سطح ۴ — خیلی نادر',
  hidden_level_5: 'سطح ۵ — تاریک و روانشناختی',
  hidden_combo: 'دستاوردهای ترکیبی (نیاز به دو یا چند دستاورد)',
  hidden_legendary: 'دستاوردهای بسیار نادر و افسانه‌ای پنهان',
};

export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategoryType[] = [
  'public_general',
  'public_course_english',
  'public_course_writing',
  'public_course_finance',
  'public_course_year_good_money_good',
  'public_course_cosmos',
  'public_course_money_factory',
  'public_course_bodybuilding',
  'public_social',
  'public_combo_rare',
  'hidden_level_1',
  'hidden_level_2',
  'hidden_level_3',
  'hidden_level_4',
  'hidden_level_5',
  'hidden_combo',
  'hidden_legendary',
];

export function isKnownAchievementCategory(value?: string | null): value is AchievementCategoryType {
  return Boolean(value) && value! in ACHIEVEMENT_CATEGORY_TITLES;
}
