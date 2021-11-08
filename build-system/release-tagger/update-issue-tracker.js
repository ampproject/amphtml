/**
 * @fileoverview
 * Create or update release issue tracker
 */

const dedent = require('dedent');
const {createIssue, getIssue, updateIssue} = require('./utils');
const {cyan, magenta} = require('kleur/colors');
const {log} = require('../common/logging');

const CHANNEL_NAMES = {
  'beta-opt-in': 'Experimental and Beta (opt-in) channels',
  'beta-percent': 'Experimental and Beta (1% traffic) channels',
  'stable': 'Stable channel',
  'lts': 'LTS channel',
};

class IssueTracker {
  footer = '/cc @ampproject/release-on-duty';
  label = 'Type: Release';
  /**
   * @param {string} head
   * @param {string} base
   * @param {string?} body
   * @param {string?} number
   */
  constructor(head, base, body = '', number = '') {
    this.head = head;
    this.base = base;
    this.number = number ? Number(number) : -1;
    this.title = `🚄 Release ${this.head}`;
    this.header = `### AMP Version\n\n\[${this.head}](https://github.com/ampproject/amphtml/releases/tag/${this.head})`;
    if (!body) {
      // create task list
      this.main = dedent`### Promotions\n\n\
      ${Object.keys(CHANNEL_NAMES)
        .map((channel) => this._createTask(channel, this.head))
        .join('\n')}`;
    } else {
      // get existing task list
      this.main = body.substring(
        body.indexOf('### Promotions'),
        body.indexOf('\n\n/cc')
      );
    }
  }

  /**
   * @param {string} channel
   * @param {string} tag
   * @return {string}
   */
  _createTask(channel, tag) {
    return `- [ ] <!-- amp-version=${tag} channel=${channel} -->${tag} promoted to ${CHANNEL_NAMES[channel]} <!-- promote-time -->`;
  }

  /** @param {string} channel */
  addCherrypickTasks(channel) {
    // keep completed tasks
    const lines = this.main.split(/Promotions/)[1].split('\n');
    const keep = [];
    for (const line of lines) {
      if (line.startsWith('- [x]') || line.startsWith('🌸')) {
        keep.push(line);
      }
    }

    // add tasks for new release starting with given channel
    const keys = Object.keys(CHANNEL_NAMES);
    const add = [];
    let index = keys.indexOf(channel);
    while (index < keys.length) {
      add.push(this._createTask(keys[index], this.head));
      index++;
    }

    // regenerate main section
    this.main = dedent`### Promotions\n\n\
    ${keep.join('\n')}
    🌸 ${this.base} was cherry-picked to create ${this.head}
    ${add.join('\n')}`;
  }

  /**
   * @param {string} channel
   * @param {string} time
   */
  checkTask(channel, time) {
    const task = this._createTask(channel, this.head);
    const [before, after] = this.main.split(task);
    const checked = task
      .replace('[ ]', '[x]')
      .replace('<!-- promote-time -->', `(${time})`);
    this.main = `${before}${checked}${after}`;
  }
}

/**
 * Get issue if it exists and whether it's a cherrypick
 * @param {string} head
 * @return {!Promise}
 */
async function setup(head) {
  let issue = await getIssue(`Release ${head}`);
  if (issue || head.endsWith('000')) {
    return {isCherrypick: false, issue};
  }

  // is cherrypick, so find base issue tracker
  let version = Number(head);
  while (version % 1000 !== 0) {
    version--;
    issue = await getIssue(`Release ${version}`);
    if (issue) {
      break;
    }
  }
  return {isCherrypick: true, issue};
}

/**
 * Create or update issue tracker
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {string} time
 * @return {Promise<void>}
 */
async function createOrUpdateTracker(head, base, channel, time) {
  const {isCherrypick, issue} = await setup(head);

  // create new tracker
  if (!issue) {
    const tracker = new IssueTracker(head, base);
    tracker.checkTask(channel, time);
    const {footer, header, label, main, title} = tracker;
    const body = `${header}\n\n${main}\n\n${footer}`;
    const newIssue = await createIssue(body, label, title);
    log(
      'Created issue tracker',
      magenta(newIssue.title),
      'at',
      cyan(newIssue['html_url'])
    );
    return;
  }

  // check task
  log('Found issue tracker', magenta(issue.title), 'at', cyan(issue.url));
  const tracker = new IssueTracker(head, base, issue.body, issue.number);
  if (isCherrypick) {
    tracker.addCherrypickTasks(channel);
  }
  tracker.checkTask(channel, time);
  const {footer, header, main, number, title} = tracker;
  const body = `${header}\n\n${main}\n\n${footer}`;
  await updateIssue(body, number, title);

  // if stable, close last stable's tracker
  if (channel == 'stable' && !isCherrypick) {
    const old = await getIssue(`Release ${base}`);
    if (old) {
      await updateIssue(old.body, old.number, old.title, 'closed');
    }
  }
}

module.exports = {createOrUpdateTracker};
