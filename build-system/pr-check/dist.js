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

const {type} = require('minimist')(process.argv.slice(2));

const jobName = 'dist.js';

// Mapping from build type name to the command to execute.
const COMMANDS = {
  'Module Build (Test)': 'amp dist --esm --fortesting',
  'Module 3p Build (Test)':
    'amp dist --esm --fortesting --core_runtime_only --vendor_configs',
  'Nomodule Build (Test)': 'amp dist --fortesting',
  'Nomodule 3p Build (Test)':
    'amp dist --fortesting --core_runtime_only --vendor_configs',
  'Module Build (Bundle Size)':
    'amp dist --noconfig --esm --version_override 0000000000000 --nomanglecache',
  'Module 3p Build (Bundle Size)':
    'amp dist --noconfig --esm --core_runtime_only --vendor_configs --version_override 0000000000000 --nomanglecache',
  'Nomodule Build (Bundle Size)':
    'amp dist --noconfig --version_override 0000000000000 --nomanglecache',
  'Nomodule 3p Build (Bundle Size)':
    'amp dist --noconfig --core_runtime_only --vendor_configs --version_override 0000000000000 --nomanglecache',
};

// Mapping from Build type name to which build targets should trigger this build in pull requests.
const PR_TARGETS = {
  'Module Build (Test)': [
    Targets.RUNTIME,
    Targets.INTEGRATION_TEST,
    Targets.VISUAL_DIFF,
  ],
  'Module 3p Build (Test)': [
    Targets.RUNTIME,
    Targets.INTEGRATION_TEST,
    Targets.VISUAL_DIFF,
  ],
  'Nomodule Build (Test)': [
    Targets.RUNTIME,
    Targets.INTEGRATION_TEST,
    Targets.E2E_TEST,
    Targets.VISUAL_DIFF,
  ],
  'Nomodule 3p Build (Test)': [
    Targets.RUNTIME,
    Targets.INTEGRATION_TEST,
    Targets.E2E_TEST,
    Targets.VISUAL_DIFF,
  ],
  'Module Build (Bundle Size)': [Targets.RUNTIME],
  'Module 3p Build (Bundle Size)': [Targets.RUNTIME],
  'Nomodule Build (Bundle Size)': [Targets.RUNTIME],
  'Nomodule 3p Build (Bundle Size)': [Targets.RUNTIME],
};

// We require a special exception for running an empty visual diff build when skipping module test builds.
// Run this on the 3p Build since that one is not parallelized!
const RUN_ON_SKIP = {
  'Module 3p Build (Test)': () => {
    timedExecOrDie('amp visual-diff --empty');
  },
};

// We gracefully halt uneffected tests, but want to run the Bundle Size step regardless.
const gracefullyHaltNextJobs = type.endsWith('(Test)');

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  const command = maybeParallelizeCommand(
    COMMANDS[type],
    'extensions/amp-*',
    (results) =>
      `--extensions=${results.replaceAll(/\bextensions\//g, '').replaceAll(' ', ',')}`
  );

  timedExecOrDie(command);
  storeBuildOutputToWorkspace();
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(...PR_TARGETS[type])) {
    pushBuildWorkflow();
    return;
  }

  RUN_ON_SKIP[type]?.();
  skipDependentJobs(
    jobName,
    'this PR does not affect relevant files for this build',
    gracefullyHaltNextJobs
  );
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
