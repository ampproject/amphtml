/**
 * @fileoverview
 * Entry file for ./github/workflows/release-tagger.yml
 * Parameters
 * 1. action (promote|rollback)
 * 2. head (AMP version)
 * 3. base (AMP version)
 * 4. channel (beta-percent|stable|lts)
 */

const dedent = require('dedent');
const {action, base, channel, head, sha} = require('minimist')(
  process.argv.slice(2),
  {
    string: ['head', 'base'],
  }
);
const {addLabels, removeLabels} = require('./label-pull-requests');
const {cyan, magenta} = require('kleur/colors');
const {log} = require('../common/logging');
const {getRelease, makeRelease} = require('./make-release');
const {publishRelease, rollbackRelease} = require('./update-release');

/**
 * Promote actions
 * @return {Promise<void>}
 */
async function _promote() {
  log(
    cyan(dedent`Release tagger triggered with inputs:
    action: ${magenta(action)}
    head: ${magenta(head)}
    base: ${magenta(base)}
    channel: ${magenta(channel)}
    sha: ${magenta(sha)}`)
  );

  const supportedChannels = ['beta-opt-in', 'beta-percent', 'stable', 'lts'];
  if (!supportedChannels.includes(channel)) {
    return;
  }

  const release = await getRelease(head);
  if (!release) {
    const {'html_url': url} = await makeRelease(head, base, channel, sha);
    log('Created release', magenta(head), 'at', cyan(url));
  } else {
    log('Found release', magenta(head), 'at', cyan(release['html_url']));
  }

  if (['stable', 'lts'].includes(channel)) {
    const latest = channel == 'stable';
    const {'html_url': url} = await publishRelease(head, latest);
    log('Published release', magenta(head), 'at', cyan(url));
  }

  if (['beta-percent', 'stable', 'lts'].includes(channel)) {
    await addLabels(head, base, channel);
    log(
      'Labeled PRs for release',
      magenta(head),
      'and channel',
      magenta(channel)
    );
  }
}

/**
 * Rollback actions
 * @return {Promise<void>}
 */
async function _rollback() {
  const supportedChannels = ['beta-percent', 'stable', 'lts'];
  if (!supportedChannels.includes(channel)) {
    return;
  }

  try {
    await rollbackRelease(head);
    log('Rolled back release', head);
  } catch (e) {
    log('Could not roll back release.', e);
  }

  await removeLabels(head, base, channel);
  log('Removed labels from PRs for release', head, 'and channel', channel);
}

/**
 * Main functions for the release tagger
 * @return {Promise<void>}
 */
async function main() {
  if (action == 'promote') {
    log('Action: promote');
    return await _promote();
  }

  if (action == 'rollback') {
    log('Action: rollback');
    return await _rollback();
  }
}

main();
