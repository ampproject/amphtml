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

/**
 * @fileoverview
 * Creates a Github issue for an upcoming design review.
 *
 * https://go.amp.dev/design-reviews
 *
 * A Github Action runs this once a week. See create-design-review-issues.yml
 */

/*
 * ⚠️ Only use standard node modules.
 *
 * This file runs by itself. It cannot depend on `npm install` nor file
 * structure since the Github Action downloads this file only.
 */
const https = require('https');

function leadingZero(number) {
  return number.toString().padStart(2, '0');
}

function isDaylightSavingsUsa(date) {
  // [start, end] ranges of Daylight Savings in (most of) the USA
  // https://www.timeanddate.com/time/dst/2021.html
  const ranges = [
    ['2021/3/14', '2021/11/7'],
    ['2022/3/13', '2022/11/6'],
    ['2023/3/12', '2023/11/5'],
    ['2024/3/10', '2024/11/3'],
    ['2025/3/9', '2025/11/2'],
    ['2026/3/8', '2026/11/1'],
    ['2027/3/14', '2027/11/7'],
    ['2028/3/12', '2028/11/5'],
    ['2029/3/11', '2029/11/4'],
  ];
  return ranges.some(([start, end]) => {
    const time = date.getTime();
    return (
      time > parseYyyyMmDd(start, /* hours */ 2, /* minutes */ 0).getTime() &&
      time < parseYyyyMmDd(end, /* hours */ 2, /* minutes */ 0).getTime()
    );
  });
}

function parseYyyyMmDd(yyyyMmDd, hours = 0, minutes = 0) {
  const [yyyy, mm, dd] = yyyyMmDd.split('/', 3).map(Number);
  return new Date(yyyy, mm - 1, dd, hours, minutes);
}

function httpsRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      res.on('close', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve({res, body});
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.write(data);
    req.end();
  });
}

async function postGithub(token, url, data) {
  const {res, body} = await httpsRequest(
    url,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'amphtml',
        'Accept': 'application/vnd.github.v3+json',
      },
    },
    JSON.stringify(data)
  );

  if (res.statusCode < 200 || res.statusCode > 299) {
    console./*OK*/ error(body);
    throw new Error(res.statusCode);
  }

  return JSON.parse(body);
}

function postGithubIssue(token, repo, data) {
  const url = `https://api.github.com/repos/${repo}/issues`;
  return postGithub(token, url, data);
}

function getNextDayOfWeek(date, dayOfWeek, weeks = 1) {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(
    resultDate.getDate() +
      (weeks - 1) * 7 +
      ((7 + dayOfWeek - date.getDay()) % 7)
  );
  return resultDate;
}

function getWeeksBetween(d1, d2) {
  return Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
}

function getRotation(date, timeRotationUtc, startYyyyMmDd, frequencyWeeks = 1) {
  const [year, month, day] = startYyyyMmDd.split('-');
  const start = new Date(year, month - 1, day);
  const dateBeginningOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const weeks = getWeeksBetween(start, dateBeginningOfDay);
  if (weeks % frequencyWeeks !== 0) {
    return null;
  }
  return timeRotationUtc[weeks % timeRotationUtc.length];
}

const timeZ = (yyyy, mm, dd, hours, minutes) =>
  `${yyyy + mm + dd}T${leadingZero(hours) + leadingZero(minutes)}Z`;

function getNextIssueData({
  frequencyWeeks,
  dayOfWeek,
  generateWeeksFromNow,
  sessionDurationHours,
  timeRotationStartYyyyMmDd,
  timeRotationUtc,
  labels,
  createTitle,
  createBody,
}) {
  const today = new Date();

  // We generate it in the same day of week.
  if (today.getDay() !== dayOfWeek) {
    return null;
  }

  // if we run on the same day of week, we need to skip one day to calculate
  // properly
  today.setDate(today.getDate() + 1);

  const nextDay = getNextDayOfWeek(today, dayOfWeek, generateWeeksFromNow);
  const rotation = getRotation(
    nextDay,
    timeRotationUtc,
    timeRotationStartYyyyMmDd,
    frequencyWeeks
  );

  if (!rotation) {
    return null;
  }

  const [region, timeUtcNoDst] = rotation;

  let [hours, minutes] = timeUtcNoDst.split(':').map(Number);
  if (isDaylightSavingsUsa(nextDay)) {
    hours -= 1;
  }

  const yyyy = nextDay.getFullYear();
  const mm = leadingZero(nextDay.getMonth() + 1);
  const dd = leadingZero(nextDay.getDate());

  const timeUtc = `${leadingZero(hours)}:${leadingZero(minutes)}`;

  const startZ = timeZ(yyyy, mm, dd, hours, minutes);
  const endZ = timeZ(yyyy, mm, dd, hours + sessionDurationHours, minutes);

  const templateData = {
    yyyy,
    mm,
    dd,
    startZ,
    endZ,
    timeUtc,
    region,
  };

  const title = createTitle(templateData);
  const body = createBody(templateData);

  return {title, labels, body};
}

function env(key) {
  if (!(key in process.env)) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return process.env[key];
}

async function maybeCreateIssue(name) {
  const template = require(`./template/${name}`);
  const nextIssueData = getNextIssueData(template);

  console./*OK*/ log();
  console./*OK*/ log(name);

  if (!nextIssueData) {
    console./*OK*/log('- [ignored]');
    return;
  }

  if (process.argv.includes('--dry-run')) {
    console./*OK*/ log(nextIssueData);
    return;
  }

  const {title, 'html_url': htmlUrl} = await postGithubIssue(
    env('GITHUB_TOKEN'),
    env('GITHUB_REPOSITORY'),
    nextIssueData
  );
  console./*OK*/ log('-', title);
  console./*OK*/ log('-', htmlUrl);
}

async function createAllIssuesForToday() {
  console.log('Creating scheduled issues:')
  for (const name of ['design-review', 'wg-components-office-hours']) {
    await maybeCreateIssue(name);
  }
}

createAllIssuesForToday().catch((e) => {
  console./*OK*/ error(e);
  process.exit(1);
});
