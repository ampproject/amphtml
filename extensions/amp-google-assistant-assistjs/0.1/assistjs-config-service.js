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

/**
 * @fileoverview The shared service takes assist.js related config from <amp-google-assistant-assistjs-config>
 * and provides config parameters to other assist.js components.
 */

export class AssistjsConfigService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor() {
    const config = JSON.parse(document.getElementsByTagName('amp-google-assistant-assistjs-config')[0].textContent);
 
    if (!config.hasOwnProperty('projectId')) {
      throw new Error('Project id is required to embed assist.js.');
    }
    /** @private {string} */
    this.projectId_ = config.projectId;

    /** @private {string} */
    this.assistjsServer_ = config.hasOwnProperty('assistjsServer') ? config.assistjsServer : 'https://actions.google.com';

    /** @private {boolean} */
    this.devMode_ = config.hasOwnProperty('devMode') ? config.devMode : false;

    /** @private {string} */
    this.hostUrl_ = config.hasOwnProperty('hostUrl') ? config.hostUrl : window.location.href;
  }

  getAssistjsServer() {
    return this.assistjsServer_;
  }

  getProjectId() {
    return this.projectId_;
  }

  getDevMode() {
    return this.devMode_;
  }

  getHostUrl() {
    return this.hostUrl_;
  }
}
