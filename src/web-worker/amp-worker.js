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

import {Services} from '../services';
import {calculateEntryPointScriptUrl} from '../service/extension-location';
import {dev, devAssert} from '../log';
import {getMode} from '../mode';
import {getService, registerServiceBuilder} from '../service';
import {setupInit} from '../utils/xhr-utils';

const TAG = 'web-worker';

/**
 * @typedef {{method: string, resolve: !Function, reject: !Function}}
 */
let PendingMessageDef;

/**
 * Invokes function named `method` with args `opt_args` on the web worker
 * and returns a Promise that will be resolved with the function's return value.
 *
 * If `opt_localWin` is provided, method will be executed in a scope limited
 * to other invocations with `opt_localWin`.
 *
 * Note: Currently only works in a single entry point (amp-bind.js).
 *
 * @param {!Window} win
 * @param {string} method
 * @param {!Array=} opt_args
 * @param {!Window=} opt_localWin
 * @return {!Promise}
 */
export function invokeWebWorker(win, method, opt_args, opt_localWin) {
  if (!win.Worker) {
    return Promise.reject('Worker not supported in window.');
  }
  registerServiceBuilder(win, 'amp-worker', AmpWorker);
  const worker = getService(win, 'amp-worker');
  return worker.sendMessage_(method, opt_args || [], opt_localWin);
}

/**
 * @param {!Window} win
 * @return {!AmpWorker}
 * @visibleForTesting
 */
export function ampWorkerForTesting(win) {
  registerServiceBuilder(win, 'amp-worker', AmpWorker);
  return getService(win, 'amp-worker');
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

    /** @const @private {!../service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    // Use `testLocation` for testing with iframes. @see testing/iframe.js.
    let loc = win.location;
    if (getMode().test && win.testLocation) {
      loc = win.testLocation;
    }
    // Use RTV to make sure we fetch prod/canary/experiment correctly.
    const useLocal = getMode().localDev || getMode().test;
    const useRtvVersion = !useLocal;
    const url = calculateEntryPointScriptUrl(
      loc,
      'ww',
      useLocal,
      useRtvVersion
    );
    dev().fine(TAG, 'Fetching web worker from', url);

    /** @private {Worker} */
    this.worker_ = null;

    /** @const @private {!Promise} */
    this.fetchPromise_ = this.xhr_
      .fetch(
        url,
        setupInit(
          {
            ampCors: false,
          },
          'text/plain'
        ),
        true
      )
      .then(res => res.text())
      .then(text => {
        // Workaround since Worker constructor only accepts same origin URLs.
        const blob = new win.Blob([text + '\n//# sourceurl=' + url], {
          type: 'text/javascript',
        });
        const blobUrl = win.URL.createObjectURL(blob);
        this.worker_ = new win.Worker(blobUrl);
        this.worker_.onmessage = this.receiveMessage_.bind(this);
      });

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

    /**
     * Array of top-level and local windows passed into `invokeWebWorker`.
     * Used to uniquely identify windows for scoping worker functions when
     * a single worker is used for multiple windows (i.e. FIE).
     * @const @private {!Array<!Window>}
     */
    this.windows_ = [win];
  }

  /**
   * Sends a method invocation request to the worker and returns a Promise.
   * @param {string} method
   * @param {!Array} args
   * @param {Window=} opt_localWin
   * @return {!Promise}
   * @private
   * @restricted
   */
  sendMessage_(method, args, opt_localWin) {
    return this.fetchPromise_.then(() => {
      return new Promise((resolve, reject) => {
        const id = this.counter_++;
        this.messages_[id] = {method, resolve, reject};

        const scope = this.idForWindow_(opt_localWin || this.win_);

        const message = /** @type {ToWorkerMessageDef} */ ({
          method,
          args,
          scope,
          id,
        });
        this.worker_./*OK*/ postMessage(message);
      });
    });
  }

  /**
   * Receives the result of a method invocation from the worker and resolves
   * the Promise returned from the corresponding `sendMessage_()` call.
   * @param {!MessageEvent} event
   * @private
   */
  receiveMessage_(event) {
    const {
      method,
      returnValue,
      id,
    } = /** @type {FromWorkerMessageDef} */ (event.data);

    const message = this.messages_[id];
    if (!message) {
      dev().error(
        TAG,
        `Received unexpected message (${method}, ${id}) from worker.`
      );
      return;
    }
    devAssert(
      method == message.method,
      'Received mismatched method ' +
        `(${method}, ${id}), expected ${message.method}.`
    );

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

  /**
   * Returns an identifier for `win`, unique for set of windows seen so far.
   * @param {!Window} win
   * @return {number}
   * @private
   */
  idForWindow_(win) {
    const index = this.windows_.indexOf(win);
    if (index >= 0) {
      return index;
    } else {
      return this.windows_.push(win) - 1;
    }
  }

  /**
   * @return {!Promise}
   * @visibleForTesting
   */
  fetchPromiseForTesting() {
    return this.fetchPromise_;
  }
}
