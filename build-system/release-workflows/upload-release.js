'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const klaw = require('klaw');
const path = require('path');
const {bgWhite, cyan} = require('kleur/colors');
const {log} = require('../common/logging');
const {runReleaseJob} = require('./release-job');
const {Storage} = require('@google-cloud/storage');
const {timedExecOrDie} = require('../pr-check/utils');

/**
 * @fileoverview Script that uploads a release build.
 */

const jobName = 'upload-release.js';

const SRCS_DIR = '/tmp/restored-workspace/releases';
const DEST_DIR = '/tmp/release';
const ARTIFACT_FILE_NAME = '/tmp/release.tar.gz';

const PROGRESS_WIDTH = 40;

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

  const filesTxtPaths = fastGlob.sync(
    path.join(SRCS_DIR, flavor, '*/org-cdn/rtv/*/files.txt')
  );
  for (const filesTxtPath of filesTxtPaths) {
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

let printProgressReady = true;

/**
 * Logs file upload progress every 1 second.
 *
 * @param {number} totalFiles
 * @param {number} uploadedFiles
 */
function logProgress_(totalFiles, uploadedFiles) {
  const percentage = Math.round((uploadedFiles / totalFiles) * PROGRESS_WIDTH);
  if (printProgressReady || uploadedFiles === totalFiles) {
    log(
      '[' +
        bgWhite(' '.repeat(percentage)) +
        '.'.repeat(PROGRESS_WIDTH - percentage) +
        ']',
      cyan(uploadedFiles),
      '/',
      cyan(totalFiles)
    );

    printProgressReady = false;
    setTimeout(() => {
      printProgressReady = true;
    }, 1000);
  }
}

/**
 * Uploads release files to Google Cloud Storage.
 * @return {Promise<void>}
 */
async function uploadFiles_() {
  const {GCLOUD_SERVICE_KEY} = process.env;
  if (!GCLOUD_SERVICE_KEY) {
    throw new Error(
      'CircleCI job is missing the GCLOUD_SERVICE_KEY env variable'
    );
  }

  const credentials = JSON.parse(GCLOUD_SERVICE_KEY);
  if (
    !credentials.client_email ||
    !credentials.private_key ||
    !credentials.project_id
  ) {
    throw new Error(
      'GCLOUD_SERVICE_KEY is not a Google Cloud JSON service key'
    );
  }

  const storage = new Storage({credentials, projectId: credentials.project_id});
  const bucket = storage.bucket('org-cdn');

  let totalFiles = 0;
  for await (const {stats} of klaw(DEST_DIR)) {
    if (stats.isFile()) {
      totalFiles++;
    }
  }

  log('Uploading', cyan(totalFiles), 'files to storage:');
  const uploadsPromises = [];
  let uploadedFiles = 0;
  for await (const {path, stats} of klaw(DEST_DIR)) {
    if (stats.isFile()) {
      const destination = path.slice(DEST_DIR.length + 1);
      uploadsPromises.push(
        bucket.upload(path, {destination, resumable: false}).then(() => {
          logProgress_(totalFiles, ++uploadedFiles);
        })
      );
    }
  }

  await Promise.all(uploadsPromises);
  log('Finished uploading all files.');
}

runReleaseJob(jobName, async () => {
  fs.ensureDirSync(DEST_DIR);

  for (const flavor of fs.readdirSync(SRCS_DIR)) {
    mergeOutputs_(flavor);
    mergeFilesTxt_(flavor);
  }

  await uploadFiles_();

  log('Archiving releases to', cyan(ARTIFACT_FILE_NAME));
  timedExecOrDie(`cd ${DEST_DIR} && tar -czf ${ARTIFACT_FILE_NAME} *`);
});
