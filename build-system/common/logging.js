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

const log = require('fancy-log');
const {bold, yellow} = require('ansi-colors');
const {isCiBuild} = require('./ci');

let loggingPrefix = '';

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
    process.stdout.clearLine();
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
 * Logs messages without the fancy-log timestamp
 * @param {...string} messages
 */
function logWithoutTimestamp(...messages) {
  console.log(...messages);
}

/**
 * Logs messages without the fancy-log timestamp only during local development
 * @param {...string} messages
 */
function logWithoutTimestampLocalDev(...messages) {
  if (!isCiBuild()) {
    console.log(...messages);
  }
}

module.exports = {
  getLoggingPrefix,
  log,
  logLocalDev,
  logOnSameLine,
  logOnSameLineLocalDev,
  logWithoutTimestamp,
  logWithoutTimestampLocalDev,
  setLoggingPrefix,
};
