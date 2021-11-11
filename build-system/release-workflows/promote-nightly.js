'use strict';

const {log} = require('../common/logging');
const {Octokit} = require('@octokit/rest');
const {runReleaseJob} = require('./release-job');
const {VERSION} = require('../compile/internal-version');

/**
 * @fileoverview Script that promotes the latest nightly release.
 */

const jobName = 'promote-nightly.js';

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const versioningJsonFile = 'build-system/global-configs/versioning.json';
const params = {owner: 'ampproject', repo: 'amphtml'};

runReleaseJob(jobName, async () => {
  // TODO(danielrozenberg): add safety check that this version exists on the CDN.

  const getContentResponse = await octokit.repos.getContent({
    ...params,
    path: versioningJsonFile,
    ref: 'main',
  });
  if (!('content' in getContentResponse.data)) {
    throw new Error(`Failed to fetch ${versioningJsonFile}`);
  }

  const versioning = Object.assign(
    JSON.parse(
      Buffer.from(getContentResponse.data.content, 'base64').toString('utf8')
    ),
    {nightly: `04${VERSION}`}
  );

  const updateFileResponse = await octokit.repos.createOrUpdateFileContents({
    ...params,
    content: Buffer.from(JSON.stringify(versioning, undefined, 2)).toString(
      'base64'
    ),
    path: versioningJsonFile,
    message: `⏫🌙 Promoting release ${VERSION} to Nightly channel`,
    sha: getContentResponse.data.sha,
    branch: 'main',
    a: [
      {
        files: {
          [versioningJsonFile]: JSON.stringify(versioning, undefined, 2),
        },
        commit: `Promoting release ${VERSION} to Nightly channel`,
      },
    ],
    createWhenEmpty: false,
  });

  if (updateFileResponse.status !== 200) {
    throw new Error(`Failed to commit an update to ${versioningJsonFile}`);
  }

  log(
    versioningJsonFile,
    'updated in commit',
    updateFileResponse.data.commit.sha
  );
});
