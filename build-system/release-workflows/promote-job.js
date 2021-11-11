'use strict';

const fs = require('fs-extra');
const {createPullRequest} = require('octokit-plugin-create-pull-request');
const {Octokit: BaseOctokit} = require('@octokit/rest');

const Octokit = BaseOctokit.plugin(createPullRequest);
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const versioningJsonFile = 'build-system/global-configs/versioning.json';
const params = {owner: 'ampproject', repo: 'amphtml'};

// TODO(danielrozenberg): change to @ampproject/release-on-duty after testing is done.
const releaseOnDuty = '@ampproject/wg-infra';

/**
 * @typedef {{
 *   versioningChanges: Record<string, string?>,
 *   title: string,
 *   body: string,
 * }}
 */
let VersionMutatorDef;

/**
 * Creates a pull request to update versioning.json.
 *
 * @param {function(!Record<string, string>): VersionMutatorDef} versioningMutator
 * @return {ReturnType<ReturnType<createPullRequest>['createPullRequest']>}
 */
async function createVersioningUpdatePullRequest(versioningMutator) {
  const currentVersioning = await fs.readJson(versioningJsonFile, 'utf8');
  const {body, title, versioningChanges} = versioningMutator(currentVersioning);

  const newVersioning = {
    ...currentVersioning,
    ...versioningChanges,
  };

  const pullRequestResponse = await octokit.createPullRequest({
    ...params,
    title,
    body: `${body}\n\n${releaseOnDuty}`,
    head: `promote-job-${process.env.GITHUB_RUN_ID}`,
    changes: [
      {
        files: {
          [versioningJsonFile]:
            JSON.stringify(newVersioning, undefined, 2) + '\n',
        },
        commit: title,
      },
    ],
    createWhenEmpty: false,
  });

  if (!pullRequestResponse || pullRequestResponse.status !== 201) {
    throw new Error('Failed to create a pull request');
  }
  return pullRequestResponse;
}

module.exports = {
  createVersioningUpdatePullRequest,
  VersionMutatorDef,
};
