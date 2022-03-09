'use strict';
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const {cyan, red} = require('kleur/colors');
const {log} = require('../common/logging');

const logFile = path.resolve(process.cwd(), 'dist', 'debug-compilation.log');

const pad = (value, length) =>
  (value.length > length ? value.slice(value.length - length) : value).padEnd(
    length
  );

/**
 * Output debugging information when developing changes in this functionality.
 *
 * @param {string} lifecycle
 * @param {string} fullpath
 * @param {?string=} content
 * @param {Object=} sourcemap
 */
function debug(lifecycle, fullpath, content, sourcemap) {
  if (argv.debug) {
    if (!content) {
      content = fs.readFileSync(fullpath, 'utf-8');
    }
    const sourcemapPath = `${fullpath}.map`;
    if (!sourcemap && fs.existsSync(sourcemapPath)) {
      sourcemap = fs.readFileSync(sourcemapPath, 'utf-8');
    }
    const contentsPath = tempy.writeSync(content);
    if (sourcemap) {
      fs.writeFileSync(
        `${contentsPath}.map`,
        JSON.stringify(sourcemap, null, 4)
      );
    }
    fs.appendFileSync(
      logFile,
      `${pad(lifecycle, 20)}: ${pad(fullpath, 100)} ${contentsPath}\n`
    );
  }
}

/**
 * Logs debug information.
 */
function displayLifecycleDebugging() {
  if (argv.debug) {
    log(cyan('Debug Lifecycles: ') + red(logFile));
  }
}

module.exports = {
  displayLifecycleDebugging,
  debug,
};
