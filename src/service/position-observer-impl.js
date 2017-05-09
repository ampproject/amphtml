/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {map} from '../types';
import {getServiceForDoc} from '../service';
import {viewportForDoc} from '../viewport';
import {IntersectionObserverPolyfill} from '../intersection-observer-polyfill';

/**
 * @typedef {{
 *   io: Object,
 *   native: boolean,
 * }}
 */
let IntersectionObserverDef;

/**
 * @typedef {{
 *   id: string,
 *   useNative: (boolean|undefine),
 *   options: Object,
 * }}
 */
let PosObTrackOptionDef;

/* @const @{Object} */
export const PosObTrackOption = {
  LAYOUT: {
    id: 'layout',
    useNative: false,
    options: {
      threshold: [0],
    },
  },
  VIEWPORT: {
    id: 'viewport',
    options: {
      threshold: [0],
    },
  },
};

/**
 * Allows tracking of any element position to the viewport.
 *
 * This class allows any element to track its position with given track option
 * and callback. Layout manager will notify possible element position changes
 * to PositionObserver. And position observer will notify registered element
 * if the position change satifies the element provided option.
 */
export class PositionObserver {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /** @const @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!Object<string, IntersectionObserverDef>} */
    this.intersectionObservers_ = map();

    /** @const @private {!Object<string, elementObservables>} */
    this.observableMap_ = map();
  }

  /**
   * Provided method to element to enable them to their position to viewport
   * Element can be AMP or non AMP element
   * @param {!Element} element
   * @param {!PosObTrackOptionDef} trackOption
   * @param {!function(Object)} callback
   * @return {function()}
   */
  trackElement(element, trackOption, callback) {
    // TODO: Do we want to support user customized trackOption.
    // TODO: Do want to support multi callbacks

    //get the InOb for this trackOptionType
    const io = this.getInOb_(trackOption);

    // observe element and register with callback
    if (!this.observableMap_[trackOption.id].hasElement(element)) {
      io.observe(element);
    }
    this.observableMap_[trackOption.id].add(element, callback);

    // return unobserve function
    return () => {
      this.observableMap_[trackOption.id].remove(element, callback);
      if (!this.observableMap_[trackOption.id].hasElement(element)) {
        io.unobserve(element);
      }
    };
  }

  /**
   * Function that layout manager can inform the PositionObserver service
   * about possible position change to elements.
   */
  tick() {
    // TODO(zhouyx): Optimize this function to limit change to this layer and
    // child layer. Also take in params from layout manager.
    // A list of things can do here:
    // Modifty #tick function of IntersectionObserverPolyfill to
    // accept elements. Don't calculate for elements of other layer.
    // Have layout manager tick with layer,
    // IntersectionObserverPolyfill can only tick for observed elements
    // live inside child layer.
    const viewportRect = viewportForDoc(this.ampdoc_).getRect();
    const keys = Object.keys(this.intersectionObservers_);
    for (let i = 0; i < keys.length; i++) {
      if (!this.intersectionObservers_[keys[i]].native) {
        this.intersectionObservers_[keys[i]].io.tick(viewportRect);
      }
    }
  }

  /**
   * Function that get the IntersectionObserverDef through trackOption id
   * If it is not exists, create a new one
   * @param {!PosObTrackOptionDef} trackOption
   * @return {Object}
   * @private
   */
  getInOb_(trackOption) {
    // return existing IntersectionObserver if there's one.
    if (this.intersectionObservers_[trackOption.id]) {
      return this.intersectionObservers_[trackOption.id].io;
    }

    // Create a new observableMap
    this.observableMap_[trackOption.id] = new elementObservables();
    // create a new IntersectionObserver
    const ioEntry = Object.create(null);
    if (trackOption.useNative !== false &&
        this.win_.IntersectionObserver &&
        this.win_.IntersectionObserver.prototype.observe) {
      // use native IntersectionObserver
      ioEntry.io = new this.win_.IntersectionObserver(changes => {
        this.observableMap_[trackOption.id].fire(changes);
      }, trackOption.options);
      ioEntry.native = true;
    } else {
      // use IntersectionObserver Polyfill.
      ioEntry.io = new IntersectionObserverPolyfill(changes => {
        this.observableMap_[trackOption.id].fire(changes);
      }, trackOption.options);
    }
    this.intersectionObservers_[trackOption.id] = ioEntry;
    return ioEntry.io;
  }
}

/**
 * Helper class to have an element mapped observable
 * attached to one IntersectionObserver
 */
class elementObservables {
  constructor() {
    this.handlerMap_ = map();
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  hasElement(element) {
    return this.handlerMap_[element];
  }

  /**
   * @param {!Element} element
   * @param {!function(Object)} callback
   */
  add(element, callback) {
    if (this.handlerMap_[element]) {
      this.handlerMap_[element].push(callback);
    } else {
      this.handlerMap_[element] = [callback];
    }
  }

  /**
   * @param {!Element} element
   * @param {!function(Object)} callback
   */
  remove(element, callback) {
    // remove this callback from handlerMap_[element]
    const callbacks = this.handlerMap_[element];
    for (let i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback) {
        callbacks.splice(i, 1);
        if (callbacks.length == 0) {
          this.handlerMap_[element] = null;
        }
        return;
      }
    }
  }

  /**
   * @param {!Object} changes
   */
  fire(changes) {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const callbacks = this.handlerMap_[change.target];
      if (callbacks) {
        for (let j = 0; j < callbacks.length; j++) {
          callbacks[j](change);
        }
      }
    }
  }
}

/**
 * @param {!.ampdoc-impl.AmpDoc} ampdoc
 * @return {!PositionObserver}
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  return getServiceForDoc(ampdoc, 'position-observer',
      () => new PositionObserver(ampdoc));
};
