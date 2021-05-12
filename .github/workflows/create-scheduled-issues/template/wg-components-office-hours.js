/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

module.exports = {
  frequency: {
    // Third (3) Tuesday (2) of every month.
    nthDayOfWeek: [3, 2],
  },
  upcoming: 3,
  timeRotationStartYyyyMmDd: '2021-04-20',
  timeRotation: [['Americas', '18:00']],
  labels: ['Type: Office Hours', 'WG: components'],

  createTitle({yyyy, mm, dd, hours, minutes, region}) {
    return `wg-components Office Hours ${yyyy}-${mm}-${dd} ${hours}:${minutes} UTC (${region})`;
  },

  createBody({yyyy, mm, dd, hours, minutes}) {
    return `
TODO
`;
  },
};
