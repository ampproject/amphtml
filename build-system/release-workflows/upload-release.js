'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const klaw = require('klaw');
const path = require('path');
const {cyan} = require('kleur/colors');
const {log} = require('../common/logging');
const {runReleaseJob} = require('./release-job');
const {S3} = require('@aws-sdk/client-s3');
const {timedExecOrDie} = require('../pr-check/utils');
const zlib = require('zlib');

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
 * Logs file processing progress every 1 second.
 *
 * @param {number} totalFiles
 * @param {number} processedFiles
 */
function logProgress_(totalFiles, processedFiles) {
  const percentage = Math.round((processedFiles / totalFiles) * PROGRESS_WIDTH);
  if (printProgressReady || processedFiles === totalFiles) {
    log(
      '[' +
        '#'.repeat(percentage) +
        '.'.repeat(PROGRESS_WIDTH - percentage) +
        ']',
      cyan(processedFiles),
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
 * Compresses a single file with Brotli and writes it to ${path}.br.
 * @param {string} path
 * @param {number} sizeHint
 * @return {Promise<void>}
 */
async function brotliCompressFile_(path, sizeHint) {
  const readStream = fs.createReadStream(path);
  const writeStream = fs.createWriteStream(`${path}.br`);
  const brotli = zlib.createBrotliCompress({
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: sizeHint,
    },
  });

  return new Promise((resolve, reject) => {
    readStream
      .pipe(brotli)
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

/**
 * Compresses all files with Brotli.
 * @return {Promise<void>}
 */
async function brotliCompressAll_() {
  let totalFiles = 0;
  for await (const {stats} of klaw(DEST_DIR)) {
    if (stats.isFile()) {
      totalFiles++;
    }
  }

  log('Brotli compression of', cyan(totalFiles), 'files:');
  const compressPromises = [];
  let compressedFiles = 0;
  for await (const {path, stats} of klaw(DEST_DIR)) {
    if (!stats.isFile()) {
      continue;
    }

    compressPromises.push(
      brotliCompressFile_(path, stats.size).then(() => {
        logProgress_(totalFiles, ++compressedFiles);
      })
    );
  }

  await Promise.all(compressPromises);
  log('Finished Brotli compression of all files.');
}

/**
 * Ensures the presence of env variables or throws an error.
 * @param  {...string} vars
 * @return {string[]}
 */
function ensureEnvVariable_(...vars) {
  const ret = [];
  for (const v of vars) {
    const value = process.env[v];
    if (!value) {
      throw new Error(`CircleCI job is missing the ${v} env variable`);
    }
    ret.push(value);
  }
  return ret;
}

/**
 * Uploads release files to Cloudflare R2.
 * @return {Promise<void>}
 */
async function uploadFiles_() {
  const [accountId, accessKeyId, secretAccessKey] = ensureEnvVariable_(
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY'
  );

  const s3 = new S3({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    maxAttempts: 7,
  });

  let totalFiles = 0;
  for await (const {stats} of klaw(DEST_DIR)) {
    if (stats.isFile()) {
      totalFiles++;
    }
  }

  log('Uploading', cyan(totalFiles), 'files to R2:');
  const uploadsPromises = [];
  let uploadedFiles = 0;
  for await (const {path, stats} of klaw(DEST_DIR)) {
    if (!stats.isFile()) {
      continue;
    }

    const key = path.slice(DEST_DIR.length + 1);
    uploadsPromises.push(
      s3
        .putObject({Bucket: 'ampjs', Key: key, Body: fs.createReadStream(path)})
        .then(() => {
          logProgress_(totalFiles, ++uploadedFiles);
        })
    );
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

  await brotliCompressAll_();
  await uploadFiles_();

  log('Archiving releases to', cyan(ARTIFACT_FILE_NAME));
  timedExecOrDie(`cd ${DEST_DIR} && tar -czf ${ARTIFACT_FILE_NAME} *`);

  log('Persisting AMP version number to workspace');
  const [versionsFile] = fastGlob.sync(
    path.join(DEST_DIR, 'org-cdn/rtv/01*/version.txt')
  );
  fs.copySync(versionsFile, '/tmp/workspace/AMP_VERSION');
});
