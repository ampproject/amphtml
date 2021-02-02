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
  /** */
  constructor() {
    const config = JSON.parse(
      document.getElementsByTagName('amp-google-assistant-assistjs-config')[0]
        .textContent
    );

    if (!config.hasOwn('projectId')) {
      throw new Error('Project id is required to embed assist.js.');
    }
    /** @private {string} */
    this.projectId_ = config.projectId;

    /** @private {string} */
    this.assistjsServer_ = config.hasOwn('assistjsServer')
      ? config.assistjsServer
      : 'https://actions.google.com';

    /** @private {boolean} */
    this.devMode_ = config.hasOwn('devMode') ? config.devMode : false;

    /** @private {string} */
    this.hostUrl_ = config.hasOwn('hostUrl')
      ? config.hostUrl
      : window.location.href;
  }

  /** @return {string} */
  getAssistjsServer() {
    return this.assistjsServer_;
  }

  /** @return {string} */
  getProjectId() {
    return this.projectId_;
  }

  /** @return {boolean} */
  getDevMode() {
    return this.devMode_;
  }

  /** @return {string} */
  getHostUrl() {
    return this.hostUrl_;
  }
}
