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
 * Get the SHA of the most recent commit from the main branch.
 *
 * @param {Octokit} octokit
 * @return {Promise<string>}
 */
async function getCommit(octokit) {
  const {data: commit} = await octokit.rest.repos.getCommit({
    ...params,
    ref: 'main',
  });

  return commit.sha;
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

  log('Cutting a new nightly at', cyan(newSha), '...');

  const ampVersion = getVersion(newSha);

  await updateBranch(octokit, newSha);
  await createTag(octokit, newSha, ampVersion);

  log(green('Successfully cut the'), cyan('nightly'), green('branch'));
  log('It was fast-forwarded from', cyan(currentSha), 'to', cyan(newSha));
}

cutNightlyBranch();
