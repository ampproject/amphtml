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
  timedExecOrDie('amp validator-webui');
  timedExecOrDie('amp validator');
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

  if (buildTargetsInclude(Targets.VALIDATOR_WEBUI)) {
    timedExecOrDie('amp validator-webui');
  }

  if (
    buildTargetsInclude(
      Targets.HTML_FIXTURES,
      Targets.RUNTIME,
      Targets.VALIDATOR
    )
  ) {
    timedExecOrDie('amp validator');
  }

  if (buildTargetsInclude(Targets.VALIDATOR)) {
    timedExecOrDie('amp validator-cpp');
  }

  if (buildTargetsInclude(Targets.HTML_FIXTURES)) {
    timedExecOrDie('amp validate-html-fixtures');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
