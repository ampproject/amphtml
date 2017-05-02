/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.0
 * https://github.com/hustcc/timeago.js
 */

const seconds =
  formatNum.bind(null, 'секунду', '%s секунду', '%s секунди', '%s секунд');
const minutes =
  formatNum.bind(null, 'хвилину', '%s хвилину', '%s хвилини', '%s хвилин');
const hours =
  formatNum.bind(null, 'годину', '%s годину', '%s години', '%s годин');
const days =
  formatNum.bind(null, 'день', '%s день', '%s дні', '%s днів');
const weeks =
  formatNum.bind(null, 'тиждень', '%s тиждень', '%s тиждні', '%s тижднів');
const months =
  formatNum.bind(null, 'місяць', '%s місяць', '%s місяці', '%s місяців');
const years =
  formatNum.bind(null, 'рік', '%s рік', '%s роки', '%s років');

export const uk = function(number, index) {
  switch (index) {
    case 0: return ['щойно', 'через декілька секунд'];
    case 1: return [seconds(number) + ' тому', 'через ' + seconds(number)];
    case 2:
    case 3: return [minutes(number) + ' тому', 'через ' + minutes(number)];
    case 4:
    case 5: return [hours(number) + ' тому', 'через ' + hours(number)];
    case 6:
    case 7: return [days(number) + ' тому', 'через ' + days(number)];
    case 8:
    case 9: return [weeks(number) + ' тому', 'через ' + weeks(number)];
    case 10:
    case 11: return [months(number) + ' тому', 'через ' + months(number)];
    case 12:
    case 13: return [years(number) + ' тому', 'через ' + years(number)];
    default: return ['', ''];
  }
};

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
