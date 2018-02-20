/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';

/** @typedef {{width: number, height: number}} */
export let SizeInfoDef;

/**
 * Sends a CORS XHR request to the given URL.
 * @param {string} adUrl Request URL to send XHR to.
 * @param {!Window} win
 * @return {!Promise<?../../../src/service/xhr-impl.FetchResponse>}
 */
export function sendXhrRequest(url, win) {
  return Services.xhrFor(win).fetch(url, {
    mode: 'cors',
    method: 'GET',
    credentials: 'include',
  });
}

