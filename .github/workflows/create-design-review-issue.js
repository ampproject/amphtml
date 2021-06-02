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

const dayOfWeek = /* wednesday */ 3; // sunday = 0, monday = 1, ...

const sessionDurationHours = 1;

// Times in this rotation are adjusted according to Daylight Savings
const timeRotationUtc = [
  ['Americas', '21:00'],
  ['Asia/Oceania', '01:00'],
  ['Africa/Europe/western Asia', '16:30'],
];

const timeRotationStartYyyyMmDd = '2021-03-31';

// All previous weeks have already been handled.
const generateWeeksFromNow = 3;

const labels = ['Type: Design Review'];

const createTitle = ({yyyyMmDd, timeUtc, region}) =>
  `Design Review ${yyyyMmDd} ${timeUtc} UTC (${region})`;

const vcUrl = 'https://bit.ly/amp-dr';
const calendarEventTitle = 'AMP Project Design Review';
const calendarEventDetails = vcUrl;

const createBody = ({timeUtc, timeUrl, calendarUrl}) =>
  `
Time: [${timeUtc} UTC](${timeUrl}) ([add to Google Calendar](${calendarUrl}))
Location: [Video conference via Google Meet](${vcUrl})

The AMP community holds weekly engineering [design reviews](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md). **We encourage everyone in the community to participate in these design reviews.**

If you are interested in bringing your design to design review, read the [design review documentation](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md) and add a link to your design doc or issue by the Monday before your design review.

When attending a design review please read through the designs _before_ the design review starts. This allows us to spend more time on discussion of the design.

We rotate our design review between times that work better for different parts of the world as described in our [design review documentation](https://github.com/ampproject/amphtml/blob/main/docs/design-reviews.md), but you are welcome to attend any design review. If you cannot make any of the design reviews but have a design to discuss please let mrjoro@ know on [Slack](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#discussion-channels) and we will find a time that works for you.
`.trim();

const isDryRun = process.argv.includes('--dry-run');

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

async function requestGithub(token, path, data, options = {}) {
  const {res, body} = await httpsRequest(
    `https://api.github.com/${path.replace(/^\//, '')}`,
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

async function graphqlQueryGithub(token, query) {
  const {data} = await postGithub(token, '/graphql', {query});
  return data;
}

async function postGithub(token, url, data) {
  return requestGithub(token, url, data, {method: 'POST'});
}

function postGithubIssue(token, repo, data) {
  const url = `/repos/${repo}/issues`;
  return postGithub(token, url, data);
}

function closeGithubIssue(token, repo, number) {
  return requestGithub(
    token,
    `/repos/${repo}/issues/${number}`,
    {state: 'closed'},
    {method: 'PATCH'}
  );
}

async function getGithubIssues(token, repo, labels) {
  const url = `/repos/${repo}/issues?state=open&labels=${encodeURIComponent(
    labels.join(',')
  )}`;
  return requestGithub(token, url);
}

async function getGraphqlIssueId(token, repo, number) {
  const [owner, name] = repo.split('/');
  const query = `
    query {
      repository(owner:"${owner}", name:"${name}") {
        issue(number:${number}) {
          id
        }
      }
    }
  `;
  const {repository} = await graphqlQueryGithub(token, query);
  return repository.issue.id;
}

async function pinIssue(token, repo, number) {
  const issueId = await getGraphqlIssueId(token, repo, number);
  const clientMutationId = 'create-design-review-pin';
  const mutation = `
    mutation {
      pinIssue(input: { clientMutationId: "${clientMutationId}", issueId:"${issueId}" }) {
        issue {
          title
        }
      }
    }
  `;
  return graphqlQueryGithub(token, mutation);
}

async function unpinIssue(token, repo, number) {
  const issueId = await getGraphqlIssueId(token, repo, number);
  const clientMutationId = 'create-design-review-unpin';
  const mutation = `
    mutation {
      unpinIssue(input: { clientMutationId: "${clientMutationId}", issueId:"${issueId}" }) {
        issue {
          title
        }
      }
    }
  `;
  return graphqlQueryGithub(token, mutation);
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
  `${yyyy + mm + dd}T${leadingZero(hours) + leadingZero(minutes)}Z`;

function getNextIssueData() {
  const today = new Date();

  // if we run on the same day of week, we need to skip one day to calculate
  // properly
  today.setDate(today.getDate() + 1);

  const nextDay = getNextDayOfWeek(today, dayOfWeek, generateWeeksFromNow);
  const [region, timeUtcNoDst] = getRotation(
    nextDay,
    timeRotationStartYyyyMmDd
  );

  let [hours, minutes] = timeUtcNoDst.split(':').map(Number);
  if (isDaylightSavingsUsa(nextDay)) {
    hours -= 1;
  }

  const yyyy = nextDay.getFullYear();
  const mm = leadingZero(nextDay.getMonth() + 1);
  const dd = leadingZero(nextDay.getDate());

  const timeUtc = `${leadingZero(hours)}:${leadingZero(minutes)}`;

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

function env(key) {
  if (!(key in process.env)) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return process.env[key];
}

const datetimeFromTitleRegexp = /(\d{4}-\d{2}-\d{2}) (\d{1,2}[:]\d{2})/;

function getSessionDateFromTitle(title) {
  const [unusedFullMatch, day, time] = title.match(datetimeFromTitleRegexp);
  // ISO 860 is parsed as UTC
  return Date.parse(`${day}T${time}:00`);
}

async function getExistingIssuesWithSessionDate(token, repo) {
  const issues = await getGithubIssues(token, repo, labels);
  return issues
    .map((issue) => ({
      sessionDate: getSessionDateFromTitle(issue.title),
      issue,
    }))
    .sort((a, b) => a.sessionDate - b.sessionDate);
}

async function closeStaleIssues(token, repo, issuesWithSessionDate) {
  const now = new Date();

  // Compensate duration so that we swap only once the session has ended.
  now.setHours(now.getHours() - sessionDurationHours);

  const issues = issuesWithSessionDate.filter(
    ({sessionDate}) => sessionDate < now
  );
  for (const {issue} of issues) {
    const {number, title} = issue;
    if (!isDryRun) {
      await unpinIssue(token, repo, number);
      await closeGithubIssue(token, repo, number);
    }
    console./*OK*/ log('Unpinned & closed: ', title, '\n');
  }
  return issues;
}

async function closeStalePinNextIssue(token, repo, existing) {
  const staleIssues = closeStaleIssues(token, repo, existing);
  if (!staleIssues.length) {
    // If there aren't any open stale issues, the newer issue has been pinned.
    console./*OK*/ log('(Zero issues to close, pin or unpin.)');
    return;
  }

  const mostRecentStaleIssue = staleIssues[staleIssues.length - 1];
  const nextIssue = existing.find(
    ({sessionDate}) => sessionDate > mostRecentStaleIssue.sessionDate
  );
  if (!nextIssue) {
    throw new Error(
      "Could not find next session issue to pin. If it's created later, it will NOT be pinned."
    );
  }

  const {number, title} = nextIssue.issue;
  if (!isDryRun) {
    await pinIssue(token, repo, number);
  }
  console./*OK*/ log('Pinned: ', title, '\n');
}

async function createNextDesignReviewIssue(token, repo, existing) {
  const nextIssueData = getNextIssueData();
  const nextIssueDateFromTitle = getSessionDateFromTitle(nextIssueData.title);

  const existingIssue = existing.find(
    ({sessionDate}) => sessionDate == nextIssueDateFromTitle
  );
  if (existingIssue) {
    const {title, 'html_url': htmlUrl} = existingIssue.issue;
    console./*OK*/ log(
      '(Skipping creation of next issue since it exists.)\n' + `- ${title}\n  ${htmlUrl}`
    );
    return;
  }

  if (isDryRun) {
    console./*OK*/ log(nextIssueData);
    return;
  }
  const {title, 'html_url': htmlUrl} = await postGithubIssue(
    token,
    repo,
    nextIssueData
  );
  console./*OK*/ log(title);
  console./*OK*/ log(htmlUrl);
}

async function createDesignReviewIssue(token, repo) {
  const existing = await getExistingIssuesWithSessionDate(token, repo);
  await createNextDesignReviewIssue(token, repo, existing);
  await closeStalePinNextIssue(token, repo, existing);
}

createDesignReviewIssue(env('GITHUB_TOKEN'), env('GITHUB_REPOSITORY')).catch(
  (e) => {
    console./*OK*/ error(e);
    process.exit(1);
  }
);
