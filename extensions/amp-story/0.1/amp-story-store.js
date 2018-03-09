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

const defaultState = {
  canShowBookend: true,
  canShowNavigationOverlayHint: true,
  canShowSystemLayerButtons: true,
  canShowPreviousPageHelp: true,
  allowAutomaticAdInsertion: true,
};


const actions = (state, action) => {
  switch (action.type) {
    case 'toggleBookend':
      return Object.assign({}, state, {bookendEnabled: action.payload});
    default:
      console.log('Action not implemented', action);
      break;
  }
};


export const store = {
  state_: defaultState,

  listeners: {},

  get(key) {
    return this.state_[key];
  },

  subscribe(key, listener) {
    if (!this.state_.hasOwnProperty(key)) {
      return console.error('Property does not exist');
    }
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(listener);
  },

  dispatch(action) {
    const oldState = Object.assign({}, this.state_);
    this.state_ = actions(this.state_, action);
    Object.keys(this.listeners).forEach((key) => {
      if (oldState[key] !== this.state_[key]) {
        this.listeners[key].forEach((listener) => listener(this.state_));
      }
    });
  },
};
