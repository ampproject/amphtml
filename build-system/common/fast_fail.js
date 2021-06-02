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
const {green, red} = require('./colors');
const {parentPort, workerData} = require('worker_threads');

const {CIRCLE_TOKEN, CIRCLE_WORKFLOW_ID} = process.env;

const POLLING_RATE = parseInt(process.env.POLLING_RATE || '', 10) || 1000;

/**
 * DO_NOT_SUBMIT delete this function after choose the optimal way to get the PID.
 * @return {number}
 */
function getPid() {
  if (workerData && workerData.pid) {
    return workerData.pid;
  }
  if (process.env.JOB_PID) {
    return parseInt(process.env.JOB_PID, 10);
  }
  if (process.argv[2]) {
    return parseInt(process.argv[2], 10);
  }
  return process.pid;
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
 * Starts the fast fail polling background service.
 */
function initializeFastFailPolling() {
  parentPort?./*OK*/ postMessage(`${green('Initialized')} Fail Fast Worker`);
  const interval = setInterval(async () => {
    const jobs = await getJobs();
    const failed = jobs.items.filter((job) => job.status === 'failed');
    if (failed.length) {
      const pid = getPid();
      const failedJobNames = failed.map((job) => job.name).join(', ');
      parentPort?./*OK*/ postMessage(
        `${red(
          `Found failed job${failed.length > 1 ? 's' : ''}`
        )} ${failedJobNames}, Killing ${pid}.`
      );
      clearInterval(interval);
      setTimeout(() => {
        // Waiting a couple seconds so the parent can log the failures.
        process.kill(pid);
        process.exit(1);
      }, 5000);
    }
  }, POLLING_RATE);
}

if (require.main === module) {
  initializeFastFailPolling();
}
module.exports = {
  initializeFastFailPolling,
};
