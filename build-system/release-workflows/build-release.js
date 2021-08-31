'use strict';

const fs = require('fs-extra');
const {runCiJob} = require('./ci-job');
const {timedExecOrThrow} = require('../pr-check/utils');

/**
 * @fileoverview Script that builds a release.
 */

const jobName = 'build-release.js';

runCiJob(jobName, async () => {
  const {ESM, FLAVOR} = process.env;
  timedExecOrThrow(`amp release --flavor=${FLAVOR} --${ESM}`);
  fs.ensureDirSync(`/tmp/workspace/releases/${FLAVOR}/${ESM}`);
  fs.copySync('release/', `/tmp/workspace/releases/${FLAVOR}/${ESM}`);
});
