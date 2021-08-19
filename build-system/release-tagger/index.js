/**
 * @fileoverview
 * Entry file for ./github/workflows/release-tagger.yml
 * Parameters
 * 1. action (promote|rollback)
 * 2. head (AMP version)
 * 3. base (AMP version)
 * 4. channel (beta|stable|lts)
 */

const [action, head, base, channel] = process.argv.slice(2);

const {addLabels, removeLabels} = require('./label-pull-requests');
const {log} = require('../common/logging');
const {makeRelease} = require('./make-release');
const {publishRelease, rollbackRelease} = require('./update-release');

/**
 * Promote actions
 * @return {Promise<void>}
 */
async function _promote() {
  try {
    await publishRelease(head);
    log('Published release', head);
  } catch (e) {
    await makeRelease(head, base, channel);
    log('Created release', head);
  }

  await addLabels(head, base, channel);
  log('Labeled PRs for release', head, 'and channel', channel);
}

/**
 * Rollback actions
 * @return {Promise<void>}
 */
async function _rollback() {
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
