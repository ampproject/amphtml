'use strict';

/**
 * @fileoverview Script that cuts a nightly branch.
 */

const {cyan, green, red} = require('kleur/colors');
const {log} = require('../common/logging');
const {Octokit} = require('@octokit/rest');

const params = {owner: 'ampproject', repo: 'amphtml'};

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
          red('An error occurred while attempting to fast-forward the'),
          cyan('nightly'),
          red('branch to commit'),
          cyan(sha)
        );
    }

    break;
  }
}

cutNightlyBranch();
