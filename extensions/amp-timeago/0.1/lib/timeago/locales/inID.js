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

export const inID = function(number, index) {
  return [
    ['baru saja', 'sebentar'],
    ['%s detik yang lalu', 'dalam %s detik'],
    ['1 menit yang lalu', 'dalam 1 menit'],
    ['%s menit yang lalu', 'dalam %s menit'],
    ['1 jam yang lalu', 'dalam 1 jam'],
    ['%s jam yang lalu', 'dalam %s jam'],
    ['1 hari yang lalu', 'dalam 1 hari'],
    ['%s hari yang lalu', 'dalam %s hari'],
    ['1 minggu yang lalu', 'dalam 1 minggu'],
    ['%s minggu yang lalu', 'dalam %s minggu'],
    ['1 bulan yang lalu', 'dalam 1 bulan'],
    ['%s bulan yang lalu', 'dalam %s bulan'],
    ['1 tahun yang lalu', 'dalam 1 tahun'],
    ['%s tahun yang lalu', 'dalam %s tahun'],
  ][index];
};
