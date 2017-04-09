/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
