'use strict';

/**
 * @fileoverview Script that tests the module AMP runtime during CI.
 */

const argv = require('minimist')(process.argv.slice(2));
const {MINIFIED_TARGETS} = require('../tasks/prepend-global');
const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'module-tests.js';

/**
 * Adds a canary or prod config string to all esm and non-esm minified targets.
 */
function prependConfig() {
  const targets = MINIFIED_TARGETS.flatMap((target) => [
    `dist/${target}.js`,
    `dist/${target}.mjs`,
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
  timedExecOrDie('amp integration --nobuild --minified --headless --esm');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    prependConfig();
    timedExecOrDie(
      `amp integration --nobuild --minified --headless --esm --config=${argv.config}`
    );
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
