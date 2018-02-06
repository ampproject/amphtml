/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {CONFIGURATION_EVENT, ORIGIN, SHARE_EVENT} from './constants';
import {getData} from '../../../src/event-helper';
import {isObject} from '../../../src/types';
import {startsWith} from '../../../src/string';

import {tryParseJson} from '../../../src/json';

export class PostMessageDispatcher {
  constructor() {
    this.listeners_ = {};
  }

  on(eventType, listener) {
    if (!this.listeners_[eventType]) {
      this.listeners_[eventType] = [];
    }
    this.listeners_[eventType].push(listener);
  }

  /** @private */
  emit_(eventType, eventData) {
    if (!this.listeners_[eventType]) {
      return;
    }
    this.listeners_[eventType].forEach(listener => listener(eventData));
  }

  /**
   * Utility method to parse out the data from the supplied `postMessage` event.
   * @private
   */
  getMessageData_(event) {
    const data = getData(event);

    if (isObject(data)) {
      return data;
    }

    if (typeof data === 'string' && startsWith(data, '{')) {
      return tryParseJson(data);
    }

    return undefined;
  }

  /**
   * Handles messages posted from amp-addthis iframes, ensuring the correct origin, etc.
   */
  handleAddThisMessage(event) {
    if (event.origin !== ORIGIN || !getData(event)) {
      return;
    }

    const data = this.getMessageData_(event) || {};

    switch (data.event) {
      case CONFIGURATION_EVENT: {
        this.emit_(
            CONFIGURATION_EVENT,
            Object.assign({}, data, {source: event.source})
        );
        break;
      }
      case SHARE_EVENT: {
        this.emit_(SHARE_EVENT, data);
        break;
      }
    }
  }
}
