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

export const nl = function(number, index) {
  return [
    ['recent', 'binnenkort'],
    ['%s seconden geleden', 'binnen %s seconden'],
    ['1 minuut geleden', 'binnen 1 minuut'],
    ['%s minuten geleden', 'binnen %s minuten'],
    ['1 uur geleden', 'binnen 1 uur'],
    ['%s uren geleden', 'binnen %s uren'],
    ['1 dag geleden', 'binnen 1 dag'],
    ['%s dagen geleden', 'binnen %s dagen'],
    ['1 week geleden', 'binnen 1 week'],
    ['%s weken geleden', 'binnen %s weken'],
    ['1 maand geleden', 'binnen 1 maand'],
    ['%s maanden geleden', 'binnen %s maanden'],
    ['1 jaar geleden', 'binnen 1 jaar'],
    ['%s jaren geleden', 'binnen %s jaren'],
  ][index];
};
