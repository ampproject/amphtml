/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';

/** @typedef {{property: !StateProperty}} */
let GetStateConfigurationDef;

// TODO(#26020): implement and allow retrieving PAGE_ATTACHMENT_STATE.
// TODO(gmajoulet): implement and allow retrieving STORY_PROGRESS.
/** @enum {!GetStateConfigurationDef} */
const GET_STATE_CONFIGURATIONS = {
  'CURRENT_PAGE_ID': {
    property: StateProperty.CURRENT_PAGE_ID,
  },
  'MUTED_STATE': {
    property: StateProperty.MUTED_STATE,
  },
};

/** @typedef {{action: !Action, isValueValid: function(*):boolean}} */
let SetStateConfigurationDef;

/** @enum {!SetStateConfigurationDef} */
const SET_STATE_CONFIGURATIONS = {
  'MUTED_STATE': {
    action: Action.TOGGLE_MUTED,
    isValueValid: value => typeof value === 'boolean',
  },
};

/**
 * Viewer messaging handler.
 */
export class AmpStoryViewerMessagingHandler {
  /**
   * @param {!Window} win
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   */
  constructor(win, viewer) {
    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /**
   * @public
   */
  startListening() {
    this.viewer_.onMessageRespond('getDocumentState', data =>
      this.onGetDocumentState_(data)
    );
    this.viewer_.onMessageRespond('setDocumentState', data =>
      this.onSetDocumentState_(data)
    );
  }

  /**
   * @param {string} eventType
   * @param {?JsonObject|string|undefined} data
   * @param {boolean=} cancelUnsent
   */
  send(eventType, data, cancelUnsent = false) {
    this.viewer_.sendMessage(eventType, data, cancelUnsent);
  }

  /**
   * Handles 'getDocumentState' viewer messages.
   * @param {!Object=} data
   * @return {!Promise}
   * @private
   */
  onGetDocumentState_(data = {}) {
    const {state} = data;
    const config = GET_STATE_CONFIGURATIONS[state];

    if (!config) {
      return Promise.reject(`Invalid 'state' parameter`);
    }

    const value = this.storeService_.get(config.property);

    return Promise.resolve({state, value});
  }

  /**
   * Handles 'setDocumentState' viewer messages.
   * @param {!Object=} data
   * @return {!Promise<!Object|undefined>}
   * @private
   */
  onSetDocumentState_(data = {}) {
    const {state, value} = data;
    const config = SET_STATE_CONFIGURATIONS[state];

    if (!config) {
      return Promise.reject(`Invalid 'state' parameter`);
    }

    if (!config.isValueValid(value)) {
      return Promise.reject(`Invalid 'value' parameter`);
    }

    this.storeService_.dispatch(config.action, value);

    return Promise.resolve({state, value});
  }
}
