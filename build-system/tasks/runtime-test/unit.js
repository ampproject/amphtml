/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'using strict';

const argv = require('minimist')(process.argv.slice(2));
const babelify = require('babelify');
const defaultConfig = require('../karma.conf');
const log = require('fancy-log');
const testConfig = require('../../config');
const {
  createKarmaServer,
  getAdTypes,
  getBrowserConfig,
  getUnitTestsToRun,
  maybePrintArgvMessages,
  maybeSetCoverageConfig,
  refreshKarmaWdCache,
  runTestInBatches,
  startTestServer,
} = require('./helpers');
const {clean} = require('../clean');
const {createCtrlcHandler, exitCtrlcHandler} = require('../../ctrlcHandler');
const {css} = require('../css');
const {dist} = require('../dist');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isTravisBuild} = require('../../travis');

async function maybeBuild() {
  if (argv.nobuild) {
    return;
  }

  if (argv.local_changes) {
    return css();
  }

  await clean();
  await dist();
}

function setConfigOverrides(config) {
  config.singleRun = !argv.watch && !argv.w;
  config.client.mocha.grep = argv.grep;
  config.client.verboseLogging = argv.verbose || argv.v;
  config.client.captureConsole = argv.verbose || argv.v || argv.local_changes;

  config.browserify.configure = function(bundle) {
    bundle.on('prebundle', function() {
      log(green('Transforming tests with'), cyan('browserify') + green('...'));
    });
    bundle.on('transform', function(tr) {
      if (tr instanceof babelify) {
        tr.once('babelify', function() {
          process.stdout.write('.');
        });
      }
    });
  };

  // config.client is available in test browser via window.parent.karma.config
  config.client.amp = {
    useCompiledJs: false, // never compiled for unit tests
    saucelabs: !!argv.saucelabs_lite,
    singlePass: false, // never single pass for unit tests
    adTypes: getAdTypes(),
    mochaTimeout: defaultConfig.client.mocha.timeout,
    propertiesObfuscated: false, // never single pass for unit tests
    testServerPort: defaultConfig.client.testServerPort,
    testOnIe: config.browsers.includes('IE'),
  };
}

function getFileConfig() {
  const files = testConfig.commonUnitTestPaths.concat(
    testConfig.chaiAsPromised
  );

  if (argv.saucelabs_lite) {
    return {'files': files.concat(testConfig.unitTestOnSaucePaths)};
  }

  if (argv.local_changes) {
    return {'files': files.concat(getUnitTestsToRun(testConfig.unitTestPaths))};
  }

  return {'files': files.concat(testConfig.unitTestPaths)};
}

function getReporterConfig() {
  let {reporters} = defaultConfig;

  if (
    (!isTravisBuild() && (argv.testnames || argv.local_changes)) ||
    (argv.files && !argv.saucelabs_lite)
  ) {
    reporters = ['mocha'];
  }

  if (argv.coverage) {
    reporters.push('coverage-istanbul');
  }

  if (argv.saucelabs_lite) {
    reporters = ['super-dots', 'saucelabs', 'karmaSimpleReporter'];
  }

  return {'reporters': reporters};
}

function getTestConfig() {
  const browsers = getBrowserConfig();
  const files = getFileConfig();
  const reporters = getReporterConfig();
  const config = Object.assign({}, defaultConfig, browsers, files, reporters);

  maybeSetCoverageConfig(config, 'lcov-unit.info');
  setConfigOverrides(config);

  return config;
}

function setup(config) {
  // Avoid Karma startup errors
  refreshKarmaWdCache();

  const testServer = startTestServer(config.client.testServerPort);
  const handlerProcess = createCtrlcHandler('gulp unit');

  return new Map()
    .set('handlerProcess', handlerProcess)
    .set('testServer', testServer);
}

async function teardown(env) {
  const exitCode = env.get('exitCode');

  // Exit tests
  // TODO(rsimha, 14814): Remove after Karma / Sauce ticket is resolved.
  if (isTravisBuild()) {
    setTimeout(() => {
      process.exit(exitCode);
    }, 5000);
  }

  env.get('testServer').emit('kill');
  exitCtrlcHandler(env.get('handlerProcess'));

  if (exitCode != 0) {
    log(red('ERROR:'), yellow(`Karma test failed with exit code ${exitCode}`));
    process.exitCode = exitCode;
  }
}

async function runUnitTests(config) {
  if (argv.saucelabs_lite) {
    return runTestInBatches(config);
  }

  return createKarmaServer(config);
}

async function unit() {
  // TODO(estherkim): validate argv flags

  // TODO(alanorozco): Come up with a more elegant check?
  global.AMP_TESTING = true;
  process.env.SERVE_MODE = 'default';

  await maybeBuild();
  await maybePrintArgvMessages();

  const config = getTestConfig();
  const env = setup(config);

  const exitCode = await runUnitTests(config);

  env.set('exitCode', exitCode);
  teardown(env);
}

module.exports = {
  unit,
};

unit.description = 'Runs unit tests';
//TODO(estherkim): fill this out
unit.flags = {
  'local_changes': '',
  'saucelabs_lite': '',
  'chrome_canary': '',
  'chrome_flags': '',
  'coverage': '',
  'firefox': '',
  'grep': '',
  'headless': '',
  'ie': '',
  'nobuild': '',
  'nohelp': '',
  'safari': '',
  'testnames': '',
  'verbose': '',
  'watch': '',
};
