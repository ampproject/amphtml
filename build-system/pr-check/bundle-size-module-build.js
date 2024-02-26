'use strict';

/**
 * @fileoverview Script that builds the module AMP runtime for bundle-size during CI.
 */

const {
  skipDependentJobs,
  storeBuildOutputToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');
const {maybeParallelizeCommand} = require('./parallelization');

const jobName = 'bundle-size-module-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  const command = maybeParallelizeCommand(
    'amp dist --noconfig --esm --version_override 0000000000000 --nomanglecache',
    'extensions/amp-*',
    {
      callback(results) {
        return `--extensions=${results.replaceAll(/\bextensions\//g, '').replaceAll(' ', ',')}`;
      },
      onZero: '--vendor_configs',
    }
  );

  timedExecOrDie(command);
  storeBuildOutputToWorkspace();
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
