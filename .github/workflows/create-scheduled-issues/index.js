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
const {leadingZero} = require('./utils');

const templates = ['design-review', 'wg-components-office-hours'];

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
    resultDate.getDate() + ((7 + dayOfWeek - date.getDay()) % 7)
  );
  return resultDate;
}

function getRotationWeekly(start, scheduled, timeRotation) {
  const weeks = Math.round((scheduled - start) / (7 * 24 * 60 * 60 * 1000));
  return timeRotation[weeks % timeRotation.length];
}

function getNextNthWeekdayOfMonth(date, n, dayOfWeek) {
  let count = 0;
  const idate = new Date(date.getFullYear(), date.getMonth(), 1);
  while (true) {
    if (idate.getDay() === dayOfWeek) {
      if (++count == n) {
        break;
      }
    }
    idate.setDate(idate.getDate() + 1);
  }
  return idate;
}

function getRotationMonthly(start, scheduled, timeRotation) {
  const months =
    12 * (scheduled.getFullYear() - start.getFullYear()) +
    (scheduled.getMonth() - start.getMonth());
  return timeRotation[months % timeRotation.length];
}

function getNextIssueData(template, skip = 0) {
  let {
    frequency,
    timeRotationStartYyyyMmDd,
    timeRotation,
    labels,
    createTitle,
    createBody,
  } = template;

  const {dayOfWeek, nthDayOfWeek} = frequency;
  if ((dayOfWeek == null) === (nthDayOfWeek == null)) {
    throw new Error(
      'specify exactly one of frequency.dayOfWeek or frequency.nthDayOfWeek'
    );
  }

  const currentStartDate = new Date();
  if (dayOfWeek != null) {
    currentStartDate.setDate(currentStartDate.getDate() + skip * 7);
  } else if (nthDayOfWeek != null) {
    currentStartDate.setMonth(currentStartDate.getMonth() + skip);
  }

  const [year, month, day] = timeRotationStartYyyyMmDd.split('-');
  const timeRotationStart = new Date(year, month - 1, day);

  const nextDay =
    dayOfWeek != null
      ? getNextDayOfWeek(currentStartDate, dayOfWeek)
      : getNextNthWeekdayOfMonth(currentStartDate, ...nthDayOfWeek);

  const selectedTime =
    dayOfWeek != null
      ? getRotationWeekly(timeRotationStart, nextDay, timeRotation)
      : getRotationMonthly(timeRotationStart, nextDay, timeRotation);

  const [region, timeNoDst] = selectedTime;

  let [hours, minutes] = timeNoDst.split(':').map(Number);
  if (isDaylightSavingsUsa(nextDay)) {
    hours -= 1;
  }

  const yyyy = nextDay.getFullYear();
  const mm = leadingZero(nextDay.getMonth() + 1);
  const dd = leadingZero(nextDay.getDate());

  const templateData = {
    region,
    yyyy,
    mm,
    dd,
    hours,
    minutes,
    time: `${leadingZero(hours)}:${leadingZero(minutes)}`,
  };

  const title = createTitle(templateData).trim();
  const body = createBody(templateData).trim();

  return {yyyy, mm, dd, issue: {title, labels, body}};
}

function env(key) {
  if (!(key in process.env)) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return process.env[key];
}

async function createIssue(token, repo, template, skip = 0) {
  const {yyyy, mm, dd, issue: issueData} = getNextIssueData(template, skip);
  const yyyyMmDd = `${yyyy}-${mm}-${dd}`;
  const dateFromTitleRegEx = new RegExp(
    `${yyyy}[/\\- ]*${mm}[/\\- ]*${dd}[/\\- ]*`
  );
  if (process.argv.includes('--dry_run')) {
    return {yyyyMmDd, dryRunData: issueData};
  }
  const existingIssue = await findGithubIssue(
    token,
    repo,
    dateFromTitleRegEx,
    issueData.labels
  );
  if (existingIssue) {
    return {yyyyMmDd, existing: true, issue: existingIssue};
  }
  return {yyyyMmDd, issue: await postGithubIssue(token, repo, issueData)};
}

async function createAllIssues() {
  const token = env('GITHUB_TOKEN');
  const repo = env('GITHUB_REPOSITORY');
  await templates.map(async (templateName) => {
    const template = require(`./template/${templateName}`);

    const results = [];
    const {upcoming = 1} = template;
    for (let skip = 0; skip < upcoming; skip++) {
      results.push(createIssue(token, repo, template, skip));
    }

    for (const result of await Promise.all(results)) {
      const {yyyyMmDd, issue, existing, dryRunData} = result;
      if (dryRunData) {
        console.log(dryRunData);
        return;
      }
      console.log(
        existing
          ? `Skipped: ${templateName} (${yyyyMmDd})`
          : `✍️  ${issue.title}`
      );
      console.log(`- ${issue['html_url']}`);
      console.log();
    }
  });
}

createAllIssues().catch((e) => {
  console./*OK*/ error(e);
  process.exit(1);
});
