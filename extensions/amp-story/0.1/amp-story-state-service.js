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
import {EmbedMode} from './embed-mode';
import {Observable} from '../../../src/observable';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isArray} from '../../../src/types';


/** @typedef {{type: !StateType, value: *}} */
export let StateChangeEventDef;

/** @private @const @enum {string} */
export const StateType = {
  BOOKEND_ACTIVE: 'bookendactive',
  NAVIGATION_OVERLAY_HINT_SHOWN: 'navigationoverlayhintshown',
  NO_PREVIOUS_PAGE_HELP_SHOWN: 'nopreviouspagehelpshown',
  ALLOW_AUTOMATIC_AD_INSERTION: 'allowautomaticadinsertion',
  SYSTEM_LAYER_BUTTONS_SHOWN: 'systemlayerbuttonsshown',
  MUTE_AUDIO_BY_DEFAULT: 'muteaudiobydefault',
};

/**
 *
 */
export class AmpStoryStateService {
  // TODO(newmuis): Scope this to story using a static for(...) function so that
  // it can be retrieved from other classes (e.g. AmpStoryPage) without directly
  // passing it.
  constructor() {
    this.states_ = dict({});
  }

  /**
   * @param {!StateType} stateType
   * @return {!State}
   */
  getState(stateType) {
    return dev().assert(this.states_[stateType], `Unknown state ${stateType}.`);
  }

  /**
   * @param {!State|!Array<!State>} stateOrArr
   */
  initializeState(stateOrArr) {
    if (isArray(stateOrArr)) {
      stateOrArr.forEach(state => {
        this.initializeSinglevalue_(state);
      });
    } else {
      this.initializeSinglevalue_(/** @type {!State} */ (stateOrArr));
    }
  }

  /**
   * @param {!State} state
   * @private
   */
  initializeSinglevalue_(state) {
    dev().assert(!this.states_[state.type],
        `Duplicate entries for state ${state.type}.`);
    this.states_[state.type] = state;
  }

  /**
   * @param {!EmbedMode} embedMode
   */
  initializeEmbedMode(embedMode) {
    switch (embedMode) {
      case EmbedMode.NAME_TBD:
        this.initializeState([
          new State(StateType.BOOKEND_ACTIVE,
              false /* defaultValue */, false /* isModifiable */),
          new State(StateType.NAVIGATION_OVERLAY_HINT_SHOWN,
              false /* defaultValue */, false /* isModifiable */),
          new State(StateType.NO_PREVIOUS_PAGE_HELP_SHOWN,
              false /* defaultValue */, true /* isModifiable */),
          new State(StateType.ALLOW_AUTOMATIC_AD_INSERTION,
              false /* defaultValue */, false /* isModifiable */),
          new State(StateType.SYSTEM_LAYER_BUTTONS_SHOWN,
              false /* defaultValue */, false /* isModifiable */),
          new State(StateType.MUTE_AUDIO_BY_DEFAULT,
              false /* defaultValue */, false /* isModifiable */),
        ]);
        break;

      default:
        this.initializeState([
          new State(StateType.BOOKEND_ACTIVE,
              false /* defaultValue */, true /* isModifiable */),
          new State(StateType.NAVIGATION_OVERLAY_HINT_SHOWN,
              false /* defaultValue */, true /* isModifiable */),
          new State(StateType.NO_PREVIOUS_PAGE_HELP_SHOWN,
              false /* defaultValue */, true /* isModifiable */),
          new State(StateType.ALLOW_AUTOMATIC_AD_INSERTION,
              true /* defaultValue */, true /* isModifiable */),
          new State(StateType.SYSTEM_LAYER_BUTTONS_SHOWN,
              true /* defaultValue */, true /* isModifiable */),
          new State(StateType.MUTE_AUDIO_BY_DEFAULT,
              true /* defaultValue */, true /* isModifiable */),
        ]);
        break;
    }
  }
}


/**
 * TODO(newmuis): Perhaps some of this can be merged with
 * ../../../src/finite-state-machine.js
 * @template T
 */
class State {
  /**
   * @param {!StateType} type
   * @param {T} defaultValue
   * @param {boolean} isModifiable
   */
  constructor(type, defaultValue, isModifiable) {
    /** @const {!StateType} */
    this.type = type;

    /** @private {T} */
    this.value_ = defaultValue;

    /** @private @const {!Observable<StateChangeEventDef>} */
    this.observable_ = new Observable();

    /** @private @const {boolean} */
    this.isModifiable_ = isModifiable;
  }

  /**
   * @return {boolean}
   */
  isModifiable() {
    return this.isModifiable_;
  }

  /**
   * @return {T}
   */
  getValue() {
    return this.value_;
  }

  /**
   * @param {function(!StateChangeEventDef):void} stateChangeFn
   */
  observe(stateChangeFn) {
    this.observable_.add(stateChangeFn);
  }

  /**
   * @param {T} value The new state
   */
  setValue(value) {
    if (this.isModifiable) {
      dev().error('AMP-STORY',
          `Cannot change readonly state ${this.isModifiable}.`);
      return;
    }

    if (value === this.getValue()) {
      return;
    }

    this.value_ = value;
    this.onStateUpdated_();
  }

  /** @private */
  onStateUpdated_() {
    this.observable_.fire({type: this.type, value: this.value_});
  }
}
