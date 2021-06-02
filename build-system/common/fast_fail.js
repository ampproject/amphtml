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
const {parentPort, workerData} = require('worker_threads');

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
 * Starts the fast fail polling background service.
 */
function initializeFastFailPolling() {
  parentPort?./*OK*/ postMessage('');
  const interval = setInterval(async () => {
    const jobs = await getJobs();
    const failed = jobs.items.filter((job) => job.status === 'failed');
    if (failed.length) {
      const pid = getPid();
      const failedJobNames = failed.map((job) => job.name).join(', ');
      const jobOrJobs = `job${failed.length > 1 ? 's' : ''}`;
      parentPort?./*OK*/ postMessage(
        `Found failed ${jobOrJobs}: ${failedJobNames}`
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
