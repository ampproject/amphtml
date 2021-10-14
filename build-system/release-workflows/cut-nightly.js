'use strict';

/**
 * @fileoverview Script that cuts a nightly branch.
 */

const {cyan, green, red} = require('kleur/colors');
const {getVersion} = require('../compile/internal-version');
const {log} = require('../common/logging');
const {Octokit} = require('@octokit/rest');
const params = {owner: 'ampproject', repo: 'amphtml'};

// Permanent external ID as assigned by the GitHub Actions runner.
const GITHUB_EXTERNAL_ID = 'be30aa50-41df-5bf3-2e88-b5215679ea95';

/**
 * Get last green commit
 * @param {Octokit} octokit
 * @return {Promise<string|undefined>}
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
    const {'check_runs': checkRuns} = (
      await octokit.rest.checks.listForRef({
        ...params,
        ref: sha,
      })
    ).data;
    if (
      checkRuns
        .filter(({'external_id': id}) => id !== GITHUB_EXTERNAL_ID)
        .some(({status}) => status != 'completed')
    ) {
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
}

/**
 * Fast forward nightly branch to given sha
 * @param {Octokit} octokit
 * @param {string} sha
 * @return {Promise<void>}
 */
async function updateBranch(octokit, sha) {
  const response = await octokit.rest.git.updateRef({
    ...params,
    ref: 'heads/nightly',
    sha,
  });

  // Casting to Number because the return type in Octokit is incorrectly
  // annotated to only ever return 200.
  switch (Number(response.status)) {
    case 201:
      log(
        'A new',
        cyan('nightly'),
        'branch was successfully cut at commit',
        cyan(sha)
      );
      break;
    case 200:
      log(
        'The',
        cyan('nightly'),
        'branch is already at the latest',
        green('green'),
        'commit',
        cyan(sha)
      );
      break;
    default:
      log(
        red(
          'An uncaught status was returned while attempting to fast-forward the'
        ),
        cyan('nightly'),
        red('branch to commit'),
        cyan(sha)
      );
      log('See full response:', response);
  }
}

/**
 * Create GitHub tag
 * @param {Octokit} octokit
 * @param {string} sha
 * @return {Promise<void>}
 */
async function createTag(octokit, sha) {
  const ampVersion = getVersion(sha);

  await octokit.rest.git.createTag({
    ...params,
    tag: ampVersion,
    message: ampVersion,
    object: sha,
    type: 'commit',
  });

  // once a tag object is created, create a reference
  const response = await octokit.rest.git.createRef({
    ...params,
    ref: `refs/tags/${ampVersion}`,
    sha,
  });

  switch (Number(response.status)) {
    case 201:
      log(
        'A new tag',
        cyan(ampVersion),
        'was successfully created at commit',
        cyan(sha)
      );
      break;
    case 422:
      log('The tag', cyan(ampVersion), 'already exists at', cyan(sha));
      break;
    default:
      log(
        red('An uncaught status was returned while attempting to create a tag'),
        cyan(ampVersion),
        red('for commit'),
        cyan(sha)
      );
      log('See full response:', response);
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

  const sha = await getCommit(octokit);
  if (!sha) {
    throw new Error(
      'Failed to cut nightly. Could not find a green commit in the last 100 commits'
    );
  }

  await Promise.all([
    await updateBranch(octokit, sha),
    await createTag(octokit, sha),
  ]);

  log('Successfully cut nightly');
}

cutNightlyBranch();
