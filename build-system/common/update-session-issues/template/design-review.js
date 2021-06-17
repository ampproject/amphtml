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

const sessionDurationHours = 1;

/**
 * Times in this rotation are adjusted according to Daylight Savings.
 * If these are updated, the schedule on update-session-issues.yml should
 * also be updated correspondingly.
 */
const timeRotationUtc = [
  [/* wed */ 3, '16:30', 'Africa/Europe/western Asia'],
  [/* wed */ 3, '21:00', 'Americas'],
  [/* thu */ 4, '01:00', 'Asia/Oceania'],
];

const timeRotationStart = new Date('2021-04-14');

// All previous weeks have already been handled.
const generateWeeksFromNow = 3;

const labels = ['Type: Design Review'];

const createTitle = ({datetimeUtc, region}) =>
  `Design Review ${datetimeUtc} UTC (${region})`;

const vcUrl = 'https://bit.ly/amp-dr';
const calendarEventTitle = 'AMP Project Design Review';
const calendarEventDetails = vcUrl;

const createBody = ({calendarUrl, timeUrl, timeUtc}) =>
  `
Time: [${timeUtc} UTC](${timeUrl}) ([add to Google Calendar](${calendarUrl}))
Location: [Video conference via Google Meet](${vcUrl})

The AMP community holds weekly engineering [design reviews](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md). **We encourage everyone in the community to participate in these design reviews.**

If you are interested in bringing your design to design review, read the [design review documentation](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md) and add a link to your design doc or issue by the Monday before your design review.

When attending a design review please read through the designs _before_ the design review starts. This allows us to spend more time on discussion of the design.

We rotate our design review between times that work better for different parts of the world as described in our [design review documentation](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md), but you are welcome to attend any design review. If you cannot make any of the design reviews but have a design to discuss please let mrjoro@ know on [Slack](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#discussion-channels) and we will find a time that works for you.
`;

module.exports = /** @type {import('../types').TemplateDef} */ ({
  calendarEventTitle,
  calendarEventDetails,
  sessionDurationHours,
  timeRotationUtc,
  timeRotationStart,
  generateWeeksFromNow,
  labels,
  createTitle,
  createBody,
});
