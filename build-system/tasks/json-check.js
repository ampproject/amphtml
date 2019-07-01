/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const colors = require('ansi-colors');
const gulp = require('gulp');
const log = require('fancy-log');
const through2 = require('through2');
const {jsonGlobs} = require('../config');

const expectedCaches = ['cloudflare', 'google'];

/**
 * Fail if caches.json is missing some expected caches.
 */
async function cachesJson() {
  return gulp.src(['caches.json']).pipe(
    through2.obj(function(file) {
      let obj;
      try {
        obj = JSON.parse(file.contents.toString());
      } catch (e) {
        log(
          colors.yellow(
            'Could not parse caches.json. ' +
              'This is most likely a fatal error that ' +
              'will be found by checkValidJson'
          )
        );
        return;
      }
      const foundCaches = [];
      for (const foundCache of obj.caches) {
        foundCaches.push(foundCache.id);
      }
      for (const cache of expectedCaches) {
        if (!foundCaches.includes(cache)) {
          log(
            colors.red('Missing expected cache "' + cache + '" in caches.json')
          );
          process.exitCode = 1;
        }
      }
    })
  );
}

/**
 * Fail if JSON files are valid.
 */
async function jsonSyntax() {
  let hasError = false;
  return gulp
    .src(jsonGlobs)
    .pipe(
      through2.obj(function(file) {
        try {
          JSON.parse(file.contents.toString());
        } catch (e) {
          log(
            colors.red('Invalid JSON in ' + file.relative + ': ' + e.message)
          );
          hasError = true;
        }
      })
    )
    .on('end', function() {
      if (hasError) {
        process.exit(1);
      }
    });
}

module.exports = {
  cachesJson,
  jsonSyntax,
};

cachesJson.description = 'Check that some expected caches are included.';
jsonSyntax.description = 'Check that JSON files are valid JSON.';
