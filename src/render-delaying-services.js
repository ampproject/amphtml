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

import {dev} from './log';
import {getServicePromise} from './service';
import {timerFor} from './timer';

/**
 * A map of services that delay rendering. The key is the name of the service
 * and the value is a DOM query which is used to check if the service is needed
 * in the current document.
 * Do not add a service unless absolutely necessary.
 * @const {!Object<string, string>}
 */
const SERVICES = {
  'amp-accordion': '[custom-element=amp-accordion]',
  'amp-dynamic-css-classes': '[custom-element=amp-dynamic-css-classes]',
  'variant': 'amp-experiment',
};

/**
 * Maximum milliseconds to wait for all extensions to load before erroring.
 * @const
 */
const LOAD_TIMEOUT = 3000;

/**
 * Detects any render delaying services that are required on the page,
 * and returns a promise with a timeout.
 * @param {!Window} win
 * @return {!Promise<!Array<*>>} resolves to an Array that has the same length as
 *     the detected render delaying services
 */
export function waitForServices(win) {
  const promises = includedServices(win).map(service => {
    return timerFor(win).timeoutPromise(
      LOAD_TIMEOUT,
      getServicePromise(win, service),
      `Render timeout waiting for service ${service} to be ready.`
    );
  });
  return Promise.all(promises);
}

/**
 * Detects which, if any, render-delaying extensions are included on the page.
 * @param {!Window} win
 * @return {!Array<string>}
 * @private
 */
function includedServices(win) {
  const doc = win.document;
  dev().assert(doc.body);

  return Object.keys(SERVICES).filter(service => {
    return doc.querySelector(SERVICES[service]);
  });
}
