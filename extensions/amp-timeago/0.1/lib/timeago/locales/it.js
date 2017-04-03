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

export const it = function(number, index) {
  return [
    ['poco fa', 'tra poco'],
    ['%s secondi fa', '%s secondi da ora'],
    ['un minuto fa', 'un minuto da ora'],
    ['%s minuti fa', '%s minuti da ora'],
    ['un\'ora fa', 'un\'ora da ora'],
    ['%s ore fa', '%s ore da ora'],
    ['un giorno fa', 'un giorno da ora'],
    ['%s giorni fa', '%s giorni da ora'],
    ['una settimana fa', 'una settimana da ora'],
    ['%s settimane fa', '%s settimane da ora'],
    ['un mese fa', 'un mese da ora'],
    ['%s mesi fa', '%s mesi da ora'],
    ['un anno fa', 'un anno da ora'],
    ['%s anni fa', '%s anni da ora'],
  ][index];
};
