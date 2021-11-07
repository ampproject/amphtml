'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExec,
} = require('../pr-check/utils');
const {
  Targets,
  buildTargetsInclude,
  determineBuildTargets,
} = require('../pr-check/build-targets');
const {runNpmChecks} = require('../common/npm-checks');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'pr-check.js';

/**
 * This file runs tests against the local workspace to mimic the CI build as
 * closely as possible.
 * @return {Promise<void>}
 */
async function prCheck() {
  const runCheck = (cmd) => {
    const {status} = timedExec(cmd);
    if (status != 0) {
      stopTimer(jobName, startTime);
      throw new Error('Local PR check failed. See logs above.');
    }
  };

  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  runNpmChecks();
  printChangeSummary();
  determineBuildTargets();

  if (buildTargetsInclude(Targets.PRESUBMIT)) {
    runCheck('amp presubmit');
  }

  if (buildTargetsInclude(Targets.INVALID_WHITESPACES)) {
    runCheck('amp check-invalid-whitespaces --local_changes');
  }

  if (buildTargetsInclude(Targets.HTML_FIXTURES)) {
    runCheck('amp validate-html-fixtures --local_changes');
  }

  if (buildTargetsInclude(Targets.LINT_RULES)) {
    runCheck('amp lint');
  } else if (buildTargetsInclude(Targets.LINT)) {
    runCheck('amp lint --local_changes');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    runCheck('amp prettify --local_changes');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    runCheck('amp ava');
  }

  if (buildTargetsInclude(Targets.BUILD_SYSTEM)) {
    runCheck('amp check-build-system');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    runCheck('amp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    runCheck('amp check-links --local_changes');
  }

  if (buildTargetsInclude(Targets.OWNERS)) {
    runCheck('amp check-owners');
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    runCheck('amp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    runCheck('amp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    runCheck('amp server-tests');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    runCheck('amp dep-check');
    runCheck('amp check-types');
    runCheck('amp check-sourcemaps');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    runCheck('amp unit --local_changes --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    if (!argv.nobuild) {
      runCheck('amp clean');
      runCheck('amp dist --fortesting');
    }
    runCheck('amp integration --nobuild --minified --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.VALIDATOR)) {
    runCheck('amp validator');
  }

  if (buildTargetsInclude(Targets.VALIDATOR_WEBUI)) {
    runCheck('amp validator-webui');
  }

  stopTimer(jobName, startTime);
}

module.exports = {
  prCheck,
};

prCheck.description = 'Run almost all CI checks against the local branch';
prCheck.flags = {
  'nobuild': 'Skip building the runtime',
};
