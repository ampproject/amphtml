'use strict';

const argv = require('minimist')(process.argv.slice(2));
const CiReporter = require('./mocha-ci-reporter');
const config = require('../../test-configs/config');
const fs = require('fs');
const glob = require('glob');
const http = require('http');
const Mocha = require('mocha');
const path = require('path');
const {
  buildRuntime,
  getFilesFromArgv,
  getFilesFromFileList,
} = require('../../common/utils');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {cyan} = require('kleur/colors');
const {execOrDie} = require('../../common/exec');
const {HOST, PORT, startServer, stopServer} = require('../serve');
const {isCiBuild, isCircleciBuild} = require('../../common/ci');
const {log} = require('../../common/logging');
const {maybePrintCoverageMessage} = require('../helpers');
const {watch} = require('chokidar');

const SLOW_TEST_THRESHOLD_MS = isCiBuild() ? 5000 : 2500;
const TEST_RETRIES = isCiBuild() ? 3 : 0;

const COV_DOWNLOAD_PATH = '/coverage/download';
const COV_OUTPUT_DIR = './test/coverage-e2e';
const COV_OUTPUT_HTML = path.resolve(COV_OUTPUT_DIR, 'lcov-report/index.html');

/**
 * Set up the e2e testing environment.
 * @return {!Promise<void>}
 */
async function setUpTesting_() {
  require('@babel/register')({caller: {name: 'test'}});
  const {describes} = require('./helper');
  describes.configure({
    browsers: argv.browsers,
    headless: argv.headless,
  });

  // build runtime
  if (!argv.nobuild) {
    await buildRuntime();
  }

  // start up web server
  return startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.debug},
    {minified: argv.minified}
  );
}

/**
 * Creates a mocha test instance with configuration determined by CLI args.
 * @return {!Mocha}
 */
function createMocha_() {
  const reporter = isCircleciBuild() ? CiReporter : undefined;

  return new Mocha({
    // e2e tests have a different standard for when a test is too slow,
    // so we set a non-default threshold.
    slow: SLOW_TEST_THRESHOLD_MS,
    reporter,
    retries: TEST_RETRIES,
    fullStackTrace: true,
    reporterOptions: isCiBuild()
      ? {
          mochaFile: 'result-reports/e2e.xml',
        }
      : null,
  });
}

/**
 * Refreshes require cache and adds file to a Mocha instance.
 * @param {!Mocha} mocha Mocha test instance.
 * @param {string} file relative path to test file to add.
 */
function addMochaFile_(mocha, file) {
  delete require.cache[path.resolve(file)];
  mocha.addFile(file);
}

/**
 * Fetch aggregated coverage data from server.
 * @param {string} outDir relative path to coverage files directory.
 * @return {Promise<void>}
 */
async function fetchCoverage_(outDir) {
  // Note: We could access the coverage UI directly through the server started
  // for the e2e tests, but then that coverage data would vanish once that
  // server instance was closed. This method will persist the coverage data so
  // it can be accessed separately.

  // Clear out previous coverage data.
  fs.rmSync(outDir, {recursive: true});
  fs.mkdirSync(outDir);

  const zipFilename = path.join(outDir, 'coverage.zip');
  const zipFile = fs.createWriteStream(zipFilename);

  await /** @type {Promise<void>} */ (
    new Promise((resolve, reject) => {
      http
        .get(
          {
            host: HOST,
            port: PORT,
            path: COV_DOWNLOAD_PATH,
          },
          (response) => {
            response.pipe(zipFile);
            zipFile.on('finish', () => {
              zipFile.close();
              resolve();
            });
          }
        )
        .on('error', (err) => {
          fs.unlinkSync(zipFilename);
          reject(err);
        });
    })
  );
  execOrDie(`unzip -o ${zipFilename} -d ${outDir}`);
}

/**
 * Runs e2e tests on all files under test.
 * @return {!Promise<void>}
 */
function runTests_() {
  const mocha = createMocha_();
  const addFile = addMochaFile_.bind(null, mocha);

  // specify tests to run
  if (argv.files || argv.filelist) {
    getFilesFromArgv().forEach(addFile);
    getFilesFromFileList().forEach(addFile);
  } else {
    config.e2eTestPaths.forEach((path) => {
      glob.sync(path).forEach(addFile);
    });
  }

  // return promise to amp that resolves when there's an error.
  return new Promise((resolve) => {
    mocha.run(async (failures) => {
      if (argv.coverage) {
        await fetchCoverage_(COV_OUTPUT_DIR);
        maybePrintCoverageMessage(COV_OUTPUT_HTML);
      }
      await stopServer();
      process.exitCode = failures ? 1 : 0;
      resolve();
    });
  });
}

/**
 * Watches files a under test, running affected e2e tests on changes.
 * @return {!Promise<void>}
 */
async function runWatch_() {
  const filesToWatch =
    argv.files || argv.filelist
      ? getFilesFromArgv().concat(getFilesFromFileList())
      : config.e2eTestPaths;

  log('Watching', cyan(`[${filesToWatch.join(', ')}]`), 'for changes...');
  watch(filesToWatch).on('change', (file) => {
    log('Detected a change in', cyan(file));
    const mocha = createMocha_();
    addMochaFile_(mocha, file);
    mocha.run();
  });

  // return non-resolving promise to amp.
  return new Promise(() => {});
}

/**
 * Entry-point to run e2e tests.
 * @return {Promise<void>}
 */
async function e2e() {
  const handlerProcess = createCtrlcHandler('e2e');
  await setUpTesting_();
  argv.watch ? await runWatch_() : await runTests_();
  exitCtrlcHandler(handlerProcess);
}

module.exports = {
  e2e,
};

e2e.description = 'Run e2e tests';
e2e.flags = {
  'browsers':
    'Run tests on the specified browser (options are `chrome`, `firefox`, `safari`)',
  'config':
    'Set the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'core_runtime_only': 'Build only the core runtime.',
  'nobuild': 'Skip building the runtime via `amp (build|dist) --fortesting`',
  'define_experiment_constant':
    'Transform tests with the EXPERIMENT constant set to true',
  'experiment': 'Experiment being tested (used for status reporting)',
  'extensions': 'Build only the listed extensions.',
  'minified': 'Run tests against minified JS',
  'files': 'Run tests found in a specific path (ex: **/test-e2e/*.js)',
  'testnames': 'List the name of each test being run',
  'watch': 'Watch for changes in files, runs corresponding test(s)',
  'headless': 'Run the browser in headless mode',
  'debug': 'Print debugging information while running tests',
  'coverage': 'Collect coverage data from instrumented code',
  'filelist': 'Run tests specified in this comma-separated list of test files',
};
