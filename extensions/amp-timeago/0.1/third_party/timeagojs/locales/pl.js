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

// 0-13 alternately: single unit of time,
// genitive plural form for all other numbers excluding cases below:
// 14-20: nominative plural form for the numbers 2,3,4
// and all other numbers higher than 21 which end in 2,3,4
const l = [
  ['w tej chwili', 'za chwilę'],
  ['%s sekund temu', 'za %s sekund'],
  ['1 minutę temu', 'za 1 minutę'],
  ['%s minut temu', 'za %s minut'],
  ['1 godzinę temu', 'za 1 godzinę'],
  ['%s godzin temu', 'za %s godzin'],
  ['1 dzień temu', 'za 1 dzień'], // ['wczoraj', 'jutro'],
  ['%s dni temu', 'za %s dni'],
  ['1 tydzień temu', 'za 1 tydzień'],
  ['%s tygodni temu', 'za %s tygodni'],
  ['1 miesiąc temu', 'za 1 miesiąc'],
  ['%s miesięcy temu', 'za %s miesięcy'],
  ['1 rok temu', 'za 1 rok'],
  ['%s lat temu', 'za %s lat'],
  ['%s sekundy temu', 'za %s sekundy'],
  ['%s minuty temu', 'za %s minuty'],
  ['%s godziny temu', 'za %s godziny'],
  ['%s dni temu', 'za %s dni'],
  ['%s tygodnie temu', 'za %s tygodnie'],
  ['%s miesiące temu', 'za %s miesiące'],
  ['%s lata temu', 'za %s lata'],
];

export const pl = function(number, index) {
  // to determine which plural form must be used check the last 2 digits
  // and calculate new index value to get the nominative form (14-20)
  // for all other cases use index value as it is (0-13)
  return l[index & 1 ? (number % 10 > 4 || number % 10 < 2 || 1 ===
    ~~(number / 10) % 10 ? index : ++index / 2 + 13) : index];
};
