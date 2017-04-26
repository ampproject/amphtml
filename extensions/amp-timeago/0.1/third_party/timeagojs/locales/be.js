/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.0
 * https://github.com/hustcc/timeago.js
 */

const seconds =
  formatNum.bind(null, 'секунду', '%s секунду', '%s секунды', '%s секунд');
const minutes =
  formatNum.bind(null, 'хвіліну', '%s хвіліну', '%s хвіліны', '%s хвілін');
const hours =
  formatNum.bind(null, 'гадзіну', '%s гадзіну', '%s гадзіны', '%s гадзін');
const days =
  formatNum.bind(null, 'дзень', '%s дзень', '%s дні', '%s дзён');
const weeks =
  formatNum.bind(null, 'тыдзень', '%s тыдзень', '%s тыдні', '%s тыдняў');
const months =
  formatNum.bind(null, 'месяц', '%s месяц', '%s месяцы', '%s месяцаў');
const years =
  formatNum.bind(null, 'год', '%s год', '%s гады', '%s гадоў');

export const be = function(number, index) {
  switch (index) {
    case 0: return ['толькі што', 'праз некалькі секунд'];
    case 1: return [seconds(number) + ' таму', 'праз ' + seconds(number)];
    case 2:
    case 3: return [minutes(number) + ' таму', 'праз ' + minutes(number)];
    case 4:
    case 5: return [hours(number) + ' таму', 'праз ' + hours(number)];
    case 6:
    case 7: return [days(number) + ' таму', 'праз ' + days(number)];
    case 8:
    case 9: return [weeks(number) + ' таму', 'праз ' + weeks(number)];
    case 10:
    case 11: return [months(number) + ' таму', 'праз ' + months(number)];
    case 12:
    case 13: return [years(number) + ' таму', 'праз ' + years(number)];
    default: return ['', ''];
  }
};

/**
 *
 * @param f1 - 1
 * @param f - 21, 31, ...
 * @param s - 2-4, 22-24, 32-34 ...
 * @param t - 5-20, 25-30, ...
 * @param n
 * @returns {string}
 */
function formatNum(f1, f, s, t, n) {
  const n10 = n % 10;
  let str = t;

  if (n === 1) {
    str = f1;
  } else if (n10 === 1 && n > 20) {
    str = f;
  } else if (n10 > 1 && n10 < 5 && (n > 20 || n < 10)) {
    str = s;
  }

  return str;
}
