'use strict';

const {createVersioningUpdatePullRequest} = require('./promote-job');
const {log} = require('../common/logging');
const {runReleaseJob} = require('./release-job');

/**
 * @fileoverview Script that promotes the current Stable traffic channel to LTS.
 */

const jobName = 'promote-stable.js';

runReleaseJob(jobName, async () => {
  const dayOfMonth = new Date().getUTCDate();
  if (!(8 <= dayOfMonth && dayOfMonth <= 14)) {
    // Skip this job if today is not the 2nd Monday of the month. The 2nd Monday
    // always falls between the 8th to the 14th of the month (inclusive).
    log('LTS promote only occur on the 2nd Monday of each month. Skipping...');
    return;
  }

  await createVersioningUpdatePullRequest((versioning) => {
    const ampVersion = versioning['stable'].slice(2);

    return {
      versioningChanges: {
        'lts': `01${ampVersion}`,
      },
      title: `⏫ Promoting release ${ampVersion} to LTS channel`,
      body: `Promoting release ${ampVersion} from Stable channel to LTS channel`,
    };
  });
});
