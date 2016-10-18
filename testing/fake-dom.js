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

import {parseUrl, resolveRelativeUrl} from '../src/url';


/**
 * @typedef {{
 *   historyOff: (boolean|undefined),
 *   localStorageOff: (boolean|undefined),
 *   location: (string|undefined),
 *   navigator: ({userAgent:(string|undefined)}|undefined),
 * }}
 */
export let FakeWindowSpec;


/** @extends {!Window} */
export class FakeWindow {

  /**
   * @param {!FakeWindowSpec=} opt_spec
   */
  constructor(opt_spec) {

    const spec = opt_spec || {};

    // Passthrough.
    /** @const */
    this.Object = window.Object;
    /** @const */
    this.HTMLElement = window.HTMLElement;

    // Events.
    EventListeners.intercept(this);

    // Document.
    /** @const {!HTMLDocument} */
    this.document = self.document.implementation.createHTMLDocument('');
    Object.defineProperty(this.document, 'defaultView', {
      get: () => this,
    });
    EventListeners.intercept(this.document);
    EventListeners.intercept(this.document.documentElement);
    EventListeners.intercept(this.document.body);

    /** @const {!FakeCustomElements} */
    this.customElements = new FakeCustomElements(this);

    // History.
    /** @const {!FakeHistory|undefined} */
    this.history = spec.historyOff ? undefined : new FakeHistory(this);

    // Location.
    /** @private @const {!FakeLocation} */
    this.location_ = new FakeLocation(
        spec.location || window.location.href,
        this, this.history);
    Object.defineProperty(this, 'location', {
      get: () => this.location_,
      set: href => this.location_.assign(href),
    });

    // Navigator.
    /** @const {!Navigator} */
    this.navigator = freeze({
      userAgent: spec.navigator && spec.navigator.userAgent ||
          window.navigator.userAgent,
    });

    // Storage.
    /** @const {!FakeStorage|undefined} */
    this.localStorage = spec.localStorageOff ?
        undefined : new FakeStorage(this);

    // Timers and animation frames.
    /**
     * @param {function()} handler
     * @param {number=} timeout
     * @param {...*} var_args
     * @return {number}
     * @const
     */
    this.setTimeout = window.setTimeout;

    /**
     * @param {number} id
     * @const
     */
    this.clearTimeout = window.clearTimeout;

    /**
     * @param {function()} handler
     * @param {number=} timeout
     * @param {...*} var_args
     * @return {number}
     * @const
     */
    this.setInterval = window.setInterval;

    /**
     * @param {number} id
     * @const
     */
    this.clearInterval = window.clearInterval;

    let raf = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame;
    if (raf) {
      raf = raf.bind(window);
    } else {
      raf = function(fn) {
        window.setTimeout(fn, 16);
      };
    }
    /**
     * @param {function()} handler
     * @const
     */
    this.requestAnimationFrame = raf;
  }

  /**
   * @param {string} type
   * @param {function(!Event)} handler
   * @param {(boolean|!Object)=} captureOrOpts
   */
  addEventListener() {}

  /**
   * @param {string} type
   * @param {function(!Event)} handler
   * @param {(boolean|!Object)=} captureOrOpts
   */
  removeEventListener() {}
}


/**
 * @typedef {{
 *   type: string,
 *   handler: function(!Event),
 *   capture: boolean,
 *   options: ?Object
 * }}
 */
export let EventListener;


/**
 * Helper for testing event listeners.
 */
class EventListeners {

  /**
   * @param {!EventTarget} target
   * @return {!EventListeners}
   */
  static intercept(target) {
    target.eventListeners = new EventListeners();
    const originalAdd = target.addEventListener;
    const originalRemove = target.removeEventListener;
    target.addEventListener = function(type, handler, captureOrOpts) {
      target.eventListeners.add(type, handler, captureOrOpts);
      if (originalAdd) {
        originalAdd.apply(target, arguments);
      }
    };
    target.removeEventListener = function(type, handler, captureOrOpts) {
      target.eventListeners.remove(type, handler, captureOrOpts);
      if (originalRemove) {
        originalRemove.apply(target, arguments);
      }
    };
  }

  constructor() {
    /** @const {!Array<!EventListener>} */
    this.listeners = [];
  }

  /**
   * @param {string} type
   * @param {function(!Event)} handler
   * @param {(boolean|!Object)=} captureOrOpts
   * @private
   */
  listener_(type, handler, captureOrOpts) {
    return {
      type,
      handler,
      capture: typeof captureOrOpts == 'boolean' ? captureOrOpts :
          typeof captureOrOpts == 'object' ? captureOrOpts.capture || false :
          false,
      options: typeof captureOrOpts == 'object' ? captureOrOpts : null,
    };
  }

  /**
   * @param {string} type
   * @param {function(!Event)} handler
   * @param {(boolean|!Object)=} captureOrOpts
   */
  add(type, handler, captureOrOpts) {
    const listener = this.listener_(type, handler, captureOrOpts);
    this.listeners.push(listener);
  }

  /**
   * @param {string} type
   * @param {function(!Event)} handler
   * @param {(boolean|!Object)=} captureOrOpts
   */
  remove(type, handler, captureOrOpts) {
    const toRemove = this.listener_(type, handler, captureOrOpts);
    for (let i = this.listeners.length - 1; i >= 0; i--) {
      const listener = this.listeners[i];
      if (listener.type == toRemove.type &&
          listener.handler == toRemove.handler &&
          listener.capture == toRemove.capture) {
        this.listeners.splice(i, 1);
      }
    }
  }

  /**
   * @param {string} type
   * @return {!Array<!EventListener>}
   */
  forType(type) {
    return this.listeners.filter(listener => listener.type == type);
  }

  /**
   * @param {string} type
   * @return {number}
   */
  count(type) {
    return this.forType(type).length;
  }

  /**
   * @param {!Event} event
   */
  fire(event) {
    this.forType(event.type).forEach(listener => {
      listener.handler.call(null, event);
    });
  }
}


/**
 * @param {!EventTarget} target
 */
export function interceptEventListeners(target) {
  EventListeners.intercept(target);
}


/**
 * @extends {!Location}
 */
class FakeLocation {

  /**
   * @param {string} href
   * @param {!FakeWindow} win
   * @param {?History} history
   */
  constructor(href, win, history) {

    /** @const {!Window} */
    this.win = win;

    /** @private @const {?History} */
    this.history_ = history;

    /** @const {!Array<!Location>} */
    this.changes = [];

    /** @private {!Location} */
    this.url_ = parseUrl(href, true);

    // href
    Object.defineProperty(this, 'href', {
      get: () => this.url_.href,
      set: href => this.assign(href),
    });

    const properties = ['protocol', 'host', 'hostname', 'port', 'pathname',
        'search', 'hash', 'origin'];
    properties.forEach(property => {
      Object.defineProperty(this, property, {
        get: () => this.url_[property],
      });
    });

    if (this.history_) {
      this.history_.replaceState(null, '', this.url_.href,
          /* fireEvent */ false);
    }
  }

  /**
   * @param {string} href
   */
  set_(href) {
    const oldHash = this.url_.hash;
    this.url_ = parseUrl(resolveRelativeUrl(href, this.url_));
    if (this.url_.hash != oldHash) {
      this.win.eventListeners.fire({type: 'hashchange'});
    }
  }

  /**
   * @param {!Object} args
   */
  change_(args) {
    const change = parseUrl(this.url_.href);
    Object.assign(change, args);
    this.changes.push(change);
  }

  /**
   * @param {string} href
   */
  assign(href) {
    this.set_(href);
    if (this.history_) {
      this.history_.pushState(null, '', this.url_.href,
          /* fireEvent */ true);
    }
    this.change_({assign: true});
  }

  /**
   * @param {string} href
   */
  replace(href) {
    this.set_(href);
    if (this.history_) {
      this.history_.replaceState(null, '', this.url_.href,
          /* fireEvent */ true);
    }
    this.change_({replace: true});
  }

  /**
   * @param {boolean} forceReload
   */
  reload(forceReload) {
    this.change_({reload: true, forceReload});
  }

  /**
   * Resets the URL without firing any events or triggering a history
   * entry.
   * @param {string} href
   */
  resetHref(href) {
    this.url_ = parseUrl(resolveRelativeUrl(href, this.url_));
  }
}


/**
 * @extends {!History}
 */
export class FakeHistory {

  /** @param {!FakeWindow} win */
  constructor(win) {
    /** @const */
    this.win = win;

    /** @const {!Array<!{url: string}>} */
    this.stack = [{url: '', state: null}];

    /** @const {number} */
    this.index = 0;

    Object.defineProperty(this, 'length', {
      get: () => this.stack.length,
    });

    Object.defineProperty(this, 'state', {
      get: () => this.stack[this.index].state,
    });
  }

  /** */
  back() {
    this.go(-1);
  }

  /** */
  forward() {
    this.go(1);
  }

  /**
   * @param {number} steps
   */
  go(steps) {
    const newIndex = this.index + steps;
    if (newIndex == this.index) {
      return;
    }
    if (newIndex < 0) {
      throw new Error('can\'t go back');
    }
    if (newIndex >= this.stack.length) {
      throw new Error('can\'t go forward');
    }
    this.index = newIndex;
  }

  /**
   * @param {?Object} state
   * @param {?string} title
   * @param {?string} url
   * @param {boolean=} opt_fireEvent
   */
  pushState(state, title, url, opt_fireEvent) {
    this.index++;
    if (this.index < this.stack.length) {
      // Remove tail.
      this.stack.splice(this.index, thius.stack.length - this.index);
    }
    this.stack[this.index] = {
      state: state ? freeze(state) : null,
      url,
    };
    if (opt_fireEvent) {
      this.win.eventListeners.fire({type: 'popstate'});
    }
  }

  /**
   * @param {?Object} state
   * @param {?string} title
   * @param {?string} url
   * @param {boolean=} opt_fireEvent
   */
  replaceState(state, title, url, opt_fireEvent) {
    const cell = this.stack[this.index];
    cell.state = state ? freeze(state) : null;
    cell.url = url;
    if (opt_fireEvent) {
      this.win.eventListeners.fire({type: 'popstate'});
    }
  }
}


/**
 * @extends {Storage}
 */
export class FakeStorage {

  /** @param {!Window} win */
  constructor(win) {
    /** @const */
    this.win = win;

    /** @const {!Object<string, string>} */
    this.values = {};

    // Length.
    Object.defineProperty(this, 'length', {
      get: () => Object.keys(this.values).length,
    });
  }

  /**
   * @param {number} n
   * @return {string}
   */
  key(n) {
    return Object.keys(this.values)[n];
  }

  /**
   * @param {string} name
   * @return {?string}
   */
  getItem(name) {
    if (name in this.values) {
      return this.values[name];
    }
    return null;
  }

  /**
   * @param {string} name
   * @param {*} value
   * @return {?string}
   */
  setItem(name, value) {
    this.values[name] = String(value);
  }

  /**
   * @param {string} name
   */
  removeItem(name) {
    delete this.values[name];
  }

  /**
   */
  clear() {
    Object.keys(this.values).forEach(name => {
      delete this.values[name];
    });
  }
}


/**
 * @extends {CustomElementRegistry}
 */
export class FakeCustomElements {

  /** @param {!Window} win */
  constructor(win) {
    /** @const */
    this.win = win;

    /** @type {number} */
    this.count = 0;

    /** @const {!Object<string, !{prototype: !Prototype}>} */
    this.elements = {};

    /**
     * Custom Elements V0 API.
     * @param {string} name
     * @param {{prototype: !Prototype}} spec
     */
    this.win.document.registerElement = (name, spec) => {
      if (this.elements[name]) {
        throw new Error('custom element already defined: ' + name);
      }
      this.elements[name] = spec;
      this.count++;
    };
  }

  /**
   * Custom Elements V1 API.
   * @param {string} name
   * @param {!Function} klass
   */
  define(name, klass) {
    if (this.elements[name]) {
      throw new Error('custom element already defined: ' + name);
    }
    this.elements[name] = klass.prototype;
    this.count++;
  }
}


/**
 * @param {!Object} obj
 * @return {!Object}
 */
function freeze(obj) {
  if (!Object.freeze) {
    return obj;
  }
  return Object.freeze(obj);
}
