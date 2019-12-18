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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const log = require('fancy-log');
const sleep = require('sleep-promise');
const {exec, execScriptAsync, getStdout} = require('../common/exec');
const {green, red, cyan, yellow} = colors;
const {maybeGenerateRunner} = require('./generate-runner');

// Used to start and stop the Closure nailgun server
let nailgunRunnerReplacer;
const nailgunRunner = require.resolve(
  '../../third_party/nailgun/nailgun-runner'
);
const nailgunServer = require.resolve(
  '../../third_party/nailgun/nailgun-server.jar'
);
const DEFAULT_NAILGUN_PORT = '2113';
const CHECK_TYPES_NAILGUN_PORT = '2114';
const DIST_NAILGUN_PORT = '2115';
const NAILGUN_STARTUP_TIMEOUT_MS = 5 * 1000;
const NAILGUN_STOP_TIMEOUT_MS = 5 * 1000;

/**
 * Replaces the default compiler binary with nailgun on linux and macos
 * @return {?NodeRequire}
 */
function maybeReplaceDefaultCompiler() {
  if (process.platform == 'darwin') {
    return require('require-hijack')
      .replace('google-closure-compiler-osx')
      .with(nailgunRunner);
  } else if (process.platform == 'linux') {
    return require('require-hijack')
      .replace('google-closure-compiler-linux')
      .with(nailgunRunner);
  } else {
    log(
      yellow('WARNING:'),
      'Cannot run',
      cyan('nailgun-server.jar'),
      'on',
      cyan(process.platform)
    );
    log(
      yellow('WARNING:'),
      'Closure compiler will be significantly slower than on',
      cyan('macos'),
      'or',
      cyan('linux')
    );
    return null;
  }
}

/**
 * Starts a nailgun server (provides a fast-running closure compiler instance)
 * @param {string} port
 * @param {boolean} detached
 */
async function startNailgunServer(port, detached) {
  await maybeGenerateRunner(port);

  if (argv.disable_nailgun) {
    return;
  }

  nailgunRunnerReplacer = maybeReplaceDefaultCompiler();
  if (!nailgunRunnerReplacer) {
    return;
  }

  // Start up the nailgun server after cleaning up old instances (if any)
  const customRunner = require.resolve(`../runner/dist/${port}/runner.jar`);
  const startNailgunServerCmd =
    'java -XX:+TieredCompilation -server -cp ' +
    `${nailgunServer}:${customRunner} ` +
    `com.facebook.nailgun.NGServer ${port}`;
  const stopNailgunServerCmd = `${nailgunRunner} --nailgun-port ${port} ng-stop`;
  const getVersionCmd =
    `${nailgunRunner} --nailgun-port ${port} ` +
    'org.ampproject.AmpCommandLineRunner -- --version';
  exec(stopNailgunServerCmd, {stdio: 'pipe'});
  const nailgunServerProcess = execScriptAsync(startNailgunServerCmd, {
    stdio: detached ? 'ignore' : 'pipe',
    detached,
  });
  if (detached) {
    nailgunServerProcess.unref();
  }

  // Ensure that the nailgun server is up and running
  const end = Date.now() + NAILGUN_STARTUP_TIMEOUT_MS;
  while (Date.now() < end) {
    try {
      const version = getStdout(getVersionCmd).trim();
      if (/Version/.test(version)) {
        log('Started', cyan('nailgun-server.jar'), 'on port', cyan(port));
        return;
      }
    } catch (e) {
      await sleep(1000);
    }
  }
  log(
    red('ERROR:'),
    'Could not start',
    cyan('nailgun-server.jar'),
    'on port',
    cyan(port) + '...'
  );
  process.exit(1);
}

/**
 * Stops the nailgun server if it's running, and restores the binary used by
 * google-closure-compiler
 * @param {string} port
 */
async function stopNailgunServer(port) {
  if (argv.disable_nailgun) {
    return;
  }

  if (nailgunRunnerReplacer) {
    nailgunRunnerReplacer.restore();
  }
  if (process.platform == 'darwin' || process.platform == 'linux') {
    const stopNailgunServerCmd = `${nailgunRunner} --nailgun-port ${port} ng-stop`;
    const stopped = exec(stopNailgunServerCmd, {
      stdio: 'pipe',
      timeout: NAILGUN_STOP_TIMEOUT_MS,
    });
    if (stopped.status == 0) {
      log('Stopped', cyan('nailgun-server.jar'), 'on port', cyan(port));
    } else {
      log(
        yellow('WARNING:'),
        'Could not stop',
        cyan('nailgun-server.jar'),
        'on port',
        cyan(port)
      );
      log(red(stopped.stderr));
    }
  }
}

async function nailgunStart() {
  log(green('Usage:'));
  log('⤷ To start a server:', cyan('gulp nailgun-start'));
  log('⤷ To compile code:', cyan('build-system/tasks/nailgun-compile <args>'));
  log('⤷ To stop the server:', cyan('gulp nailgun-stop'));
  await startNailgunServer(DEFAULT_NAILGUN_PORT, /* detached */ true);
}

async function nailgunStop() {
  await stopNailgunServer(DEFAULT_NAILGUN_PORT);
}

module.exports = {
  checkTypesNailgunPort: CHECK_TYPES_NAILGUN_PORT,
  distNailgunPort: DIST_NAILGUN_PORT,
  nailgunStart,
  nailgunStop,
  startNailgunServer,
  stopNailgunServer,
};

nailgunStart.description = 'Starts up a nailgun server for closure compiler';
nailgunStop.description = 'Stops an already running nailgun server';
