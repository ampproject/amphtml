/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {randomUUID} from './uuid';
import {getService} from './service';


/**
 * @param {!Window} window
 */
export function getClientId(window) {
  return clientIdServiceFor(window).clientId;
};


/** @private */
class ClientIdService {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @const {string} */
    this.clientId = randomUUID();
  }
}


/**
 * @param {!Window} window
 * @return {!ClientIdService}
 */
function clientIdServiceFor(window) {
  return getService(window, 'clientId', () => {
    return new ClientIdService(window);
  });
};
