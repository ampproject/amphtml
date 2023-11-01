'use strict';

/**
 * @fileoverview Script that cuts a nightly branch.
 */

const {cyan, green, red, yellow} = require('kleur/colors');
const {getVersion} = require('../compile/internal-version');
const {log} = require('../common/logging');
const {Octokit} = require('@octokit/rest');
const {RequestError} = require('@octokit/request-error');

const params = {owner: 'ampproject', repo: 'amphtml'};

// Permanent external ID as assigned by the GitHub Actions runner.
const GITHUB_EXTERNAL_ID = 'be30aa50-41df-5bf3-2e88-b5215679ea95';

const CHECKS_TO_SKIP = [
  'Cut Nightly Branch',
  'create-issue-on-error',
  'status-page',
];

/**
 * Get the current nightly branch's commit SHA.
 *
 * @param {Octokit} octokit
 * @return {Promise<string>}
 */
async function getCurrentNightly(octokit) {
  const {data} = await octokit.rest.git.getRef({
    ...params,
    ref: 'heads/nightly',
  });
  return data.object.sha;
}

/**
 * Get the SHA of the last green commit from the main branch.
 *
 * @param {Octokit} octokit
 * @return {Promise<string>}
 * @throws {Error} if a green commit was not found in the last 100 main commits.
 */
async function getCommit(octokit) {
  const commits = await octokit.rest.repos.listCommits({
    ...params,
    ref: 'main',
    'per_page': 100,
  });
  log(
    'Iterating the latest',
    cyan(commits.data.length),
    'commits on',
    cyan('main')
  );

  for (const {sha} of commits.data) {
    const checkRuns = (
      await octokit.paginate(
        // TODO(danielrozenberg): seems to be related to https://github.com/octokit/plugin-paginate-rest.js/issues/350
        // restore this when the types match again: await octokit.rest.checks.listForRef,
        'GET /repos/{owner}/{repo}/commits/{ref}/check-runs',
        {
          ...params,
          ref: sha,
          'per_page': 100,
        }
      )
    ).filter(
      ({'external_id': id, name}) =>
        id !== GITHUB_EXTERNAL_ID && !CHECKS_TO_SKIP.includes(name)
    );

    if (checkRuns.some(({status}) => status != 'completed')) {
      log(
        'Not all check runs for commit',
        cyan(sha),
        'are completed. Checking next commit...'
      );
      continue;
    }

    if (
      !checkRuns.every(({conclusion}) =>
        ['success', 'neutral', 'skipped'].includes(conclusion ?? '')
      )
    ) {
      log(
        'Not all check runs for commit',
        cyan(sha),
        'are successful. Checking next commit...'
      );
      continue;
    }

    log(
      'All check runs for commit',
      cyan(sha),
      'have completed successfully. Cutting a new nightly at this commit...'
    );

    return sha;
  }

  throw new Error(
    'Failed to cut nightly. Could not find a green commit in the last 100 commits'
  );
}

/**
 * Fast forward nightly branch to given SHA.
 *
 * @param {Octokit} octokit
 * @param {string} sha
 * @return {Promise<void>}
 */
async function updateBranch(octokit, sha) {
  try {
    await octokit.rest.git.updateRef({
      ...params,
      ref: 'heads/nightly',
      sha,
    });
    log(
      'A new',
      cyan('nightly'),
      'branch was successfully cut at commit',
      cyan(sha)
    );
  } catch (e) {
    log(
      red(
        'An uncaught status was returned while attempting to fast-forward the'
      ),
      cyan('nightly'),
      red('branch to commit'),
      cyan(sha)
    );
    log('See full error:', e);
  }
}

/**
 * Create GitHub tag.
 *
 * @param {Octokit} octokit
 * @param {string} sha
 * @param {string} ampVersion
 * @return {Promise<void>}
 */
async function createTag(octokit, sha, ampVersion) {
  try {
    await octokit.rest.git.createTag({
      ...params,
      tag: ampVersion,
      message: ampVersion,
      object: sha,
      type: 'commit',
    });

    // once a tag object is created, create a reference.
    await octokit.rest.git.createRef({
      ...params,
      ref: `refs/tags/${ampVersion}`,
      sha,
    });

    log(
      'A new tag',
      cyan(ampVersion),
      'was successfully created at commit',
      cyan(sha)
    );
  } catch (e) {
    if (e instanceof RequestError && e.status === 422) {
      log('The tag', cyan(ampVersion), 'already exists at', cyan(sha));
    } else {
      throw new Error(
        `An unaught status returned while attempting to create a tag\n${e}`
      );
    }
  }
}

/**
 * Perform nightly branch cut.
 *
 * @return {Promise<void>}
 */
async function cutNightlyBranch() {
  const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});
  octokit.hook.error('request', async (error, options) => {
    log(
      red('Error occurred while calling GitHub API with'),
      cyan(options.method),
      cyan(options.url)
    );
    throw error;
  });

  const currentSha = await getCurrentNightly(octokit);
  const newSha = await getCommit(octokit);
  if (newSha === currentSha) {
    log(
      yellow('There are no new'),
      green('green'),
      yellow('commits in the'),
      cyan('main'),
      yellow('branch to be cut into'),
      cyan('nightly')
    );
    return;
  }

  const ampVersion = getVersion(newSha);

  await updateBranch(octokit, newSha);
  await createTag(octokit, newSha, ampVersion);

  log(green('Successfully cut the'), cyan('nightly'), green('branch'));
  log('It was fast-forwarded from', cyan(currentSha), 'to', cyan(newSha));
}

cutNightlyBranch();
