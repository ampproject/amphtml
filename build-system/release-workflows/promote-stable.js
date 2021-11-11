'use strict';

const {createVersioningUpdatePullRequest} = require('./promote-job');
const {runReleaseJob} = require('./release-job');

/**
 * @fileoverview Script that promotes the current Beta/Experimental traffic channel to Stable.
 */

const jobName = 'promote-stable.js';

runReleaseJob(jobName, async () => {
  await createVersioningUpdatePullRequest((versioning) => {
    const ampVersion = versioning['beta-traffic'].slice(2);

    return {
      versioningChanges: {
        'stable': `01${ampVersion}`,
        'control': `02${ampVersion}`,
        'nightly-control': `05${ampVersion}`,
      },
      title: `⏫ Promoting release ${ampVersion} to Stable channel`,
      body: `Promoting release ${ampVersion} from Beta/Experimental Traffic channel to Stable channel`,
    };
  });
});
