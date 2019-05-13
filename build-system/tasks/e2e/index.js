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
const ciReporter = require('../mocha-ci-reporter');
const config = require('../../config');
const glob = require('glob');
const log = require('fancy-log');
const Mocha = require('mocha');
const tryConnect = require('try-net-connect');
const {cyan} = require('ansi-colors');
const {execOrDie, execScriptAsync} = require('../../exec');
const {watch} = require('gulp');

const HOST = 'localhost';
const PORT = 8000;
const WEBSERVER_TIMEOUT_RETRIES = 10;
const SLOW_TEST_THRESHOLD_MS = 2500;

let webServerProcess_;

function installPackages_() {
  execOrDie('npx yarn --cwd build-system/tasks/e2e', {'stdio': 'ignore'});
}

function buildRuntime_() {
  execOrDie('gulp build');
}

function launchWebServer_() {
  webServerProcess_ = execScriptAsync(
      `gulp serve --host ${HOST} --port ${PORT}`);

  let resolver;
  const deferred = new Promise(resolverIn => {
    resolver = resolverIn;
  });

  tryConnect({
    host: HOST,
    port: PORT,
    retries: WEBSERVER_TIMEOUT_RETRIES, // retry timeout defaults to 1 sec
  }).on('connected', () => {
    return resolver(webServerProcess_);
  });

  return deferred;
}

function cleanUp_() {
  if (webServerProcess_ && !webServerProcess_.killed) {
    webServerProcess_.kill('SIGKILL');
  }
}

function createMocha_() {
  const mocha = new Mocha({
    // e2e tests have a different standard for when a test is too slow,
    // so we set a non-default threshold.
    slow: SLOW_TEST_THRESHOLD_MS,
    reporter: argv.testnames || argv.watch ? '' : ciReporter,
    fullStackTrace: true,
  });

  return mocha;
}

async function e2e() {
  // install e2e-specific modules
  installPackages_();

  // set up promise to return to gulp.task()
  let resolver;
  const deferred = new Promise(resolverIn => {
    resolver = resolverIn;
  });

  require('@babel/register');
  const {describes} = require('./helper');
  describes.configure({
    engine: argv.engine,
    headless: argv.headless,
  });

  // build runtime
  if (!argv.nobuild) {
    buildRuntime_();
  }

  // start up web server
  await launchWebServer_();

  // run tests
  if (!argv.watch) {
    const mocha = createMocha_();

    // specify tests to run
    if (argv.files) {
      glob.sync(argv.files).forEach(file => {
        delete require.cache[file];
        mocha.addFile(file);
      });
    }
    else {
      config.e2eTestPaths.forEach(path => {
        glob.sync(path).forEach(file => {
          delete require.cache[file];
          mocha.addFile(file);
        });
      });
    }

    mocha.run(async failures => {
      // end web server
      cleanUp_();

      // end task
      process.exitCode = failures ? 1 : 0;
      execOrDie('ps -e'); // log processes
      await resolver();
    });
  }
  else {
    const filesToWatch = argv.files ? [argv.files] : [config.e2eTestPaths];
    const watcher = watch(filesToWatch);
    log('Watching', cyan(filesToWatch), 'for changes...');
    watcher.on('change', ({path}) => {
      log('Detected a change in', cyan(path));
      log('Running tests...');
      // clear file from node require cache if running test again
      delete require.cache[path];
      const mocha = createMocha_();
      mocha.files = [path];
      mocha.run();
    });
  }

  return deferred;
}

module.exports = {
  e2e,
};

e2e.description = 'Runs e2e tests';
e2e.flags = {
  'nobuild': '  Skips building the runtime via `gulp build`',
  'files': '  Run tests found in a specific path (ex: **/test-e2e/*.js)',
  'testnames': '  Lists the name of each test being run',
  'watch': '  Watches for changes in files, runs corresponding test(s)',
};
