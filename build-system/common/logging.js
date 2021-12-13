'use strict';

const {bold, gray, yellow} = require('kleur/colors');
const {isCiBuild} = require('./ci');

/**
 * Used by tests to wrap progress dots. Attempts to match the terminal width
 * during local development and defaults to 150 if it couldn't be determined.
 */
const dotWrappingWidth = isCiBuild() ? 150 : process.stdout.columns ?? 150;

/**
 * Used by CI job scripts to print a prefix before top-level logging lines.
 */
let loggingPrefix = '';

/**
 * Logs messages with a timestamp. The timezone suffix is dropped.
 * @param  {...any} messages
 */
function log(...messages) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  const prefix = `[${gray(timestamp)}]`;
  console.log(prefix, ...messages);
}

/**
 * Sets the logging prefix for the ongoing PR check job
 * @param {string} prefix
 */
function setLoggingPrefix(prefix) {
  loggingPrefix = prefix;
}

/**
 * Returns the formatted logging prefix for the ongoing PR check job
 * @return {string}
 */
function getLoggingPrefix() {
  return bold(yellow(loggingPrefix));
}

/**
 * Logs messages only during local development
 * @param  {...string} messages
 */
function logLocalDev(...messages) {
  if (!isCiBuild()) {
    log(...messages);
  }
}

/**
 * Logs messages on the same line to indicate progress
 * @param {...string} messages
 */
function logOnSameLine(...messages) {
  if (!isCiBuild() && process.stdout.isTTY) {
    process.stdout.moveCursor(0, -1);
    process.stdout.cursorTo(0);
    process.stdout.clearLine(0);
  }
  log(...messages);
}

/**
 * Logs messages on the same line only during local development
 * @param {...string} messages
 */
function logOnSameLineLocalDev(...messages) {
  if (!isCiBuild()) {
    logOnSameLine(...messages);
  }
}

/**
 * Logs messages without a timestamp
 * @param {...string} messages
 */
function logWithoutTimestamp(...messages) {
  console.log(...messages);
}

/**
 * Logs messages without a timestamp only during local development
 * @param {...string} messages
 */
function logWithoutTimestampLocalDev(...messages) {
  if (!isCiBuild()) {
    console.log(...messages);
  }
}

module.exports = {
  dotWrappingWidth,
  getLoggingPrefix,
  log,
  logLocalDev,
  logOnSameLine,
  logOnSameLineLocalDev,
  logWithoutTimestamp,
  logWithoutTimestampLocalDev,
  setLoggingPrefix,
};
