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
 * Creates Github issues on a schedule, like for upcoming Design Reviews
 * (https://go.amp.dev/design-reviews)
 *
 * See README.md for a guide to running and configuring this script.
 */

/*
 * ⚠️ Only use standard node modules.
 *
 * This file runs by itself. It cannot depend on `npm install`.
 */
const https = require('https');

const templates = ['design-review', 'wg-components-office-hours'];

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
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function requestGithub(token, url, data, options = {}) {
  const {res, body} = await httpsRequest(
    url,
    {
      ...options,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'amphtml',
        'Accept': 'application/vnd.github.v3+json',
      },
    },
    data ? JSON.stringify(data) : undefined
  );

  if (res.statusCode < 200 || res.statusCode > 299) {
    console./*OK*/ error(body);
    throw new Error(res.statusCode);
  }

  return JSON.parse(body);
}

function postGithub(token, url, data) {
  return requestGithub(token, url, data, {method: 'POST'});
}

function postGithubIssue(token, repo, data) {
  const url = `https://api.github.com/repos/${repo}/issues`;
  return postGithub(token, url, data);
}

function normalizeTitleForComparison(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/gi, ' ');
}

async function findGithubIssue(token, repo, dateFromTitleRegEx, labels) {
  const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=${encodeURIComponent(
    labels.join(',')
  )}`;
  return (await requestGithub(token, url)).find((item) =>
    dateFromTitleRegEx.test(item.title)
  );
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

function getRotationWeekly(
  scheduled,
  start,
  timeRotationUtc,
  frequencyWeeks = 1
) {
  const dateBeginningOfDay = new Date(
    scheduled.getFullYear(),
    scheduled.getMonth(),
    scheduled.getDate()
  );
  const weeks = getWeeksBetween(start, dateBeginningOfDay);
  if (weeks % frequencyWeeks !== 0) {
    return null;
  }
  return timeRotationUtc[weeks % timeRotationUtc.length];
}

function getNextNthWeekdayOfMonth(date, weekday, n) {
  let count = 0;
  const idate = new Date(date.getFullYear(), date.getMonth(), 1);
  while (true) {
    if (idate.getDay() === weekday) {
      if (++count == n) {
        break;
      }
    }
    idate.setDate(idate.getDate() + 1);
  }
  return idate;
}

function getRotationMonthly(scheduled, start, timeRotationUtc) {
  const months =
    12 * (scheduled.getFullYear() - start.getFullYear()) +
    (scheduled.getMonth() - start.getMonth());
  return timeRotationUtc[months % timeRotationUtc.length];
}

const timeZ = (yyyy, mm, dd, hours, minutes) =>
  `${yyyy + mm + dd}T${leadingZero(hours) + leadingZero(minutes)}Z`;

function getNextIssueData(template) {
  let {
    frequencyWeeks,
    frequencyWeekdayOfMonth,
    sessionsFromNow = 1,
    sessionDurationHours,
    timeRotationStartYyyyMmDd,
    timeRotationUtc,
    labels,
    createTitle,
    createBody,
  } = template;

  if (!frequencyWeeks === !frequencyWeekdayOfMonth) {
    throw new Error(
      'specify exactly one of frequencyWeeks or frequencyWeekdayOfMonth'
    );
  }

  const dayOfWeek = (frequencyWeeks || frequencyWeekdayOfMonth)[1];

  // if we run on the same day of week, we need to skip one day to calculate
  // properly
  const today = new Date();
  today.setDate(today.getDate() + 1);

  const [year, month, day] = timeRotationStartYyyyMmDd.split('-');
  const timeRotationStart = new Date(year, month - 1, day);

  const nextDay =
    frequencyWeeks != null
      ? getNextDayOfWeek(today, dayOfWeek, sessionsFromNow)
      : getNextNthWeekdayOfMonth(
          new Date(
            today.getFullYear(),
            today.getMonth() + (sessionsFromNow - 1),
            today.getDate(),
            today.getHours(),
            today.getMinutes()
          ),
          dayOfWeek,
          frequencyWeekdayOfMonth[0]
        );

  const rotation =
    frequencyWeeks != null
      ? getRotationWeekly(
          nextDay,
          timeRotationStart,
          timeRotationUtc,
          frequencyWeeks[0]
        )
      : getRotationMonthly(nextDay, timeRotationStart, timeRotationUtc);

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

  return {yyyy, mm, dd, issue: {title, labels, body}};
}

function env(key) {
  if (!(key in process.env)) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return process.env[key];
}

async function maybeCreateIssue(token, repo, name) {
  const template = require(`./template/${name}`);
  const {yyyy, mm, dd, issue} = getNextIssueData(template);

  console./*OK*/ log();
  console./*OK*/ log(name);

  if (!issue) {
    console./*OK*/ log('- [ignored]');
    return;
  }

  const dateFromTitleRegEx = new RegExp(
    `${yyyy}[/\\- ]*${mm}[/\\- ]*${dd}[/\\- ]*`
  );
  const existingIssue = await findGithubIssue(
    token,
    repo,
    dateFromTitleRegEx,
    issue.labels
  );
  if (existingIssue) {
    console./*OK*/ log('- [issue already exists]');
  }

  if (process.argv.includes('--dry-run')) {
    console./*OK*/ log(issue);
    return;
  }

  const {title, 'html_url': htmlUrl} =
    existingIssue || (await postGithubIssue(token, repo, issue));

  console./*OK*/ log('-', title);
  console./*OK*/ log('-', htmlUrl);
}

async function createAllIssuesForToday() {
  console./*OK*/ log('Creating scheduled issues:');
  for (const name of templates) {
    await maybeCreateIssue(env('GITHUB_TOKEN'), env('GITHUB_REPOSITORY'), name);
  }
}

createAllIssuesForToday().catch((e) => {
  console./*OK*/ error(e);
  process.exit(1);
});
