import {bold, gray, yellow} from 'kleur/colors';
import {isCiBuild} from './ci.mjs';

/**
 * Used by tests to wrap progress dots. Attempts to match the terminal width
 * during local development and defaults to 150 if it couldn't be determined.
 */
export const dotWrappingWidth = isCiBuild()
  ? 150
  : process.stdout.columns ?? 150;

/**
 * Used by CI job scripts to print a prefix before top-level logging lines.
 */
let loggingPrefix = '';

/**
 * Logs messages with a timestamp. The timezone suffix is dropped.
 * @param  {...string} messages
 */
export function log(...messages) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  const prefix = `[${gray(timestamp)}]`;
  console.log(prefix, ...messages);
}

/**
 * Sets the logging prefix for the ongoing PR check job
 * @param {string} prefix
 */
export function setLoggingPrefix(prefix) {
  loggingPrefix = prefix;
}

/**
 * Returns the formatted logging prefix for the ongoing PR check job
 * @return {string}
 */
export function getLoggingPrefix() {
  return bold(yellow(loggingPrefix));
}

/**
 * Logs messages only during local development
 * @param  {...string} messages
 */
export function logLocalDev(...messages) {
  if (!isCiBuild()) {
    log(...messages);
  }
}

/**
 * Logs messages on the same line to indicate progress
 * @param {...string} messages
 */
export function logOnSameLine(...messages) {
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
export function logOnSameLineLocalDev(...messages) {
  if (!isCiBuild()) {
    logOnSameLine(...messages);
  }
}

/**
 * Logs messages without a timestamp
 * @param {...string} messages
 */
export function logWithoutTimestamp(...messages) {
  console.log(...messages);
}

/**
 * Logs messages without a timestamp only during local development
 * @param {...string} messages
 */
export function logWithoutTimestampLocalDev(...messages) {
  if (!isCiBuild()) {
    console.log(...messages);
  }
}
