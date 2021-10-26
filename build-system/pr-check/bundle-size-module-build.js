'use strict';

/**
 * @fileoverview Script that builds the module AMP runtime for bundle-size during CI.
 */

const {
  skipDependentJobs,
  storeModuleBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size-module-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie(
    `amp dist --noconfig --esm` +
      ` --extensions=${[
        'amp-accordion',
        'amp-mustache',
        'amp-script',
        'amp-subscriptions',
        'amp-subscriptions-google',
        //
        'amp-access',
        'amp-analytics',
        'amp-animation',
        // 'amp-bind',
        'amp-form',
        'amp-image-lightbox',
        'amp-image-slider',
        'amp-list',
        'amp-pan-zoom',
        'amp-render',
        'amp-story',
        'amp-story-player',
      ].join(',')}`
  );
  storeModuleBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime',
      /* gracefullyHaltNextJobs= */ false
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
