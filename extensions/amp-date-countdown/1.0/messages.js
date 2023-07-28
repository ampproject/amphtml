/**
 * Get locale strings or undefined.
 * @param {string} locale
 * @return {!Array<string>|undefined}
 */
export function getLocaleStrings(locale) {
  return LOCALE_WORD[locale];
}

/**
 * Strings representing years, minutes, etc. in various locales
 * @type {{[key: string]: !Array<string>}}
 */
const LOCALE_WORD = {
  'de': ['Jahren', 'Monaten', 'Tagen', 'Stunden', 'Minuten', 'Sekunden'],
  'en': ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'],
  'es': ['años', 'meses', 'días', 'horas', 'minutos', 'segundos'],
  'fr': ['ans', 'mois', 'jours', 'heures', 'minutes', 'secondes'],
  'id': ['tahun', 'bulan', 'hari', 'jam', 'menit', 'detik'],
  'it': ['anni', 'mesi', 'giorni', 'ore', 'minuti', 'secondi'],
  'ja': ['年', 'ヶ月', '日', '時間', '分', '秒'],
  'ko': ['년', '달', '일', '시간', '분', '초'],
  'nl': ['jaar', 'maanden', 'dagen', 'uur', 'minuten', 'seconden'],
  'pt': ['anos', 'meses', 'dias', 'horas', 'minutos', 'segundos'],
  'ru': ['год', 'месяц', 'день', 'час', 'минута', 'секунда'],
  'th': ['ปี', 'เดือน', 'วัน', 'ชั่วโมง', 'นาที', 'วินาที'],
  'tr': ['yıl', 'ay', 'gün', 'saat', 'dakika', 'saniye'],
  'vi': ['năm', 'tháng', 'ngày', 'giờ', 'phút', 'giây'],
  'zh-cn': ['年', '月', '天', '小时', '分钟', '秒'],
  'zh-tw': ['年', '月', '天', '小時', '分鐘', '秒'],
};
