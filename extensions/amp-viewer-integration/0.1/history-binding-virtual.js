/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '#service';
import {dict} from '#core/types/object';
import {dev, devAssert} from '../../../src/log';

/** @private @const {string} */
const TAG_ = 'HistoryBindingVirtual';

/**
 * Implementation of HistoryBindingInterface that assumes a virtual history that
 * relies on viewer's "pushHistory", "popHistory" and "historyPopped"
 * protocol.
 *
 * Visible for testing.
 *
 * @implements {HistoryBindingInterface}
 */
export class HistoryBindingVirtual {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {?function(!HistoryStateDef)} */
    this.onStateUpdated_ = null;

    /** @private {!UnlistenDef} */
    this.unlistenOnHistoryPopped_ = this.viewer_.onMessage(
      'historyPopped',
      (data) => this.onHistoryPopped_(data)
    );
  }

  /** @override */
  replaceStateForTarget(target) {
    devAssert(target[0] == '#', 'target should start with a #');
    this.win.location.replace(target);
  }

  /** @override */
  cleanup() {
    this.unlistenOnHistoryPopped_();
  }

  /** @override */
  setOnStateUpdated(callback) {
    this.onStateUpdated_ = callback;
  }

  /**
   * Gets the history state from a response. This checks if `maybeHistoryState`
   * is a history state, and returns it if so, falling back to `fallbackState`
   * otherwise.
   * @param {*} maybeHistoryState
   * @param {!HistoryStateDef} fallbackState
   * @param {string} debugId
   * @return {!HistoryStateDef}
   * @private
   */
  toHistoryState_(maybeHistoryState, fallbackState, debugId) {
    if (this.isHistoryState_(maybeHistoryState)) {
      return /** @type {!HistoryStateDef} */ (maybeHistoryState);
    } else {
      dev().warn(
        TAG_,
        'Ignored unexpected "%s" data:',
        debugId,
        maybeHistoryState
      );
    }
    return fallbackState;
  }

  /**
   * @param {*} maybeHistoryState
   * @return {boolean}
   */
  isHistoryState_(maybeHistoryState) {
    return !!maybeHistoryState && maybeHistoryState['stackIndex'] !== undefined;
  }

  /**
   * `pushHistory`
   *
   *   Request:  {'stackIndex': string}
   *   Response: undefined | {'stackIndex': string}
   *
   * @override
   */
  push(opt_stateUpdate) {
    const message = /** @type {!JsonObject} */ ({
      'stackIndex': this.stackIndex_ + 1,
      ...(opt_stateUpdate || {}),
    });
    const push = 'pushHistory';
    return this.viewer_
      .sendMessageAwaitResponse(push, message)
      .then((response) => {
        const fallbackState = /** @type {!HistoryStateDef} */ (message);
        const newState = this.toHistoryState_(response, fallbackState, push);
        this.updateHistoryState_(newState);
        return newState;
      });
  }

  /**
   * `popHistory`
   *
   *   Request:  {'stackIndex': string}
   *   Response: undefined | {'stackIndex': string}
   *
   * @override
   */
  pop(stackIndex) {
    if (stackIndex > this.stackIndex_) {
      return this.get();
    }
    const message = dict({'stackIndex': this.stackIndex_});
    const pop = 'popHistory';
    return this.viewer_
      .sendMessageAwaitResponse(pop, message)
      .then((response) => {
        const fallbackState = /** @type {!HistoryStateDef} */ (
          dict({
            'stackIndex': this.stackIndex_ - 1,
          })
        );
        const newState = this.toHistoryState_(response, fallbackState, pop);
        this.updateHistoryState_(newState);
        return newState;
      });
  }

  /**
   * `replaceHistory`
   *
   *   Request:   {'fragment': string}
   *   Response:  undefined | {'stackIndex': string}
   *
   * @override
   */
  replace(opt_stateUpdate) {
    if (opt_stateUpdate && opt_stateUpdate.url) {
      if (!this.viewer_.hasCapability('fullReplaceHistory')) {
        // Full URL replacement requested, but not supported by the viewer.
        // Don't update, and return the current state.
        const curState = /** @type {!HistoryStateDef} */ (
          dict({
            'stackIndex': this.stackIndex_,
          })
        );
        return Promise.resolve(curState);
      }

      // replace fragment, only explicit fragment param will be sent.
      const url = opt_stateUpdate.url.replace(/#.*/, '');
      opt_stateUpdate.url = url;
    }

    const message = /** @type {!JsonObject} */ ({
      'stackIndex': this.stackIndex_,
      ...(opt_stateUpdate || {}),
    });
    const replace = 'replaceHistory';
    return this.viewer_
      .sendMessageAwaitResponse(replace, message, /* cancelUnsent */ true)
      .then((response) => {
        const fallbackState = /** @type {!HistoryStateDef} */ (message);
        const newState = this.toHistoryState_(response, fallbackState, replace);
        this.updateHistoryState_(newState);
        return newState;
      });
  }

  /**
   * Note: Only returns the current `stackIndex`.
   * @override
   */
  get() {
    // Not sure why this type coercion is necessary, but CC complains otherwise.
    return Promise.resolve(
      /** @type {!HistoryStateDef} */ ({
        data: undefined,
        fragment: '',
        stackIndex: this.stackIndex_,
        title: '',
      })
    );
  }

  /**
   * `historyPopped` (from viewer)
   *
   *   Request:  {'newStackIndex': number} | {'stackIndex': number}
   *   Response: undefined
   *
   * @param {!JsonObject} data
   * @private
   */
  onHistoryPopped_(data) {
    if (data['newStackIndex'] !== undefined) {
      data['stackIndex'] = data['newStackIndex'];
    }
    if (this.isHistoryState_(data)) {
      this.updateHistoryState_(/** @type {!HistoryStateDef} */ (data));
    } else {
      dev().warn(TAG_, 'Ignored unexpected "historyPopped" data:', data);
    }
  }

  /**
   * @param {!HistoryStateDef} state
   * @private
   */
  updateHistoryState_(state) {
    const {stackIndex} = state;
    if (this.stackIndex_ != stackIndex) {
      dev().fine(TAG_, `stackIndex: ${this.stackIndex_} -> ${stackIndex}`);
      this.stackIndex_ = stackIndex;
      if (this.onStateUpdated_) {
        this.onStateUpdated_(state);
      }
    }
  }

  /**
   * `getFragment`
   *
   *   Request:  undefined
   *   Response: string
   *
   * @override
   */
  getFragment() {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve('');
    }
    return this.viewer_
      .sendMessageAwaitResponse(
        'getFragment',
        undefined,
        /* cancelUnsent */ true
      )
      .then((data) => {
        if (!data) {
          return '';
        }
        let hash = dev().assertString(data);
        /* Strip leading '#'*/
        if (hash[0] == '#') {
          hash = hash.substr(1);
        }
        return hash;
      });
  }

  /**
   * `replaceHistory`
   *
   *   Request:   {'fragment': string}
   *   Response:  undefined | {'stackIndex': string}
   *
   * @override
   */
  updateFragment(fragment) {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve();
    }
    return /** @type {!Promise} */ (
      this.viewer_.sendMessageAwaitResponse(
        'replaceHistory',
        dict({'fragment': fragment}),
        /* cancelUnsent */ true
      )
    );
  }
}
