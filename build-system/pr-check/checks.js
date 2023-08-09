'use strict';

/**
 * @fileoverview Script that runs various checks during CI.
 */

const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');
const {timedExecOrDie} = require('./utils');

const jobName = 'checks.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp presubmit');
  timedExecOrDie('amp check-invalid-whitespaces');
  timedExecOrDie('amp lint');
  timedExecOrDie('amp prettify');
  timedExecOrDie('amp check-json-schemas');
  timedExecOrDie('amp ava');
  timedExecOrDie('amp check-build-system');
  timedExecOrDie('amp check-ignore-lists');
  timedExecOrDie('amp check-links');
  timedExecOrDie('amp babel-plugin-tests');
  timedExecOrDie('amp check-exact-versions');
  timedExecOrDie('amp check-renovate-config');
  timedExecOrDie('amp server-tests');
  timedExecOrDie('amp make-extension --name=t --test --cleanup');
  timedExecOrDie('amp dep-check');
  timedExecOrDie('amp check-types');
  timedExecOrDie('amp check-sourcemaps');
  timedExecOrDie('amp check-analytics-vendors-list');
  timedExecOrDie('amp check-video-interface-list');
  timedExecOrDie('amp get-zindex');
  timedExecOrDie('amp markdown-toc');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.PRESUBMIT)) {
    timedExecOrDie('amp presubmit');
  }

  if (buildTargetsInclude(Targets.INVALID_WHITESPACES)) {
    timedExecOrDie('amp check-invalid-whitespaces');
  }

  if (buildTargetsInclude(Targets.IGNORE_LIST)) {
    timedExecOrDie(`amp check-ignore-lists`);
  }

  if (buildTargetsInclude(Targets.LINT_RULES)) {
    timedExecOrDie('amp lint');
  } else if (buildTargetsInclude(Targets.LINT)) {
    timedExecOrDie('amp lint --local_changes');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    timedExecOrDie('amp prettify');
  }

  if (buildTargetsInclude(Targets.JSON_FILES)) {
    timedExecOrDie('amp check-json-schemas');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    timedExecOrDie('amp ava');
  }

  if (buildTargetsInclude(Targets.BUILD_SYSTEM)) {
    timedExecOrDie('amp check-build-system');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    timedExecOrDie('amp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    timedExecOrDie('amp check-links --local_changes'); // only for PR builds
    timedExecOrDie('amp markdown-toc');
  }

  if (buildTargetsInclude(Targets.OWNERS)) {
    timedExecOrDie('amp check-owners --local_changes'); // only for PR builds
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    timedExecOrDie('amp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    timedExecOrDie('amp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    timedExecOrDie('amp server-tests');
  }

  if (buildTargetsInclude(Targets.AVA, Targets.RUNTIME)) {
    timedExecOrDie('amp make-extension --name=t --test --cleanup');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    timedExecOrDie('amp dep-check');
    timedExecOrDie('amp check-types');
    timedExecOrDie('amp check-sourcemaps');
    timedExecOrDie('amp check-analytics-vendors-list');
    timedExecOrDie('amp check-video-interface-list');
    timedExecOrDie('amp get-zindex');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
