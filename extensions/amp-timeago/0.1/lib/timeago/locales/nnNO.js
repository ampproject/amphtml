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

export const nnNO = function(number, index) {
  return [
    ['nett no', 'om litt'],
    ['%s sekund sidan', 'om %s sekund'],
    ['1 minutt sidan', 'om 1 minutt'],
    ['%s minutt sidan', 'om %s minutt'],
    ['1 time sidan', 'om 1 time'],
    ['%s timar sidan', 'om %s timar'],
    ['1 dag sidan', 'om 1 dag'],
    ['%s dagar sidan', 'om %s dagar'],
    ['1 veke sidan', 'om 1 veke'],
    ['%s veker sidan', 'om %s veker'],
    ['1 månad sidan', 'om 1 månad'],
    ['%s månadar sidan', 'om %s månadar'],
    ['1 år sidan', 'om 1 år'],
    ['%s år sidan', 'om %s år'],
  ][index];
};
