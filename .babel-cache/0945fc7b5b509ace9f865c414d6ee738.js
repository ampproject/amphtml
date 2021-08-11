var _stateComparisonFunct;function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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
  DESKTOP_PANELS: 1, // Default desktop UI displaying previous and next pages.
  DESKTOP_FULLBLEED: 2, // Desktop UI if landscape mode is enabled.
  DESKTOP_ONE_PANEL: 4, // Desktop UI with one panel and space around story.
  VERTICAL: 3 // Vertical scrolling versions, for search engine bots indexing.
};

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
export var EmbeddedComponentState = {
  HIDDEN: 0, // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1, // Component has been clicked, a tooltip should be shown.
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
  ACCESS_STATE: 'accessState', // amp-access paywall.
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
  PAGE_SIZE: 'pageSize' };


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
  SET_VIEWER_CUSTOM_CONTROLS: 'setCustomControls' };


/**
 * Functions to compare a data structure from the previous to the new state and
 * detect a mutation, when a simple equality test would not work.
 * @private @const {!Object<string, !function(*, *):boolean>}
 */
var stateComparisonFunctions = (_stateComparisonFunct = {}, _defineProperty(_stateComparisonFunct,
StateProperty.ACTIONS_ALLOWLIST, function (old, curr) {return old.length !== curr.length;}), _defineProperty(_stateComparisonFunct,
StateProperty.INTERACTIVE_COMPONENT_STATE,
/**
 * @param {InteractiveComponentDef} old
 * @param {InteractiveComponentDef} curr
 */
function (old, curr) {return old.element !== curr.element || old.state !== curr.state;}), _defineProperty(_stateComparisonFunct,
StateProperty.NAVIGATION_PATH, function (old, curr) {return old.length !== curr.length;}), _defineProperty(_stateComparisonFunct,
StateProperty.PAGE_IDS, function (old, curr) {return old.length !== curr.length;}), _defineProperty(_stateComparisonFunct,
StateProperty.PAGE_SIZE, function (old, curr) {return (
    old === null ||
    curr === null ||
    old.width !== curr.width ||
    old.height !== curr.height);}), _defineProperty(_stateComparisonFunct,
StateProperty.PANNING_MEDIA_STATE, function (old, curr) {return (
    old === null || curr === null || !deepEquals(old, curr, 2));}), _defineProperty(_stateComparisonFunct,
StateProperty.INTERACTIVE_REACT_STATE, function (old, curr) {return (
    !deepEquals(old, curr, 3));}), _stateComparisonFunct);


/**
 * Returns the new sate.
 * @param  {!State} state Immutable state
 * @param  {!Action} action
 * @param  {*} data
 * @return {!State} new state
 */
var actions = function actions(state, action, data) {var _objectSpread7, _objectSpread12, _objectSpread13, _objectSpread23, _objectSpread26, _objectSpread28, _objectSpread32;
  switch (action) {
    case Action.ADD_INTERACTIVE_REACT:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.INTERACTIVE_REACT_STATE, _objectSpread(_objectSpread({},
        state[StateProperty.INTERACTIVE_REACT_STATE]), {}, _defineProperty({},
        data['interactiveId'], data)))));


    case Action.ADD_NEW_PAGE_ID:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.NEW_PAGE_AVAILABLE_ID, data)));

    case Action.ADD_PANNING_MEDIA_STATE:
      var updatedState = _objectSpread(_objectSpread({},
      state[StateProperty.PANNING_MEDIA_STATE]),
      data);

      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PANNING_MEDIA_STATE, updatedState)));

    case Action.ADD_TO_ACTIONS_ALLOWLIST:
      var newActionsAllowlist = [].concat(
      state[StateProperty.ACTIONS_ALLOWLIST],
      data);

      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.ACTIONS_ALLOWLIST, newActionsAllowlist)));

    // Triggers the amp-acess paywall.
    case Action.TOGGLE_ACCESS:
      // Don't change the PAUSED_STATE if ACCESS_STATE is not changed.
      if (state[StateProperty.ACCESS_STATE] === data) {
        return state;
      }

      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread7 = {}, _defineProperty(_objectSpread7,
        StateProperty.ACCESS_STATE, !!data), _defineProperty(_objectSpread7,
        StateProperty.PAUSED_STATE, !!data), _objectSpread7)));

    case Action.TOGGLE_PAGE_ATTACHMENT_STATE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAGE_ATTACHMENT_STATE, !!data)));

    // Triggers the ad UI.
    case Action.TOGGLE_AD:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.AD_STATE, !!data)));

    // Expands or collapses the affiliate link.
    case Action.TOGGLE_AFFILIATE_LINK:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.AFFILIATE_LINK_STATE, data)));

    case Action.TOGGLE_EDUCATION:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.EDUCATION_STATE, !!data)));

    case Action.TOGGLE_INTERACTIVE_COMPONENT:
      data = /** @type {InteractiveComponentDef} */(data);
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread12 = {}, _defineProperty(_objectSpread12,
        StateProperty.PAUSED_STATE,
        data.state === EmbeddedComponentState.EXPANDED ||
        data.state === EmbeddedComponentState.FOCUSED), _defineProperty(_objectSpread12,
        StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
        data.state !== EmbeddedComponentState.EXPANDED ||
        state.uiState === UIType.DESKTOP_PANELS), _defineProperty(_objectSpread12,
        StateProperty.INTERACTIVE_COMPONENT_STATE, data), _objectSpread12)));

    // Shows or hides the info dialog.
    case Action.TOGGLE_INFO_DIALOG:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread13 = {}, _defineProperty(_objectSpread13,
        StateProperty.INFO_DIALOG_STATE, !!data), _defineProperty(_objectSpread13,
        StateProperty.PAUSED_STATE, !!data), _objectSpread13)));

    // Shows or hides the audio controls.
    case Action.TOGGLE_STORY_HAS_AUDIO:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.STORY_HAS_AUDIO_STATE, !!data)));

    case Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE, !!data)));

    // Shows or hides the play/pause controls.
    case Action.TOGGLE_STORY_HAS_PLAYBACK_UI:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.STORY_HAS_PLAYBACK_UI_STATE, !!data)));

    // Mutes or unmutes the story media.
    case Action.TOGGLE_MUTED:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.MUTED_STATE, !!data)));

    case Action.TOGGLE_PAGE_HAS_AUDIO:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAGE_HAS_AUDIO_STATE, !!data)));

    case Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE, !!data)));

    case Action.TOGGLE_PAUSED:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAUSED_STATE, !!data)));

    case Action.TOGGLE_RTL:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.RTL_STATE, !!data)));

    case Action.TOGGLE_KEYBOARD_ACTIVE_STATE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.KEYBOARD_ACTIVE_STATE, !!data)));

    case Action.TOGGLE_SIDEBAR:
      // Don't change the PAUSED_STATE if SIDEBAR_STATE is not changed.
      if (state[StateProperty.SIDEBAR_STATE] === data) {
        return state;
      }
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread23 = {}, _defineProperty(_objectSpread23,
        StateProperty.PAUSED_STATE, !!data), _defineProperty(_objectSpread23,
        StateProperty.SIDEBAR_STATE, !!data), _objectSpread23)));

    case Action.TOGGLE_HAS_SIDEBAR:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.HAS_SIDEBAR_STATE, !!data)));

    case Action.TOGGLE_SUPPORTED_BROWSER:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.SUPPORTED_BROWSER_STATE, !!data)));

    case Action.TOGGLE_SHARE_MENU:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread26 = {}, _defineProperty(_objectSpread26,
        StateProperty.PAUSED_STATE, !!data), _defineProperty(_objectSpread26,
        StateProperty.SHARE_MENU_STATE, !!data), _objectSpread26)));

    case Action.TOGGLE_SYSTEM_UI_IS_VISIBLE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.SYSTEM_UI_IS_VISIBLE_STATE, !!data)));

    case Action.TOGGLE_UI:
      if (
      state[StateProperty.UI_STATE] === UIType.VERTICAL &&
      data !== UIType.VERTICAL)
      {
        dev().error(TAG, 'Cannot switch away from UIType.VERTICAL');
        return state;
      }
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread28 = {}, _defineProperty(_objectSpread28,
        StateProperty.DESKTOP_STATE, data === UIType.DESKTOP_PANELS), _defineProperty(_objectSpread28,
        StateProperty.UI_STATE, data), _objectSpread28)));

    case Action.SET_GYROSCOPE_PERMISSION:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.GYROSCOPE_PERMISSION_STATE, data)));

    case Action.TOGGLE_VIEWPORT_WARNING:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.VIEWPORT_WARNING_STATE, !!data)));

    case Action.SET_CONSENT_ID:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.CONSENT_ID, data)));

    case Action.CHANGE_PAGE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, (_objectSpread32 = {}, _defineProperty(_objectSpread32,
        StateProperty.CURRENT_PAGE_ID, data.id), _defineProperty(_objectSpread32,
        StateProperty.CURRENT_PAGE_INDEX, data.index), _objectSpread32)));

    case Action.SET_ADVANCEMENT_MODE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.ADVANCEMENT_MODE, data)));

    case Action.SET_NAVIGATION_PATH:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.NAVIGATION_PATH, data)));

    case Action.SET_PAGE_IDS:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAGE_IDS, data)));

    case Action.SET_PAGE_SIZE:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.PAGE_SIZE, data)));

    case Action.SET_VIEWER_CUSTOM_CONTROLS:
      return (/** @type {!State} */_objectSpread(_objectSpread({},
        state), {}, _defineProperty({},
        StateProperty.VIEWER_CUSTOM_CONTROLS, data)));

    default:
      dev().error(TAG, 'Unknown action %s.', action);
      return state;}

};

/**
 * Store service.
 */
export var AmpStoryStoreService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function AmpStoryStoreService(win) {_classCallCheck(this, AmpStoryStoreService);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!Object<string, !Observable>} */
    this.listeners_ = {};

    /** @private {!State} */
    this.state_ = /** @type {!State} */_objectSpread(_objectSpread({},
    this.getDefaultState_()),
    this.getEmbedOverrides_());

  }

  /**
   * Retrieves a state property.
   * @param  {string} key Property to retrieve from the state.
   * @return {*}
   */_createClass(AmpStoryStoreService, [{ key: "get", value:
    function get(key) {
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
     */ }, { key: "subscribe", value:
    function subscribe(key, listener) {var callToInitialize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
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
     */ }, { key: "dispatch", value:
    function dispatch(action, data) {var _this = this;
      var oldState = _objectSpread({}, this.state_);
      this.state_ = actions(this.state_, action, data);

      var comparisonFn;
      Object.keys(this.listeners_).forEach(function (key) {
        comparisonFn = stateComparisonFunctions[key];
        if (
        comparisonFn ?
        comparisonFn(oldState[key], _this.state_[key]) :
        oldState[key] !== _this.state_[key])
        {
          _this.listeners_[key].fire(_this.state_[key]);
        }
      });
    }

    /**
     * Retrieves the default state, that could be overriden by an embed mode.
     * @return {!State}
     * @private
     */ }, { key: "getDefaultState_", value:
    function getDefaultState_() {
      // Compiler won't resolve the object keys and trigger an error for missing
      // properties, so we have to force the type.
      return (/** @type {!State} */({
          [StateProperty.CAN_INSERT_AUTOMATIC_AD]: true,
          [StateProperty.CAN_SHOW_AUDIO_UI]: true,
          [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: true,
          [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
          [StateProperty.CAN_SHOW_PAGINATION_BUTTONS]: true,
          [StateProperty.CAN_SHOW_SHARING_UIS]: true,
          [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: true,
          [StateProperty.VIEWER_CUSTOM_CONTROLS]: [],
          [StateProperty.ACCESS_STATE]: false,
          [StateProperty.AD_STATE]: false,
          [StateProperty.AFFILIATE_LINK_STATE]: null,
          [StateProperty.DESKTOP_STATE]: false,
          [StateProperty.EDUCATION_STATE]: false,
          [StateProperty.GYROSCOPE_PERMISSION_STATE]: '',
          [StateProperty.HAS_SIDEBAR_STATE]: false,
          [StateProperty.INFO_DIALOG_STATE]: false,
          [StateProperty.INTERACTIVE_COMPONENT_STATE]: {
            state: EmbeddedComponentState.HIDDEN },

          [StateProperty.INTERACTIVE_REACT_STATE]: {},
          [StateProperty.KEYBOARD_ACTIVE_STATE]: false,
          [StateProperty.MUTED_STATE]: true,
          [StateProperty.PAGE_ATTACHMENT_STATE]: false,
          [StateProperty.PAGE_HAS_AUDIO_STATE]: false,
          [StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE]: false,
          [StateProperty.PANNING_MEDIA_STATE]: {},
          [StateProperty.PAUSED_STATE]: false,
          [StateProperty.RTL_STATE]: false,
          [StateProperty.SHARE_MENU_STATE]: false,
          [StateProperty.SIDEBAR_STATE]: false,
          [StateProperty.SUPPORTED_BROWSER_STATE]: true,
          [StateProperty.STORY_HAS_AUDIO_STATE]: false,
          [StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE]: false,
          [StateProperty.STORY_HAS_PLAYBACK_UI_STATE]: false,
          [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: true,
          [StateProperty.UI_STATE]: UIType.MOBILE,
          [StateProperty.VIEWPORT_WARNING_STATE]: false,
          // amp-story only allows actions on a case-by-case basis to preserve UX
          // behaviors. By default, no actions are allowed.
          [StateProperty.ACTIONS_ALLOWLIST]: [],
          [StateProperty.CONSENT_ID]: null,
          [StateProperty.CURRENT_PAGE_ID]: '',
          [StateProperty.CURRENT_PAGE_INDEX]: 0,
          [StateProperty.ADVANCEMENT_MODE]: '',
          [StateProperty.NEW_PAGE_AVAILABLE_ID]: '',
          [StateProperty.NAVIGATION_PATH]: [],
          [StateProperty.PAGE_IDS]: [],
          [StateProperty.PAGE_SIZE]: null,
          [StateProperty.PREVIEW_STATE]: false }));

    }

    // @TODO(gmajoulet): These should get their own file if they start growing.
    /**
     * Retrieves the embed mode config, that will override the default state.
     * @return {!Object<StateProperty, *>} Partial state
     * @protected
     */ }, { key: "getEmbedOverrides_", value:
    function getEmbedOverrides_() {var _ref, _ref3, _ref4;
      var embedMode = parseEmbedMode(this.win_.location.hash);
      switch (embedMode) {
        case EmbedMode.NAME_TBD:
          return _ref = {}, _defineProperty(_ref,
          StateProperty.CAN_INSERT_AUTOMATIC_AD, false), _defineProperty(_ref,
          StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT, false), _defineProperty(_ref,
          StateProperty.CAN_SHOW_PAGINATION_BUTTONS, false), _defineProperty(_ref,
          StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP, true), _defineProperty(_ref,
          StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS, false), _defineProperty(_ref,
          StateProperty.MUTED_STATE, false), _ref;

        case EmbedMode.NO_SHARING:
          return _defineProperty({},
          StateProperty.CAN_SHOW_SHARING_UIS, false);

        case EmbedMode.PREVIEW:
          return _ref3 = {}, _defineProperty(_ref3,
          StateProperty.PREVIEW_STATE, true), _defineProperty(_ref3,
          StateProperty.CAN_INSERT_AUTOMATIC_AD, false), _defineProperty(_ref3,
          StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT, false), _defineProperty(_ref3,
          StateProperty.CAN_SHOW_PAGINATION_BUTTONS, false), _defineProperty(_ref3,
          StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP, false), _defineProperty(_ref3,
          StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS, false), _ref3;

        case EmbedMode.NO_SHARING_NOR_AUDIO_UI:
          return _ref4 = {}, _defineProperty(_ref4,
          StateProperty.CAN_SHOW_AUDIO_UI, false), _defineProperty(_ref4,
          StateProperty.CAN_SHOW_SHARING_UIS, false), _ref4;

        default:
          return {};}

    } }]);return AmpStoryStoreService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-store-service.js