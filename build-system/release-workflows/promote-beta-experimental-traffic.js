'use strict';

const {createVersioningUpdatePullRequest} = require('./promote-job');
const {runReleaseJob} = require('./release-job');

/**
 * @fileoverview Script that promotes the current Beta/Experimental opt-in channel to traffic.
 */

const jobName = 'promote-beta-experimental-traffic.js';

runReleaseJob(jobName, async () => {
  await createVersioningUpdatePullRequest((versioning) => {
    const ampVersion = versioning['beta-opt-in'].slice(2);

    return {
      versioningChanges: {
        'beta-traffic': `03${ampVersion}`,
        'experimental-traffic': `00${ampVersion}`,
        'experimentA': true ? `10${ampVersion}` : null,
        'experimentB': true ? `11${ampVersion}` : null,
        'experimentC': true ? `12${ampVersion}` : null,
      },
      title: `⏫ Promoting release ${ampVersion} to Beta/Experimental traffic channel`,
      body: `Promoting release ${ampVersion} from Beta/Experimental opt-in channel to Beta/Experimental traffic channel`,
    };
  });
});
