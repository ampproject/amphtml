'use strict';

const fs = require('fs-extra');
const {createPullRequest} = require('octokit-plugin-create-pull-request');
const {log} = require('../common/logging');
const {Octokit: BaseOctokit} = require('@octokit/rest');
const {runReleaseJob} = require('./release-job');
const {VERSION} = require('../compile/internal-version');

/**
 * @fileoverview Script that promotes the latest nightly release.
 */

const jobName = 'promote-nightly.js';

const Octokit = BaseOctokit.plugin(createPullRequest);
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const versioningJsonFile = 'build-system/global-configs/versioning.json';
const params = {owner: 'ampproject', repo: 'amphtml'};
// TODO(danielrozenberg): change to @ampproject/release-on-duty after testing is done.
const releaseOnDuty = '@ampproject/wg-infra';

runReleaseJob(jobName, async () => {
  const versioning = await fs.readJson(versioningJsonFile, 'utf8');
  versioning.nightly = `04${VERSION}`;

  const pullRequest = await octokit.createPullRequest({
    ...params,
    title: `⏫🌙 Promoting release ${VERSION} to Nightly channel`,
    body: `Promoting release ${VERSION} to Nightly channel\n\n${releaseOnDuty}`,
    head: `amp-promote-${VERSION}-nightly`,
    changes: [
      {
        files: {
          [versioningJsonFile]: JSON.stringify(versioning, 2),
        },
        commit: `Promoting release ${VERSION} to Nightly channel`,
      },
    ],
    createWhenEmpty: false,
  });

  if (pullRequest) {
    log('Pull request', pullRequest.data.number, 'created');
  } else {
    log('Pull request not created');
  }
});
