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

export const nbNO = function(number, index) {
  return [
    ['akkurat nå', 'om litt'],
    ['%s sekunder siden', 'om %s sekunder'],
    ['1 minutt siden', 'om 1 minutt'],
    ['%s minutter siden', 'om %s minutter'],
    ['1 time siden', 'om 1 time'],
    ['%s timer siden', 'om %s timer'],
    ['1 dag siden', 'om 1 dag'],
    ['%s dager siden', 'om %s dager'],
    ['1 uke siden', 'om 1 uke'],
    ['%s uker siden', 'om %s uker'],
    ['1 måned siden', 'om 1 måned'],
    ['%s måneder siden', 'om %s måneder'],
    ['1 år siden', 'om 1 år'],
    ['%s år siden', 'om %s år'],
  ][index];
};
