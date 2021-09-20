'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const path = require('path');
const {cyan} = require('kleur/colors');
const {log} = require('../common/logging');
const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('../pr-check/utils');

/**
 * @fileoverview Script that builds a release.
 */

const jobName = 'archive-release.js';

const SRCS_DIR = '/tmp/restored-workspace/releases';
const DEST_DIR = '/tmp/release';
const ARTIFACT_FILE_NAME = '/tmp/release.tar.gz';

/**
 * Merge the outputs of the flavor (both module/nomodule) into the dest dir.
 * @param {string} flavor
 */
function mergeOutputs_(flavor) {
  for (const esm of fs.readdirSync(path.join(SRCS_DIR, flavor))) {
    log('Merging', cyan(flavor), 'flavor', cyan(esm), 'build');
    fs.copySync(path.join(SRCS_DIR, flavor, esm), DEST_DIR, {
      overwrite: true,
      filter: (src) => !src.endsWith('/files.txt'),
    });
  }
}

/**
 * Merge the files.txt files for the flavor's module/nomodule outputs.
 * @param {string} flavor
 */
function mergeFilesTxt_(flavor) {
  const /** @type Map<string, Set<string>> */ filesByRtv = new Map();

  for (const filesTxtPath of fastGlob.sync(
    path.join(SRCS_DIR, flavor, '*/org-cdn/rtv/*/files.txt')
  )) {
    // filesTxtPath is guaranteed to end with '/<15-digits-rtv>/files.txt', so
    // we can extract the RTV with simple negative start/end indexes.
    const rtv = filesTxtPath.slice(-25, -10);
    if (!filesByRtv.has(rtv)) {
      filesByRtv.set(rtv, new Set());
    }

    // Add all files in this module/nomodule directory's RTV to the set.
    fs.readFileSync(filesTxtPath, {encoding: 'utf-8'})
      .trim()
      .split('\n')
      .forEach((file) => {
        filesByRtv.get(rtv)?.add(file);
      });
  }

  filesByRtv.forEach((files, rtv) => {
    log('Writing merged', cyan('files.txt'), 'for RTV', cyan(rtv));
    fs.writeFileSync(
      path.join(DEST_DIR, '/org-cdn/rtv', rtv, 'files.txt'),
      [...files].sort().join('\n')
    );
  });
}

runCiJob(jobName, () => {
  fs.ensureDirSync(DEST_DIR);

  for (const flavor of fs.readdirSync(SRCS_DIR)) {
    mergeOutputs_(flavor);
    mergeFilesTxt_(flavor);
  }

  log('Archiving releases to', cyan(ARTIFACT_FILE_NAME));
  timedExecOrDie(`cd ${DEST_DIR} && tar -czf ${ARTIFACT_FILE_NAME} *`);

  // TODO(danielrozenberg): actually upload to GCP storage bucket.
});
