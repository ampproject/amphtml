/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp');
var karma = require('karma').server;
var config = require('../config');
var karmaConfig = config.karma;
var extend = require('util')._extend;

/**
 * Read in and process the configuration settings for karma
 * @return {!Object} Karma configuration
 */
function getConfig() {
  var obj = Object.create(null);
  if (argv.safari) {
    return extend(obj, karmaConfig.safari);
  }

  if (argv.firefox) {
    return extend(obj, karmaConfig.firefox);
  }

  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
    return extend(obj, karmaConfig.saucelabs);
  }

  return extend(obj, karmaConfig.default);
}

/**
 * Run tests.
 */
gulp.task('test', ['build'], function(done) {
  if (argv.saucelabs && process.env.MAIN_REPO) {
    console./*OK*/info('Deactivated for main repo');
    return;
  }

  var config = getConfig();
  var browsers = [];

  if (argv.watch || argv.w) {
    config.singleRun = false;
  }

  if (argv.verbose || argv.v) {
    config.client.captureConsole = true;
  }

  karma.start(config, done);
});
