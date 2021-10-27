/**
 * @fileoverview
 * Entry file for ./github/workflows/release-tagger.yml
 * Parameters
 * 1. action (promote|rollback)
 * 2. head (AMP version)
 * 3. base (AMP version)
 * 4. channel (beta-percent|stable|lts)
 * 5. time (in UTC, Y-%m-%d %H:%M:%S)
 */

const argv = require('minimist')(process.argv.slice(2));
const dedent = require('dedent');
const {addLabels, removeLabels} = require('./label-pull-requests');
const {createOrUpdateTracker} = require('./update-issue-tracker');
const {cyan, magenta} = require('kleur/colors');
const {getRelease} = require('./utils');
const {log} = require('../common/logging');
const {makeRelease} = require('./make-release');
const {publishRelease, rollbackRelease} = require('./update-release');

const {action, base, channel, head, sha, time} = argv;

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
    time: ${magenta(time)}
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
    log('Found release', magenta(head), 'at', cyan(release.url));
  }

  if (['stable', 'lts'].includes(channel)) {
    const {'html_url': url} = await publishRelease(head);
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

  await createOrUpdateTracker(head, base, channel, time);
  log(
    'Updated issue tracker for release',
    magenta(head),
    'and channel',
    magenta(channel)
  );
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

  // TODO(estherkim): add release tracker comment on prs
}

main();
