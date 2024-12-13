/**
 * @fileoverview
 * Add progress comment for Stable and LTS cherry-picks
 */

const {getChannels, steps} = require('./common');
const {log} = require('../common/logging');

const [number, user] = process.argv.slice(2);
const body = process.env.BODY || '';

const commentTemplate = (channels) => {
  const reducer = (current, step) => {
    return current + `- [ ] <!-- status=${step.status} --> ${step.text} \n`;
  };

  return `
  #### 🌸 Cherry-Pick Progress 🌸 
  Hi @${user}, thanks for filing this cherry-pick request!
  Seeing that this affects ${channels.join(
    ' and '
  )}, [status.amp.dev](https://status.amp.dev) will be updated with progress of the fix.
  Please update this tracker as each step is completed.
  ${steps.reduce(reducer, '')}
  `;
};

/**
 * Add progress comment for Stable and LTS cherry-picks
 * @return {Promise<void>}
 */
async function addComment() {
  const channels = getChannels(body);
  if (channels.length == 0) {
    return;
  }

  const apiUrl = `https://api.github.com/repos/ampproject/amphtml/issues/${number}/comments`;
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify({body: commentTemplate(channels)}),
  };

  const response = await fetch(apiUrl, options);
  log(await response.json());
}

addComment();
