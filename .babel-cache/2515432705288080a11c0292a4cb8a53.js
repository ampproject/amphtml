function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
getStoreService } from "./amp-story-store-service";

import { AnalyticsVariable, getVariableService } from "./variable-service";
import { dev, user } from "../../../src/log";
import { dict } from "../../../src/core/types/object";

/** @type {string} */
var TAG = 'amp-story-viewer-messaging-handler';

/** @enum {number} */
var DataSources = {
  STORE_SERVICE: 0,
  VARIABLE_SERVICE: 2 };


/**
 * @typedef {{
 *   dataSource: !DataSources,
 *   property: (!StateProperty|!AnalyticsVariable)
 * }}
 */
var GetStateConfigurationDef;

/** @enum {!GetStateConfigurationDef} */
var GET_STATE_CONFIGURATIONS = {
  'CURRENT_PAGE_ID': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.CURRENT_PAGE_ID },

  'EDUCATION_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.EDUCATION_STATE },

  'MUTED_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.MUTED_STATE },

  'PAGE_ATTACHMENT_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.PAGE_ATTACHMENT_STATE },

  'UI_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.UI_STATE },

  'STORY_PROGRESS': {
    dataSource: DataSources.VARIABLE_SERVICE,
    property: AnalyticsVariable.STORY_PROGRESS } };



/** @typedef {{action: !Action, isValueValid: function(*):boolean}} */
var SetStateConfigurationDef;

/** @enum {!SetStateConfigurationDef} */
var SET_STATE_CONFIGURATIONS = {
  'MUTED_STATE': {
    action: Action.TOGGLE_MUTED,
    isValueValid: function isValueValid(value) {return typeof value === 'boolean';} } };



/**
 * Viewer messaging handler.
 */
export var AmpStoryViewerMessagingHandler = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   */
  function AmpStoryViewerMessagingHandler(win, viewer) {_classCallCheck(this, AmpStoryViewerMessagingHandler);
    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private @const {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(win);

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /**
   * @public
   */_createClass(AmpStoryViewerMessagingHandler, [{ key: "startListening", value:
    function startListening() {var _this = this;
      this.viewer_.onMessageRespond('getDocumentState', function (data) {return (
          _this.onGetDocumentState_(data));});

      this.viewer_.onMessage('onDocumentState', function (data) {return (
          _this.onOnDocumentState_(data));});

      this.viewer_.onMessageRespond('setDocumentState', function (data) {return (
          _this.onSetDocumentState_(data));});

      this.viewer_.onMessageRespond('customDocumentUI', function (data) {return (
          _this.onCustomDocumentUI_(data));});

    }

    /**
     * @param {string} eventType
     * @param {?JsonObject|string|undefined} data
     * @param {boolean=} cancelUnsent
     */ }, { key: "send", value:
    function send(eventType, data) {var cancelUnsent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.viewer_.sendMessage(eventType, data, cancelUnsent);
    }

    /**
     * Handles 'getDocumentState' viewer messages.
     * @param {!Object=} data
     * @return {!Promise}
     * @private
     */ }, { key: "onGetDocumentState_", value:
    function onGetDocumentState_() {var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var state = data.state;
      var config = GET_STATE_CONFIGURATIONS[state];

      if (!config) {
        return Promise.reject("Invalid 'state' parameter");
      }

      var value;

      switch (config.dataSource) {
        case DataSources.STORE_SERVICE:
          value = this.storeService_.get(config.property);
          break;
        case DataSources.VARIABLE_SERVICE:
          value = this.variableService_.get()[config.property];
          break;
        default:
          dev().error(TAG, 'Unknown data source %s.', config.dataSource);
          break;}


      return Promise.resolve({ state: state, value: value });
    }

    /**
     * Handles 'onDocumentState' viewer messages.
     * @param {!Object=} data
     * @private
     */ }, { key: "onOnDocumentState_", value:
    function onOnDocumentState_() {var _this2 = this;var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var state = data.state;
      var config = GET_STATE_CONFIGURATIONS[state];

      if (!config) {
        user().error(TAG, "Invalid 'state' parameter");
        return;
      }

      this.storeService_.subscribe(config.property, function (value) {
        _this2.viewer_.sendMessage(
        'documentStateUpdate',
        dict({ 'state': state, 'value': value }));

      });
    }

    /**
     * Handles 'setDocumentState' viewer messages.
     * @param {!Object=} data
     * @return {!Promise<!Object|undefined>}
     * @private
     */ }, { key: "onSetDocumentState_", value:
    function onSetDocumentState_() {var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var state = data.state,value = data.value;
      var config = SET_STATE_CONFIGURATIONS[state];

      if (!config) {
        return Promise.reject("Invalid 'state' parameter");
      }

      if (!config.isValueValid(value)) {
        return Promise.reject("Invalid 'value' parameter");
      }

      this.storeService_.dispatch(config.action, value);

      return Promise.resolve({ state: state, value: value });
    }

    /**
     * Handles 'customDocumentUI' viewer messages.
     * @param {!Object} data
     * @private
     */ }, { key: "onCustomDocumentUI_", value:
    function onCustomDocumentUI_(data) {
      this.storeService_.dispatch(
      Action.SET_VIEWER_CUSTOM_CONTROLS,
      data.controls);

    } }]);return AmpStoryViewerMessagingHandler;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-viewer-messaging-handler.js