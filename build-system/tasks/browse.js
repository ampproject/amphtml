/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const log = require('fancy-log');
const {cyan, green, red} = require('ansi-colors');
const {exec} = require('../common/exec');

/* Command to start the browser for each OS. */
const BROWSE_CMD = {
  OSX: 'open',
  LINUX: 'sensible-browser',
  WINDOWS: 'start chrome',
};

/* Returns the command to open the browse to a URL on the current platform. */
function platformBrowseCmd() {
  // See https://nodejs.org/api/process.html#process_process_platform
  switch (process.platform) {
    case 'darwin':
      return BROWSE_CMD.OSX;
    case 'win32':
      return BROWSE_CMD.WINDOWS;
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'sunos':
      return BROWSE_CMD.LINUX;
    default:
      return null;
  }
}

async function browse() {
  const {url} = argv;

  if (!url) {
    log(
      red('ERROR:'),
      'No URL provided; please use',
      cyan('--url'),
      'to specify webpage URL to browse.'
    );
    process.exitCode = 1;
    return;
  }

  return doBrowse(url);
}

function doBrowse(url) {
  const browseCmd = platformBrowseCmd();
  if (browseCmd === null) {
    log(
      red('ERROR:'),
      'Unrecognized platform',
      `${cyan(process.platform)};`,
      'could not open browser.'
    );
    process.exitCode = 1;
    return;
  }

  log(green('INFO:'), 'Opening', cyan(url), 'in browser...');
  return exec(`${browseCmd} ${url}`);
}

module.exports = {browse};

browse.description = 'Open a URL in the browser';
browse.flags = {
  url: '  URL to open',
};
