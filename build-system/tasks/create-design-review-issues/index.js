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
const dayOfWeek = /* wednesday */ 3; // sunday = 0, monday = 1, ...

const sessionDurationHours = 1;

const timeRotationUtc = [
  ['Americas', '21:00'],
  ['Asia/Oceania', '01:00'],
  ['Africa/Europe/western Asia', '16:30'],
];

const timeRotationStartYyyyMmDd = '2021-03-17';

// All previous weeks have already been handled.
const generateWeeksFromNow = 3;

const labels = 'Type: Design Review';

const createTitle = ({yyyyMmDd, timeUtc, region}) =>
  `Design Review ${yyyyMmDd} ${timeUtc} UTC (${region})`;

const vcUrl = 'https://bit.ly/amp-dr';
const calendarEventTitle = 'AMP Project Design Review';
const calendarEventDetails = vcUrl;

const createBody = ({timeUtc, timeUrl, calendarUrl}) =>
  `
Time: [${timeUtc} UTC](${timeUrl}) ([add to Google Calendar](${calendarUrl}))
Location: [Video conference via Google Meet](${vcUrl})

The AMP community holds weekly engineering [design reviews](https://github.com/ampproject/amphtml/blob/master/contributing/design-reviews.md). **We encourage everyone in the community to participate in these design reviews.**

If you are interested in bringing your design to design review, read the [design review documentation](https://github.com/ampproject/amphtml/blob/master/contributing/design-reviews.md) and add a link to your design doc or issue by the Monday before your design review.

When attending a design review please read through the designs _before_ the design review starts. This allows us to spend more time on discussion of the design.

We rotate our design review between times that work better for different parts of the world as described in our [design review documentation](https://github.com/ampproject/amphtml/blob/master/contributing/design-reviews.md), but you are welcome to attend any design review. If you cannot make any of the design reviews but have a design to discuss please let mrjoro@ know on [Slack](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#discussion-channels) and we will find a time that works for you.
`.trim();

function padleft(str, size) {
  str = str.toString();
  while (str.length < size) {
    str = '0' + str;
  }
  return str;
}

function nextDayOfWeek(date, dayOfWeek, weeks = 1) {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(
    resultDate.getDate() +
      (weeks - 1) * 7 +
      ((7 + dayOfWeek - date.getDay()) % 7)
  );
  return resultDate;
}

function getRotation(date, startYyyyMmDd) {
  const [year, month, day] = startYyyyMmDd.split('-');
  const start = new Date(year, month - 1, day);
  const dateBeginningOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const weeks = Math.round(
    (dateBeginningOfDay - start) / (7 * 24 * 60 * 60 * 1000)
  );
  return timeRotationUtc[weeks % timeRotationUtc.length];
}

const timeZ = (yyyy, mm, dd, hours, minutes) =>
  `${yyyy + mm + dd}T${padleft(hours, 2) + padleft(minutes, 2)}Z`;

function nextIssue() {
  const today = new Date();

  // if we run on the same day of week, we need to skip one day to calculate
  // properly
  today.setDate(today.getDate() + 1);

  const nextDay = nextDayOfWeek(today, dayOfWeek, generateWeeksFromNow);
  const [region, timeUtc] = getRotation(nextDay, timeRotationStartYyyyMmDd);
  const [hours, minutes] = timeUtc.split(':').map(Number);

  const yyyy = nextDay.getFullYear();
  const mm = padleft(nextDay.getMonth() + 1, 2);
  const dd = padleft(nextDay.getDate(), 2);

  const timeUrl = `https://www.timeanddate.com/worldclock/meeting.html?year=${yyyy}&month=${mm}&day=${dd}&iv=0`;

  const startZ = timeZ(yyyy, mm, dd, hours, minutes);
  const endZ = timeZ(yyyy, mm, dd, hours + sessionDurationHours, minutes);

  const calendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(
    calendarEventTitle
  )}&dates=${startZ}/${endZ}&details=${encodeURIComponent(
    calendarEventDetails
  )}`;

  const templateData = {
    yyyyMmDd: `${yyyy}-${mm}-${dd}`,
    timeUtc,
    region,
    timeUrl,
    calendarUrl,
  };

  const title = createTitle(templateData);
  const body = createBody(templateData);
  return {title, labels, body};
}

// JSON is consumed by .github/workflows/create-design-review-issues.yml
console.log(JSON.stringify(nextIssue()));
