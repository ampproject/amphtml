'use strict';

/**
 * @fileoverview
 * Triggers the promote workflow on ampproject/cdn-configuration
 */

const {readFileSync} = require('fs');
const {Octokit} = require('@octokit/rest');
const {runReleaseJob} = require('./release-job');

const jobName = 'trigger-promote.js';

const cdnConfigurationParams = {
  owner: 'ampproject',
  repo: 'cdn-configuration',
  // TODO(estherkim): set to promote-nightly or promote-amp-version
  'workflow_id': 'promote-nightly.yml',
  ref: 'main',
};

/**
 * Trigger promote workflow
 * @return {Promise}
 */
async function trigger_() {
  const ampVersion = readFileSync('/tmp/workspace/AMP_VERSION', 'utf8')
    .toString()
    .trim();

  const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});
  const inputs = {
    'amp_version': ampVersion,
  };
  await octokit.rest.actions.createWorkflowDispatch({
    ...cdnConfigurationParams,
    inputs,
  });
}

runReleaseJob(jobName, async () => {
  await trigger_();
});
