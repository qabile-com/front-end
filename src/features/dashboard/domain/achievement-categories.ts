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

const ACHIEVEMENT_CATEGORY_BY_SLUG: Record<string, AchievementCategoryType> = {
  // public_general
  'jarghe-nokhostin': 'public_general',
  'donbal-konande-khargoosh-sefid': 'public_general',
  'ghorse-ghermez': 'public_general',
  'bidari-avaliye': 'public_general',
  'azad-kardan-zehn': 'public_general',
  'jangjoo-sahar-khiz': 'public_general',
  'zhornal-nevis-bidari': 'public_general',
  'dosh-abe-sarde-sohyoon': 'public_general',
  'hich-ghashoghi-vojood-nadarad': 'public_general',

  // public_course_english
  'kelid-zaban': 'public_course_english',
  'sokhangoo-ye-sohyoon': 'public_course_english',
  'zabandan-matrix': 'public_course_english',
  'negahban-goftar': 'public_course_english',

  // public_course_writing
  'ghalam-nokhostin': 'public_course_writing',
  'kateb-dar-hal-bidari': 'public_course_writing',
  'saheb-ghalame-moghadas': 'public_course_writing',
  'katebe-ghabileh': 'public_course_writing',

  // public_course_finance
  'novamooze-bazaar': 'public_course_finance',
  'cheshm-tizbin': 'public_course_finance',
  'jangjoo-ye-bazaar': 'public_course_finance',
  'enzebat-zarrin': 'public_course_finance',

  // public_course_year_good_money_good
  'aghaze-sale-no': 'public_course_year_good_money_good',
  'bafande-ye-sarnevesht': 'public_course_year_good_money_good',
  'sale-khoob-male-khoob': 'public_course_year_good_money_good',
  'ejra-konande-ye-ahd': 'public_course_year_good_money_good',

  // public_course_cosmos
  'game-nokhostin-keyhan': 'public_course_cosmos',
  'aber-rah': 'public_course_cosmos',
  'aber-kaenat': 'public_course_cosmos',
  'bidar-shavande-ye-rooh': 'public_course_cosmos',

  // public_course_money_factory
  'kargare-atash': 'public_course_money_factory',
  'operator-karkhaneh': 'public_course_money_factory',
  'khodavandegar-karkhaneh': 'public_course_money_factory',
  'tolid-konande-ye-servat': 'public_course_money_factory',

  // public_course_bodybuilding
  'avvalin-vazne-ahanin': 'public_course_bodybuilding',
  'jangjoo-ye-jesm': 'public_course_bodybuilding',
  'badan-e-azhdaha': 'public_course_bodybuilding',
  'taghir-shekle-ghoghnoos': 'public_course_bodybuilding',
  'enzebat-e-ozolani': 'public_course_bodybuilding',

  // public_social
  'nokhostin-faryad': 'public_social',
  'sedaye-bidar': 'public_social',
  'atash-afrooz-meydan': 'public_social',
  'negahban-goftogoo': 'public_social',
  'rooh-e-meydan': 'public_social',
  'pezhvak-dahandeh': 'public_social',
  'pasokhgoo-ye-ghabileh': 'public_social',
  barangizandeh: 'public_social',
  'sedaye-bolande-ghabileh': 'public_social',
  'ostoreye-meydan': 'public_social',
  'hekmatgoo-ye-kootah': 'public_social',
  bidargaar: 'public_social',
  'faryade-ghoghnoos': 'public_social',
  'negahban-e-farhang': 'public_social',

  // public_combo_rare
  'donbal-konande-vaghei-khargoosh': 'public_combo_rare',
  'ghorse-ghermez-khorde': 'public_combo_rare',
  'bidari-kamel': 'public_combo_rare',
  'neo-ye-ghabileh': 'public_combo_rare',
  'saken-e-sohyoon': 'public_combo_rare',
  'ostoreye-zende-ye-matrix': 'public_combo_rare',

  // hidden_level_1
  'khargoosh-sefid': 'hidden_level_1',
  'ghorse-ghermez-penhan': 'hidden_level_1',
  'sokoot-avval': 'hidden_level_1',
  'negah-avval': 'hidden_level_1',
  'jarghe-penhan': 'hidden_level_1',
  'nafas-avval': 'hidden_level_1',
  tamashagar: 'hidden_level_1',
  'bazgasht-koochak': 'hidden_level_1',

  // hidden_level_2
  'saye-matrix': 'hidden_level_2',
  'kasi-ke-mibinad': 'hidden_level_2',
  'negahban-khamoosh': 'hidden_level_2',
  'bidar-shode-dar-sokoot': 'hidden_level_2',
  entekhabgar: 'hidden_level_2',
  'nevisande-saye': 'hidden_level_2',
  'saat-bidari': 'hidden_level_2',
  'niyaz-be-tashvigh': 'hidden_level_2',

  // hidden_level_3
  'doshman-sistem': 'hidden_level_3',
  'tavalod-dobare-khamoosh': 'hidden_level_3',
  'kasi-ke-bidar-shod': 'hidden_level_3',
  'neo-hanooz-nemidanad': 'hidden_level_3',
  'oboor-az-ayeneh': 'hidden_level_3',
  'ghorbani-aghah': 'hidden_level_3',
  'sedaye-bi-seda': 'hidden_level_3',
  'hafeze-ghabileh': 'hidden_level_3',
  'an-ke-dide-nemishavad': 'hidden_level_3',
  'memare-khamoosh': 'hidden_level_3',
  'khorooj-ghatei-az-matrix': 'hidden_level_3',

  // hidden_level_5
  'kasi-ke-digar-soal-nemikonad': 'hidden_level_5',
  'paziraresh-tanhayi': 'hidden_level_5',
  'sokoot-baad-az-faryad': 'hidden_level_5',
  'bahaye-danestan': 'hidden_level_5',
  'raha-kardan-natijeh': 'hidden_level_5',
  'adat-bedoon-shahed': 'hidden_level_5',
  'entekhab-sakht': 'hidden_level_5',
  'kasi-ke-bargasht-nakhast': 'hidden_level_5',
  'atash-negah-dashte-shode': 'hidden_level_5',
  'bazgasht-ba-aghahi': 'hidden_level_5',
  'bi-tavajoh-be-rotbeh': 'hidden_level_5',
  'nevisande-baraye-khodesh': 'hidden_level_5',
  'moghavemat-dar-barabare-vasvaseh': 'hidden_level_5',

  // hidden_combo
  'bidari-talkh': 'hidden_combo',
  'neovye-tanha': 'hidden_combo',
  'mardi-ke-do-donya-ra-did': 'hidden_combo',
  'kasi-ke-do-bar-mord': 'hidden_combo',
  'ghorbani-kamel': 'hidden_combo',
  'kasi-ke-sistem-ra-tark-kard': 'hidden_combo',

  // hidden_legendary
  'chizi-ke-nemishod-unsaw-kard': 'hidden_legendary',
  'atash-sookhte': 'hidden_legendary',
  'kasi-ke-digar-nemikhandad': 'hidden_legendary',
  'vazne-aghahi': 'hidden_legendary',
  'akharin-entekhab': 'hidden_legendary',
  'hichkas-montazeresh-nabood': 'hidden_legendary',
  'bidari-bedoon-shahed': 'hidden_legendary',
  'an-ke-mandegar-shod': 'hidden_legendary',
  'kasi-ke-mand': 'hidden_legendary',
  'atash-kontrol-shode': 'hidden_legendary',
  'bidar-o-khamoosh': 'hidden_legendary',
  'ghorbani-dobareh': 'hidden_legendary',
  'ostoreye-bi-nam': 'hidden_legendary',
  'khorooj-nehayi': 'hidden_legendary',
};

export function getAchievementCategoryType(slug?: string | null): AchievementCategoryType | undefined {
  const key = slug?.trim();
  return key ? ACHIEVEMENT_CATEGORY_BY_SLUG[key] : undefined;
}
