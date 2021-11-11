'use strict';

const {createVersioningUpdatePullRequest} = require('./promote-job');
const {runReleaseJob} = require('./release-job');
const {VERSION} = require('../compile/internal-version');

/**
 * @fileoverview Script that promotes the latest nightly release.
 */

const jobName = 'promote-nightly.js';

runReleaseJob(jobName, async () => {
  // TODO(danielrozenberg): add safety check that this version exists on the CDN.

  await createVersioningUpdatePullRequest(() => ({
    versioningChanges: {nightly: `04${VERSION}`},
    title: `⏫🌙 Promoting release ${VERSION} to Nightly channel`,
    body: `Promoting release ${VERSION} to Nightly channel`,
  }));
});
