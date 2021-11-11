'use strict';

const {createVersioningUpdatePullRequest} = require('./promote-job');
const {runReleaseJob} = require('./release-job');

/**
 * @fileoverview Script that promotes the current Nightly channel to Beta/Experimental opt-in.
 */

const jobName = 'promote-beta-experimental-opt-in.js';

runReleaseJob(jobName, async () => {
  await createVersioningUpdatePullRequest((versioning) => {
    const ampVersion = versioning['nightly'].slice(2);

    return {
      versioningChanges: {
        'beta-opt-in': `03${ampVersion}`,
        'experimental-opt-in': `00${ampVersion}`,
      },
      title: `⏫ Promoting release ${ampVersion} to Beta/Experimental opt-in channel`,
      body: `Promoting release ${ampVersion} from Nightly channel to Beta/Experimental opt-in channel`,
    };
  });
});
