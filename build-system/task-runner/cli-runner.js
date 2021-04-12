#!/usr/bin/env node
/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This is the amphtml CLI runner executable that is installed to
 * the global node directory. It invokes the repo-local `amp` or `gulp` runner,
 * and makes it possible for multiple local repo copies to share one globally
 * installed runner executable.
 */

const childProcess = require('child_process');
const path = require('path');

/**
 * Returns the current git repo's root directory if we are inside one.
 * @return {string|undefined}
 */
function getRepoRoot() {
  const repoRootCmd = 'git rev-parse --show-toplevel';
  const spawnOptions = {
    shell: process.platform == 'win32' ? 'cmd' : '/bin/bash',
    encoding: 'utf-8',
  };
  const result = childProcess.spawnSync(repoRootCmd, spawnOptions);
  return result.status == 0 ? result.stdout.trim() : undefined;
}

/**
 * Invokes the repo-local runner if we are inside a git repository. The runner
 * target is set to either `amp.js` or gulp-deprecated.js` at install time.
 */
function invokeRunner() {
  const repoRoot = getRepoRoot();
  if (repoRoot) {
    require(path.join(repoRoot, '__RUNNER_TARGET__'));
  } else {
    console.log('\x1b[31mERROR:\x1b[0m Not inside a git repo');
  }
}

invokeRunner();
