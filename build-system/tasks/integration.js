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
const defaultConfig = require('./karma.conf');
const log = require('fancy-log');
const testConfig = require('../config');
const {
  createKarmaServer,
  getAdTypes,
  getBrowserConfig,
  maybePrintArgvMessages,
  maybeSetCoverageConfig,
  refreshKarmaWdCache,
  runTestInBatches,
  startTestServer,
} = require('./runtime-test/helpers');
const {clean} = require('./clean');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {dist} = require('./dist');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isTravisBuild} = require('../travis');
const {reportTestStarted} = require('./report-test-status');

function shouldNotRun() {
  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
  }

  return false;
}

async function maybeBuild() {
  if (argv.nobuild) {
    return;
  }
  argv.fortesting = true;
  argv.compiled = true;
  await clean();
  await dist();
}

function setConfigOverrides(config) {
  config.singleRun = !argv.watch && !argv.w;
  config.client.mocha.grep = !!argv.grep;
  config.client.verboseLogging = !!argv.verbose || !!argv.v;
  config.client.captureConsole = !!argv.verbose || !!argv.v || !!argv.files;

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

  // c.client is available in test browser via window.parent.karma.config
  config.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: !!argv.saucelabs,
    singlePass: !!argv.single_pass,
    adTypes: getAdTypes(),
    mochaTimeout: defaultConfig.client.mocha.timeout,
    propertiesObfuscated: !!argv.single_pass,
    testServerPort: defaultConfig.client.testServerPort,
    testOnIe:
      config.browsers.includes('IE') || config.browsers.includes('SL_IE_11'),
  };
}

function getFileConfig() {
  const files = testConfig.commonIntegrationTestPaths;

  if (argv.files) {
    return {'files': files.concat(argv.files)};
  }

  return {'files': files.concat(testConfig.integrationTestPaths)};
}

function getReporterConfig() {
  let {reporters} = defaultConfig;

  if ((!isTravisBuild() && argv.testnames) || (argv.files && !argv.saucelabs)) {
    reporters = ['mocha'];
  }

  if (argv.coverage) {
    reporters.push('coverage-istanbul');
  }

  if (argv.saucelabs) {
    reporters.push('saucelabs');
  }

  return {'reporters': reporters};
}

function getTestConfig() {
  const browsers = getBrowserConfig();
  const files = getFileConfig();
  const reporters = getReporterConfig();
  const config = Object.assign({}, defaultConfig, browsers, files, reporters);

  maybeSetCoverageConfig(config, 'lcov-integration.info');
  setConfigOverrides(config);

  return config;
}

function runIntegrationTests(config) {
  reportTestStarted();

  if (argv.saucelabs) {
    return runTestInBatches(config);
  }

  return createKarmaServer(config);
}

function setup(config) {
  // Avoid Karma startup errors
  refreshKarmaWdCache();

  const testServer = startTestServer(config.client.testServerPort);
  const handlerProcess = createCtrlcHandler('gulp integration');

  return new Map()
    .set('handlerProcess', handlerProcess)
    .set('testServer', testServer);
}

function teardown(env) {
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

async function integration() {
  if (shouldNotRun()) {
    return;
  }

  // TODO(alanorozco): Come up with a more elegant check?
  global.AMP_TESTING = true;
  process.env.SERVE_MODE = argv.compiled ? 'compiled' : 'default';

  maybeBuild();
  maybePrintArgvMessages();

  const config = getTestConfig();
  const env = setup(config);

  const exitCode = await runIntegrationTests(config);

  env.set('exitCode', exitCode);
  teardown(env);
}

module.exports = {
  integration,
};

integration.description = 'Runs integration tests';
//TODO(estherkim): fill this out
integration.flags = {};
