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
  frequencyWeeks: 3,
  dayOfWeek: /* tuesday */ 2, // sunday = 0, monday = 1
  sessionDurationHours: 1,
  timeRotationStartYyyyMmDd: '2021-03-31',
  timeRotationUtc: [
    ['Americas', '21:00'],
    ['Asia/Oceania', '01:00'],
    ['Africa/Europe/western Asia', '16:30'],
  ],
  labels: ['Type: Design Review'],

  // All previous weeks have already been handled.
  generateWeeksFromNow: 3,

  createTitle({yyyy, mm, dd, timeUtc, region}) {
    return `wg-components Office Hours ${yyyy}-${mm}-${dd} ${timeUtc} UTC (${region})`;
  },

  createBody({yyyy, mm, dd, timeUtc, startZ, endZ}) {
    const vcUrl = 'https://bit.ly/amp-dr';
    const calendarEventTitle = 'AMP Project wg-components Office Hours';
    const calendarEventDetails = vcUrl;

    const timeUrl = `https://www.timeanddate.com/worldclock/meeting.html?year=${yyyy}&month=${mm}&day=${dd}&iv=0`;

    const calendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(
      calendarEventTitle
    )}&dates=${startZ}/${endZ}&details=${encodeURIComponent(
      calendarEventDetails
    )}`;

    return `
Time: [${timeUtc} UTC](${timeUrl}) ([add to Google Calendar](${calendarUrl}))
Location: [Video conference via Google Meet](${vcUrl})

wg-components Office Hours

TODO
`.trim();
  },
};
