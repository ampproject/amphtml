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


/** @type {string} */
const TAG = 'amp-story';


/**
 * @typedef {{
 *    caninsertautomaticad: boolean,
 *    canshowbookend: boolean,
 *    canshownavigationoverlayhint: boolean,
 *    canshowpreviouspagehelp: boolean,
 *    canshowsystemlayerbuttons: boolean,
 *    bookendstate: boolean,
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
  CAN_SHOW_SYSTEM_LAYER_BUTTONS: 'canshowsystemlayerbuttons',

  // App States.
  BOOKEND_STATE: 'bookendstate',
};


/** @private @const @enum {string} */
export const Action = {
  TOGGLE_BOOKEND: 'togglebookend',
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
    case Action.TOGGLE_BOOKEND:
      if (!state[StateProperty.CAN_SHOW_BOOKEND]) {
        return state;
      }
      return /** @type {!State} */ (Object.assign(
          {}, state, {[StateProperty.BOOKEND_STATE]: !!data}));
    default:
      dev().error(TAG, `Unknown action ${action}.`);
      return state;
  }
};


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
    if (!this.state_.hasOwnProperty(key)) {
      dev().error(TAG, `Unknown state ${key}.`);
      return;
    }
    return this.state_[key];
  }

  /**
   * Subscribes to a state property mutations.
   * @param  {string} key
   * @param  {!Function} listener
   */
  subscribe(key, listener) {
    if (!this.state_.hasOwnProperty(key)) {
      dev().error(TAG, `Can't subscribe to unknown state ${key}.`);
      return;
    }
    if (!this.listeners_[key]) {
      this.listeners_[key] = new Observable();
    }
    this.listeners_[key].add(listener);
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
      [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: true,
      [StateProperty.BOOKEND_STATE]: false,
    });
  }

  /**
   * Retrieves the embed mode config, that will override the default state.
   * @todo(gmajoulet): These should get their own file if they start growing.
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
        };
      default:
        return {};
    }
  }
}
