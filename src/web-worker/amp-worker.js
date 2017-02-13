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

import {FromWorkerMessageDef, ToWorkerMessageDef} from './web-worker-defines';
import {calculateEntryPointScriptUrl} from '../service/extension-location';
import {dev} from '../log';
import {fromClass} from '../service';
import {isExperimentOn} from '../experiments';
import {getMode} from '../mode';

const TAG = 'web-worker';

/**
 * @typedef {{method: string, resolve: !Function, reject: !Function}}
 */
let PendingMessageDef;

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
    return Promise.reject('Worker not supported in window.');
  }
  const worker = fromClass(win, 'amp-worker', AmpWorker);
  return worker.sendMessage_(method, opt_args || []);
}

/**
 * @param {!Window} win
 * @return {!AmpWorker}
 * @visibleForTesting
 */
export function ampWorkerForTesting(win) {
  return fromClass(win, 'amp-worker', AmpWorker);
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
     * Array of in-flight messages pending response from worker.
     * @const @private {!Object<number, PendingMessageDef>}
     */
    this.messages_ = {};

    /**
     * Monotonically increasing integer that increments on each message.
     * @private {number}
     */
    this.counter_ = 0;
  }

  /**
   * Sends a method invocation request to the worker and returns a Promise.
   * @param {string} method
   * @param {!Array} args
   * @return {!Promise}
   * @private
   */
  sendMessage_(method, args) {
    return new Promise((resolve, reject) => {
      const id = this.counter_++;
      this.messages_[id] = {method, resolve, reject};

      /** @type {ToWorkerMessageDef} */
      const message = {method, args, id};
      this.worker_./*OK*/postMessage(message);
    });
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

    const message = this.messages_[id];
    if (!message) {
      dev().error(TAG, `Received unexpected message (${method}, ${id}) ` +
          `from worker.`);
      return;
    }
    dev().assert(method == message.method, `Received mismatched method ` +
        `(${method}, ${id}), expected ${message.method}.`);

    message.resolve(returnValue);

    delete this.messages_[id];
  }

  /**
   * @return {boolean}
   * @visibleForTesting
   */
  hasPendingMessages() {
    return Object.keys(this.messages_).length > 0;
  }
}
