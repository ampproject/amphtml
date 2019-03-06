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

import {EmbedMode, parseEmbedMode} from './embed-mode';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {hasOwn} from '../../../src/utils/object';
import {registerServiceBuilder} from '../../../src/service';


/** @type {string} */
const TAG = 'amp-story';


/**
 * Util function to retrieve the store service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @return {!AmpStoryStoreService}
 */
export const getStoreService = win => {
  let service = Services.storyStoreService(win);

  if (!service) {
    service = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', () => service);
  }

  return service;
};


/**
 * Different UI experiences to display the story.
 * @const @enum {number}
 */
export const UIType = {
  MOBILE: 0,
  DESKTOP_PANELS: 1, // Default desktop UI.
  DESKTOP_FULLBLEED: 2, // Desktop UI if landscape mode is enabled.
};

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
export const EmbeddedComponentState = {
  HIDDEN: 0, // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1, // Component has been clicked, a tooltip should be shown.
  EXPANDED: 2, // Component is in expanded mode.
};

/**
 * @typedef {{
 *    element: !Element,
 *    state: !EmbeddedComponentState,
 *    clientX: number,
 *    clientY: number,
 * }}
 */
export let InteractiveComponentDef;

/**
 * @typedef {{
 *    canInsertAutomaticAd: boolean,
 *    canShowBookend: boolean,
 *    canShowNavigationOverlayHint: boolean,
 *    canShowPreviousPageHelp: boolean,
 *    canShowSharingUis: boolean,
 *    canShowSystemLayerButtons: boolean,
 *    accessState: boolean,
 *    adState: boolean,
 *    bookendState: boolean,
 *    desktopState: boolean,
 *    hasSidebarState: boolean,
 *    infoDialogState: boolean,
 *    interactiveEmbeddedComponentState: !InteractiveComponentDef,
 *    landscapeState: boolean,
 *    mutedState: boolean,
 *    pageAudioState: boolean,
 *    pausedState: boolean,
 *    rtlState: boolean,
 *    shareMenuState: boolean,
 *    sidebarState: boolean,
 *    storyHasAudioState: boolean,
 *    storyHasBackgroundAudioState: boolean,
 *    supportedBrowserState: boolean,
 *    systemUiIsVisibleState: boolean,
 *    uiState: !UIType,
 *    viewportWarningState: boolean,
 *    actionsWhitelist: !Array<{tagOrTarget: string, method: string}>,
 *    consentId: ?string,
 *    currentPageId: string,
 *    currentPageIndex: number,
 *    pagesCount: number,
 * }}
 */
export let State;


/** @private @const @enum {string} */
export const StateProperty = {
  // Embed options.
  CAN_INSERT_AUTOMATIC_AD: 'canInsertAutomaticAd',
  CAN_SHOW_BOOKEND: 'canShowBookend',
  CAN_SHOW_NAVIGATION_OVERLAY_HINT: 'canShowNavigationOverlayHint',
  CAN_SHOW_PREVIOUS_PAGE_HELP: 'canShowPreviousPageHelp',
  CAN_SHOW_SHARING_UIS: 'canShowSharingUis',
  CAN_SHOW_SYSTEM_LAYER_BUTTONS: 'canShowSystemLayerButtons',

  // App States.
  ACCESS_STATE: 'accessState', // amp-access paywall.
  AD_STATE: 'adState',
  BOOKEND_STATE: 'bookendState',
  DESKTOP_STATE: 'desktopState',
  HAS_SIDEBAR_STATE: 'hasSidebarState',
  INFO_DIALOG_STATE: 'infoDialogState',
  INTERACTIVE_COMPONENT_STATE: 'interactiveEmbeddedComponentState',
  LANDSCAPE_STATE: 'landscapeState',
  MUTED_STATE: 'mutedState',
  PAGE_HAS_AUDIO_STATE: 'pageAudioState',
  PAUSED_STATE: 'pausedState',
  RTL_STATE: 'rtlState',
  SHARE_MENU_STATE: 'shareMenuState',
  SIDEBAR_STATE: 'sidebarState',
  SUPPORTED_BROWSER_STATE: 'supportedBrowserState',
  // Any page has audio, or amp-story has a `background-audio` attribute.
  STORY_HAS_AUDIO_STATE: 'storyHasAudioState',
  // amp-story has a `background-audio` attribute.
  STORY_HAS_BACKGROUND_AUDIO_STATE: 'storyHasBackgroundAudioState',
  SYSTEM_UI_IS_VISIBLE_STATE: 'systemUiIsVisibleState',
  UI_STATE: 'uiState',
  VIEWPORT_WARNING_STATE: 'viewportWarningState',

  // App data.
  ACTIONS_WHITELIST: 'actionsWhitelist',
  CONSENT_ID: 'consentId',
  CURRENT_PAGE_ID: 'currentPageId',
  CURRENT_PAGE_INDEX: 'currentPageIndex',
  PAGES_COUNT: 'pagesCount',
  ADVANCEMENT_MODE: 'advancementMode',
};


/** @private @const @enum {string} */
export const Action = {
  ADD_TO_ACTIONS_WHITELIST: 'addToActionsWhitelist',
  CHANGE_PAGE: 'setCurrentPageId',
  SET_CONSENT_ID: 'setConsentId',
  SET_PAGES_COUNT: 'setPagesCount',
  SET_ADVANCEMENT_MODE: 'setAdvancementMode',
  TOGGLE_ACCESS: 'toggleAccess',
  TOGGLE_AD: 'toggleAd',
  TOGGLE_BOOKEND: 'toggleBookend',
  TOGGLE_HAS_SIDEBAR: 'toggleHasSidebar',
  TOGGLE_INFO_DIALOG: 'toggleInfoDialog',
  TOGGLE_INTERACTIVE_COMPONENT: 'toggleInteractiveComponent',
  TOGGLE_LANDSCAPE: 'toggleLandscape',
  TOGGLE_MUTED: 'toggleMuted',
  TOGGLE_PAGE_HAS_AUDIO: 'togglePageHasAudio',
  TOGGLE_PAUSED: 'togglePaused',
  TOGGLE_RTL: 'toggleRtl',
  TOGGLE_SHARE_MENU: 'toggleShareMenu',
  TOGGLE_SIDEBAR: 'toggleSidebar',
  TOGGLE_SUPPORTED_BROWSER: 'toggleSupportedBrowser',
  TOGGLE_STORY_HAS_AUDIO: 'toggleStoryHasAudio',
  TOGGLE_STORY_HAS_BACKGROUND_AUDIO: 'toggleStoryHasBackgroundAudio',
  TOGGLE_SYSTEM_UI_IS_VISIBLE: 'toggleSystemUiIsVisible',
  TOGGLE_UI: 'toggleUi',
  TOGGLE_VIEWPORT_WARNING: 'toggleViewportWarning',
};


/**
 * Functions to compare a data structure from the previous to the new state and
 * detect a mutation, when a simple equality test would not work.
 * @private @const {!Object<string, !function(*, *):boolean>}
 */
const stateComparisonFunctions = {
  [StateProperty.ACTIONS_WHITELIST]: (old, curr) => old.length !== curr.length,
  [StateProperty.INTERACTIVE_COMPONENT_STATE]:
      /**
       * @param {InteractiveComponentDef} old
       * @param {InteractiveComponentDef} curr
       */
      (old, curr) => old.element !== curr.element || old.state !== curr.state,
};


/**
 * Returns the new sate.
 * @param  {!State} state Immutable state
 * @param  {!Action} action
 * @param  {*} data
 * @return {!State} new state
 */
const actions = (state, action, data) => {
  switch (action) {
    case Action.ADD_TO_ACTIONS_WHITELIST:
      const newActionsWhitelist =
          [].concat(state[StateProperty.ACTIONS_WHITELIST], data);
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.ACTIONS_WHITELIST]: newActionsWhitelist}));
    // Triggers the amp-acess paywall.
    case Action.TOGGLE_ACCESS:
      // Don't change the PAUSED_STATE if ACCESS_STATE is not changed.
      if (state[StateProperty.ACCESS_STATE] === data) {
        return state;
      }

      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.ACCESS_STATE]: !!data,
            [StateProperty.PAUSED_STATE]: !!data,
          }));
    // Triggers the ad UI.
    case Action.TOGGLE_AD:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.AD_STATE]: !!data}));
    // Shows or hides the bookend.
    case Action.TOGGLE_BOOKEND:
      if (!state[StateProperty.CAN_SHOW_BOOKEND]) {
        return state;
      }
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.BOOKEND_STATE]: !!data,
            [StateProperty.PAUSED_STATE]: !!data,
          }));
    case Action.TOGGLE_INTERACTIVE_COMPONENT:
      data = /** @type {InteractiveComponentDef} */ (data);
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.PAUSED_STATE]:
              data.state === EmbeddedComponentState.EXPANDED ||
              data.state === EmbeddedComponentState.FOCUSED,
            [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]:
              data.state !== EmbeddedComponentState.EXPANDED ||
              state.uiState === UIType.DESKTOP_PANELS,
            [StateProperty.INTERACTIVE_COMPONENT_STATE]: data,
          }));
    // Shows or hides the info dialog.
    case Action.TOGGLE_INFO_DIALOG:
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.INFO_DIALOG_STATE]: !!data,
            [StateProperty.PAUSED_STATE]: !!data,
          }));
    case Action.TOGGLE_LANDSCAPE:
        return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.LANDSCAPE_STATE]: !!data}));
    // Shows or hides the audio controls.
    case Action.TOGGLE_STORY_HAS_AUDIO:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.STORY_HAS_AUDIO_STATE]: !!data}));
    case Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO:
      return /** @type {!State} */ (Object.assign({}, state,
          {[StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE]: !!data}));
    // Mutes or unmutes the story media.
    case Action.TOGGLE_MUTED:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.MUTED_STATE]: !!data}));
    case Action.TOGGLE_PAGE_HAS_AUDIO:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.PAGE_HAS_AUDIO_STATE]: !!data}));
    case Action.TOGGLE_PAUSED:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.PAUSED_STATE]: !!data}));
    case Action.TOGGLE_RTL:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.RTL_STATE]: !!data}));
    case Action.TOGGLE_SIDEBAR:
      // Don't change the PAUSED_STATE if SIDEBAR_STATE is not changed.
      if (state[StateProperty.SIDEBAR_STATE] === data) {
        return state;
      }
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.PAUSED_STATE]: !!data,
            [StateProperty.SIDEBAR_STATE]: !!data,
          }));
    case Action.TOGGLE_HAS_SIDEBAR:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.HAS_SIDEBAR_STATE]: !!data}));
    case Action.TOGGLE_SUPPORTED_BROWSER:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.SUPPORTED_BROWSER_STATE]: !!data}));
    case Action.TOGGLE_SHARE_MENU:
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.PAUSED_STATE]: !!data,
            [StateProperty.SHARE_MENU_STATE]: !!data,
          }));
    case Action.TOGGLE_SYSTEM_UI_IS_VISIBLE:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: !!data}));
    case Action.TOGGLE_UI:
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            // Keep DESKTOP_STATE for compatiblity with v0.1.
            [StateProperty.DESKTOP_STATE]: data === UIType.DESKTOP_PANELS,
            [StateProperty.UI_STATE]: data,
          }));
    case Action.TOGGLE_VIEWPORT_WARNING:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.VIEWPORT_WARNING_STATE]: !!data}));
    case Action.SET_CONSENT_ID:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.CONSENT_ID]: data}));
    case Action.CHANGE_PAGE:
      return /** @type {!State} */ (Object.assign(
          {}, state, {
            [StateProperty.CURRENT_PAGE_ID]: data.id,
            [StateProperty.CURRENT_PAGE_INDEX]: data.index,
          }));
    case Action.SET_PAGES_COUNT:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.PAGES_COUNT]: data}));
    case Action.SET_ADVANCEMENT_MODE:
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.ADVANCEMENT_MODE]: data}));
    default:
      dev().error(TAG, 'Unknown action %s.', action);
      return state;
  }
};


/**
 * Store service.
 */
export class AmpStoryStoreService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!Object<string, !Observable>} */
    this.listeners_ = {};

    /** @private {!State} */
    this.state_ = /** @type {!State} */ (Object.assign(
        {}, this.getDefaultState_(), this.getEmbedOverrides_()));
  }

  /**
   * Retrieves a state property.
   * @param  {string} key Property to retrieve from the state.
   * @return {*}
   */
  get(key) {
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
  subscribe(key, listener, callToInitialize = false) {
    if (!hasOwn(this.state_, key)) {
      dev().error(TAG, 'Can\'t subscribe to unknown state %s.', key);
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
  dispatch(action, data) {
    const oldState = Object.assign({}, this.state_);
    this.state_ = actions(this.state_, action, data);

    let comparisonFn;
    Object.keys(this.listeners_).forEach(key => {
      comparisonFn = stateComparisonFunctions[key];
      if (comparisonFn ?
        comparisonFn(oldState[key], this.state_[key]) :
        oldState[key] !== this.state_[key]) {
        this.listeners_[key].fire(this.state_[key]);
      }
    });
  }

  /**
   * Retrieves the default state, that could be overriden by an embed mode.
   * @return {!State}
   * @private
   */
  getDefaultState_() {
    // Compiler won't resolve the object keys and trigger an error for missing
    // properties, so we have to force the type.
    return /** @type {!State} */ ({
      [StateProperty.CAN_INSERT_AUTOMATIC_AD]: true,
      [StateProperty.CAN_SHOW_BOOKEND]: true,
      [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: true,
      [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
      [StateProperty.CAN_SHOW_SHARING_UIS]: true,
      [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: true,
      [StateProperty.ACCESS_STATE]: false,
      [StateProperty.AD_STATE]: false,
      [StateProperty.BOOKEND_STATE]: false,
      [StateProperty.DESKTOP_STATE]: false,
      [StateProperty.HAS_SIDEBAR_STATE]: false,
      [StateProperty.INFO_DIALOG_STATE]: false,
      [StateProperty.INTERACTIVE_COMPONENT_STATE]: {
        state: EmbeddedComponentState.HIDDEN,
      },
      [StateProperty.LANDSCAPE_STATE]: false,
      [StateProperty.MUTED_STATE]: true,
      [StateProperty.PAGE_HAS_AUDIO_STATE]: false,
      [StateProperty.PAUSED_STATE]: false,
      [StateProperty.RTL_STATE]: false,
      [StateProperty.SHARE_MENU_STATE]: false,
      [StateProperty.SIDEBAR_STATE]: false,
      [StateProperty.SUPPORTED_BROWSER_STATE]: true,
      [StateProperty.STORY_HAS_AUDIO_STATE]: false,
      [StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE]: false,
      [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: true,
      [StateProperty.UI_STATE]: UIType.MOBILE,
      [StateProperty.VIEWPORT_WARNING_STATE]: false,
      // amp-story only allows actions on a case-by-case basis to preserve UX
      // behaviors. By default, no actions are allowed.
      [StateProperty.ACTIONS_WHITELIST]: [],
      [StateProperty.CONSENT_ID]: null,
      [StateProperty.CURRENT_PAGE_ID]: '',
      [StateProperty.CURRENT_PAGE_INDEX]: 0,
      [StateProperty.PAGES_COUNT]: 0,
      [StateProperty.ADVANCEMENT_MODE]: '',
    });
  }

  // @TODO(gmajoulet): These should get their own file if they start growing.
  /**
   * Retrieves the embed mode config, that will override the default state.
   * @return {!Object<StateProperty, *>} Partial state
   * @private
   */
  getEmbedOverrides_() {
    const embedMode = parseEmbedMode(this.win_.location.hash);
    switch (embedMode) {
      case EmbedMode.NAME_TBD:
        return {
          [StateProperty.CAN_INSERT_AUTOMATIC_AD]: false,
          [StateProperty.CAN_SHOW_BOOKEND]: false,
          [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
          [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
          [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
          [StateProperty.MUTED_STATE]: false,
        };
      case EmbedMode.NO_SHARING:
        return {
          [StateProperty.CAN_SHOW_SHARING_UIS]: false,
        };
      default:
        return {};
    }
  }
}
