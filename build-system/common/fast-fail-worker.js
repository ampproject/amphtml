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

 const {log} = require('./logging');
const {Worker} = require('worker_threads');

/** @type {Worker} */
let fastFailWorker;

/**
 * Starts the fast fail background polling service as a worker.
 * @return {Promise<void>}
 */
function startFastFailPollingWorker() {
  return new Promise((resolve, reject) => {
    if (fastFailWorker) {
      reject('The worker already exists');
      return;
    }
    fastFailWorker = new Worker('./build-system/common/fast-fail.js', {
      workerData: {
        pid: process.pid,
      },
    });
    fastFailWorker.on('message', (message) => {
      log(message);
      resolve();
    });
  });
}

/**
 * Stops the fast fail background process.
 */
 function stopFastFailWorker() {
  if (fastFailWorker) {
    fastFailWorker.terminate();
  }
}

module.exports = {
  startFastFailPollingWorker,
  stopFastFailWorker
};
