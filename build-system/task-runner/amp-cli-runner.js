#!/usr/bin/env node

'use strict';

/**
 * @fileoverview This is the `amp` CLI runner executable that is installed to
 * the global node directory. It invokes the repo-local `amp` task runner, and
 * makes it possible for multiple local repo copies to share one globally
 * installed runner executable.
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Returns the current git root directory if we are inside the amphtml repo.
 *
 * Detects by the presence of `amp.js` in the root.
 *
 * @return {string|undefined}
 */
function getRepoRoot() {
  const repoRootCmd = 'git rev-parse --show-toplevel';
  const result = childProcess.spawnSync(repoRootCmd, {
    shell: process.platform == 'win32' ? 'cmd' : '/bin/bash',
    encoding: 'utf-8',
  });
  const repoRoot = result.status == 0 ? result.stdout.trim() : undefined;
  if (repoRoot && fs.existsSync(path.join(repoRoot, 'amp.js'))) {
    return repoRoot;
  }
  return undefined;
}

/**
 * Invokes the repo-local `amp` task runner if we are inside a git repository.
 */
function invokeAmpTaskRunner() {
  const repoRoot = getRepoRoot();
  const isCompGen = process.argv.includes['--compgen'];
  if (repoRoot) {
    require(path.join(repoRoot, 'amp.js'));
  } else if (!isCompGen) {
    console.log(
      '\x1b[31mERROR:\x1b[0m Not inside the \x1b[36mamphtml\x1b[0m git repo'
    );
  }
}

invokeAmpTaskRunner();
