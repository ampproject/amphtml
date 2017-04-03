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

export const he = function(number, index) {
  return [
    ['זה עתה', 'עכשיו'],
    ['לפני %s שניות', 'בעוד %s שניות'],
    ['לפני דקה', 'בעוד דקה'],
    ['לפני %s דקות', 'בעוד %s דקות'],
    ['לפני שעה', 'בעוד שעה'],
    ['לפני %s שעות', 'בעוד %s שעות'],
    ['אתמול', 'מחר'],
    ['לפני %s ימים', 'בעוד %s ימים'],
    ['לפני שבוע', 'בעוד שבוע'],
    ['לפני %s שבועות', 'בעוד %s שבועות'],
    ['לפני חודש', 'בעוד חודש'],
    ['לפני %s חודשים', 'בעוד %s חודשים'],
    ['לפני שנה', 'בעוד שנה'],
    ['לפני %s שנים', 'בעוד %s שנים'],
  ][index];
};
