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

export const sv = function(number, index) {
  return [
    ['just nu', 'om en stund'],
    ['%s sekunder sedan', 'om %s seconder'],
    ['1 minut sedan', 'om 1 minut'],
    ['%s minuter sedan', 'om %s minuter'],
    ['1 timme sedan', 'om 1 timme'],
    ['%s timmar sedan', 'om %s timmar'],
    ['1 dag sedan', 'om 1 dag'],
    ['%s dagar sedan', 'om %s dagar'],
    ['1 vecka sedan', 'om 1 vecka'],
    ['%s veckor sedan', 'om %s veckor'],
    ['1 månad sedan', 'om 1 månad'],
    ['%s månader sedan', 'om %s månader'],
    ['1 år sedan', 'om 1 år'],
    ['%s år sedan', 'om %s år'],
  ][index];
};
