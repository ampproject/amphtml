/**
 * @fileoverview
 * Updates Github issues for scheduled public sessions, like
 * Design Reviews (https://go.amp.dev/design-reviews). This involves:
 *
 *  1. Creating issues for future sessions.
 *  2. Pinning the issue for the next upcoming session.
 *  3. Unpinning and closing issues for sessions that have ended.
 *
 * A Github Workflow runs this on a matching schedule.
 * See update-session-issues.yml
 */

/*
 * ⚠️ Only use standard node modules.
 * This file cannot depend on `npm install`.
 */
const {readdir} = require('fs').promises;
const https = require('https');
const {relative} = require('path');
const {RotationItemDef, TemplateDef} = require('./types');

/** @return {Promise<{[key: string]: TemplateDef}>} */
async function getTemplates() {
  const dir = relative(process.cwd(), __dirname) + '/template';
  const files = (await readdir(dir)).filter((basename) =>
    basename.endsWith('.js')
  );
  const entries = files.map((basename) => {
    const name = basename.replace(/\.js$/, '');
    const template = require(`./template/${basename}`);
    return [name, template];
  });
  return Object.fromEntries(entries);
}

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
 * @param {object} options
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
 * @param {object} data
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
 * @param {Array<RotationItemDef>} timeRotationUtc
 * @param {Date} nextDay
 * @param {Date} start
 * @return {RotationItemDef}
 */
function getRotation(timeRotationUtc, nextDay, start) {
  // @ts-ignore date calc
  const delta = nextDay - start;
  const weeks = Math.round(delta / (7 * 24 * 60 * 60 * 1000));
  return timeRotationUtc[weeks % timeRotationUtc.length];
}

const timeZ = (yyyy, mm, dd, hours, minutes) =>
  `${yyyy + mm + dd}T${leadingZero(hours) + leadingZero(minutes)}00Z`;

/**
 * @param {TemplateDef} template
 * @return {object}
 */
function getNextIssueData(template) {
  const {
    calendarEventDetails,
    calendarEventTitle,
    createBody,
    createTitle,
    generateWeeksFromNow,
    labels,
    sessionDurationHours,
    timeRotationStart,
    timeRotationUtc,
  } = template;

  const upcomingWeekday = addDays(new Date(), generateWeeksFromNow * 7);

  const [dayOfWeek, timeUtcNoDst, region] = getRotation(
    timeRotationUtc,
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

  const title = createTitle(templateData).trim();
  const body = createBody(templateData).trim();

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
    unusedFullMatch, // eslint-disable-line @typescript-eslint/no-unused-vars
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
 * @param {Array<string>} labels
 * @return {Promise<Array<IssueWithSessionDateDef>>}
 */
async function getExistingIssuesWithSessionDate(token, repo, labels) {
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
 * @param {number} sessionDurationHours
 * @param {Array<IssueWithSessionDateDef>} issuesWithSessionDate
 * @return {Promise<Array<Object>>}
 */
async function closeStaleIssues(
  token,
  repo,
  sessionDurationHours,
  issuesWithSessionDate
) {
  const now = new Date();

  // Compensate duration so that we swap only once the session has ended.
  now.setHours(now.getHours() - sessionDurationHours);

  // We may run matching a session's end by the minute, this prevents off-by-one.
  now.setSeconds(Math.max(1, now.getSeconds()));

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
 * @param {number} sessionDurationHours
 * @param {Array<IssueWithSessionDateDef>} existing
 * @return {Promise<void>}
 */
async function closeStalePinUpcoming(
  token,
  repo,
  sessionDurationHours,
  existing
) {
  const staleIssues = await closeStaleIssues(
    token,
    repo,
    sessionDurationHours,
    existing
  );
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
 * @param {TemplateDef} template
 * @param {Array<IssueWithSessionDateDef>} existing
 * @return {Promise<void>}
 */
async function createScheduledIssue(token, repo, template, existing) {
  const issueData = getNextIssueData(template);
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
 * @param {string} line
 * @param {string} underline
 * @return {string}
 */
const header = (line, underline = /* em-dash */ '\u2014') =>
  `\n${line}\n${new Array(line.length).fill(underline).join('')}`;

/**
 * @param {string} token
 * @param {string} repo
 * @return {Promise<void>}
 */
async function updateDesignReviewIssues(token, repo) {
  const templates = await getTemplates();

  for (const name in templates) {
    const template = templates[name];
    const {labels, sessionDurationHours} = template;

    console./*OK*/ log(header(name, '='));

    const existing = await getExistingIssuesWithSessionDate(
      token,
      repo,
      labels
    );
    await createScheduledIssue(token, repo, template, existing);
    await closeStalePinUpcoming(token, repo, sessionDurationHours, existing);
  }
}

updateDesignReviewIssues(env('GITHUB_TOKEN'), env('GITHUB_REPOSITORY')).catch(
  (e) => {
    console./*OK*/ error(e);
    process.exit(1);
  }
);
