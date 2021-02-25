'use strict';

/**
 * @fileoverview Script that runs the visual diff tests during CI.
 */

<<<<<<< HEAD
=======
const atob = require('atob');
const {
  downloadNomoduleOutput,
  printSkipMessage,
  timedExecOrDie,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
>>>>>>> 24885f3d02 (apply recommendations)
const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'visual-diff-tests.js';

const baseCommand = 'gulp visual-diff';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
<<<<<<< HEAD
  timedExecOrDie('amp visual-diff --nobuild --main');
=======
  downloadNomoduleOutput();
  timedExecOrDie('gulp update-packages');
  process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
  timedExecOrDie(`${baseCommand} --nobuild --master`);
>>>>>>> 24885f3d02 (apply recommendations)
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.VISUAL_DIFF)) {
<<<<<<< HEAD
    timedExecOrDie('amp visual-diff --nobuild');
  } else {
    timedExecOrDie('amp visual-diff --empty');
    skipDependentJobs(
=======
    downloadNomoduleOutput();
    timedExecOrDie('gulp update-packages');
    timedExecOrDie(`${baseCommand} --nobuild --esm`);
    timedExecOrDie(`${baseCommand} --nobuild`);
  } else {
    timedExecOrDie(`${baseCommand} --empty --esm`);
    timedExecOrDie(`${baseCommand} --empty`);
    printSkipMessage(
>>>>>>> 24885f3d02 (apply recommendations)
      jobName,
      'this PR does not affect the runtime or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
