var _stateComparisonFunct;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
import { EmbedMode, parseEmbedMode } from "./embed-mode";
import { Observable } from "../../../src/core/data-structures/observable";
import { Services } from "../../../src/service";
import { deepEquals } from "../../../src/core/types/object/json";
import { dev } from "../../../src/log";
import { hasOwn } from "../../../src/core/types/object";
import { registerServiceBuilder } from "../../../src/service-helpers";

/** @type {string} */
var TAG = 'amp-story';

/**
 * Util function to retrieve the store service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @return {!AmpStoryStoreService}
 */
export var getStoreService = function getStoreService(win) {
  var service = Services.storyStoreService(win);

  if (!service) {
    service = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return service;
    });
  }

  return service;
};

/**
 * Different UI experiences to display the story.
 * @const @enum {number}
 */
export var UIType = {
  MOBILE: 0,
  DESKTOP_PANELS: 1,
  // Default desktop UI displaying previous and next pages.
  DESKTOP_FULLBLEED: 2,
  // Desktop UI if landscape mode is enabled.
  DESKTOP_ONE_PANEL: 4,
  // Desktop UI with one panel and space around story.
  VERTICAL: 3 // Vertical scrolling versions, for search engine bots indexing.

};

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
export var EmbeddedComponentState = {
  HIDDEN: 0,
  // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1,
  // Component has been clicked, a tooltip should be shown.
  EXPANDED: 2 // Component is in expanded mode.

};

/**
 * @typedef {{
 *    element: !Element,
 *    state: !EmbeddedComponentState,
 *    clientX: number,
 *    clientY: number,
 * }}
 */
export var InteractiveComponentDef;

/**
 * @typedef {{
 *    option: ?../../amp-story-interactive/0.1/amp-story-interactive-abstract.OptionConfigType,
 *    interactiveId: string,
 *    type: ../../amp-story-interactive/0.1/amp-story-interactive-abstract.InteractiveType
 * }}
 */
export var InteractiveReactData;

/**
 * @typedef {{
 *    canInsertAutomaticAd: boolean,
 *    canShowAudioUi: boolean,
 *    canShowNavigationOverlayHint: boolean,
 *    canShowPaginationButtons: boolean,
 *    canShowPreviousPageHelp: boolean,
 *    canShowSharingUis: boolean,
 *    canShowSystemLayerButtons: boolean,
 *    viewerCustomControls: !Array<!Object>,
 *    accessState: boolean,
 *    adState: boolean,
 *    pageAttachmentState: boolean,
 *    affiliateLinkState: !Element,
 *    desktopState: boolean,
 *    educationState: boolean,
 *    gyroscopeEnabledState: string,
 *    hasSidebarState: boolean,
 *    infoDialogState: boolean,
 *    interactiveEmbeddedComponentState: !InteractiveComponentDef,
 *    interactiveReactState: !Map<string, !InteractiveReactData>,
 *    keyboardActiveState: boolean,
 *    mutedState: boolean,
 *    pageAudioState: boolean,
 *    pageHasElementsWithPlaybackState: boolean,
 *    panningMediaState: !Map<string, ../../amp-story-panning-media/0.1/amp-story-panning-media.panningMediaPositionDef> ,
 *    pausedState: boolean,
 *    previewState: boolean,
 *    rtlState: boolean,
 *    shareMenuState: boolean,
 *    sidebarState: boolean,
 *    storyHasAudioState: boolean,
 *    storyHasPlaybackUiState: boolean,
 *    storyHasBackgroundAudioState: boolean,
 *    supportedBrowserState: boolean,
 *    systemUiIsVisibleState: boolean,
 *    uiState: !UIType,
 *    viewportWarningState: boolean,
 *    actionsAllowlist: !Array<{tagOrTarget: string, method: string}>,
 *    consentId: ?string,
 *    currentPageId: string,
 *    currentPageIndex: number,
 *    pageIds: !Array<string>,
 *    newPageAvailableId: string,
 *    pageSize: {width: number, height: number},
 * }}
 */
export var State;

/** @const @enum {string} */
export var StateProperty = {
  // Embed options.
  CAN_INSERT_AUTOMATIC_AD: 'canInsertAutomaticAd',
  CAN_SHOW_AUDIO_UI: 'canShowAudioUi',
  CAN_SHOW_NAVIGATION_OVERLAY_HINT: 'canShowNavigationOverlayHint',
  CAN_SHOW_PAGINATION_BUTTONS: 'canShowPaginationButtons',
  CAN_SHOW_PREVIOUS_PAGE_HELP: 'canShowPreviousPageHelp',
  CAN_SHOW_SHARING_UIS: 'canShowSharingUis',
  CAN_SHOW_SYSTEM_LAYER_BUTTONS: 'canShowSystemLayerButtons',
  VIEWER_CUSTOM_CONTROLS: 'viewerCustomControls',
  // App States.
  ACCESS_STATE: 'accessState',
  // amp-access paywall.
  AD_STATE: 'adState',
  PAGE_ATTACHMENT_STATE: 'pageAttachmentState',
  AFFILIATE_LINK_STATE: 'affiliateLinkState',
  DESKTOP_STATE: 'desktopState',
  EDUCATION_STATE: 'educationState',
  GYROSCOPE_PERMISSION_STATE: 'gyroscopePermissionState',
  HAS_SIDEBAR_STATE: 'hasSidebarState',
  INFO_DIALOG_STATE: 'infoDialogState',
  INTERACTIVE_COMPONENT_STATE: 'interactiveEmbeddedComponentState',
  // State of interactive components (polls, quizzes) on the story.
  INTERACTIVE_REACT_STATE: 'interactiveReactState',
  KEYBOARD_ACTIVE_STATE: 'keyboardActiveState',
  MUTED_STATE: 'mutedState',
  PAGE_HAS_AUDIO_STATE: 'pageAudioState',
  PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE: 'pageHasElementsWithPlaybackState',
  PANNING_MEDIA_STATE: 'panningMediaState',
  PAUSED_STATE: 'pausedState',
  // Story preview state.
  PREVIEW_STATE: 'previewState',
  RTL_STATE: 'rtlState',
  SHARE_MENU_STATE: 'shareMenuState',
  SIDEBAR_STATE: 'sidebarState',
  SUPPORTED_BROWSER_STATE: 'supportedBrowserState',
  // Any page has audio, or amp-story has a `background-audio` attribute.
  STORY_HAS_AUDIO_STATE: 'storyHasAudioState',
  // amp-story has a `background-audio` attribute.
  STORY_HAS_BACKGROUND_AUDIO_STATE: 'storyHasBackgroundAudioState',
  // Any page has elements with playback.
  STORY_HAS_PLAYBACK_UI_STATE: 'storyHasPlaybackUiState',
  SYSTEM_UI_IS_VISIBLE_STATE: 'systemUiIsVisibleState',
  UI_STATE: 'uiState',
  VIEWPORT_WARNING_STATE: 'viewportWarningState',
  // App data.
  ACTIONS_ALLOWLIST: 'actionsAllowlist',
  CONSENT_ID: 'consentId',
  CURRENT_PAGE_ID: 'currentPageId',
  CURRENT_PAGE_INDEX: 'currentPageIndex',
  ADVANCEMENT_MODE: 'advancementMode',
  NAVIGATION_PATH: 'navigationPath',
  NEW_PAGE_AVAILABLE_ID: 'newPageAvailableId',
  PAGE_IDS: 'pageIds',
  PAGE_SIZE: 'pageSize'
};

/** @const @enum {string} */
export var Action = {
  ADD_INTERACTIVE_REACT: 'addInteractiveReact',
  ADD_TO_ACTIONS_ALLOWLIST: 'addToActionsAllowlist',
  CHANGE_PAGE: 'setCurrentPageId',
  SET_CONSENT_ID: 'setConsentId',
  SET_ADVANCEMENT_MODE: 'setAdvancementMode',
  SET_NAVIGATION_PATH: 'setNavigationPath',
  SET_PAGE_IDS: 'setPageIds',
  TOGGLE_ACCESS: 'toggleAccess',
  TOGGLE_AD: 'toggleAd',
  TOGGLE_AFFILIATE_LINK: 'toggleAffiliateLink',
  TOGGLE_EDUCATION: 'toggleEducation',
  TOGGLE_HAS_SIDEBAR: 'toggleHasSidebar',
  TOGGLE_INFO_DIALOG: 'toggleInfoDialog',
  TOGGLE_INTERACTIVE_COMPONENT: 'toggleInteractiveComponent',
  TOGGLE_KEYBOARD_ACTIVE_STATE: 'toggleKeyboardActiveState',
  TOGGLE_MUTED: 'toggleMuted',
  TOGGLE_PAGE_ATTACHMENT_STATE: 'togglePageAttachmentState',
  TOGGLE_PAGE_HAS_AUDIO: 'togglePageHasAudio',
  TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK: 'togglePageHasElementWithPlayblack',
  TOGGLE_PAUSED: 'togglePaused',
  TOGGLE_RTL: 'toggleRtl',
  TOGGLE_SHARE_MENU: 'toggleShareMenu',
  TOGGLE_SIDEBAR: 'toggleSidebar',
  TOGGLE_SUPPORTED_BROWSER: 'toggleSupportedBrowser',
  TOGGLE_STORY_HAS_AUDIO: 'toggleStoryHasAudio',
  TOGGLE_STORY_HAS_BACKGROUND_AUDIO: 'toggleStoryHasBackgroundAudio',
  TOGGLE_STORY_HAS_PLAYBACK_UI: 'toggleStoryHasPlaybackUi',
  TOGGLE_SYSTEM_UI_IS_VISIBLE: 'toggleSystemUiIsVisible',
  TOGGLE_UI: 'toggleUi',
  SET_GYROSCOPE_PERMISSION: 'setGyroscopePermission',
  TOGGLE_VIEWPORT_WARNING: 'toggleViewportWarning',
  ADD_NEW_PAGE_ID: 'addNewPageId',
  SET_PAGE_SIZE: 'updatePageSize',
  ADD_PANNING_MEDIA_STATE: 'addPanningMediaState',
  SET_VIEWER_CUSTOM_CONTROLS: 'setCustomControls'
};

/**
 * Functions to compare a data structure from the previous to the new state and
 * detect a mutation, when a simple equality test would not work.
 * @private @const {!Object<string, !function(*, *):boolean>}
 */
var stateComparisonFunctions = (_stateComparisonFunct = {}, _stateComparisonFunct[StateProperty.ACTIONS_ALLOWLIST] = function (old, curr) {
  return old.length !== curr.length;
}, _stateComparisonFunct[StateProperty.INTERACTIVE_COMPONENT_STATE] =
/**
 * @param {InteractiveComponentDef} old
 * @param {InteractiveComponentDef} curr
 */
function (old, curr) {
  return old.element !== curr.element || old.state !== curr.state;
}, _stateComparisonFunct[StateProperty.NAVIGATION_PATH] = function (old, curr) {
  return old.length !== curr.length;
}, _stateComparisonFunct[StateProperty.PAGE_IDS] = function (old, curr) {
  return old.length !== curr.length;
}, _stateComparisonFunct[StateProperty.PAGE_SIZE] = function (old, curr) {
  return old === null || curr === null || old.width !== curr.width || old.height !== curr.height;
}, _stateComparisonFunct[StateProperty.PANNING_MEDIA_STATE] = function (old, curr) {
  return old === null || curr === null || !deepEquals(old, curr, 2);
}, _stateComparisonFunct[StateProperty.INTERACTIVE_REACT_STATE] = function (old, curr) {
  return !deepEquals(old, curr, 3);
}, _stateComparisonFunct);

/**
 * Returns the new sate.
 * @param  {!State} state Immutable state
 * @param  {!Action} action
 * @param  {*} data
 * @return {!State} new state
 */
var actions = function actions(state, action, data) {
  var _extends2, _extends3, _extends4, _extends5, _extends6, _extends7, _extends8, _extends9, _extends10, _extends11, _extends12, _extends13, _extends14, _extends15, _extends16, _extends17, _extends18, _extends19, _extends20, _extends21, _extends22, _extends23, _extends24, _extends25, _extends26, _extends27, _extends28, _extends29, _extends30, _extends31, _extends32, _extends33, _extends34, _extends35, _extends36, _extends37;

  switch (action) {
    case Action.ADD_INTERACTIVE_REACT:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends3 = {}, _extends3[StateProperty.INTERACTIVE_REACT_STATE] = _extends({}, state[StateProperty.INTERACTIVE_REACT_STATE], (_extends2 = {}, _extends2[data['interactiveId']] = data, _extends2)), _extends3))
      );

    case Action.ADD_NEW_PAGE_ID:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends4 = {}, _extends4[StateProperty.NEW_PAGE_AVAILABLE_ID] = data, _extends4))
      );

    case Action.ADD_PANNING_MEDIA_STATE:
      var updatedState = _extends({}, state[StateProperty.PANNING_MEDIA_STATE], data);

      return (
        /** @type {!State} */
        _extends({}, state, (_extends5 = {}, _extends5[StateProperty.PANNING_MEDIA_STATE] = updatedState, _extends5))
      );

    case Action.ADD_TO_ACTIONS_ALLOWLIST:
      var newActionsAllowlist = [].concat(state[StateProperty.ACTIONS_ALLOWLIST], data);
      return (
        /** @type {!State} */
        _extends({}, state, (_extends6 = {}, _extends6[StateProperty.ACTIONS_ALLOWLIST] = newActionsAllowlist, _extends6))
      );
    // Triggers the amp-acess paywall.

    case Action.TOGGLE_ACCESS:
      // Don't change the PAUSED_STATE if ACCESS_STATE is not changed.
      if (state[StateProperty.ACCESS_STATE] === data) {
        return state;
      }

      return (
        /** @type {!State} */
        _extends({}, state, (_extends7 = {}, _extends7[StateProperty.ACCESS_STATE] = !!data, _extends7[StateProperty.PAUSED_STATE] = !!data, _extends7))
      );

    case Action.TOGGLE_PAGE_ATTACHMENT_STATE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends8 = {}, _extends8[StateProperty.PAGE_ATTACHMENT_STATE] = !!data, _extends8))
      );
    // Triggers the ad UI.

    case Action.TOGGLE_AD:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends9 = {}, _extends9[StateProperty.AD_STATE] = !!data, _extends9))
      );
    // Expands or collapses the affiliate link.

    case Action.TOGGLE_AFFILIATE_LINK:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends10 = {}, _extends10[StateProperty.AFFILIATE_LINK_STATE] = data, _extends10))
      );

    case Action.TOGGLE_EDUCATION:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends11 = {}, _extends11[StateProperty.EDUCATION_STATE] = !!data, _extends11))
      );

    case Action.TOGGLE_INTERACTIVE_COMPONENT:
      data =
      /** @type {InteractiveComponentDef} */
      data;
      return (
        /** @type {!State} */
        _extends({}, state, (_extends12 = {}, _extends12[StateProperty.PAUSED_STATE] = data.state === EmbeddedComponentState.EXPANDED || data.state === EmbeddedComponentState.FOCUSED, _extends12[StateProperty.SYSTEM_UI_IS_VISIBLE_STATE] = data.state !== EmbeddedComponentState.EXPANDED || state.uiState === UIType.DESKTOP_PANELS, _extends12[StateProperty.INTERACTIVE_COMPONENT_STATE] = data, _extends12))
      );
    // Shows or hides the info dialog.

    case Action.TOGGLE_INFO_DIALOG:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends13 = {}, _extends13[StateProperty.INFO_DIALOG_STATE] = !!data, _extends13[StateProperty.PAUSED_STATE] = !!data, _extends13))
      );
    // Shows or hides the audio controls.

    case Action.TOGGLE_STORY_HAS_AUDIO:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends14 = {}, _extends14[StateProperty.STORY_HAS_AUDIO_STATE] = !!data, _extends14))
      );

    case Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends15 = {}, _extends15[StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE] = !!data, _extends15))
      );
    // Shows or hides the play/pause controls.

    case Action.TOGGLE_STORY_HAS_PLAYBACK_UI:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends16 = {}, _extends16[StateProperty.STORY_HAS_PLAYBACK_UI_STATE] = !!data, _extends16))
      );
    // Mutes or unmutes the story media.

    case Action.TOGGLE_MUTED:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends17 = {}, _extends17[StateProperty.MUTED_STATE] = !!data, _extends17))
      );

    case Action.TOGGLE_PAGE_HAS_AUDIO:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends18 = {}, _extends18[StateProperty.PAGE_HAS_AUDIO_STATE] = !!data, _extends18))
      );

    case Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends19 = {}, _extends19[StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE] = !!data, _extends19))
      );

    case Action.TOGGLE_PAUSED:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends20 = {}, _extends20[StateProperty.PAUSED_STATE] = !!data, _extends20))
      );

    case Action.TOGGLE_RTL:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends21 = {}, _extends21[StateProperty.RTL_STATE] = !!data, _extends21))
      );

    case Action.TOGGLE_KEYBOARD_ACTIVE_STATE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends22 = {}, _extends22[StateProperty.KEYBOARD_ACTIVE_STATE] = !!data, _extends22))
      );

    case Action.TOGGLE_SIDEBAR:
      // Don't change the PAUSED_STATE if SIDEBAR_STATE is not changed.
      if (state[StateProperty.SIDEBAR_STATE] === data) {
        return state;
      }

      return (
        /** @type {!State} */
        _extends({}, state, (_extends23 = {}, _extends23[StateProperty.PAUSED_STATE] = !!data, _extends23[StateProperty.SIDEBAR_STATE] = !!data, _extends23))
      );

    case Action.TOGGLE_HAS_SIDEBAR:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends24 = {}, _extends24[StateProperty.HAS_SIDEBAR_STATE] = !!data, _extends24))
      );

    case Action.TOGGLE_SUPPORTED_BROWSER:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends25 = {}, _extends25[StateProperty.SUPPORTED_BROWSER_STATE] = !!data, _extends25))
      );

    case Action.TOGGLE_SHARE_MENU:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends26 = {}, _extends26[StateProperty.PAUSED_STATE] = !!data, _extends26[StateProperty.SHARE_MENU_STATE] = !!data, _extends26))
      );

    case Action.TOGGLE_SYSTEM_UI_IS_VISIBLE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends27 = {}, _extends27[StateProperty.SYSTEM_UI_IS_VISIBLE_STATE] = !!data, _extends27))
      );

    case Action.TOGGLE_UI:
      if (state[StateProperty.UI_STATE] === UIType.VERTICAL && data !== UIType.VERTICAL) {
        dev().error(TAG, 'Cannot switch away from UIType.VERTICAL');
        return state;
      }

      return (
        /** @type {!State} */
        _extends({}, state, (_extends28 = {}, _extends28[StateProperty.DESKTOP_STATE] = data === UIType.DESKTOP_PANELS, _extends28[StateProperty.UI_STATE] = data, _extends28))
      );

    case Action.SET_GYROSCOPE_PERMISSION:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends29 = {}, _extends29[StateProperty.GYROSCOPE_PERMISSION_STATE] = data, _extends29))
      );

    case Action.TOGGLE_VIEWPORT_WARNING:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends30 = {}, _extends30[StateProperty.VIEWPORT_WARNING_STATE] = !!data, _extends30))
      );

    case Action.SET_CONSENT_ID:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends31 = {}, _extends31[StateProperty.CONSENT_ID] = data, _extends31))
      );

    case Action.CHANGE_PAGE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends32 = {}, _extends32[StateProperty.CURRENT_PAGE_ID] = data.id, _extends32[StateProperty.CURRENT_PAGE_INDEX] = data.index, _extends32))
      );

    case Action.SET_ADVANCEMENT_MODE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends33 = {}, _extends33[StateProperty.ADVANCEMENT_MODE] = data, _extends33))
      );

    case Action.SET_NAVIGATION_PATH:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends34 = {}, _extends34[StateProperty.NAVIGATION_PATH] = data, _extends34))
      );

    case Action.SET_PAGE_IDS:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends35 = {}, _extends35[StateProperty.PAGE_IDS] = data, _extends35))
      );

    case Action.SET_PAGE_SIZE:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends36 = {}, _extends36[StateProperty.PAGE_SIZE] = data, _extends36))
      );

    case Action.SET_VIEWER_CUSTOM_CONTROLS:
      return (
        /** @type {!State} */
        _extends({}, state, (_extends37 = {}, _extends37[StateProperty.VIEWER_CUSTOM_CONTROLS] = data, _extends37))
      );

    default:
      dev().error(TAG, 'Unknown action %s.', action);
      return state;
  }
};

/**
 * Store service.
 */
export var AmpStoryStoreService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function AmpStoryStoreService(win) {
    _classCallCheck(this, AmpStoryStoreService);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!Object<string, !Observable>} */
    this.listeners_ = {};

    /** @private {!State} */
    this.state_ =
    /** @type {!State} */
    _extends({}, this.getDefaultState_(), this.getEmbedOverrides_());
  }

  /**
   * Retrieves a state property.
   * @param  {string} key Property to retrieve from the state.
   * @return {*}
   */
  _createClass(AmpStoryStoreService, [{
    key: "get",
    value: function get(key) {
      if (!hasOwn(this.state_, key)) {
        dev().error(TAG, 'Unknown state %s.', key);
        return;
      }

      return this.state_[key];
    }
    /**
     * Subscribes to a state property mutations.
     * @param  {string} key
     * @param  {!Function} listener
     * @param  {boolean=} callToInitialize Whether the listener should be
     *                                     triggered with current value.
     */

  }, {
    key: "subscribe",
    value: function subscribe(key, listener, callToInitialize) {
      if (callToInitialize === void 0) {
        callToInitialize = false;
      }

      if (!hasOwn(this.state_, key)) {
        dev().error(TAG, "Can't subscribe to unknown state %s.", key);
        return;
      }

      if (!this.listeners_[key]) {
        this.listeners_[key] = new Observable();
      }

      this.listeners_[key].add(listener);

      if (callToInitialize) {
        listener(this.get(key));
      }
    }
    /**
     * Dispatches an action and triggers the listeners for the updated state
     * properties.
     * @param  {!Action} action
     * @param  {*} data
     */

  }, {
    key: "dispatch",
    value: function dispatch(action, data) {
      var _this = this;

      var oldState = _extends({}, this.state_);

      this.state_ = actions(this.state_, action, data);
      var comparisonFn;
      Object.keys(this.listeners_).forEach(function (key) {
        comparisonFn = stateComparisonFunctions[key];

        if (comparisonFn ? comparisonFn(oldState[key], _this.state_[key]) : oldState[key] !== _this.state_[key]) {
          _this.listeners_[key].fire(_this.state_[key]);
        }
      });
    }
    /**
     * Retrieves the default state, that could be overriden by an embed mode.
     * @return {!State}
     * @private
     */

  }, {
    key: "getDefaultState_",
    value: function getDefaultState_() {
      var _ref;

      // Compiler won't resolve the object keys and trigger an error for missing
      // properties, so we have to force the type.
      return _ref = {}, _ref[StateProperty.CAN_INSERT_AUTOMATIC_AD] = true, _ref[StateProperty.CAN_SHOW_AUDIO_UI] = true, _ref[StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT] = true, _ref[StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP] = true, _ref[StateProperty.CAN_SHOW_PAGINATION_BUTTONS] = true, _ref[StateProperty.CAN_SHOW_SHARING_UIS] = true, _ref[StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS] = true, _ref[StateProperty.VIEWER_CUSTOM_CONTROLS] = [], _ref[StateProperty.ACCESS_STATE] = false, _ref[StateProperty.AD_STATE] = false, _ref[StateProperty.AFFILIATE_LINK_STATE] = null, _ref[StateProperty.DESKTOP_STATE] = false, _ref[StateProperty.EDUCATION_STATE] = false, _ref[StateProperty.GYROSCOPE_PERMISSION_STATE] = '', _ref[StateProperty.HAS_SIDEBAR_STATE] = false, _ref[StateProperty.INFO_DIALOG_STATE] = false, _ref[StateProperty.INTERACTIVE_COMPONENT_STATE] = {
        state: EmbeddedComponentState.HIDDEN
      }, _ref[StateProperty.INTERACTIVE_REACT_STATE] = {}, _ref[StateProperty.KEYBOARD_ACTIVE_STATE] = false, _ref[StateProperty.MUTED_STATE] = true, _ref[StateProperty.PAGE_ATTACHMENT_STATE] = false, _ref[StateProperty.PAGE_HAS_AUDIO_STATE] = false, _ref[StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE] = false, _ref[StateProperty.PANNING_MEDIA_STATE] = {}, _ref[StateProperty.PAUSED_STATE] = false, _ref[StateProperty.RTL_STATE] = false, _ref[StateProperty.SHARE_MENU_STATE] = false, _ref[StateProperty.SIDEBAR_STATE] = false, _ref[StateProperty.SUPPORTED_BROWSER_STATE] = true, _ref[StateProperty.STORY_HAS_AUDIO_STATE] = false, _ref[StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE] = false, _ref[StateProperty.STORY_HAS_PLAYBACK_UI_STATE] = false, _ref[StateProperty.SYSTEM_UI_IS_VISIBLE_STATE] = true, _ref[StateProperty.UI_STATE] = UIType.MOBILE, _ref[StateProperty.VIEWPORT_WARNING_STATE] = false, _ref[StateProperty.ACTIONS_ALLOWLIST] = [], _ref[StateProperty.CONSENT_ID] = null, _ref[StateProperty.CURRENT_PAGE_ID] = '', _ref[StateProperty.CURRENT_PAGE_INDEX] = 0, _ref[StateProperty.ADVANCEMENT_MODE] = '', _ref[StateProperty.NEW_PAGE_AVAILABLE_ID] = '', _ref[StateProperty.NAVIGATION_PATH] = [], _ref[StateProperty.PAGE_IDS] = [], _ref[StateProperty.PAGE_SIZE] = null, _ref[StateProperty.PREVIEW_STATE] = false, _ref;
    } // @TODO(gmajoulet): These should get their own file if they start growing.

    /**
     * Retrieves the embed mode config, that will override the default state.
     * @return {!Object<StateProperty, *>} Partial state
     * @protected
     */

  }, {
    key: "getEmbedOverrides_",
    value: function getEmbedOverrides_() {
      var _ref2, _ref3, _ref4, _ref5;

      var embedMode = parseEmbedMode(this.win_.location.hash);

      switch (embedMode) {
        case EmbedMode.NAME_TBD:
          return _ref2 = {}, _ref2[StateProperty.CAN_INSERT_AUTOMATIC_AD] = false, _ref2[StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT] = false, _ref2[StateProperty.CAN_SHOW_PAGINATION_BUTTONS] = false, _ref2[StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP] = true, _ref2[StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS] = false, _ref2[StateProperty.MUTED_STATE] = false, _ref2;

        case EmbedMode.NO_SHARING:
          return _ref3 = {}, _ref3[StateProperty.CAN_SHOW_SHARING_UIS] = false, _ref3;

        case EmbedMode.PREVIEW:
          return _ref4 = {}, _ref4[StateProperty.PREVIEW_STATE] = true, _ref4[StateProperty.CAN_INSERT_AUTOMATIC_AD] = false, _ref4[StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT] = false, _ref4[StateProperty.CAN_SHOW_PAGINATION_BUTTONS] = false, _ref4[StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP] = false, _ref4[StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS] = false, _ref4;

        case EmbedMode.NO_SHARING_NOR_AUDIO_UI:
          return _ref5 = {}, _ref5[StateProperty.CAN_SHOW_AUDIO_UI] = false, _ref5[StateProperty.CAN_SHOW_SHARING_UIS] = false, _ref5;

        default:
          return {};
      }
    }
  }]);

  return AmpStoryStoreService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbIkVtYmVkTW9kZSIsInBhcnNlRW1iZWRNb2RlIiwiT2JzZXJ2YWJsZSIsIlNlcnZpY2VzIiwiZGVlcEVxdWFscyIsImRldiIsImhhc093biIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJUQUciLCJnZXRTdG9yZVNlcnZpY2UiLCJ3aW4iLCJzZXJ2aWNlIiwic3RvcnlTdG9yZVNlcnZpY2UiLCJBbXBTdG9yeVN0b3JlU2VydmljZSIsIlVJVHlwZSIsIk1PQklMRSIsIkRFU0tUT1BfUEFORUxTIiwiREVTS1RPUF9GVUxMQkxFRUQiLCJERVNLVE9QX09ORV9QQU5FTCIsIlZFUlRJQ0FMIiwiRW1iZWRkZWRDb21wb25lbnRTdGF0ZSIsIkhJRERFTiIsIkZPQ1VTRUQiLCJFWFBBTkRFRCIsIkludGVyYWN0aXZlQ29tcG9uZW50RGVmIiwiSW50ZXJhY3RpdmVSZWFjdERhdGEiLCJTdGF0ZSIsIlN0YXRlUHJvcGVydHkiLCJDQU5fSU5TRVJUX0FVVE9NQVRJQ19BRCIsIkNBTl9TSE9XX0FVRElPX1VJIiwiQ0FOX1NIT1dfTkFWSUdBVElPTl9PVkVSTEFZX0hJTlQiLCJDQU5fU0hPV19QQUdJTkFUSU9OX0JVVFRPTlMiLCJDQU5fU0hPV19QUkVWSU9VU19QQUdFX0hFTFAiLCJDQU5fU0hPV19TSEFSSU5HX1VJUyIsIkNBTl9TSE9XX1NZU1RFTV9MQVlFUl9CVVRUT05TIiwiVklFV0VSX0NVU1RPTV9DT05UUk9MUyIsIkFDQ0VTU19TVEFURSIsIkFEX1NUQVRFIiwiUEFHRV9BVFRBQ0hNRU5UX1NUQVRFIiwiQUZGSUxJQVRFX0xJTktfU1RBVEUiLCJERVNLVE9QX1NUQVRFIiwiRURVQ0FUSU9OX1NUQVRFIiwiR1lST1NDT1BFX1BFUk1JU1NJT05fU1RBVEUiLCJIQVNfU0lERUJBUl9TVEFURSIsIklORk9fRElBTE9HX1NUQVRFIiwiSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFIiwiSU5URVJBQ1RJVkVfUkVBQ1RfU1RBVEUiLCJLRVlCT0FSRF9BQ1RJVkVfU1RBVEUiLCJNVVRFRF9TVEFURSIsIlBBR0VfSEFTX0FVRElPX1NUQVRFIiwiUEFHRV9IQVNfRUxFTUVOVFNfV0lUSF9QTEFZQkFDS19TVEFURSIsIlBBTk5JTkdfTUVESUFfU1RBVEUiLCJQQVVTRURfU1RBVEUiLCJQUkVWSUVXX1NUQVRFIiwiUlRMX1NUQVRFIiwiU0hBUkVfTUVOVV9TVEFURSIsIlNJREVCQVJfU1RBVEUiLCJTVVBQT1JURURfQlJPV1NFUl9TVEFURSIsIlNUT1JZX0hBU19BVURJT19TVEFURSIsIlNUT1JZX0hBU19CQUNLR1JPVU5EX0FVRElPX1NUQVRFIiwiU1RPUllfSEFTX1BMQVlCQUNLX1VJX1NUQVRFIiwiU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEUiLCJVSV9TVEFURSIsIlZJRVdQT1JUX1dBUk5JTkdfU1RBVEUiLCJBQ1RJT05TX0FMTE9XTElTVCIsIkNPTlNFTlRfSUQiLCJDVVJSRU5UX1BBR0VfSUQiLCJDVVJSRU5UX1BBR0VfSU5ERVgiLCJBRFZBTkNFTUVOVF9NT0RFIiwiTkFWSUdBVElPTl9QQVRIIiwiTkVXX1BBR0VfQVZBSUxBQkxFX0lEIiwiUEFHRV9JRFMiLCJQQUdFX1NJWkUiLCJBY3Rpb24iLCJBRERfSU5URVJBQ1RJVkVfUkVBQ1QiLCJBRERfVE9fQUNUSU9OU19BTExPV0xJU1QiLCJDSEFOR0VfUEFHRSIsIlNFVF9DT05TRU5UX0lEIiwiU0VUX0FEVkFOQ0VNRU5UX01PREUiLCJTRVRfTkFWSUdBVElPTl9QQVRIIiwiU0VUX1BBR0VfSURTIiwiVE9HR0xFX0FDQ0VTUyIsIlRPR0dMRV9BRCIsIlRPR0dMRV9BRkZJTElBVEVfTElOSyIsIlRPR0dMRV9FRFVDQVRJT04iLCJUT0dHTEVfSEFTX1NJREVCQVIiLCJUT0dHTEVfSU5GT19ESUFMT0ciLCJUT0dHTEVfSU5URVJBQ1RJVkVfQ09NUE9ORU5UIiwiVE9HR0xFX0tFWUJPQVJEX0FDVElWRV9TVEFURSIsIlRPR0dMRV9NVVRFRCIsIlRPR0dMRV9QQUdFX0FUVEFDSE1FTlRfU1RBVEUiLCJUT0dHTEVfUEFHRV9IQVNfQVVESU8iLCJUT0dHTEVfUEFHRV9IQVNfRUxFTUVOVF9XSVRIX1BMQVlCQUNLIiwiVE9HR0xFX1BBVVNFRCIsIlRPR0dMRV9SVEwiLCJUT0dHTEVfU0hBUkVfTUVOVSIsIlRPR0dMRV9TSURFQkFSIiwiVE9HR0xFX1NVUFBPUlRFRF9CUk9XU0VSIiwiVE9HR0xFX1NUT1JZX0hBU19BVURJTyIsIlRPR0dMRV9TVE9SWV9IQVNfQkFDS0dST1VORF9BVURJTyIsIlRPR0dMRV9TVE9SWV9IQVNfUExBWUJBQ0tfVUkiLCJUT0dHTEVfU1lTVEVNX1VJX0lTX1ZJU0lCTEUiLCJUT0dHTEVfVUkiLCJTRVRfR1lST1NDT1BFX1BFUk1JU1NJT04iLCJUT0dHTEVfVklFV1BPUlRfV0FSTklORyIsIkFERF9ORVdfUEFHRV9JRCIsIlNFVF9QQUdFX1NJWkUiLCJBRERfUEFOTklOR19NRURJQV9TVEFURSIsIlNFVF9WSUVXRVJfQ1VTVE9NX0NPTlRST0xTIiwic3RhdGVDb21wYXJpc29uRnVuY3Rpb25zIiwib2xkIiwiY3VyciIsImxlbmd0aCIsImVsZW1lbnQiLCJzdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiYWN0aW9ucyIsImFjdGlvbiIsImRhdGEiLCJ1cGRhdGVkU3RhdGUiLCJuZXdBY3Rpb25zQWxsb3dsaXN0IiwiY29uY2F0IiwidWlTdGF0ZSIsImVycm9yIiwiaWQiLCJpbmRleCIsIndpbl8iLCJsaXN0ZW5lcnNfIiwic3RhdGVfIiwiZ2V0RGVmYXVsdFN0YXRlXyIsImdldEVtYmVkT3ZlcnJpZGVzXyIsImtleSIsImxpc3RlbmVyIiwiY2FsbFRvSW5pdGlhbGl6ZSIsImFkZCIsImdldCIsIm9sZFN0YXRlIiwiY29tcGFyaXNvbkZuIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJmaXJlIiwiZW1iZWRNb2RlIiwibG9jYXRpb24iLCJoYXNoIiwiTkFNRV9UQkQiLCJOT19TSEFSSU5HIiwiUFJFVklFVyIsIk5PX1NIQVJJTkdf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cUIsV0FOakIsSUFNK0IsS0FOL0I7O0FBUUYsYUFBS2hELFNBQVMsQ0FBQ21KLFVBQWY7QUFDRSxtQ0FDR3hILGFBQWEsQ0FBQ00sb0JBRGpCLElBQ3dDLEtBRHhDOztBQUdGLGFBQUtqQyxTQUFTLENBQUNvSixPQUFmO0FBQ0UsbUNBQ0d6SCxhQUFhLENBQUMwQixhQURqQixJQUNpQyxJQURqQyxRQUVHMUIsYUFBYSxDQUFDQyx1QkFGakIsSUFFMkMsS0FGM0MsUUFHR0QsYUFBYSxDQUFDRyxnQ0FIakIsSUFHb0QsS0FIcEQsUUFJR0gsYUFBYSxDQUFDSSwyQkFKakIsSUFJK0MsS0FKL0MsUUFLR0osYUFBYSxDQUFDSywyQkFMakIsSUFLK0MsS0FML0MsUUFNR0wsYUFBYSxDQUFDTyw2QkFOakIsSUFNaUQsS0FOakQ7O0FBUUYsYUFBS2xDLFNBQVMsQ0FBQ3FKLHVCQUFmO0FBQ0UsbUNBQ0cxSCxhQUFhLENBQUNFLGlCQURqQixJQUNxQyxLQURyQyxRQUVHRixhQUFhLENBQUNNLG9CQUZqQixJQUV3QyxLQUZ4Qzs7QUFJRjtBQUNFLGlCQUFPLEVBQVA7QUE3Qko7QUErQkQ7QUFoTEg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0VtYmVkTW9kZSwgcGFyc2VFbWJlZE1vZGV9IGZyb20gJy4vZW1iZWQtbW9kZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9vYnNlcnZhYmxlJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7ZGVlcEVxdWFsc30gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnknO1xuXG4vKipcbiAqIFV0aWwgZnVuY3Rpb24gdG8gcmV0cmlldmUgdGhlIHN0b3JlIHNlcnZpY2UuIEVuc3VyZXMgd2UgY2FuIHJldHJpZXZlIHRoZVxuICogc2VydmljZSBzeW5jaHJvbm91c2x5IGZyb20gdGhlIGFtcC1zdG9yeSBjb2RlYmFzZSB3aXRob3V0IHJ1bm5pbmcgaW50byByYWNlXG4gKiBjb25kaXRpb25zLlxuICogQHBhcmFtICB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshQW1wU3RvcnlTdG9yZVNlcnZpY2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTdG9yZVNlcnZpY2UgPSAod2luKSA9PiB7XG4gIGxldCBzZXJ2aWNlID0gU2VydmljZXMuc3RvcnlTdG9yZVNlcnZpY2Uod2luKTtcblxuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBzZXJ2aWNlID0gbmV3IEFtcFN0b3J5U3RvcmVTZXJ2aWNlKHdpbik7XG4gICAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW4sICdzdG9yeS1zdG9yZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHNlcnZpY2U7XG59O1xuXG4vKipcbiAqIERpZmZlcmVudCBVSSBleHBlcmllbmNlcyB0byBkaXNwbGF5IHRoZSBzdG9yeS5cbiAqIEBjb25zdCBAZW51bSB7bnVtYmVyfVxuICovXG5leHBvcnQgY29uc3QgVUlUeXBlID0ge1xuICBNT0JJTEU6IDAsXG4gIERFU0tUT1BfUEFORUxTOiAxLCAvLyBEZWZhdWx0IGRlc2t0b3AgVUkgZGlzcGxheWluZyBwcmV2aW91cyBhbmQgbmV4dCBwYWdlcy5cbiAgREVTS1RPUF9GVUxMQkxFRUQ6IDIsIC8vIERlc2t0b3AgVUkgaWYgbGFuZHNjYXBlIG1vZGUgaXMgZW5hYmxlZC5cbiAgREVTS1RPUF9PTkVfUEFORUw6IDQsIC8vIERlc2t0b3AgVUkgd2l0aCBvbmUgcGFuZWwgYW5kIHNwYWNlIGFyb3VuZCBzdG9yeS5cbiAgVkVSVElDQUw6IDMsIC8vIFZlcnRpY2FsIHNjcm9sbGluZyB2ZXJzaW9ucywgZm9yIHNlYXJjaCBlbmdpbmUgYm90cyBpbmRleGluZy5cbn07XG5cbi8qKlxuICogU3RhdGVzIGluIHdoaWNoIGFuIGVtYmVkZGVkIGNvbXBvbmVudCBjb3VsZCBiZSBmb3VuZCBpbi5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBFbWJlZGRlZENvbXBvbmVudFN0YXRlID0ge1xuICBISURERU46IDAsIC8vIENvbXBvbmVudCBpcyBwcmVzZW50IGluIHBhZ2UsIGJ1dCBoYXNuJ3QgYmVlbiBpbnRlcmFjdGVkIHdpdGguXG4gIEZPQ1VTRUQ6IDEsIC8vIENvbXBvbmVudCBoYXMgYmVlbiBjbGlja2VkLCBhIHRvb2x0aXAgc2hvdWxkIGJlIHNob3duLlxuICBFWFBBTkRFRDogMiwgLy8gQ29tcG9uZW50IGlzIGluIGV4cGFuZGVkIG1vZGUuXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICBlbGVtZW50OiAhRWxlbWVudCxcbiAqICAgIHN0YXRlOiAhRW1iZWRkZWRDb21wb25lbnRTdGF0ZSxcbiAqICAgIGNsaWVudFg6IG51bWJlcixcbiAqICAgIGNsaWVudFk6IG51bWJlcixcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgSW50ZXJhY3RpdmVDb21wb25lbnREZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgIG9wdGlvbjogPy4uLy4uL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS8wLjEvYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGUsXG4gKiAgICBpbnRlcmFjdGl2ZUlkOiBzdHJpbmcsXG4gKiAgICB0eXBlOiAuLi8uLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUvMC4xL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5JbnRlcmFjdGl2ZVR5cGVcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgSW50ZXJhY3RpdmVSZWFjdERhdGE7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgIGNhbkluc2VydEF1dG9tYXRpY0FkOiBib29sZWFuLFxuICogICAgY2FuU2hvd0F1ZGlvVWk6IGJvb2xlYW4sXG4gKiAgICBjYW5TaG93TmF2aWdhdGlvbk92ZXJsYXlIaW50OiBib29sZWFuLFxuICogICAgY2FuU2hvd1BhZ2luYXRpb25CdXR0b25zOiBib29sZWFuLFxuICogICAgY2FuU2hvd1ByZXZpb3VzUGFnZUhlbHA6IGJvb2xlYW4sXG4gKiAgICBjYW5TaG93U2hhcmluZ1VpczogYm9vbGVhbixcbiAqICAgIGNhblNob3dTeXN0ZW1MYXllckJ1dHRvbnM6IGJvb2xlYW4sXG4gKiAgICB2aWV3ZXJDdXN0b21Db250cm9sczogIUFycmF5PCFPYmplY3Q+LFxuICogICAgYWNjZXNzU3RhdGU6IGJvb2xlYW4sXG4gKiAgICBhZFN0YXRlOiBib29sZWFuLFxuICogICAgcGFnZUF0dGFjaG1lbnRTdGF0ZTogYm9vbGVhbixcbiAqICAgIGFmZmlsaWF0ZUxpbmtTdGF0ZTogIUVsZW1lbnQsXG4gKiAgICBkZXNrdG9wU3RhdGU6IGJvb2xlYW4sXG4gKiAgICBlZHVjYXRpb25TdGF0ZTogYm9vbGVhbixcbiAqICAgIGd5cm9zY29wZUVuYWJsZWRTdGF0ZTogc3RyaW5nLFxuICogICAgaGFzU2lkZWJhclN0YXRlOiBib29sZWFuLFxuICogICAgaW5mb0RpYWxvZ1N0YXRlOiBib29sZWFuLFxuICogICAgaW50ZXJhY3RpdmVFbWJlZGRlZENvbXBvbmVudFN0YXRlOiAhSW50ZXJhY3RpdmVDb21wb25lbnREZWYsXG4gKiAgICBpbnRlcmFjdGl2ZVJlYWN0U3RhdGU6ICFNYXA8c3RyaW5nLCAhSW50ZXJhY3RpdmVSZWFjdERhdGE+LFxuICogICAga2V5Ym9hcmRBY3RpdmVTdGF0ZTogYm9vbGVhbixcbiAqICAgIG11dGVkU3RhdGU6IGJvb2xlYW4sXG4gKiAgICBwYWdlQXVkaW9TdGF0ZTogYm9vbGVhbixcbiAqICAgIHBhZ2VIYXNFbGVtZW50c1dpdGhQbGF5YmFja1N0YXRlOiBib29sZWFuLFxuICogICAgcGFubmluZ01lZGlhU3RhdGU6ICFNYXA8c3RyaW5nLCAuLi8uLi9hbXAtc3RvcnktcGFubmluZy1tZWRpYS8wLjEvYW1wLXN0b3J5LXBhbm5pbmctbWVkaWEucGFubmluZ01lZGlhUG9zaXRpb25EZWY+ICxcbiAqICAgIHBhdXNlZFN0YXRlOiBib29sZWFuLFxuICogICAgcHJldmlld1N0YXRlOiBib29sZWFuLFxuICogICAgcnRsU3RhdGU6IGJvb2xlYW4sXG4gKiAgICBzaGFyZU1lbnVTdGF0ZTogYm9vbGVhbixcbiAqICAgIHNpZGViYXJTdGF0ZTogYm9vbGVhbixcbiAqICAgIHN0b3J5SGFzQXVkaW9TdGF0ZTogYm9vbGVhbixcbiAqICAgIHN0b3J5SGFzUGxheWJhY2tVaVN0YXRlOiBib29sZWFuLFxuICogICAgc3RvcnlIYXNCYWNrZ3JvdW5kQXVkaW9TdGF0ZTogYm9vbGVhbixcbiAqICAgIHN1cHBvcnRlZEJyb3dzZXJTdGF0ZTogYm9vbGVhbixcbiAqICAgIHN5c3RlbVVpSXNWaXNpYmxlU3RhdGU6IGJvb2xlYW4sXG4gKiAgICB1aVN0YXRlOiAhVUlUeXBlLFxuICogICAgdmlld3BvcnRXYXJuaW5nU3RhdGU6IGJvb2xlYW4sXG4gKiAgICBhY3Rpb25zQWxsb3dsaXN0OiAhQXJyYXk8e3RhZ09yVGFyZ2V0OiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nfT4sXG4gKiAgICBjb25zZW50SWQ6ID9zdHJpbmcsXG4gKiAgICBjdXJyZW50UGFnZUlkOiBzdHJpbmcsXG4gKiAgICBjdXJyZW50UGFnZUluZGV4OiBudW1iZXIsXG4gKiAgICBwYWdlSWRzOiAhQXJyYXk8c3RyaW5nPixcbiAqICAgIG5ld1BhZ2VBdmFpbGFibGVJZDogc3RyaW5nLFxuICogICAgcGFnZVNpemU6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFN0YXRlO1xuXG4vKiogQGNvbnN0IEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgU3RhdGVQcm9wZXJ0eSA9IHtcbiAgLy8gRW1iZWQgb3B0aW9ucy5cbiAgQ0FOX0lOU0VSVF9BVVRPTUFUSUNfQUQ6ICdjYW5JbnNlcnRBdXRvbWF0aWNBZCcsXG4gIENBTl9TSE9XX0FVRElPX1VJOiAnY2FuU2hvd0F1ZGlvVWknLFxuICBDQU5fU0hPV19OQVZJR0FUSU9OX09WRVJMQVlfSElOVDogJ2NhblNob3dOYXZpZ2F0aW9uT3ZlcmxheUhpbnQnLFxuICBDQU5fU0hPV19QQUdJTkFUSU9OX0JVVFRPTlM6ICdjYW5TaG93UGFnaW5hdGlvbkJ1dHRvbnMnLFxuICBDQU5fU0hPV19QUkVWSU9VU19QQUdFX0hFTFA6ICdjYW5TaG93UHJldmlvdXNQYWdlSGVscCcsXG4gIENBTl9TSE9XX1NIQVJJTkdfVUlTOiAnY2FuU2hvd1NoYXJpbmdVaXMnLFxuICBDQU5fU0hPV19TWVNURU1fTEFZRVJfQlVUVE9OUzogJ2NhblNob3dTeXN0ZW1MYXllckJ1dHRvbnMnLFxuICBWSUVXRVJfQ1VTVE9NX0NPTlRST0xTOiAndmlld2VyQ3VzdG9tQ29udHJvbHMnLFxuXG4gIC8vIEFwcCBTdGF0ZXMuXG4gIEFDQ0VTU19TVEFURTogJ2FjY2Vzc1N0YXRlJywgLy8gYW1wLWFjY2VzcyBwYXl3YWxsLlxuICBBRF9TVEFURTogJ2FkU3RhdGUnLFxuICBQQUdFX0FUVEFDSE1FTlRfU1RBVEU6ICdwYWdlQXR0YWNobWVudFN0YXRlJyxcbiAgQUZGSUxJQVRFX0xJTktfU1RBVEU6ICdhZmZpbGlhdGVMaW5rU3RhdGUnLFxuICBERVNLVE9QX1NUQVRFOiAnZGVza3RvcFN0YXRlJyxcbiAgRURVQ0FUSU9OX1NUQVRFOiAnZWR1Y2F0aW9uU3RhdGUnLFxuICBHWVJPU0NPUEVfUEVSTUlTU0lPTl9TVEFURTogJ2d5cm9zY29wZVBlcm1pc3Npb25TdGF0ZScsXG4gIEhBU19TSURFQkFSX1NUQVRFOiAnaGFzU2lkZWJhclN0YXRlJyxcbiAgSU5GT19ESUFMT0dfU1RBVEU6ICdpbmZvRGlhbG9nU3RhdGUnLFxuICBJTlRFUkFDVElWRV9DT01QT05FTlRfU1RBVEU6ICdpbnRlcmFjdGl2ZUVtYmVkZGVkQ29tcG9uZW50U3RhdGUnLFxuICAvLyBTdGF0ZSBvZiBpbnRlcmFjdGl2ZSBjb21wb25lbnRzIChwb2xscywgcXVpenplcykgb24gdGhlIHN0b3J5LlxuICBJTlRFUkFDVElWRV9SRUFDVF9TVEFURTogJ2ludGVyYWN0aXZlUmVhY3RTdGF0ZScsXG4gIEtFWUJPQVJEX0FDVElWRV9TVEFURTogJ2tleWJvYXJkQWN0aXZlU3RhdGUnLFxuICBNVVRFRF9TVEFURTogJ211dGVkU3RhdGUnLFxuICBQQUdFX0hBU19BVURJT19TVEFURTogJ3BhZ2VBdWRpb1N0YXRlJyxcbiAgUEFHRV9IQVNfRUxFTUVOVFNfV0lUSF9QTEFZQkFDS19TVEFURTogJ3BhZ2VIYXNFbGVtZW50c1dpdGhQbGF5YmFja1N0YXRlJyxcbiAgUEFOTklOR19NRURJQV9TVEFURTogJ3Bhbm5pbmdNZWRpYVN0YXRlJyxcbiAgUEFVU0VEX1NUQVRFOiAncGF1c2VkU3RhdGUnLFxuICAvLyBTdG9yeSBwcmV2aWV3IHN0YXRlLlxuICBQUkVWSUVXX1NUQVRFOiAncHJldmlld1N0YXRlJyxcbiAgUlRMX1NUQVRFOiAncnRsU3RhdGUnLFxuICBTSEFSRV9NRU5VX1NUQVRFOiAnc2hhcmVNZW51U3RhdGUnLFxuICBTSURFQkFSX1NUQVRFOiAnc2lkZWJhclN0YXRlJyxcbiAgU1VQUE9SVEVEX0JST1dTRVJfU1RBVEU6ICdzdXBwb3J0ZWRCcm93c2VyU3RhdGUnLFxuICAvLyBBbnkgcGFnZSBoYXMgYXVkaW8sIG9yIGFtcC1zdG9yeSBoYXMgYSBgYmFja2dyb3VuZC1hdWRpb2AgYXR0cmlidXRlLlxuICBTVE9SWV9IQVNfQVVESU9fU1RBVEU6ICdzdG9yeUhhc0F1ZGlvU3RhdGUnLFxuICAvLyBhbXAtc3RvcnkgaGFzIGEgYGJhY2tncm91bmQtYXVkaW9gIGF0dHJpYnV0ZS5cbiAgU1RPUllfSEFTX0JBQ0tHUk9VTkRfQVVESU9fU1RBVEU6ICdzdG9yeUhhc0JhY2tncm91bmRBdWRpb1N0YXRlJyxcbiAgLy8gQW55IHBhZ2UgaGFzIGVsZW1lbnRzIHdpdGggcGxheWJhY2suXG4gIFNUT1JZX0hBU19QTEFZQkFDS19VSV9TVEFURTogJ3N0b3J5SGFzUGxheWJhY2tVaVN0YXRlJyxcbiAgU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEU6ICdzeXN0ZW1VaUlzVmlzaWJsZVN0YXRlJyxcbiAgVUlfU1RBVEU6ICd1aVN0YXRlJyxcbiAgVklFV1BPUlRfV0FSTklOR19TVEFURTogJ3ZpZXdwb3J0V2FybmluZ1N0YXRlJyxcblxuICAvLyBBcHAgZGF0YS5cbiAgQUNUSU9OU19BTExPV0xJU1Q6ICdhY3Rpb25zQWxsb3dsaXN0JyxcbiAgQ09OU0VOVF9JRDogJ2NvbnNlbnRJZCcsXG4gIENVUlJFTlRfUEFHRV9JRDogJ2N1cnJlbnRQYWdlSWQnLFxuICBDVVJSRU5UX1BBR0VfSU5ERVg6ICdjdXJyZW50UGFnZUluZGV4JyxcbiAgQURWQU5DRU1FTlRfTU9ERTogJ2FkdmFuY2VtZW50TW9kZScsXG4gIE5BVklHQVRJT05fUEFUSDogJ25hdmlnYXRpb25QYXRoJyxcbiAgTkVXX1BBR0VfQVZBSUxBQkxFX0lEOiAnbmV3UGFnZUF2YWlsYWJsZUlkJyxcbiAgUEFHRV9JRFM6ICdwYWdlSWRzJyxcbiAgUEFHRV9TSVpFOiAncGFnZVNpemUnLFxufTtcblxuLyoqIEBjb25zdCBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEFjdGlvbiA9IHtcbiAgQUREX0lOVEVSQUNUSVZFX1JFQUNUOiAnYWRkSW50ZXJhY3RpdmVSZWFjdCcsXG4gIEFERF9UT19BQ1RJT05TX0FMTE9XTElTVDogJ2FkZFRvQWN0aW9uc0FsbG93bGlzdCcsXG4gIENIQU5HRV9QQUdFOiAnc2V0Q3VycmVudFBhZ2VJZCcsXG4gIFNFVF9DT05TRU5UX0lEOiAnc2V0Q29uc2VudElkJyxcbiAgU0VUX0FEVkFOQ0VNRU5UX01PREU6ICdzZXRBZHZhbmNlbWVudE1vZGUnLFxuICBTRVRfTkFWSUdBVElPTl9QQVRIOiAnc2V0TmF2aWdhdGlvblBhdGgnLFxuICBTRVRfUEFHRV9JRFM6ICdzZXRQYWdlSWRzJyxcbiAgVE9HR0xFX0FDQ0VTUzogJ3RvZ2dsZUFjY2VzcycsXG4gIFRPR0dMRV9BRDogJ3RvZ2dsZUFkJyxcbiAgVE9HR0xFX0FGRklMSUFURV9MSU5LOiAndG9nZ2xlQWZmaWxpYXRlTGluaycsXG4gIFRPR0dMRV9FRFVDQVRJT046ICd0b2dnbGVFZHVjYXRpb24nLFxuICBUT0dHTEVfSEFTX1NJREVCQVI6ICd0b2dnbGVIYXNTaWRlYmFyJyxcbiAgVE9HR0xFX0lORk9fRElBTE9HOiAndG9nZ2xlSW5mb0RpYWxvZycsXG4gIFRPR0dMRV9JTlRFUkFDVElWRV9DT01QT05FTlQ6ICd0b2dnbGVJbnRlcmFjdGl2ZUNvbXBvbmVudCcsXG4gIFRPR0dMRV9LRVlCT0FSRF9BQ1RJVkVfU1RBVEU6ICd0b2dnbGVLZXlib2FyZEFjdGl2ZVN0YXRlJyxcbiAgVE9HR0xFX01VVEVEOiAndG9nZ2xlTXV0ZWQnLFxuICBUT0dHTEVfUEFHRV9BVFRBQ0hNRU5UX1NUQVRFOiAndG9nZ2xlUGFnZUF0dGFjaG1lbnRTdGF0ZScsXG4gIFRPR0dMRV9QQUdFX0hBU19BVURJTzogJ3RvZ2dsZVBhZ2VIYXNBdWRpbycsXG4gIFRPR0dMRV9QQUdFX0hBU19FTEVNRU5UX1dJVEhfUExBWUJBQ0s6ICd0b2dnbGVQYWdlSGFzRWxlbWVudFdpdGhQbGF5YmxhY2snLFxuICBUT0dHTEVfUEFVU0VEOiAndG9nZ2xlUGF1c2VkJyxcbiAgVE9HR0xFX1JUTDogJ3RvZ2dsZVJ0bCcsXG4gIFRPR0dMRV9TSEFSRV9NRU5VOiAndG9nZ2xlU2hhcmVNZW51JyxcbiAgVE9HR0xFX1NJREVCQVI6ICd0b2dnbGVTaWRlYmFyJyxcbiAgVE9HR0xFX1NVUFBPUlRFRF9CUk9XU0VSOiAndG9nZ2xlU3VwcG9ydGVkQnJvd3NlcicsXG4gIFRPR0dMRV9TVE9SWV9IQVNfQVVESU86ICd0b2dnbGVTdG9yeUhhc0F1ZGlvJyxcbiAgVE9HR0xFX1NUT1JZX0hBU19CQUNLR1JPVU5EX0FVRElPOiAndG9nZ2xlU3RvcnlIYXNCYWNrZ3JvdW5kQXVkaW8nLFxuICBUT0dHTEVfU1RPUllfSEFTX1BMQVlCQUNLX1VJOiAndG9nZ2xlU3RvcnlIYXNQbGF5YmFja1VpJyxcbiAgVE9HR0xFX1NZU1RFTV9VSV9JU19WSVNJQkxFOiAndG9nZ2xlU3lzdGVtVWlJc1Zpc2libGUnLFxuICBUT0dHTEVfVUk6ICd0b2dnbGVVaScsXG4gIFNFVF9HWVJPU0NPUEVfUEVSTUlTU0lPTjogJ3NldEd5cm9zY29wZVBlcm1pc3Npb24nLFxuICBUT0dHTEVfVklFV1BPUlRfV0FSTklORzogJ3RvZ2dsZVZpZXdwb3J0V2FybmluZycsXG4gIEFERF9ORVdfUEFHRV9JRDogJ2FkZE5ld1BhZ2VJZCcsXG4gIFNFVF9QQUdFX1NJWkU6ICd1cGRhdGVQYWdlU2l6ZScsXG4gIEFERF9QQU5OSU5HX01FRElBX1NUQVRFOiAnYWRkUGFubmluZ01lZGlhU3RhdGUnLFxuICBTRVRfVklFV0VSX0NVU1RPTV9DT05UUk9MUzogJ3NldEN1c3RvbUNvbnRyb2xzJyxcbn07XG5cbi8qKlxuICogRnVuY3Rpb25zIHRvIGNvbXBhcmUgYSBkYXRhIHN0cnVjdHVyZSBmcm9tIHRoZSBwcmV2aW91cyB0byB0aGUgbmV3IHN0YXRlIGFuZFxuICogZGV0ZWN0IGEgbXV0YXRpb24sIHdoZW4gYSBzaW1wbGUgZXF1YWxpdHkgdGVzdCB3b3VsZCBub3Qgd29yay5cbiAqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFmdW5jdGlvbigqLCAqKTpib29sZWFuPn1cbiAqL1xuY29uc3Qgc3RhdGVDb21wYXJpc29uRnVuY3Rpb25zID0ge1xuICBbU3RhdGVQcm9wZXJ0eS5BQ1RJT05TX0FMTE9XTElTVF06IChvbGQsIGN1cnIpID0+IG9sZC5sZW5ndGggIT09IGN1cnIubGVuZ3RoLFxuICBbU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9DT01QT05FTlRfU1RBVEVdOlxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IG9sZFxuICAgICAqIEBwYXJhbSB7SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IGN1cnJcbiAgICAgKi9cbiAgICAob2xkLCBjdXJyKSA9PiBvbGQuZWxlbWVudCAhPT0gY3Vyci5lbGVtZW50IHx8IG9sZC5zdGF0ZSAhPT0gY3Vyci5zdGF0ZSxcbiAgW1N0YXRlUHJvcGVydHkuTkFWSUdBVElPTl9QQVRIXTogKG9sZCwgY3VycikgPT4gb2xkLmxlbmd0aCAhPT0gY3Vyci5sZW5ndGgsXG4gIFtTdGF0ZVByb3BlcnR5LlBBR0VfSURTXTogKG9sZCwgY3VycikgPT4gb2xkLmxlbmd0aCAhPT0gY3Vyci5sZW5ndGgsXG4gIFtTdGF0ZVByb3BlcnR5LlBBR0VfU0laRV06IChvbGQsIGN1cnIpID0+XG4gICAgb2xkID09PSBudWxsIHx8XG4gICAgY3VyciA9PT0gbnVsbCB8fFxuICAgIG9sZC53aWR0aCAhPT0gY3Vyci53aWR0aCB8fFxuICAgIG9sZC5oZWlnaHQgIT09IGN1cnIuaGVpZ2h0LFxuICBbU3RhdGVQcm9wZXJ0eS5QQU5OSU5HX01FRElBX1NUQVRFXTogKG9sZCwgY3VycikgPT5cbiAgICBvbGQgPT09IG51bGwgfHwgY3VyciA9PT0gbnVsbCB8fCAhZGVlcEVxdWFscyhvbGQsIGN1cnIsIDIpLFxuICBbU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9SRUFDVF9TVEFURV06IChvbGQsIGN1cnIpID0+XG4gICAgIWRlZXBFcXVhbHMob2xkLCBjdXJyLCAzKSxcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmV3IHNhdGUuXG4gKiBAcGFyYW0gIHshU3RhdGV9IHN0YXRlIEltbXV0YWJsZSBzdGF0ZVxuICogQHBhcmFtICB7IUFjdGlvbn0gYWN0aW9uXG4gKiBAcGFyYW0gIHsqfSBkYXRhXG4gKiBAcmV0dXJuIHshU3RhdGV9IG5ldyBzdGF0ZVxuICovXG5jb25zdCBhY3Rpb25zID0gKHN0YXRlLCBhY3Rpb24sIGRhdGEpID0+IHtcbiAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICBjYXNlIEFjdGlvbi5BRERfSU5URVJBQ1RJVkVfUkVBQ1Q6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9SRUFDVF9TVEFURV06IHtcbiAgICAgICAgICAuLi5zdGF0ZVtTdGF0ZVByb3BlcnR5LklOVEVSQUNUSVZFX1JFQUNUX1NUQVRFXSxcbiAgICAgICAgICBbZGF0YVsnaW50ZXJhY3RpdmVJZCddXTogZGF0YSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLkFERF9ORVdfUEFHRV9JRDpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5Lk5FV19QQUdFX0FWQUlMQUJMRV9JRF06IGRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5BRERfUEFOTklOR19NRURJQV9TVEFURTpcbiAgICAgIGNvbnN0IHVwZGF0ZWRTdGF0ZSA9IHtcbiAgICAgICAgLi4uc3RhdGVbU3RhdGVQcm9wZXJ0eS5QQU5OSU5HX01FRElBX1NUQVRFXSxcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgIH07XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QQU5OSU5HX01FRElBX1NUQVRFXTogdXBkYXRlZFN0YXRlLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uQUREX1RPX0FDVElPTlNfQUxMT1dMSVNUOlxuICAgICAgY29uc3QgbmV3QWN0aW9uc0FsbG93bGlzdCA9IFtdLmNvbmNhdChcbiAgICAgICAgc3RhdGVbU3RhdGVQcm9wZXJ0eS5BQ1RJT05TX0FMTE9XTElTVF0sXG4gICAgICAgIGRhdGFcbiAgICAgICk7XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5BQ1RJT05TX0FMTE9XTElTVF06IG5ld0FjdGlvbnNBbGxvd2xpc3QsXG4gICAgICB9KTtcbiAgICAvLyBUcmlnZ2VycyB0aGUgYW1wLWFjZXNzIHBheXdhbGwuXG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX0FDQ0VTUzpcbiAgICAgIC8vIERvbid0IGNoYW5nZSB0aGUgUEFVU0VEX1NUQVRFIGlmIEFDQ0VTU19TVEFURSBpcyBub3QgY2hhbmdlZC5cbiAgICAgIGlmIChzdGF0ZVtTdGF0ZVByb3BlcnR5LkFDQ0VTU19TVEFURV0gPT09IGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5BQ0NFU1NfU1RBVEVdOiAhIWRhdGEsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlBBVVNFRF9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9QQUdFX0FUVEFDSE1FTlRfU1RBVEU6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QQUdFX0FUVEFDSE1FTlRfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICAvLyBUcmlnZ2VycyB0aGUgYWQgVUkuXG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX0FEOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuQURfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICAvLyBFeHBhbmRzIG9yIGNvbGxhcHNlcyB0aGUgYWZmaWxpYXRlIGxpbmsuXG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX0FGRklMSUFURV9MSU5LOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuQUZGSUxJQVRFX0xJTktfU1RBVEVdOiBkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX0VEVUNBVElPTjpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LkVEVUNBVElPTl9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9JTlRFUkFDVElWRV9DT01QT05FTlQ6XG4gICAgICBkYXRhID0gLyoqIEB0eXBlIHtJbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gKi8gKGRhdGEpO1xuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuUEFVU0VEX1NUQVRFXTpcbiAgICAgICAgICBkYXRhLnN0YXRlID09PSBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkVYUEFOREVEIHx8XG4gICAgICAgICAgZGF0YS5zdGF0ZSA9PT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5GT0NVU0VELFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5TWVNURU1fVUlfSVNfVklTSUJMRV9TVEFURV06XG4gICAgICAgICAgZGF0YS5zdGF0ZSAhPT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5FWFBBTkRFRCB8fFxuICAgICAgICAgIHN0YXRlLnVpU3RhdGUgPT09IFVJVHlwZS5ERVNLVE9QX1BBTkVMUyxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFXTogZGF0YSxcbiAgICAgIH0pO1xuICAgIC8vIFNob3dzIG9yIGhpZGVzIHRoZSBpbmZvIGRpYWxvZy5cbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfSU5GT19ESUFMT0c6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5JTkZPX0RJQUxPR19TVEFURV06ICEhZGF0YSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuUEFVU0VEX1NUQVRFXTogISFkYXRhLFxuICAgICAgfSk7XG4gICAgLy8gU2hvd3Mgb3IgaGlkZXMgdGhlIGF1ZGlvIGNvbnRyb2xzLlxuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9TVE9SWV9IQVNfQVVESU86XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfQVVESU9fU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfU1RPUllfSEFTX0JBQ0tHUk9VTkRfQVVESU86XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfQkFDS0dST1VORF9BVURJT19TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIC8vIFNob3dzIG9yIGhpZGVzIHRoZSBwbGF5L3BhdXNlIGNvbnRyb2xzLlxuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9TVE9SWV9IQVNfUExBWUJBQ0tfVUk6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfUExBWUJBQ0tfVUlfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICAvLyBNdXRlcyBvciB1bm11dGVzIHRoZSBzdG9yeSBtZWRpYS5cbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfTVVURUQ6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9QQUdFX0hBU19BVURJTzpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlBBR0VfSEFTX0FVRElPX1NUQVRFXTogISFkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX1BBR0VfSEFTX0VMRU1FTlRfV0lUSF9QTEFZQkFDSzpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlBBR0VfSEFTX0VMRU1FTlRTX1dJVEhfUExBWUJBQ0tfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfUEFVU0VEOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuUEFVU0VEX1NUQVRFXTogISFkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX1JUTDpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlJUTF9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9LRVlCT0FSRF9BQ1RJVkVfU1RBVEU6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5LRVlCT0FSRF9BQ1RJVkVfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfU0lERUJBUjpcbiAgICAgIC8vIERvbid0IGNoYW5nZSB0aGUgUEFVU0VEX1NUQVRFIGlmIFNJREVCQVJfU1RBVEUgaXMgbm90IGNoYW5nZWQuXG4gICAgICBpZiAoc3RhdGVbU3RhdGVQcm9wZXJ0eS5TSURFQkFSX1NUQVRFXSA9PT0gZGF0YSkge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEVdOiAhIWRhdGEsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlNJREVCQVJfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfSEFTX1NJREVCQVI6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5IQVNfU0lERUJBUl9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9TVVBQT1JURURfQlJPV1NFUjpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlNVUFBPUlRFRF9CUk9XU0VSX1NUQVRFXTogISFkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX1NIQVJFX01FTlU6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEVdOiAhIWRhdGEsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlNIQVJFX01FTlVfU1RBVEVdOiAhIWRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5UT0dHTEVfU1lTVEVNX1VJX0lTX1ZJU0lCTEU6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5TWVNURU1fVUlfSVNfVklTSUJMRV9TVEFURV06ICEhZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlRPR0dMRV9VSTpcbiAgICAgIGlmIChcbiAgICAgICAgc3RhdGVbU3RhdGVQcm9wZXJ0eS5VSV9TVEFURV0gPT09IFVJVHlwZS5WRVJUSUNBTCAmJlxuICAgICAgICBkYXRhICE9PSBVSVR5cGUuVkVSVElDQUxcbiAgICAgICkge1xuICAgICAgICBkZXYoKS5lcnJvcihUQUcsICdDYW5ub3Qgc3dpdGNoIGF3YXkgZnJvbSBVSVR5cGUuVkVSVElDQUwnKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuREVTS1RPUF9TVEFURV06IGRhdGEgPT09IFVJVHlwZS5ERVNLVE9QX1BBTkVMUyxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuVUlfU1RBVEVdOiBkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uU0VUX0dZUk9TQ09QRV9QRVJNSVNTSU9OOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuR1lST1NDT1BFX1BFUk1JU1NJT05fU1RBVEVdOiBkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uVE9HR0xFX1ZJRVdQT1JUX1dBUk5JTkc6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5WSUVXUE9SVF9XQVJOSU5HX1NUQVRFXTogISFkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uU0VUX0NPTlNFTlRfSUQ6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5DT05TRU5UX0lEXTogZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLkNIQU5HRV9QQUdFOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lEXTogZGF0YS5pZCxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lOREVYXTogZGF0YS5pbmRleCxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuQURWQU5DRU1FTlRfTU9ERV06IGRhdGEsXG4gICAgICB9KTtcbiAgICBjYXNlIEFjdGlvbi5TRVRfTkFWSUdBVElPTl9QQVRIOlxuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW1N0YXRlUHJvcGVydHkuTkFWSUdBVElPTl9QQVRIXTogZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlNFVF9QQUdFX0lEUzpcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtTdGF0ZVByb3BlcnR5LlBBR0VfSURTXTogZGF0YSxcbiAgICAgIH0pO1xuICAgIGNhc2UgQWN0aW9uLlNFVF9QQUdFX1NJWkU6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QQUdFX1NJWkVdOiBkYXRhLFxuICAgICAgfSk7XG4gICAgY2FzZSBBY3Rpb24uU0VUX1ZJRVdFUl9DVVNUT01fQ09OVFJPTFM6XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RhdGV9ICovICh7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBbU3RhdGVQcm9wZXJ0eS5WSUVXRVJfQ1VTVE9NX0NPTlRST0xTXTogZGF0YSxcbiAgICAgIH0pO1xuICAgIGRlZmF1bHQ6XG4gICAgICBkZXYoKS5lcnJvcihUQUcsICdVbmtub3duIGFjdGlvbiAlcy4nLCBhY3Rpb24pO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG4vKipcbiAqIFN0b3JlIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeVN0b3JlU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhT2JzZXJ2YWJsZT59ICovXG4gICAgdGhpcy5saXN0ZW5lcnNfID0ge307XG5cbiAgICAvKiogQHByaXZhdGUgeyFTdGF0ZX0gKi9cbiAgICB0aGlzLnN0YXRlXyA9IC8qKiBAdHlwZSB7IVN0YXRlfSAqLyAoe1xuICAgICAgLi4udGhpcy5nZXREZWZhdWx0U3RhdGVfKCksXG4gICAgICAuLi50aGlzLmdldEVtYmVkT3ZlcnJpZGVzXygpLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIHN0YXRlIHByb3BlcnR5LlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBQcm9wZXJ0eSB0byByZXRyaWV2ZSBmcm9tIHRoZSBzdGF0ZS5cbiAgICogQHJldHVybiB7Kn1cbiAgICovXG4gIGdldChrZXkpIHtcbiAgICBpZiAoIWhhc093bih0aGlzLnN0YXRlXywga2V5KSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHLCAnVW5rbm93biBzdGF0ZSAlcy4nLCBrZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZV9ba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGEgc3RhdGUgcHJvcGVydHkgbXV0YXRpb25zLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0gIHshRnVuY3Rpb259IGxpc3RlbmVyXG4gICAqIEBwYXJhbSAge2Jvb2xlYW49fSBjYWxsVG9Jbml0aWFsaXplIFdoZXRoZXIgdGhlIGxpc3RlbmVyIHNob3VsZCBiZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyZWQgd2l0aCBjdXJyZW50IHZhbHVlLlxuICAgKi9cbiAgc3Vic2NyaWJlKGtleSwgbGlzdGVuZXIsIGNhbGxUb0luaXRpYWxpemUgPSBmYWxzZSkge1xuICAgIGlmICghaGFzT3duKHRoaXMuc3RhdGVfLCBrZXkpKSB7XG4gICAgICBkZXYoKS5lcnJvcihUQUcsIFwiQ2FuJ3Qgc3Vic2NyaWJlIHRvIHVua25vd24gc3RhdGUgJXMuXCIsIGtleSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5saXN0ZW5lcnNfW2tleV0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzX1trZXldID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnNfW2tleV0uYWRkKGxpc3RlbmVyKTtcblxuICAgIGlmIChjYWxsVG9Jbml0aWFsaXplKSB7XG4gICAgICBsaXN0ZW5lcih0aGlzLmdldChrZXkpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24gYW5kIHRyaWdnZXJzIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSB1cGRhdGVkIHN0YXRlXG4gICAqIHByb3BlcnRpZXMuXG4gICAqIEBwYXJhbSAgeyFBY3Rpb259IGFjdGlvblxuICAgKiBAcGFyYW0gIHsqfSBkYXRhXG4gICAqL1xuICBkaXNwYXRjaChhY3Rpb24sIGRhdGEpIHtcbiAgICBjb25zdCBvbGRTdGF0ZSA9IHsuLi50aGlzLnN0YXRlX307XG4gICAgdGhpcy5zdGF0ZV8gPSBhY3Rpb25zKHRoaXMuc3RhdGVfLCBhY3Rpb24sIGRhdGEpO1xuXG4gICAgbGV0IGNvbXBhcmlzb25GbjtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmxpc3RlbmVyc18pLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29tcGFyaXNvbkZuID0gc3RhdGVDb21wYXJpc29uRnVuY3Rpb25zW2tleV07XG4gICAgICBpZiAoXG4gICAgICAgIGNvbXBhcmlzb25GblxuICAgICAgICAgID8gY29tcGFyaXNvbkZuKG9sZFN0YXRlW2tleV0sIHRoaXMuc3RhdGVfW2tleV0pXG4gICAgICAgICAgOiBvbGRTdGF0ZVtrZXldICE9PSB0aGlzLnN0YXRlX1trZXldXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNfW2tleV0uZmlyZSh0aGlzLnN0YXRlX1trZXldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgc3RhdGUsIHRoYXQgY291bGQgYmUgb3ZlcnJpZGVuIGJ5IGFuIGVtYmVkIG1vZGUuXG4gICAqIEByZXR1cm4geyFTdGF0ZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldERlZmF1bHRTdGF0ZV8oKSB7XG4gICAgLy8gQ29tcGlsZXIgd29uJ3QgcmVzb2x2ZSB0aGUgb2JqZWN0IGtleXMgYW5kIHRyaWdnZXIgYW4gZXJyb3IgZm9yIG1pc3NpbmdcbiAgICAvLyBwcm9wZXJ0aWVzLCBzbyB3ZSBoYXZlIHRvIGZvcmNlIHRoZSB0eXBlLlxuICAgIHJldHVybiAvKiogQHR5cGUgeyFTdGF0ZX0gKi8gKHtcbiAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9JTlNFUlRfQVVUT01BVElDX0FEXTogdHJ1ZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX0FVRElPX1VJXTogdHJ1ZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX05BVklHQVRJT05fT1ZFUkxBWV9ISU5UXTogdHJ1ZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX1BSRVZJT1VTX1BBR0VfSEVMUF06IHRydWUsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19QQUdJTkFUSU9OX0JVVFRPTlNdOiB0cnVlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfU0hBUklOR19VSVNdOiB0cnVlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfU1lTVEVNX0xBWUVSX0JVVFRPTlNdOiB0cnVlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuVklFV0VSX0NVU1RPTV9DT05UUk9MU106IFtdLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQUNDRVNTX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5BRF9TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQUZGSUxJQVRFX0xJTktfU1RBVEVdOiBudWxsLFxuICAgICAgW1N0YXRlUHJvcGVydHkuREVTS1RPUF9TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuRURVQ0FUSU9OX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5HWVJPU0NPUEVfUEVSTUlTU0lPTl9TVEFURV06ICcnLFxuICAgICAgW1N0YXRlUHJvcGVydHkuSEFTX1NJREVCQVJfU1RBVEVdOiBmYWxzZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LklORk9fRElBTE9HX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9DT01QT05FTlRfU1RBVEVdOiB7XG4gICAgICAgIHN0YXRlOiBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkhJRERFTixcbiAgICAgIH0sXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9SRUFDVF9TVEFURV06IHt9LFxuICAgICAgW1N0YXRlUHJvcGVydHkuS0VZQk9BUkRfQUNUSVZFX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURV06IHRydWUsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5QQUdFX0FUVEFDSE1FTlRfU1RBVEVdOiBmYWxzZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LlBBR0VfSEFTX0FVRElPX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5QQUdFX0hBU19FTEVNRU5UU19XSVRIX1BMQVlCQUNLX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5QQU5OSU5HX01FRElBX1NUQVRFXToge30sXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEVdOiBmYWxzZSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LlJUTF9TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuU0hBUkVfTUVOVV9TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuU0lERUJBUl9TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuU1VQUE9SVEVEX0JST1dTRVJfU1RBVEVdOiB0cnVlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuU1RPUllfSEFTX0FVRElPX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfQkFDS0dST1VORF9BVURJT19TVEFURV06IGZhbHNlLFxuICAgICAgW1N0YXRlUHJvcGVydHkuU1RPUllfSEFTX1BMQVlCQUNLX1VJX1NUQVRFXTogZmFsc2UsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5TWVNURU1fVUlfSVNfVklTSUJMRV9TVEFURV06IHRydWUsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5VSV9TVEFURV06IFVJVHlwZS5NT0JJTEUsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5WSUVXUE9SVF9XQVJOSU5HX1NUQVRFXTogZmFsc2UsXG4gICAgICAvLyBhbXAtc3Rvcnkgb25seSBhbGxvd3MgYWN0aW9ucyBvbiBhIGNhc2UtYnktY2FzZSBiYXNpcyB0byBwcmVzZXJ2ZSBVWFxuICAgICAgLy8gYmVoYXZpb3JzLiBCeSBkZWZhdWx0LCBubyBhY3Rpb25zIGFyZSBhbGxvd2VkLlxuICAgICAgW1N0YXRlUHJvcGVydHkuQUNUSU9OU19BTExPV0xJU1RdOiBbXSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LkNPTlNFTlRfSURdOiBudWxsLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lEXTogJycsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSU5ERVhdOiAwLFxuICAgICAgW1N0YXRlUHJvcGVydHkuQURWQU5DRU1FTlRfTU9ERV06ICcnLFxuICAgICAgW1N0YXRlUHJvcGVydHkuTkVXX1BBR0VfQVZBSUxBQkxFX0lEXTogJycsXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5OQVZJR0FUSU9OX1BBVEhdOiBbXSxcbiAgICAgIFtTdGF0ZVByb3BlcnR5LlBBR0VfSURTXTogW10sXG4gICAgICBbU3RhdGVQcm9wZXJ0eS5QQUdFX1NJWkVdOiBudWxsLFxuICAgICAgW1N0YXRlUHJvcGVydHkuUFJFVklFV19TVEFURV06IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gQFRPRE8oZ21ham91bGV0KTogVGhlc2Ugc2hvdWxkIGdldCB0aGVpciBvd24gZmlsZSBpZiB0aGV5IHN0YXJ0IGdyb3dpbmcuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGVtYmVkIG1vZGUgY29uZmlnLCB0aGF0IHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgc3RhdGUuXG4gICAqIEByZXR1cm4geyFPYmplY3Q8U3RhdGVQcm9wZXJ0eSwgKj59IFBhcnRpYWwgc3RhdGVcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgZ2V0RW1iZWRPdmVycmlkZXNfKCkge1xuICAgIGNvbnN0IGVtYmVkTW9kZSA9IHBhcnNlRW1iZWRNb2RlKHRoaXMud2luXy5sb2NhdGlvbi5oYXNoKTtcbiAgICBzd2l0Y2ggKGVtYmVkTW9kZSkge1xuICAgICAgY2FzZSBFbWJlZE1vZGUuTkFNRV9UQkQ6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX0lOU0VSVF9BVVRPTUFUSUNfQURdOiBmYWxzZSxcbiAgICAgICAgICBbU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19OQVZJR0FUSU9OX09WRVJMQVlfSElOVF06IGZhbHNlLFxuICAgICAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX1BBR0lOQVRJT05fQlVUVE9OU106IGZhbHNlLFxuICAgICAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX1BSRVZJT1VTX1BBR0VfSEVMUF06IHRydWUsXG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfU1lTVEVNX0xBWUVSX0JVVFRPTlNdOiBmYWxzZSxcbiAgICAgICAgICBbU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURV06IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBFbWJlZE1vZGUuTk9fU0hBUklORzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19TSEFSSU5HX1VJU106IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBFbWJlZE1vZGUuUFJFVklFVzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbU3RhdGVQcm9wZXJ0eS5QUkVWSUVXX1NUQVRFXTogdHJ1ZSxcbiAgICAgICAgICBbU3RhdGVQcm9wZXJ0eS5DQU5fSU5TRVJUX0FVVE9NQVRJQ19BRF06IGZhbHNlLFxuICAgICAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX05BVklHQVRJT05fT1ZFUkxBWV9ISU5UXTogZmFsc2UsXG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfUEFHSU5BVElPTl9CVVRUT05TXTogZmFsc2UsXG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfUFJFVklPVVNfUEFHRV9IRUxQXTogZmFsc2UsXG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfU1lTVEVNX0xBWUVSX0JVVFRPTlNdOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgRW1iZWRNb2RlLk5PX1NIQVJJTkdfTk9SX0FVRElPX1VJOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFtTdGF0ZVByb3BlcnR5LkNBTl9TSE9XX0FVRElPX1VJXTogZmFsc2UsXG4gICAgICAgICAgW1N0YXRlUHJvcGVydHkuQ0FOX1NIT1dfU0hBUklOR19VSVNdOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-store-service.js