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

import {dev} from './log';
import {once} from './utils/function';


/** @interface @template TYPE */
export class ObservableInterface {
/**
   * Adds the observer to this instance.
   * @param {function(TYPE)} unusedHandler Observer's handler.
   * @return {!UnlistenDef}
   */
  add(unusedHandler) {}

  /**
   * Removes the observer from this instance.
   * @param {function(TYPE)} unusedHandler Observer's instance.
   */
  remove(unusedHandler) {}

  /** Removes all observers. */
  removeAll() {}

  /**
   * Fires an event. All observers are called.
   * @param {TYPE=} opt_event
   */
  fire(opt_event) {}

  /** @return {number} */
  getHandlerCount() {}
}


/**
 * This class helps to manage observers. Observers can be added, removed or
 * fired through and instance of this class.
 * @implements {ObservableInterface}
 * @template TYPE
 */
export class Observable {

  constructor() {
    /** @type {?Array<function(TYPE)>} */
    this.handlers_ = null;
  }

  /** @override */
  add(handler) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
    return () => {
      this.remove(handler);
    };
  }

  /** @override */
  remove(handler) {
    if (!this.handlers_) {
      return;
    }
    const index = this.handlers_.indexOf(handler);
    if (index > -1) {
      this.handlers_.splice(index, 1);
    }
  }

  /** @override */
  removeAll() {
    if (!this.handlers_) {
      return;
    }
    this.handlers_.length = 0;
  }

  /** @override */
  fire(opt_event) {
    if (!this.handlers_) {
      return;
    }
    const handlers = this.handlers_;
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      handler(opt_event);
    }
  }

  /** @override */
  getHandlerCount() {
    if (!this.handlers_) {
      return 0;
    }
    return this.handlers_.length;
  }
}


/**
 * Runs a given constructor when first observed (i.e. observable on-demand).
 * Optionally unlistens when no longer observed.
 * @implements {ObservableInterface}
 * @template TYPE
 */
export class LazyObservable {
  /**
   * @param {function()|function():!UnlistenDef} ctor
   */
  constructor(ctor) {
    /** @private @const {function():!UnlistenDef} */
    this.ctor_ = ctor;

    /** @private @const {!Observable<TYPE>} */
    this.observable_ = new Observable();

    /** @private {function()|function():!UnlistenDef} */
    this.instantiate_ = this.createInstantiateFn_();

    /** @private {boolean} */
    this.isInstantiated_ = false;

    /** @private {?UnlistenDef} */
    this.disposeFn_ = null;

    /** @private {?Array<TYPE>} */
    this.queue_ = null;
  }

  /** @override */
  add(handler) {
    const unlisten = this.observable_.add(handler);

    this.instantiate_();

    return () => {
      unlisten();
      this.maybeDispose_();
    };
  }

  /** @override */
  remove(handler) {
    this.observable_.remove(handler);
    this.maybeDispose_();
  }

  /** @override */
  removeAll() {
    this.observable_.removeAll();
    this.dispose_();
  }

  /** @override */
  fire(opt_event) {
    if (!this.isInstantiated_) {
      return;
    }
    this.observable_.fire(opt_event);
  }

  /** @override */
  getHandlerCount() {
    return this.observable_.getHandlerCount();
  }

  /** @private @return {!Function} */
  createInstantiateFn_() {
    return once(() => {
      this.isInstantiated_ = true;
      this.disposeFn_ = this.ctor_() || null;

      while (this.queue_ && this.queue_.length) {
        this.observable_.fire(this.queue_.shift());
      }
    });
  }

  /** @private */
  maybeDispose_() {
    if (this.observable_.getHandlerCount() > 0) {
      return;
    }
    this.dispose_();
  }

  /** @private */
  dispose_() {
    if (!this.disposeFn_) {
      return;
    }
    const dispose = dev().assert(this.disposeFn_);

    this.instantiate_ = this.createInstantiateFn_();
    this.disposeFn_ = null; // GC
    this.isInstantiated_ = false;
    this.queue_ = null;

    dispose();
  }
}
