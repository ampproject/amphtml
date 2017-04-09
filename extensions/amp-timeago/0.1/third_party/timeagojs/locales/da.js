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

export const da = function(number, index) {
  return [
    ['for et øjeblik siden', 'om et øjeblik'],
    ['for %s sekunder siden', 'om %s sekunder'],
    ['for 1 minut siden', 'om 1 minut'],
    ['for %s minutter siden', 'om %s minutter'],
    ['for 1 time siden', 'om 1 time'],
    ['for %s timer siden', 'om %s timer'],
    ['for 1 dag siden', 'om 1 dag'],
    ['for %s dage siden', 'om %s dage'],
    ['for 1 uge siden', 'om 1 uge'],
    ['for %s uger siden', 'om %s uger'],
    ['for 1 måned siden', 'om 1 måned'],
    ['for %s måneder siden', 'om %s måneder'],
    ['for 1 år siden', 'om 1 år'],
    ['for %s år siden', 'om %s år'],
  ][index];
};
