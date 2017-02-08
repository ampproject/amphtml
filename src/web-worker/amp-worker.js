/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {calculateEntryPointScriptUrl} from '../service/extension-location';
import {dev} from '../log';
import {fromClass} from '../service';
import {isExperimentOn} from '../experiments';
import {getMode} from '../mode';

const TAG = 'web-worker';

/**
 * @typedef {{
 *   method: string,
 *   args: !Array,
 *   id: number,
 * }}
 */
export let ToWorkerMessageDef;

/**
 * @typedef {{
 *   method: string,
 *   returnValue: *,
 *   id: number,
 * }}
 */
export let FromWorkerMessageDef;

/**
 * Invokes function named `method` with args `opt_args` on the web worker
 * and returns a Promise that will be resolved with the function's return value.
 * @note Currently only works in a single entry point.
 * @param {!Window} win
 * @param {string} method
 * @param {!Array=} opt_args
 * @return {!Promise}
 */
export function invokeWebWorker(win, method, opt_args) {
  if (!isExperimentOn(win, TAG)) {
    return Promise.reject(`Experiment "${TAG}" is disabled.`);
  }
  if (!win.Worker) {
    return Promise.reject('Worker not supported in window: ' + win);
  }
  const worker = fromClass(win, 'amp-worker', AmpWorker);
  return worker.sendMessage_(method, opt_args || []);
}

/**
 * A Promise-based API wrapper around a single Web Worker.
 * @private
 */
class AmpWorker {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Window} */
    this.win_ = win;

    const url =
        calculateEntryPointScriptUrl(location, 'ww', getMode().localDev);
    /** @const @private {!Worker} */
    this.worker_ = new win.Worker(url);
    this.worker_.onmessage = this.receiveMessage_.bind(this);

    /**
     * Maps method names to the promise executors for in-flight invocations of
     * those methods. E.g. messages['foo'][3] contains the {resolve, reject}
     * functions for the third concurrent invocation of 'foo'.
     *
     * @const @private {
     *   !Object<string,
     *     !Array<({resolve: !Function, reject: !Function}|undefined)>
     *   >
     * }
     */
    this.messages_ = Object.create(null);
  }

  /**
   * Sends a method invocation request to the worker and returns a Promise.
   * @param {string} method
   * @param {!Array} args
   * @return {!Promise}
   * @private
   */
  sendMessage_(method, args) {
    const promise = new Promise((resolve, reject) => {
      if (!this.messages_[method]) {
        this.messages_[method] = [];
      }
      const index = this.messages_[method].length;
      this.messages_[method][index] = {resolve, reject};

      /** @type {ToWorkerMessageDef} */
      const message = {method, args, id: index};
      this.worker_./*OK*/postMessage(message);
    });
    return promise;
  }

  /**
   * Receives the result of a method invocation from the worker and resolves
   * the Promise returned from the corresponding `sendMessage_()` call.
   * @param {!MessageEvent} event
   * @private
   */
  receiveMessage_(event) {
    const {method, returnValue, id} =
        /** @type {FromWorkerMessageDef} */ (event.data);

    // Find the stored Promise executor for this message.
    const invocations = this.messages_[method];
    if (invocations) {
      const resolve = invocations[id].resolve;
      if (resolve) {
        resolve(returnValue);
        invocations[id] = undefined;
      } else {
        dev().error(TAG, `Received unexpected "${method}" message ` +
            `from worker with id: ${id}.`);
      }
    } else {
      dev().error(TAG, `Received unexpected "${method}" message from worker.`);
    }

    // Clean up array if there are no more messages in flight for this method.
    let empty = true;
    for (let i = 0; i < invocations.length && empty; i++) {
      if (invocations[i] !== undefined) {
        empty = false;
      }
    }
    if (empty) {
      delete this.messages_[method];
    }
  }
}
