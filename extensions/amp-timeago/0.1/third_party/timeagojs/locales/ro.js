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

export const ro = function(number, index) {
  const langTable = [
    ['chiar acum', 'chiar acum'],
    ['acum %s secunde', 'peste %s secunde'],
    ['acum un minut', 'peste un minut'],
    ['acum %s minute', 'peste %s minute'],
    ['acum o oră', 'peste o oră'],
    ['acum %s ore', 'peste %s ore'],
    ['acum o zi', 'peste o zi'],
    ['acum %s zile', 'peste %s zile'],
    ['acum o săptămână', 'peste o săptămână'],
    ['acum %s săptămâni', 'peste %s săptămâni'],
    ['acum o lună', 'peste o lună'],
    ['acum %s luni', 'peste %s luni'],
    ['acum un an', 'peste un an'],
    ['acum %s ani', 'peste %s ani'],
  ];

  if (number < 20) {
    return langTable[index];
  }

  // A `de` preposition must be added between the number and the adverb
  // if the number is greater than 20.
  return [
    langTable[index][0].replace('%s', '%s de'),
    langTable[index][1].replace('%s', '%s de'),
  ];
};
