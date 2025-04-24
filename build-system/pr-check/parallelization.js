/**
 * @fileoverview helpper functions for parallelizations.
 */

const fs = require('node:fs');
const tempy = require('tempy');
const {circleciIsParallelized} = require('../common/ci');
const {timedExecOrDie} = require('./utils');

/**
 * Splits command execution using a glob string on parallelized CircleCI builds.
 *
 * If no parallelization is detected, simply returns the command as-is.
 * If parallelization is detected, uses the glob to add an argument to the
 * command by passing it through an optional callback function.
 *
 * Optional callback: A function that receives a space-delimited list as
 *     determines by CircleCI, and returns the new argument to add as a string.
 *     e.g., `(items) => '--files=' + item.replaceAll(' ', ',')` will add
 *     '--files=x,y,z' to the command.
 *
 * Note: the glob returns results with spaces in them this cab get messy.
 *
 * @param {string} command a CLI command. e.g., `amp dist --fortesting`
 * @param {string} glob e.g., `extensions/amp-*`
 * @param {(results: string) => string} callback optional callback. See
 *    function description.
 * @return {string} the CLI command that should be executed.
 */
function maybeParallelizeCommand(command, glob, callback = (s) => s) {
  if (!circleciIsParallelized()) {
    return command;
  }

  const tempFileName = tempy.file();
  timedExecOrDie(
    `circleci tests glob ${glob} | circleci tests run --command=">${tempFileName} xargs echo -n"`
  );
  const globAndRunResults = fs.readFileSync(tempFileName, {encoding: 'utf-8'});

  return `${command} ${callback(globAndRunResults)}`;
}

module.exports = {maybeParallelizeCommand};
