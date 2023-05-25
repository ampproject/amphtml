const argv = require('minimist')(process.argv.slice(2));
const {cyan, red, yellow} = require('kleur/colors');
const {exec} = require('../../common/exec');
const {log} = require('../../common/logging');

const org = 'ampproject';
const repo = 'amphtml';

// Must match .github/workflows/sweep-experiments.yml
const prefix = 'sweep-experiments-';

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

/**
 * @param {string} path
 * @param {{[string: string]: string|Object}=} options
 * @return {!Promise<Object[]|Object>}
 */
async function githubFetch(path, options) {
  const url = `https://api.github.com/repos/${org}/${repo}/${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'amphtml',
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${env('GITHUB_TOKEN')}`,
    },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${url}\n${text}`);
  }
  return response.json();
}

/**
 * @param {(number) => string} getPagePath
 * @return {Promise<Object[]>}
 */
async function getAllPaginated(getPagePath) {
  const result = [];
  let page = 1;
  let lastResult;
  do {
    lastResult = await githubFetch(getPagePath(++page));
    result.push(...lastResult);
  } while (lastResult.length);
  return result;
}

/**
 * @return {Promise<string[]>}
 */
async function getOldBranches() {
  return (await getAllPaginated((page) => `branches?per_page=100&page=${page}`))
    .map(({name}) => name)
    .filter((name) => name.startsWith(prefix));
}

/**
 * @param {string} state
 * @param {string} orgOrUser
 * @param {string} branch
 * @return {Promise<Object|undefined>}
 */
async function getBranchPull(state, orgOrUser, branch) {
  const [pull] = await githubFetch(
    `pulls?per_page=1&head=${orgOrUser}:${branch}&state=${state}`
  );
  return pull;
}

/**
 * @param {number|string} number
 * @return {Promise}
 */
async function closePullRequest(number) {
  const path = `pulls/${number}`;
  const method = 'PATCH';
  const body = JSON.stringify({state: 'closed'});
  log(`${method} ${path} ${body}`);
  if (!argv.dry_run) {
    await githubFetch(path, {method, body});
  }
}

/**
 * @param {string} branch
 */
function deleteBranch(branch) {
  const command = `git push upstream --delete "${branch}"`;
  log(command);
  if (!argv.dry_run) {
    exec(command, {stdio: 'inherit'});
  }
}

/**
 * @return {Promise}
 */
async function cleanupBranches() {
  const {except} = argv;
  if (except) {
    log(yellow('Excluding branch:'), except);
  }
  const branches = (await getOldBranches()).filter((name) => name !== except);
  log(cyan(`Cleaning up ${branches.length} branches...`));
  for (const branch of branches) {
    log(cyan(branch));
    const pull = await getBranchPull('open', org, branch);
    if (pull) {
      try {
        await closePullRequest(pull.number);
      } catch (e) {
        log(red(e.message));
        log(yellow('Error closing pull request, will not delete branch.'));
        continue;
      }
    }
    deleteBranch(branch);
  }
}

cleanupBranches();
