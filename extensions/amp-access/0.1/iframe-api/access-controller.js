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
/*eslint no-unused-vars: 0*/


/**
 * The controller that the iframe must implement in order to provide
 * the access features.
 * See `AmpAccessIframeApi` class for more details.
 * @interface
 */
export class AccessController {

  /**
   * Check origin, protocol and configuration and initialize controller.
   * @param {string} origin
   * @param {string} protocol
   * @param {!JsonObject} config
   * @return {!Promise|undefined}
   */
  connect(origin, protocol, config) {}

  /**
   * Authorize document.
   * @return {!Promise<!JsonObject>}
   */
  authorize() {}

  /**
   * Pingback document view.
   * @return {!Promise}
   */
  pingback() {}
}
