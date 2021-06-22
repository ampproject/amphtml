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

import {parseUrlDeprecated, resolveRelativeUrl} from '../src/url';

/**
 * @typedef {{
 *   hidden: (boolean|undefined),
 *   historyOff: (boolean|undefined),
 *   localStorageOff: (boolean|undefined),
 *   location: (string|undefined),
 *   navigator: ({userAgent:(string|undefined)}|undefined),
 *   readyState: (boolean|undefined),
 *   top: (FakeWindowSpec|undefined),
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

    /**
     * This value is reflected on this.document.readyState.
     * @type {string}
     */
    this.readyState = spec.readyState || 'complete';

    // Passthrough.
    /** @const */
    this.Object = window.Object;
    /** @const */
    this.HTMLElement = window.HTMLElement;
    /** @const */
    this.HTMLFormElement = window.HTMLFormElement;
    /** @const */
    this.Element = window.Element;
    /** @const */
    this.Node = window.Node;
    /** @const */
    this.EventTarget = window.EventTarget;
    /** @const */
    this.DOMTokenList = window.DOMTokenList;
    /** @const */
    this.Math = window.Math;
    /** @const */
    this.Promise = window.Promise;
    /** @const */
    this.IntersectionObserver = window.IntersectionObserver;
    /** @const */
    this./*OK*/ pageYOffset = window./*OK*/ pageYOffset;

    /** @const */
    this.IntersectionObserver = window.IntersectionObserver;

    /** @const */
    this.crypto = window.crypto || window.msCrypto;

    // Parent Window points to itself if spec.parent was not passed.
    /** @const @type {!Window} */
    this.parent = spec.parent ? new FakeWindow(spec.parent) : this;

    // Top Window points to parent if spec.top was not passed.
    /** @const */
    this.top = spec.top ? new FakeWindow(spec.top) : this.parent;

    // Events.
    EventListeners.intercept(this);

    // Document.
    /** @const {!HTMLDocument} */
    this.document = self.document.implementation.createHTMLDocument('');
    Object.defineProperty(this.document, 'defaultView', {
      get: () => this,
    });
    Object.defineProperty(this.document, 'readyState', {
      get: () => this.readyState,
    });
    if (!this.document.fonts) {
      this.document.fonts = {};
    }
    Object.defineProperty(this.document.fonts, 'ready', {
      get: () => Promise.resolve(),
    });
    let fontStatus = 'loaded';
    Object.defineProperty(this.document.fonts, 'status', {
      get: () => fontStatus,
      set: (val) => (fontStatus = val),
    });

    EventListeners.intercept(this.document);
    EventListeners.intercept(this.document.documentElement);
    EventListeners.intercept(this.document.body);

    // Document.hidden and document.visibilityState properties.
    /** @private {boolean} */
    this.documentHidden_ = spec.hidden !== undefined ? spec.hidden : false;
    /** @private {?string} */
    this.visibilityState_ = null;

    Object.defineProperty(this.document, 'hidden', {
      get: () => this.documentHidden_,
      set: (value) => {
        this.documentHidden_ = value;
        this.visibilityState_ = null;
        this.document.eventListeners.fire({type: 'visibilitychange'});
      },
    });
    Object.defineProperty(this.document, 'visibilityState', {
      get: () => {
        if (this.visibilityState_) {
          return this.visibilityState_;
        }
        return this.documentHidden_ ? 'hidden' : 'visible';
      },
      set: (value) => {
        this.visibilityState_ = value;
        this.documentHidden_ = value != 'visible';
        this.document.eventListeners.fire({type: 'visibilitychange'});
      },
    });

    /** @private {!Array<string>} */
    this.cookie_ = [];
    this.document.publicSuffixList = [];
    this.document.lastSetCookieRaw; // used to verify cookie settings like expiration time etc
    Object.defineProperty(this.document, 'cookie', {
      get: () => {
        const cookie = [];
        for (let i = 0; i < this.cookie_.length; i += 2) {
          cookie.push(`${this.cookie_[i]}=${this.cookie_[i + 1]}`);
        }
        return cookie.join(';');
      },
      set: (value) => {
        this.document.lastSetCookieRaw = value;
        let cookie = value.match(/^([^=]*)=([^;]*)/);
        if (!cookie) {
          // couldn't find the match. Treat cookie as single value.
          cookie = [value, null];
        }
        const expiresMatch = value.match(/expires=([^;]*)(;|$)/);
        const domainMatch = value.match(/domain=([^;]*)/);
        const domain = domainMatch ? domainMatch[1] : '';
        if (this.document.publicSuffixList.indexOf(domain) >= 0) {
          // Can't set cookie to etld
          this.document.lastSetCookieRaw = '';
          return;
        }
        const expires = expiresMatch ? Date.parse(expiresMatch[1]) : Infinity;
        let i = 0;
        for (; i < this.cookie_.length; i += 2) {
          if (this.cookie_[i] == cookie[1]) {
            break;
          }
        }
        if (Date.now() >= expires) {
          this.cookie_.splice(i, 2);
        } else {
          this.cookie_.splice(i, 2, cookie[1], cookie[2]);
        }
      },
    });

    // Create element to enhance test elements.
    const nativeDocumentCreate = this.document.createElement;
    /** @this {HTMLDocument} */
    this.document.createElement = function () {
      const result = nativeDocumentCreate.apply(this, arguments);
      EventListeners.intercept(result);
      return result;
    };

    /** @const {!FakeCustomElements} */
    this.customElements = new FakeCustomElements(this);

    // History.
    /** @const {!FakeHistory|undefined} */
    this.history = spec.historyOff ? undefined : new FakeHistory(this);

    // Location.
    /** @private @const {!FakeLocation} */
    this.location_ = new FakeLocation(
      spec.location || window.location.href,
      this,
      this.history
    );
    Object.defineProperty(this, 'location', {
      get: () => this.location_,
      set: (href) => this.location_.assign(href),
    });

    // Navigator.
    /** @const {!Navigator} */
    this.navigator = {
      userAgent:
        (spec.navigator && spec.navigator.userAgent) ||
        window.navigator.userAgent,
    };

    // Storage.
    /** @const {!FakeStorage|undefined} */
    this.localStorage = spec.localStorageOff ? undefined : new FakeStorage();

    /** @const {!FakeStorage} */
    this.sessionStorage = new FakeStorage();

    // Timers and animation frames.
    /** @const */
    this.Date = window.Date;

    /** polyfill setTimeout. */
    this.setTimeout = function () {
      return window.setTimeout.apply(window, arguments);
    };

    /** polyfill clearTimeout. */
    this.clearTimeout = function () {
      return window.clearTimeout.apply(window, arguments);
    };

    /** polyfill setInterval. */
    this.setInterval = function () {
      return window.setInterval.apply(window, arguments);
    };

    /** polyfill clearInterval. */
    this.clearInterval = function () {
      return window.clearInterval.apply(window, arguments);
    };

    let raf =
      window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    if (raf) {
      raf = raf.bind(window);
    } else {
      raf = function (fn) {
        window.setTimeout(fn, 16);
      };
    }
    /**
     * @param {function()} handler
     * @const
     */
    this.requestAnimationFrame = raf;

    // Styles.
    this.getComputedStyle = function () {
      return window.getComputedStyle.apply(window, arguments);
    };
  }

  /** polyfill addEventListener. */
  addEventListener() {}

  /** polyfill removeEventListener. */
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
    const {
      addEventListener: originalAdd,
      postMessage: originalPostMessage,
      removeEventListener: originalRemove,
    } = target;
    target.addEventListener = function (type, handler, captureOrOpts) {
      target.eventListeners.add(type, handler, captureOrOpts);
      if (originalAdd) {
        originalAdd.apply(target, arguments);
      }
    };
    target.removeEventListener = function (type, handler, captureOrOpts) {
      target.eventListeners.remove(type, handler, captureOrOpts);
      if (originalRemove) {
        originalRemove.apply(target, arguments);
      }
    };
    target.postMessage = function (type) {
      const e = new Event('message');
      e.data = type;
      target.eventListeners.fire(e);
      if (originalPostMessage) {
        originalPostMessage.apply(target, arguments);
      }
    };
  }

  /** Create empty instance. */
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
      capture:
        typeof captureOrOpts == 'boolean'
          ? captureOrOpts
          : typeof captureOrOpts == 'object'
          ? captureOrOpts.capture || false
          : false,
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
      if (
        listener.type == toRemove.type &&
        listener.handler == toRemove.handler &&
        listener.capture == toRemove.capture
      ) {
        this.listeners.splice(i, 1);
      }
    }
  }

  /**
   * @param {string} type
   * @return {!Array<!EventListener>}
   */
  forType(type) {
    return this.listeners.filter((listener) => listener.type == type);
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
    this.forType(event.type).forEach((listener) => {
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
export class FakeLocation {
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
    this.url_ = parseUrlDeprecated(href, true);

    // href
    Object.defineProperty(this, 'href', {
      get: () => this.url_.href,
      set: (href) => this.assign(href),
      configurable: true,
    });

    const properties = [
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash',
      'origin',
    ];
    properties.forEach((property) => {
      Object.defineProperty(this, property, {
        get: () => this.url_[property],
      });
    });

    if (this.history_) {
      this.history_.replaceState(
        null,
        '',
        this.url_.href,
        /* fireEvent */ false
      );
    }
  }

  /**
   * @param {string} href
   */
  set_(href) {
    const oldHash = this.url_.hash;
    this.url_ = parseUrlDeprecated(resolveRelativeUrl(href, this.url_));
    if (this.url_.hash != oldHash) {
      this.win.eventListeners.fire({type: 'hashchange'});
    }
  }

  /**
   * @param {!Object} args
   */
  change_(args) {
    const change = parseUrlDeprecated(this.url_.href);
    ({...change, ...args});
    this.changes.push(change);
  }

  /**
   * @param {string} href
   */
  assign(href) {
    this.set_(href);
    if (this.history_) {
      this.history_.pushState(null, '', this.url_.href, /* fireEvent */ true);
    }
    this.change_({assign: true});
  }

  /**
   * @param {string} href
   */
  replace(href) {
    this.set_(href);
    if (this.history_) {
      this.history_.replaceState(
        null,
        '',
        this.url_.href,
        /* fireEvent */ true
      );
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
    this.url_ = parseUrlDeprecated(resolveRelativeUrl(href, this.url_));
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
      throw new Error("can't go back");
    }
    if (newIndex >= this.stack.length) {
      throw new Error("can't go forward");
    }
    this.index = newIndex;
    // Make sure to restore the location href before firing popstate to match
    // real browsers behaviors.
    this.win.location.resetHref(this.stack[this.index].url);
    this.win.eventListeners.fire({type: 'popstate'});
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
      this.stack.splice(this.index, this.stack.length - this.index);
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
  constructor() {
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

  clear() {
    Object.keys(this.values).forEach((name) => {
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

export class FakeMutationObserver {
  /**
   * @param {function(!Array<!Object>)} callback
   */
  constructor(callback) {
    this.callback_ = callback;

    /** @type {!Array{!Object}} */
    this.mutations_ = [];

    /** @type {Promise} */
    this.scheduled_ = null;
  }

  observe() {
    // I'm not implementing this. Wayyyy to complicated.
  }

  disconnect() {
    // If observe isn't implemnted, this doesn't need to be.
  }

  takeRecords() {
    return this.takeRecords_();
  }

  takeRecords_() {
    return this.mutations_.splice(0, Infinity);
  }

  /**
   * This is a non-standard method that allows you to queue a mutation.
   *
   * @param {!Object} mutation
   * @return {!Promise}
   */
  __mutate(mutation) {
    this.mutations_.push(mutation);
    if (this.scheduled_) {
      return this.scheduled_;
    }
    return (this.scheduled_ = Promise.resolve().then(() => {
      this.scheduled_ = null;
      this.callback_(this.takeRecords_());
    }));
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
