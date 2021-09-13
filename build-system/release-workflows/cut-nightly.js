'use strict';

/**
 * @fileoverview Script that cuts a nightly branch.
 */

const {cyan, green, red, yellow} = require('../common/colors');
const {log} = require('../common/logging');
const {Octokit} = require('@octokit/rest');

const params = {owner: 'ampproject', repo: 'amphtml'};

const colorizeState = (state) =>
  state == 'error' || state == 'failure'
    ? red(state)
    : state == 'pending'
    ? yellow(state)
    : state == 'success'
    ? green(state)
    : state;

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
    throw new Error(error.message);
  });

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
    const commitStatus = await octokit.rest.repos.getCombinedStatusForRef({
      ...params,
      ref: sha,
    });
    const {state} = commitStatus.data;

    log('Status of commit', cyan(sha), 'is', colorizeState(state));

    if (state === 'success') {
      const response = await octokit.rest.git.updateRef({
        ...params,
        ref: 'heads/nightly',
        sha,
      });

      // Casting to Number because the return type in Octokit is incorrectly
      // annotated to only ever return 200.
      switch (Number(response.status)) {
        case 201:
          log('Cut a new', cyan('nightly'), 'with', cyan(sha));
          break;
        case 200:
          log(
            'The',
            cyan('nightly'),
            'branch is already at the latest',
            green('green'),
            'sha',
            cyan(sha)
          );
          break;
        default:
          log(
            red('An error occurred while attempting to fast-forward the'),
            cyan('nightly'),
            red('branch to sha'),
            cyan(sha)
          );
      }

      break;
    }
  }
}

cutNightlyBranch();
