'use strict';

/**
 * @fileoverview Provides various kinds of CI state.
 *
 * References:
 * GitHub Actions: https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
 * CircleCI: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
 */

/**
 * Shorthand to extract an environment variable.
 * @param {string} key
 * @return {string}
 */
function env(key) {
  return process.env[key] ?? '';
}

/**
 * Returns true if this is a CI build.
 * @return {boolean}
 */
function isCiBuild() {
  return !!env('CI');
}

/**
 * Returns true if this is a GitHub Actions build.
 * @return {boolean}
 */
function isGithubActionsBuild() {
  return !!env('GITHUB_ACTIONS');
}

/**
 * Returns true if this is a CircleCI build.
 * @return {boolean}
 */
function isCircleciBuild() {
  return !!env('CIRCLECI');
}

/**
 * Constants for reduced code size.
 */
const isGithubActions = isGithubActionsBuild();
const isCircleci = isCircleciBuild();

/**
 * Used to filter CircleCI PR branches created directly on the amphtml repo
 * (e.g.) PRs created from the GitHub web UI. Must match `push_builds_only`
 * in .circleci/config.yml.
 * @param {string} branchName
 * @return {boolean}
 */
function isCircleciPushBranch(branchName) {
  return branchName == 'main' || /^amp-release-.*$/.test(branchName);
}

/**
 * Returns true if this is a PR build.
 * @return {boolean}
 */
function isPullRequestBuild() {
  return isGithubActions
    ? env('GITHUB_EVENT_NAME') === 'pull_request'
    : isCircleci
      ? !isCircleciPushBranch(env('CIRCLE_BRANCH'))
      : false;
}

/**
 * Returns true if this is a push build.
 * @return {boolean}
 */
function isPushBuild() {
  return isGithubActions
    ? env('GITHUB_EVENT_NAME') === 'push'
    : isCircleci
      ? isCircleciPushBranch(env('CIRCLE_BRANCH'))
      : false;
}

/**
 * Returns the name of the PR branch.
 * @return {string}
 */
function ciPullRequestBranch() {
  return isGithubActions
    ? env('GITHUB_HEAD_REF')
    : isCircleci
      ? env('CIRCLE_BRANCH')
      : '';
}

/**
 * Returns the commit SHA being tested by a PR build.
 * @return {string}
 */
function ciPullRequestSha() {
  return isGithubActions
    ? require(env('GITHUB_EVENT_PATH')).pull_request.head.sha
    : isCircleci
      ? env('CIRCLE_SHA1')
      : '';
}

/**
 * Returns the branch for push builds.
 * @return {string}
 */
function ciPushBranch() {
  return isGithubActions
    ? env('GITHUB_REF')
    : isCircleci
      ? env('CIRCLE_BRANCH')
      : '';
}

/**
 * Returns the commit SHA being tested by a push build.
 * @return {string}
 */
function ciCommitSha() {
  return isGithubActions
    ? env('GITHUB_SHA')
    : isCircleci
      ? env('CIRCLE_SHA1')
      : '';
}

/**
 * Returns the ID of the current build.
 * @return {string}
 */
function ciBuildId() {
  return isGithubActions
    ? env('GITHUB_RUN_ID')
    : isCircleci
      ? env('CIRCLE_WORKFLOW_ID')
      : '';
}

/**
 * Returns the URL of the current build.
 * @return {string}
 */
function ciBuildUrl() {
  return isGithubActions
    ? `${env('GITHUB_SERVER_URL')}/${env('GITHUB_REPOSITORY')}/actions/runs/${env('GITHUB_RUN_ID')}` // prettier-ignore
    : isCircleci
      ? `https://app.circleci.com/pipelines/workflows/${env('CIRCLE_WORKFLOW_ID')}` // prettier-ignore
      : '';
}

/**
 * Returns the ID of the current job.
 * @return {string}
 */
function ciJobId() {
  return isGithubActions
    ? env('GITHUB_RUN_NUMBER')
    : isCircleci
      ? env('CIRCLE_JOB')
      : '';
}

/**
 * Returns the URL of the current job.
 * @return {string}
 */
function circleciJobUrl() {
  return isCircleci ? env('CIRCLE_BUILD_URL') : '';
}

/**
 * Returns the merge commit for a CircleCI PR build. CIRCLECI_MERGE_COMMIT is
 * populated by .circleci/fetch_merge_commit.sh.
 * @return {string}
 */
function circleciPrMergeCommit() {
  return isCircleci ? env('CIRCLECI_MERGE_COMMIT') : '';
}

/**
 * Returns an identifier that is unique to each CircleCI job. This is different
 * from the workflow ID, which is common across all jobs in a workflow.
 * @return {string}
 */
function circleciBuildNumber() {
  return isCircleci ? env('CIRCLE_BUILD_NUM') : '';
}

/**
 * Returns the repo slug for the ongoing build.
 * @return {string}
 */
function ciRepoSlug() {
  return isGithubActions
    ? env('GITHUB_REPOSITORY')
    : isCircleci
      ? `${env('CIRCLE_PROJECT_USERNAME')}/${env('CIRCLE_PROJECT_REPONAME')}`
      : '';
}

/**
 * Returns the commit SHA being tested by a push or PR build.
 * @return {string}
 */
function ciBuildSha() {
  return isPullRequestBuild() ? ciPullRequestSha() : ciCommitSha();
}

module.exports = {
  ciBuildId,
  ciBuildSha,
  ciBuildUrl,
  ciCommitSha,
  ciJobId,
  circleciJobUrl,
  ciPullRequestBranch,
  ciPullRequestSha,
  ciPushBranch,
  circleciBuildNumber,
  circleciPrMergeCommit,
  ciRepoSlug,
  isCiBuild,
  isCircleciBuild,
  isGithubActionsBuild,
  isPullRequestBuild,
  isPushBuild,
};
