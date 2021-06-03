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

const request = require('request');
const {log} = require('./logging');
const {mkdirSync} = require('../tasks/helpers');
const {parentPort, workerData} = require('worker_threads');
const {red} = require('./colors');
const {writeFileSync} = require('fs');

const {CIRCLE_TOKEN, CIRCLE_WORKFLOW_ID} = process.env;

const POLLING_RATE = parseInt(process.env.POLLING_RATE || '', 10) || 1000;

/**
 * Get the id of the process to be killed when a failure is found.
 * @return {number}
 */
function getPid() {
  return workerData && workerData.pid;
}

/**
 * Perform an http.get request and recieve the result as a Promise.
 * @param {string} url
 * @return {Promise<Object>}
 */
function get(url) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        method: 'GET',
        url,
      },
      (err, _res, body) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      }
    );
  });
}

/**
 * The the list of CircleCI jobs
 * @return {Promise<{items: Array<Object>}>}
 */
function getJobs() {
  return get(
    `https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}/job?circle-token=${CIRCLE_TOKEN}`
  );
}

/**
 * End both the current and parent process
 * @param {string} output
 * @return {Promise<void>}
 */
async function terminate(output) {
  mkdirSync('result-reports');
  writeFileSync('result-reports/fast_fail.log', output);
  // Trying to get lots to output correctly
  process.kill(getPid());
  log(red('Shutting down'), output);
  process.exit(1);
}

/**
 * Starts the fast fail polling background service.
 */
function initializeFastFailPolling() {
  parentPort?./*OK*/ postMessage('Fast Fail Worker Initialized');
  const interval = setInterval(async () => {
    const jobs = await getJobs();
    const failed = jobs.items.filter((job) => job.status === 'failed');
    if (failed.length) {
      clearInterval(interval);

      const failedJobNames = failed.map((job) => job.name).join(', ');
      const jobOrJobs = `job${failed.length > 1 ? 's' : ''}`;
      const output = `${red(`Found failed ${jobOrJobs}`)}: ${failedJobNames}`;
      log(output);
      terminate(output);
    }
  }, POLLING_RATE);
}

if (require.main === module) {
  initializeFastFailPolling();
}
module.exports = {
  initializeFastFailPolling,
};
