'use strict';

/**
 * @fileoverview Script that tests the nomodule AMP runtime during CI.
 */

const argv = require('minimist')(process.argv.slice(2));
const {
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {MINIFIED_TARGETS} = require('../tasks/prepend-global');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'nomodule-tests.js';

/**
 * Adds a canary or prod config string to all non-esm minified targets.
 */
function prependConfig() {
  const targets = MINIFIED_TARGETS.flatMap((target) => [
    `dist/${target}.js`,
  ]).join(',');
  timedExecOrDie(
    `amp prepend-global --${argv.config} --local_dev --fortesting --derandomize --target=${targets}`
  );
}

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  prependConfig();
  try {
    timedExecOrThrow(
      `amp integration --nobuild --headless --minified --config=${argv.config}`,
      'Integration tests failed!'
    );
  } catch (e) {
    if (e.status) {
      process.exitCode = e.status;
    }
  }
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    prependConfig();
    timedExecOrDie(
      `amp integration --nobuild --minified --headless --config=${argv.config}`
    );
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
