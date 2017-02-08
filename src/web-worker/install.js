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
import {isExperimentOn} from '../experiments';
import {getMode} from '../mode';
import {parseUrl} from '../url';
import {urls} from '../config';

const TAG = 'web-worker';

let worker;

/**
 * @param {!Window} win
 * @param {string} method
 * @param {!Array=} opt_args
 * @return {!Promise}
 */
export function callWorkerMethod(win, method, args) {
  if (!worker) {
    // if (!isExperimentOn(win, TAG)) {
    //   return;
    // }
    if (!('Worker' in win)) {
      return null;
    }
    if (!getMode().localDev &&
        win.location.hostname !== parseUrl(urls.cdn).hostname) {
      return;
    }
    const url =
        calculateEntryPointScriptUrl(location, 'ww', getMode().localDev);
    worker = new AmpWorker(win, url);
  }
  return worker.sendMessage_(method, args || []);
}

class AmpWorker {
  /**
   * @param {!Window} win
   * @param {string} url
   */
  constructor(win, url) {
    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {!Worker} */
    this.worker_ = new win.Worker(url);
    this.worker_.onmessage = this.receiveMessage_.bind(this);

    /** @const @private {!Object<string, !Array<!Function>>} */
    this.messages_ = Object.create(null);
  }

  /**
   * @param {string} method
   * @param {Array} args
   * @return {!Promise}
   * @private
   */
  sendMessage_(method, args) {
    const promise = new Promise(resolve => {
      if (!this.messages_[method]) {
        this.messages_[method] = [];
      }
      const index = this.messages_[method].length;
      this.messages_[method][index] = resolve;

      this.worker_.postMessage({method, args, index});
    });
    return promise;
  }

  /**
   * @param {!MessageEvent} event
   * @private
   */
  receiveMessage_(event) {
    const {method, returnValue, index} = event.data;

    // TODO(willchou): Add errors.
    const invocations = this.messages_[method];
    if (invocations) {
      const resolve = invocations[index];
      if (resolve) {
        resolve(returnValue);
        invocations[index] = undefined;
      }
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
