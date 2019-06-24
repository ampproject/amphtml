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
import {dev} from '../../../src/log';
import {hasOwn} from '../../../src/utils/object';

/** @type {string} */
const TAG = 'amp-story';

/**
 * @typedef {{
 *    caninsertautomaticad: boolean,
 *    canshowbookend: boolean,
 *    canshownavigationoverlayhint: boolean,
 *    canshowpreviouspagehelp: boolean,
 *    canshowsharinguis: boolean,
 *    canshowsystemlayerbuttons: boolean,
 *    adstate: boolean,
 *    bookendstate: boolean,
 *    desktopstate: boolean,
 *    infodialogstate: boolean,
 *    hasaudiostate: boolean,
 *    landscapestate: boolean,
 *    mutedstate: boolean,
 *    sharemenustate: boolean,
 *    supportedbrowserstate: boolean,
 *    consentid: ?string,
 *    currentpageid: string,
 * }}
 */
export let State;

/** @private @const @enum {string} */
export const StateProperty = {
  // Embed options.
  CAN_INSERT_AUTOMATIC_AD: 'caninsertautomaticad',
  CAN_SHOW_BOOKEND: 'canshowbookend',
  CAN_SHOW_NAVIGATION_OVERLAY_HINT: 'canshownavigationoverlayhint',
  CAN_SHOW_PREVIOUS_PAGE_HELP: 'canshowpreviouspagehelp',
  CAN_SHOW_SHARING_UIS: 'canshowsharinguis',
  CAN_SHOW_SYSTEM_LAYER_BUTTONS: 'canshowsystemlayerbuttons',

  // App States.
  AD_STATE: 'adstate',
  BOOKEND_STATE: 'bookendstate',
  DESKTOP_STATE: 'desktopstate',
  HAS_AUDIO_STATE: 'hasaudiostate',
  INFO_DIALOG_STATE: 'infodialogstate',
  LANDSCAPE_STATE: 'landscapestate',
  MUTED_STATE: 'mutedstate',
  SHARE_MENU_STATE: 'sharemenustate',
  SUPPORTED_BROWSER_STATE: 'supportedbrowserstate',

  // App data.
  CONSENT_ID: 'consentid',
  CURRENT_PAGE_ID: 'currentpageid',
  CURRENT_PAGE_INDEX: 'currentpageindex',
};

/** @private @const @enum {string} */
export const Action = {
  CHANGE_PAGE: 'changepage',
  SET_CONSENT_ID: 'setconsentid',
  TOGGLE_AD: 'togglead',
  TOGGLE_BOOKEND: 'togglebookend',
  TOGGLE_DESKTOP: 'toggledesktop',
  TOGGLE_INFO_DIALOG: 'toggleinfodialog',
  TOGGLE_HAS_AUDIO: 'togglehasaudio',
  TOGGLE_LANDSCAPE: 'togglelandscape',
  TOGGLE_MUTED: 'togglemuted',
  TOGGLE_SHARE_MENU: 'togglesharemenu',
  TOGGLE_SUPPORTED_BROWSER: 'togglesupportedbrowser',
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
    // Triggers the ad UI.
    case Action.TOGGLE_AD:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.AD_STATE]: !!data,
      }));
    // Shows or hides the bookend.
    case Action.TOGGLE_BOOKEND:
      if (!state[StateProperty.CAN_SHOW_BOOKEND]) {
        return state;
      }
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.BOOKEND_STATE]: !!data,
      }));
    // Triggers the desktop UI.
    case Action.TOGGLE_DESKTOP:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.DESKTOP_STATE]: !!data,
      }));
    // Shows or hides the info dialog.
    case Action.TOGGLE_INFO_DIALOG:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.INFO_DIALOG_STATE]: !!data,
      }));
    // Shows or hides the audio controls.
    case Action.TOGGLE_HAS_AUDIO:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.HAS_AUDIO_STATE]: !!data,
      }));
    case Action.TOGGLE_LANDSCAPE:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.LANDSCAPE_STATE]: !!data,
      }));
    // Mutes or unmutes the story media.
    case Action.TOGGLE_MUTED:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.MUTED_STATE]: !!data,
      }));
    case Action.TOGGLE_SUPPORTED_BROWSER:
      if (data) {
        dev().error(TAG, 'Cannot exit unsupported browser state.');
      }
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.CAN_INSERT_AUTOMATIC_AD]: false,
        [StateProperty.CAN_SHOW_BOOKEND]: false,
        [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
        [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: false,
        [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
        [StateProperty.BOOKEND_STATE]: false,
        [StateProperty.DESKTOP_STATE]: false,
        [StateProperty.HAS_AUDIO_STATE]: false,
        [StateProperty.MUTED_STATE]: true,
        [StateProperty.SUPPORTED_BROWSER_STATE]: false,
      }));
    case Action.TOGGLE_SHARE_MENU:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.SHARE_MENU_STATE]: !!data,
      }));
    case Action.SET_CONSENT_ID:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.CONSENT_ID]: data,
      }));
    case Action.CHANGE_PAGE:
      return /** @type {!State} */ (Object.assign({}, state, {
        [StateProperty.CURRENT_PAGE_ID]: data.id,
        [StateProperty.CURRENT_PAGE_INDEX]: data.index,
      }));
    default:
      dev().error(TAG, `Unknown action ${action}.`);
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
      {},
      this.getDefaultState_(),
      this.getEmbedOverrides_()
    ));
  }

  /**
   * Retrieves a state property.
   * @param  {string} key Property to retrieve from the state.
   * @return {*}
   */
  get(key) {
    if (!hasOwn(this.state_, key)) {
      dev().error(TAG, `Unknown state ${key}.`);
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
      dev().error(TAG, `Can't subscribe to unknown state ${key}.`);
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

    Object.keys(this.listeners_).forEach(key => {
      if (oldState[key] !== this.state_[key]) {
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
      [StateProperty.AD_STATE]: false,
      [StateProperty.BOOKEND_STATE]: false,
      [StateProperty.DESKTOP_STATE]: false,
      [StateProperty.INFO_DIALOG_STATE]: false,
      [StateProperty.HAS_AUDIO_STATE]: false,
      [StateProperty.LANDSCAPE_STATE]: false,
      [StateProperty.MUTED_STATE]: true,
      [StateProperty.SHARE_MENU_STATE]: false,
      [StateProperty.SUPPORTED_BROWSER_STATE]: true,
      [StateProperty.CONSENT_ID]: null,
      [StateProperty.CURRENT_PAGE_ID]: '',
      [StateProperty.CURRENT_PAGE_INDEX]: 0,
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
