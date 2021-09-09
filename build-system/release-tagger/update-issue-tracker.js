/**
 * @fileoverview
 * Create or update release issue tracker
 */

const dedent = require('dedent');
const {createIssue, getIssue, updateIssue} = require('./utils');

const promotions = {
  'beta-opt-in': (tag) =>
    `- [ ] <!-- tag=${tag} channel=beta-opt-in -->${tag} promoted to Experimental and Beta (opt-in) channels (PROMOTE_TIME)`,
  'beta-percent': (tag) =>
    `- [ ] <!-- tag=${tag} channel=beta-percent -->${tag} promoted to Experimental and Beta (1% traffic) channels (PROMOTE_TIME)`,
  'stable': (tag) =>
    `- [ ] <!-- tag=${tag} channel=stable -->${tag} promoted to Stable channel (PROMOTE_TIME)`,
  'lts': (tag) =>
    `- [ ] <!-- tag=${tag} channel=lts -->(optional) ${tag} promoted to LTS channel (PROMOTE_TIME)`,
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
      ${Object.values(promotions)
        .map((promotion) => promotion(this.head))
        .join('\n')}`;
    } else {
      // get existing task list
      this.main = body.substring(
        body.indexOf('### Promotions'),
        body.indexOf('\n\n/cc')
      );
    }
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
    const keys = Object.keys(promotions);
    const add = [];
    let index = keys.indexOf(channel);
    while (index < keys.length) {
      add.push(promotions[keys[index]](this.head));
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
    const task = promotions[channel](this.head);
    const [before, after] = this.main.split(task);
    const checked = task.replace('[ ]', '[x]').replace('PROMOTE_TIME', time);
    this.main = `${before}${checked}${after}`;
  }
}

/**
 * Create or update issue tracker
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {string} time
 * @return {Promise<Object>}
 */
async function createOrUpdateTracker(head, base, channel, time) {
  const isCherrypick = Number(head) - Number(base) < 1000;
  const issue = isCherrypick
    ? await getIssue(`Release ${base}`)
    : await getIssue(`Release ${head}`);
  if (!issue) {
    const tracker = new IssueTracker(head, base);
    tracker.checkTask(channel, time);
    const {footer, header, label, main, title} = tracker;
    const body = `${header}\n\n${main}\n\n${footer}`;
    return await createIssue(body, label, title);
  }

  const tracker = new IssueTracker(head, base, issue.body, issue.number);
  if (isCherrypick) {
    tracker.addCherrypickTasks(channel);
  }
  tracker.checkTask(channel, time);
  const {footer, header, main, number, title} = tracker;
  const body = `${header}\n\n${main}\n\n${footer}`;
  return await updateIssue(body, number, title);
}

module.exports = {createOrUpdateTracker};
