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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {gitCommitFormattedTime, gitStatusPorcelain} = require('./git');

function getVersion() {
  if (argv.version) {
    return String(argv.version);
  } else {
    // Generate a consistent version number by using the commit* time of the
    // latest commit on the active branch as the twelve digits, and use the
    // state of the working directory as the last digit: 0 for a "clean" tree, 1
    // if there are uncommited changes in the working directory.
    //
    // e.g., the version number of a clean (no uncommited changes) tree that was
    // commited on August 1, 2018 at 14:31:11 EDT would be `1808011831110`
    // (notice that due to timezone shift, the hour value changes from EDT's 14
    // to UTC's 18. The last digit denotes that this is a clean tree.)
    //
    // *Commit time is different from author time! Commit time is the time that
    // the PR was merged into master; author time is when the author ran the
    // "git commit" command.
    const lastCommitFormattedTime = gitCommitFormattedTime();
    if (gitStatusPorcelain()) {
      return `${lastCommitFormattedTime}1`;
    } else {
      return `${lastCommitFormattedTime}0`;
    }
  }
}

// Used to e.g. references the ads binary from the runtime to get version lock.
exports.VERSION = getVersion();
