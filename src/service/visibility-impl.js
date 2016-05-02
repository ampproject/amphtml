/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getService} from '../service';
import {resourcesFor} from '../resources';
import {timer} from '../timer';
import {viewportFor} from '../viewport';

/** @const {number} */
const LISTENER_INITIAL_RUN_DELAY_ = 100;

/**
 * This type signifies a callback that gets called when visibility conditions
 * are met.
 * @typedef {function()}
 */
let VisibilityListenerCallbackDef;

/**
 * @typedef {Object<string, JSONObject|VisibilityListenerCallbackDef>}
 */
let VisibilityListenerDef;

/**
 * Allows tracking of AMP elements in the viewport.
 *
 * This class allows a caller to specify conditions to evaluate when an element
 * is in viewport and for how long. If the conditions are satisfied, a provided
 * callback is called.
 */
export class Visibility {

  /** @param {!Window} */
  constructor(win) {
    this.win_ = win;

    /**
     * key: resource id.
     * value: [{ config: <config>, callback: <callback>}]
     * @type {Object<string, Array.<VisibilityListenerDef>>}
     * @private
     */
    this.listeners_ = Object.create(null);

    /** @private {Array<!Resource>} */
    this.resources_ = [];

    /** @private @const {function} */
    this.boundScrollListener_ = this.scrollListener_.bind(this);

    /** @private {boolean} */
    this.scrollListenerRegistered_ = false;

    /** @private {!Resources} */
    this.resourcesService_ = resourcesFor(this.win_);

    /** @private {number|string} */
    this.scheduledRunId_ = null;
  }

  /** @private */
  registerForViewportEvents_() {
    if (!this.scrollListenerRegistered__) {
      const viewport = viewportFor(this.win_);

      // Currently unlistens are not being used. In the event that no resources
      // are actively being monitored, the scrollListener should be very cheap.
      viewport.onScroll(this.boundScrollListener_);
      viewport.onChanged(this.boundScrollListener_);
      this.scrollListenerRegistered_ = true;
    }

  }

  /**
   * @param {!JSONObject} config
   * @param {!VisibilityListenerCallbackDef} callback
   */
  listenOnce(config, callback) {
    const element = this.win_.document.getElementById(config['selector']
        .slice(1));
    const res = this.resourcesService_.getResourceForElement(element);
    const resId = res.getId();

    this.registerForViewportEvents_();

    this.listeners_[resId] = (this.listeners_[resId] || []);
    this.listeners_[resId].push({
      config: config,
      callback: callback,
    });
    this.resources_.push(res);

    if (this.scheduledRunId_ == null) {
      this.scheduledRunId_ = timer.delay(() => {
        this.scrollListener_();
      }, LISTENER_INITIAL_RUN_DELAY_);
    }
  }

  /** @private */
  scrollListener_() {
    if (this.scheduledRunId_ != null) {
      timer.cancel(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }

    for (let r = this.resources_.length - 1; r >= 0; r--) {
      const res = this.resources_[r];
      const change = res.element.getIntersectionChangeEntry();
      const ir = change.intersectionRect;
      const br = change.boundingClientRect;
      const visible = ir.width * ir.height * 100 / (br.height * br.width);

      const listeners = this.listeners_[res.getId()];
      for (let c = listeners.length - 1; c >= 0; c--) {
        const config = listeners[c].config;
        if (visible < config['visiblePercentageMin']) {
          continue; // Maybe later
        } else if (visible > config['visiblePercentageMax']) {
          listeners.splice(c, 1);
          continue;
        }

        listeners[c].callback();
        listeners.splice(c, 1);
      }

      // Remove resources that have no listeners.
      if (listeners.length == 0) {
        this.resources_.splice(r, 1);
      }
    }
  }
}

/**
 * @param  {!Window} win
 * @return {!Visibility}
 */
export function installVisibilityService(win) {
  return getService(win, 'visibility', () => {
    return new Visibility(win);
  });
};
