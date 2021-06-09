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

/** @typedef {0|1|2|3|4|5|6} */
let DayOfWeekDef; // sunday = 0, monday = 1, ...

const sessionDurationHours = 1;

/** @typedef {[DayOfWeekDef, string, string]} */
let RotationItemDef;

/**
 * Times in this rotation are adjusted according to Daylight Savings
 * @type {Array<RotationItemDef>}
 */
const timeRotationUtc = [
  [/* wed */ 3, 'Africa/Europe/western Asia', '16:30'],
  [/* wed */ 3, 'Americas', '21:00'],
  [/* thu */ 4, 'Asia/Oceania', '01:00'],
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
`.trim();

const isDryRun = process.argv.includes('--dry-run');

/**
 * @param {string|number} number
 * @return {string}
 */
function leadingZero(number) {
  return number.toString().padStart(2, '0');
}

/**
 * @param {Date} date
 * @return {boolean}
 */
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

/**
 * @param {string} yyyyMmDd
 * @param {number} hours
 * @param {number} minutes
 * @return {Date}
 */
function parseYyyyMmDd(yyyyMmDd, hours = 0, minutes = 0) {
  const [yyyy, mm, dd] = yyyyMmDd.split('/', 3).map(Number);
  return new Date(yyyy, mm - 1, dd, hours, minutes);
}

/**
 * @param {string} url
 * @param {Object} options
 * @param {string=} data
 * @return {!Promise<{res: *, body: string}>}
 */
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

/**
 * @param {string} token
 * @param {string} path
 * @param {Object=} data
 * @param {Object=} options
 * @return {!Promise<Object>}
 */
async function requestGithub(token, path, data, options = {}) {
  const {body, res} = await httpsRequest(
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

/**
 * @param {string} token
 * @param {string} query
 * @return {Promise<Object>}
 */
async function graphqlQueryGithub(token, query) {
  const {data} = await postGithub(token, '/graphql', {query});
  return data;
}

/**
 * @param {string} token
 * @param {string} url
 * @param {Object=} data
 * @return {Promise<Object>}
 */
async function postGithub(token, url, data) {
  return requestGithub(token, url, data, {method: 'POST'});
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {Object} data
 * @return {Promise<Object>}
 */
function postGithubIssue(token, repo, data) {
  const url = `/repos/${repo}/issues`;
  return postGithub(token, url, data);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {string|number} number
 * @return {Promise<Object>}
 */
function closeGithubIssue(token, repo, number) {
  return requestGithub(
    token,
    `/repos/${repo}/issues/${number}`,
    {state: 'closed'},
    {method: 'PATCH'}
  );
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {Array<string>} labels
 * @return {Promise<Object>}
 */
async function getGithubIssues(token, repo, labels) {
  const url = `/repos/${repo}/issues?state=open&labels=${encodeURIComponent(
    labels.join(',')
  )}`;
  return requestGithub(token, url);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {number|string} number
 * @return {Promise<string>}
 */
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

/** @enum {string} */
const PinUnpinOpDef = {pin: 'pin', unpin: 'unpin'};

/**
 * @param {string} token
 * @param {string} repo
 * @param {string|number} number
 * @param {PinUnpinOpDef=} op
 * @return {Promise<Object>}
 */
async function pinOrUnpinGithubIssue(token, repo, number, op = 'pin') {
  if (op !== 'pin' && op !== 'unpin') {
    throw new Error(`must be "pin" or "unpin", got "${op}"`);
  }
  const issueId = await getGraphqlIssueId(token, repo, number);
  const clientMutationId = `session-issue-${op}`;
  const mutation = `
    mutation {
      ${op}Issue(input: { clientMutationId: "${clientMutationId}", issueId:"${issueId}" }) {
        issue {
          title
        }
      }
    }
  `;
  return graphqlQueryGithub(token, mutation);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {string|number} number
 * @return {Promise<Object>}
 */
function pinGithubIssue(token, repo, number) {
  return pinOrUnpinGithubIssue(token, repo, number);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {string|number} number
 * @return {Promise<Object>}
 */
function unpinGithubIssue(token, repo, number) {
  return pinOrUnpinGithubIssue(token, repo, number, 'unpin');
}

/**
 * @param {Date} date
 * @param {number=} days
 * @return {Date}
 */
function addDays(date, days = 1) {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(resultDate.getDate() + days);
  return resultDate;
}

/**
 * @param {Date} nextDay
 * @param {Date} start
 * @return {RotationItemDef}
 */
function getRotation(nextDay, start) {
  const dateBeginningOfDay = new Date(
    nextDay.getFullYear(),
    nextDay.getMonth(),
    nextDay.getDate()
  );
  const weeks = Math.round(
    // @ts-ignore date calc
    (dateBeginningOfDay - start) / (7 * 24 * 60 * 60 * 1000)
  );
  return timeRotationUtc[weeks % timeRotationUtc.length];
}

const timeZ = (yyyy, mm, dd, hours, minutes) =>
  `${yyyy + mm + dd}T${leadingZero(hours) + leadingZero(minutes)}Z`;

/**
 * @return {Object}
 */
function getNextIssueData() {
  const upcomingWeekday = addDays(new Date(), generateWeeksFromNow * 7);

  const [dayOfWeek, region, timeUtcNoDst] = getRotation(
    upcomingWeekday,
    timeRotationStart
  );

  const nextDay = addDays(
    upcomingWeekday,
    dayOfWeek - upcomingWeekday.getDay()
  );
  const [hoursUnadjusted, minutes] = timeUtcNoDst.split(':').map(Number);
  const hours = hoursUnadjusted - (isDaylightSavingsUsa(nextDay) ? 1 : 0);

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
    datetimeUtc: getParseableDatetimeUtc(yyyy, mm, dd, timeUtc),
    timeUtc,
    region,
    timeUrl,
    calendarUrl,
  };

  const title = createTitle(templateData);
  const body = createBody(templateData);

  return {title, labels, body};
}

/**
 * @param {string} key
 * @return {string}
 */
function env(key) {
  if (!(key in process.env)) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return /** @type {string} */ (process.env[key]);
}

const datetimeFromTitleRegexp = /(\d{4}-\d{2}-\d{2}) (\d{1,2}[:]\d{2})/;

/**
 * @param {string|number} yyyy
 * @param {string|number} mm
 * @param {string|number} dd
 * @param {string} time
 * @return {string}
 */
function getParseableDatetimeUtc(yyyy, mm, dd, time) {
  // Keep this uniform with datetimeFromTitleRegexp, since it needs to be parsed
  // on future runs.
  // If you update it, make sure you update the titles of existing open issues
  // to match.
  return `${yyyy}-${mm}-${dd} ${time}`;
}

/**
 * @param {string} title
 * @return {number}
 */
function getSessionDateFromTitle(title) {
  const match = title.match(datetimeFromTitleRegexp);
  if (!match) {
    throw new Error(`Could not get date from title: ${title}`);
  }
  const [
    // @ts-ignore
    unusedFullMatch, // eslint-disable-line no-unused-vars
    day,
    time,
  ] = match;
  // ISO 860 is parsed as UTC
  return Date.parse(`${day}T${time}:00`);
}

/** @typedef {{sessionDate: number, issue: Object}} */
let IssueWithSessionDateDef;

/**
 * @param {string} token
 * @param {string} repo
 * @return {Promise<Array<IssueWithSessionDateDef>>}
 */
async function getExistingIssuesWithSessionDate(token, repo) {
  const issues = await getGithubIssues(token, repo, labels);
  return issues
    .map((issue) => ({
      sessionDate: getSessionDateFromTitle(issue.title),
      issue,
    }))
    .sort((a, b) => a.sessionDate - b.sessionDate);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {Array<IssueWithSessionDateDef>} issuesWithSessionDate
 * @return {Promise<Array<Object>>}
 */
async function closeStaleIssues(token, repo, issuesWithSessionDate) {
  const now = new Date();

  // Compensate duration so that we swap only once the session has ended.
  now.setHours(now.getHours() - sessionDurationHours);

  // We may run matching a session's end by the minute, add to prevent off-by-one.
  now.setMinutes(now.getMinutes() + 1);

  console./*OK*/ log(
    'Closing issues for sessions before',
    now.toISOString(),
    '...'
  );

  const issues = issuesWithSessionDate.filter(
    ({sessionDate}) => sessionDate < now.getTime()
  );
  for (const {issue} of issues) {
    const {'html_url': htmlUrl, number, title} = issue;
    if (!isDryRun) {
      await unpinGithubIssue(token, repo, number);
      await closeGithubIssue(token, repo, number);
    }
    console./*OK*/ log('Unpinned & closed: ', title, `(${htmlUrl})`);
  }
  return issues;
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {Array<IssueWithSessionDateDef>} existing
 */
async function closeStalePinUpcoming(token, repo, existing) {
  const staleIssues = await closeStaleIssues(token, repo, existing);
  if (!staleIssues.length) {
    // If there aren't any open stale issues, the newer issue has been pinned.
    console./*OK*/ log('(Zero issues to close, pin or unpin.)');
    return;
  }

  const mostRecentStaleIssue = staleIssues[staleIssues.length - 1];
  const upcoming = existing.find(
    ({sessionDate}) => sessionDate > mostRecentStaleIssue.sessionDate
  );
  if (!upcoming) {
    throw new Error(
      "Could not find next session issue to pin. If it's created later, it will NOT be pinned."
    );
  }

  const {'html_url': htmlUrl, number, title} = upcoming.issue;
  if (!isDryRun) {
    await pinGithubIssue(token, repo, number);
  }
  console./*OK*/ log('Pinned: ', title, `(${htmlUrl})`);
}

/**
 * @param {string} token
 * @param {string} repo
 * @param {Array<IssueWithSessionDateDef>} existing
 */
async function createScheduledIssue(token, repo, existing) {
  const issueData = getNextIssueData();
  const dateFromTitle = getSessionDateFromTitle(issueData.title);

  const existingIssue = existing.find(
    ({sessionDate}) => sessionDate == dateFromTitle
  );
  if (existingIssue) {
    const {'html_url': htmlUrl, title} = existingIssue.issue;
    console./*OK*/ log(
      '(Skipping creation of next issue since it exists.)\n' +
        `- ${title}\n  ${htmlUrl}`
    );
    return;
  }

  if (isDryRun) {
    console./*OK*/ log(issueData);
    return;
  }
  const {'html_url': htmlUrl, title} = await postGithubIssue(
    token,
    repo,
    issueData
  );
  console./*OK*/ log(title);
  console./*OK*/ log(htmlUrl);
}

/**
 * @param {string} token
 * @param {string} repo
 */
async function updateDesignReviewIssues(token, repo) {
  const existing = await getExistingIssuesWithSessionDate(token, repo);
  await createScheduledIssue(token, repo, existing);
  await closeStalePinUpcoming(token, repo, existing);
}

updateDesignReviewIssues(env('GITHUB_TOKEN'), env('GITHUB_REPOSITORY')).catch(
  (e) => {
    console./*OK*/ error(e);
    process.exit(1);
  }
);
