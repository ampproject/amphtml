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

import {Deferred} from '../../../src/utils/promise';
import {hasOwn} from '../../../src/utils/object';

export class AssistjsConfigService {
  /** */
  constructor() {
    /** @private {string} */
    this.projectId_ = '';

    /** @private {string} */
    this.assistjsServer_ = 'https://actions.google.com';

    /** @private {boolean} */
    this.devMode_ = false;

    /** @private {string} */
    this.hostUrl_ = window.location.href;

    /** @private {Deferred} */
    this.initializedDeferred_ = new Deferred();

    /** @private {boolean} */
    this.isInitialized_ = false;
  }

  /**
   * @param {Object} config
   * @return {string}
   * */
  initializeConfigs(config) {
    // If somehow there are multiple config elements, the first config element would be used and the rest would be ignored.
    if (this.isInitialized_) {
      return;
    }

    if (!hasOwn(config, 'projectId')) {
      throw new Error('Project id is required to embed assist.js.');
    }
    this.projectId_ = config.projectId;

    if (hasOwn(config, 'assistjsServer')) {
      this.assistjsServer_ = config.assistjsServer;
    }
    if (hasOwn(config, 'devMode')) {
      this.devMode_ = config.devMode;
    }
    if (hasOwn(config, 'hostUrl')) {
      this.hostUrl_ = config.hostUrl;
    }
    this.isInitialized_ = true;
    this.initializedDeferred_.resolve();
  }

  /**
   * @param {string} widgetName
   * @return {Promise<string>}
   */
  getWidgetIframeUrl(widgetName) {
    return this.initializedDeferred_.promise.then(() => {
      return `${this.assistjsServer_}/assist/${widgetName}?origin=${origin}&projectId=${this.projectId_}&dev=${this.devMode_}&hostUrl=${this.hostUrl_}`;
    });
  }

  /**
   * @return {string}
   */
  getAssistjsServer() {
    return this.assistjsServer_;
  }
}
