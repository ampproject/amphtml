/**
 * @fileoverview helpper functions for parallelizations.
 */

const fs = require('node:fs');
const tempy = require('tempy');
const {circleciIsParallelized, circleciNodeIndex} = require('../common/ci');
const {timedExecOrDie} = require('./utils');

/** @typedef {{
 *    callback: (results: string) => string,
 *    onZero: string,
 * }} */
let ParallelizeCommandOptionsDef;

/** @type {ParallelizeCommandOptionsDef} */
const DEFAULT_OPTIONS = {
  callback: (s) => s,
  onZero: '',
};

/**
 * Splits command execution using a glob string on parallelized CircleCI builds.
 *
 * If no parallelization is detected, simply returns the command as-is.
 * If parallelization is detected, uses the glob to add an argument to the
 * command by passing it through an optional callback function.
 *
 * Options:
 * - callback: A function that receives a space-delimited list that CircleCI
 *     determines are to be included in this prallelized build, and returns the
 *     new argument to add.
 *     e.g., `(items) => '--files=' + item.replaceAll(' ', ',')` will add
 *     '--files=x,y,z' to the command.
 *     Note: the glob returns results with spaces in them this cab get messy.
 * - onZero: An argument to be added only to the first (#0) parallelized build.
 *
 * @param {string} command a CLI command. e.g., `amp dist --fortesting`
 * @param {string} glob e.g., `extensions/amp-*`
 * @param {ParallelizeCommandOptionsDef?} options additional options. See
 *     function description.
 * @return {string} the CLI command that should be executed.
 */
function maybeParallelizeCommand(command, glob, options) {
  if (!circleciIsParallelized()) {
    return command;
  }
  options = {...DEFAULT_OPTIONS, ...(options ?? {})};

  const tempFileName = tempy.file();
  timedExecOrDie(
    `circleci tests glob ${glob} | circleci tests run --command=">${tempFileName} xargs echo -n"`
  );
  const globAndRunResults = fs.readFileSync(tempFileName, {encoding: 'utf-8'});

  if (options.onZero && circleciNodeIndex() == 0) {
    command += ` ${options.onZero}`;
  }
  return `${command} ${options.callback(globAndRunResults)}`;
}

module.exports = {maybeParallelizeCommand};
