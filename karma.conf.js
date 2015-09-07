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

module.exports = function(config) {
  config.set({
    frameworks: ['fixture', 'browserify', 'mocha', 'sinon-chai'],

    preprocessors: {
      'fixtures/*.html' : ['html2js'],
      'src/**/*.js': ['browserify'],
      'test/**/*.js': ['browserify'],
      'extensions/**/test/**/*.js': ['browserify'],
      'testing/**/*.js': ['browserify']
    },

    browserify: {
      watch: true,
      debug: true,
      transform: ['babelify']
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_DEBUG,

    autoWatch: true,

    browsers: ['Chrome'],

    // change Karma's debug.html to the mocha web reporter
    client: {
      mocha: {
        reporter: 'html'
      }
    }
  });
};
