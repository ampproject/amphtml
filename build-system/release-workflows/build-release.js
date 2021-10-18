'use strict';

const fs = require('fs-extra');
const {runReleaseJob} = require('./release-job');
const {timedExecOrThrow} = require('../pr-check/utils');

/**
 * @fileoverview Script that builds a release.
 */

const jobName = 'build-release.js';

runReleaseJob(jobName, async () => {
  const {ESM, FLAVOR} = process.env;
  timedExecOrThrow(`amp release --flavor=${FLAVOR} --${ESM} --dedup_v0`);
  fs.ensureDirSync(`/tmp/workspace/releases/${FLAVOR}/${ESM}`);
  fs.copySync('release/', `/tmp/workspace/releases/${FLAVOR}/${ESM}`);
});
