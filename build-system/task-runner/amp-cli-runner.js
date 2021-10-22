#!/usr/bin/env node

'use strict';

/**
 * @fileoverview This is the `amp` CLI runner executable that is installed to
 * the global node directory. It invokes the repo-local `amp` task runner, and
 * makes it possible for multiple local repo copies to share one globally
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
  const result = childProcess.spawnSync(repoRootCmd, {
    shell: process.platform == 'win32' ? 'cmd' : '/bin/bash',
    encoding: 'utf-8',
  });
  return result.status == 0 ? result.stdout.trim() : undefined;
}

/**
 * Invokes the repo-local `amp` task runner if we are inside a git repository.
 */
function invokeAmpTaskRunner() {
  const repoRoot = getRepoRoot();
  if (repoRoot) {
    require(path.join(repoRoot, 'amp.js'));
  } else {
    console.log('\x1b[31mERROR:\x1b[0m Not inside a git repo');
  }
}

invokeAmpTaskRunner();
