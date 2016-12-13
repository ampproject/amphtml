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

export const trackOptionType = {
  LAYOUT: 0,
  VIEWPORT_CALLBACK: 1,
};

const trackOptionMap = {
  0: {
    useNative: false,
    options: {
      threshold: [0],
    },
  },
  1: {
    options: {
      threshold: [0],
    },
  },
};

export class PositionObserver {
  constructor(ampdoc) {
    this.idIndex_ = 0;

    this.win = ampdoc.win;

    this.ampdoc = ampdoc;

    this.intersectionObservers_ = Object.create(null);

    this.observableMap_ = Object.create(null);
  }

  trackElement(element, trackOptionType, callback) {
    //get/create InOb for this trackOptionType
    const io = this.getInOb_(trackOptionType);
    // observe element and register with callback
    this.observableMap_[trackOptionType].add(element, callback);
    // TODO(zhouyx): remove the warning for observe same element multi times.
    io.observe(element);
    return () => {
      this.observableMap_[trackOptionType].remove(element, callback);
      if (!this.observableMap_[trackOptionType].element) {
        io.unobserve(element);
      }
    };
  }

  tick() {
    // TODO(zhouyx): Modifty #tick function of IntersectionObserverPolyfill to
    // accept elements. Don't calculate for elements of other layer.
    // Or I suggest layout manager only call tick(layer),
    // and in IntersectionObserverPolyfill call callback for observed elements
    // live inside child layer.
    console.log('tick');
    const viewportRect = viewportForDoc(this.ampdoc).getRect();
    console.log(this.intersectionObservers_);
    const keys = Object.keys(this.intersectionObservers_);
    for (let i = 0; i < keys.length; i++) {
      console.log('aaa');
      console.log(keys[i]);
      if (!this.intersectionObservers_[keys[i]].native) {
        console.log('not native');
        this.intersectionObservers_[keys[i]].io.tick(viewportRect);
      }
    }
  }

  getInOb_(trackOptionType) {
    // map trackoptions and callback to a certain intersectionObserver
    if (this.intersectionObservers_[trackOptionType]) {
      return this.intersectionObservers_[trackOptionType].io;
    }
    const trackOption = trackOptionMap[trackOptionType];
    // Create a new observableMap
    this.observableMap_ = map();
    this.observableMap_[trackOption] = new elementObservables();
    // create a new intersectionObserver
    const ioEntry = Object.create(null);
    console.log(trackOption);
    if (trackOption.useNative !== false &&
        this.win.IntersectionObserver &&
        this.win.IntersectionObserver.prototype.observe) {
      // use native IntersectionObserver
      console.log('native');
      ioEntry.io = new this.win.IntersectionObserver(changes => {
        this.observableMap_[trackOptionType].fire(changes);
      }, trackOption.options);
      ioEntry.native = true;
    } else {
      // use IntersectionObserver Polyfill.
      console.log('polyfill');
      ioEntry.io = new IntersectionObserverPolyfill(changes => {
        this.observableMap_[trackOptionType].fire(changes);
      }, trackOption.options);
    }
    this.intersectionObservers_[trackOptionType] = ioEntry;
    return ioEntry.io;
  }
}


class elementObservables {
  constructor() {
    this.handlerMap_ = map();
  }

  add(element, callback) {
    if (this.handlerMap_[element]) {
      this.handlerMap_[element].push(callback);
    } else {
      this.handlerMap_[element] = [callback];
    }
  }

  remove(element, callback) {
    // remove this callback from handlerMap_[element]
    const callbacks = this.handlerMap_[element];
    for (let i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback) {
        callbacks.splice(i, 1);
        if (callbacks.length == 0) {
          this.handleMap_[element] = null;
        }
        return;
      }
    }
  }

  fire(changes) {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const callbacks = this.handlerMap_[change.target];
      if (callbacks) {
        for (let j = 0; j < changes.length; j++) {
          callbacks[j](change);
        }
      }
    }
  }
}

export function installPositionObserverServiceForDoc(ampdoc) {
  return getServiceForDoc(ampdoc, 'position-observer',
      () => new PositionObserver(ampdoc));
};
