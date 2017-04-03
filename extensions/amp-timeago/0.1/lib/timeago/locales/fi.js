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

export const fi = function(number, index) {
  return [
    ['juuri äsken', 'juuri nyt'],
    ['%s sekuntia sitten', '%s sekunnin päästä'],
    ['minuutti sitten', 'minuutin päästä'],
    ['%s minuuttia sitten', '%s minuutin päästä'],
    ['tunti sitten', 'tunnin päästä'],
    ['%s tuntia sitten', '%s tunnin päästä'],
    ['päivä sitten', 'päivän päästä'],
    ['%s päivää sitten', '%s päivän päästä'],
    ['viikko sitten', 'viikon päästä'],
    ['%s viikkoa sitten', '%s viikon päästä'],
    ['kuukausi sitten', 'kuukauden päästä'],
    ['%s kuukautta sitten', '%s kuukauden päästä'],
    ['vuosi sitten', 'vuoden päästä'],
    ['%s vuotta sitten', '%s vuoden päästä'],
  ][index];
};
