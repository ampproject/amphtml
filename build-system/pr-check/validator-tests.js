'use strict';

/**
 * @fileoverview Script that runs the validator tests during CI.
 */

const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'validator-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  // NOTE: We've removed the amp validator calls as the JS validator and its
  // tests are no longer needed since we now create a WASM build off of the
  // the C++ code.
  // TODO(#38610): fix for bazel 6.0 or use older version
  timedExecOrDie('amp validator-cpp');
  timedExecOrDie('amp validate-html-fixtures');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (
    !buildTargetsInclude(
      Targets.HTML_FIXTURES,
      Targets.RUNTIME,
      Targets.VALIDATOR,
      Targets.VALIDATOR_WEBUI
    )
  ) {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, HTML fixtures, validator, or validator web UI'
    );
    return;
  }

  if (buildTargetsInclude(Targets.HTML_FIXTURES)) {
    timedExecOrDie('amp validate-html-fixtures');
  }

  if (buildTargetsInclude(Targets.VALIDATOR)) {
    timedExecOrDie('amp validator-cpp');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
