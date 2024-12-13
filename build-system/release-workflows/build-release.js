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

  // TODO(danielrozenberg): remove temporary custom-config when ampjs.org
  // becomes the default runtime CDN.
  fs.writeJsonSync('build-system/global-configs/custom-config.json', {
    'cdnUrl': 'https://ampjs.org',
    'cdnProxyRegex': '^https:\\/\\/ampjs\\.org$',
  });

  timedExecOrThrow(`amp release --flavor=${FLAVOR} --${ESM} --dedup_v0`);
  fs.ensureDirSync(`/tmp/workspace/releases/${FLAVOR}/${ESM}`);
  fs.copySync('release/', `/tmp/workspace/releases/${FLAVOR}/${ESM}`);
});
