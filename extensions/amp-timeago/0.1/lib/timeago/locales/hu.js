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

export const hu = function(number, index) {
  return [
    ['éppen most', 'éppen most'],
    ['%s másodperce', '%s másodpercen belül'],
    ['1 perce', '1 percen belül'],
    ['%s perce', '%s percen belül'],
    ['1 órája', '1 órán belül'],
    ['%s órája', '%s órán belül'],
    ['1 napja', '1 napon belül'],
    ['%s napja', '%s napon belül'],
    ['1 hete', '1 héten belül'],
    ['%s hete', '%s héten belül'],
    ['1 hónapja', '1 hónapon belül'],
    ['%s hónapja', '%s hónapon belül'],
    ['1 éve', '1 éven belül'],
    ['%s éve', '%s éven belül'],
  ][index];
};
