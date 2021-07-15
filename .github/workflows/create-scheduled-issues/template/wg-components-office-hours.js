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

const { getGoogleCalendarAddEventLink } = require("../utils");

const descriptionUrl = 'https://go.amp.dev/wg-components-hours-announcement';
const vcUrl = 'https://meet.google.com/spd-oowj-ndo';

const sessionDurationHours = 0.5;

module.exports = {
  frequency: {
    // Third (3) Tuesday (2) of every month.
    nthDayOfWeek: [3, 2],
  },
  upcoming: 3,
  timeRotationStartYyyyMmDd: '2021-04-20',
  timeRotation: [['Americas', '19:00']],

  labels: ['Type: Office Hours', 'WG: components'],

  createTitle({yyyy, mm, dd, time}) {
    return `Office Hours (wg-components) ${yyyy}-${mm}-${dd} ${time} UTC`;
  },

  createBody({yyyy, mm, dd, hours, time, minutes}) {
    const timeUrl = `https://www.timeanddate.com/worldclock/meeting.html?year=${yyyy}&month=${mm}&day=${dd}&iv=0`;
    const calendarUrl = getGoogleCalendarAddEventLink(
      yyyy,
      mm,
      dd,
      hours,
      minutes,
      sessionDurationHours,
      'AMP Office Hours (wg-components)',
      vcUrl
    );
    return `
Time: [${time} UTC](${timeUrl}) ([add to Google Calendar](${calendarUrl}))
Location: [Video conference via Google Meet](${vcUrl})

_More information coming soon._
`;
  },
};
