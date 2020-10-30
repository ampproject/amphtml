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
import {AnalyticsVariable, getVariableService} from './variable-service';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';

/** @type {string} */
const TAG = 'amp-story-viewer-messaging-handler';

/** @enum {number} */
const DataSources = {
  STORE_SERVICE: 0,
  VARIABLE_SERVICE: 2,
};

/**
 * @typedef {{
 *   dataSource: !DataSources,
 *   property: (!StateProperty|!AnalyticsVariable)
 * }}
 */
let GetStateConfigurationDef;

/** @enum {!GetStateConfigurationDef} */
const GET_STATE_CONFIGURATIONS = {
  'CURRENT_PAGE_ID': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.CURRENT_PAGE_ID,
  },
  'EDUCATION_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.EDUCATION_STATE,
  },
  'MUTED_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.MUTED_STATE,
  },
  'PAGE_ATTACHMENT_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.PAGE_ATTACHMENT_STATE,
  },
  'PAGE_IDS': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.PAGE_IDS,
  },
  'STORY_PROGRESS': {
    dataSource: DataSources.VARIABLE_SERVICE,
    property: AnalyticsVariable.STORY_PROGRESS,
  },
};

/** @typedef {{action: !Action, isValueValid: function(*):boolean}} */
let SetStateConfigurationDef;

/** @enum {!SetStateConfigurationDef} */
const SET_STATE_CONFIGURATIONS = {
  'MUTED_STATE': {
    action: Action.TOGGLE_MUTED,
    isValueValid: (value) => typeof value === 'boolean',
  },
  'CURRENT_PAGE_ID': {
    action: Action.CHANGE_PAGE,
    isValueValid: ({id, index}) =>
      typeof id === 'string' && typeof index === 'number',
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

    /** @private @const {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(win);

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /**
   * @public
   */
  startListening() {
    this.viewer_.onMessageRespond('getDocumentState', (data) =>
      this.onGetDocumentState_(data)
    );
    this.viewer_.onMessage('onDocumentState', (data) =>
      this.onOnDocumentState_(data)
    );
    this.viewer_.onMessageRespond('setDocumentState', (data) =>
      this.onSetDocumentState_(data)
    );
    this.viewer_.onMessageRespond('customDocumentUI', (data) =>
      this.onCustomDocumentUI_(data)
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

    let value;

    switch (config.dataSource) {
      case DataSources.STORE_SERVICE:
        value = this.storeService_.get(config.property);
        break;
      case DataSources.VARIABLE_SERVICE:
        value = this.variableService_.get()[config.property];
        break;
      default:
        dev().error(TAG, 'Unknown data source %s.', config.dataSource);
        break;
    }

    return Promise.resolve({state, value});
  }

  /**
   * Handles 'onDocumentState' viewer messages.
   * @param {!Object=} data
   * @private
   */
  onOnDocumentState_(data = {}) {
    const {state} = data;
    const config = GET_STATE_CONFIGURATIONS[state];

    if (!config) {
      user().error(TAG, `Invalid 'state' parameter`);
      return;
    }

    this.storeService_.subscribe(config.property, (value) => {
      this.viewer_.sendMessage(
        'documentStateUpdate',
        dict({'state': state, 'value': value})
      );
    });
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

  /**
   * Handles 'customDocumentUI' viewer messages.
   * @param {!Object} data
   * @private
   */
  onCustomDocumentUI_(data) {
    this.storeService_.dispatch(
      Action.SET_VIEWER_CUSTOM_CONTROLS,
      data.controls
    );
  }
}
