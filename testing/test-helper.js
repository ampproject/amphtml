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

import {WindowInterface} from '../src/window-interface';
import {
  getService,
  getServiceForDoc,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../src/service';
import {getStyle} from '../src/style';
import {poll} from './iframe';

export function stubService(sandbox, win, serviceId, method) {
  // Register if not already registered.
  registerServiceBuilder(win, serviceId, function () {
    return {
      [method]: () => {},
    };
  });
  const service = getService(win, serviceId);
  return sandbox.stub(service, method);
}

export function stubServiceForDoc(sandbox, ampdoc, serviceId, method) {
  // Register if not already registered.
  registerServiceBuilderForDoc(ampdoc, serviceId, function () {
    return {
      [method]: () => {},
    };
  });
  const service = getServiceForDoc(ampdoc, serviceId);
  return sandbox.stub(service, method);
}

export function mockServiceForDoc(sandbox, ampdoc, serviceId, methods) {
  resetServiceForTesting(ampdoc.win, serviceId);
  const impl = {};
  methods.forEach((method) => {
    impl[method] = () => {};
  });
  registerServiceBuilderForDoc(ampdoc, serviceId, function () {
    return impl;
  });
  const mock = {};
  methods.forEach((method) => {
    mock[method] = sandbox.stub(impl, method);
  });
  return mock;
}

export function mockWindowInterface(sandbox) {
  const methods = Object.getOwnPropertyNames(WindowInterface).filter(
    (p) => typeof WindowInterface[p] === 'function'
  );
  const mock = {};
  methods.forEach((method) => {
    mock[method] = sandbox.stub(WindowInterface, method);
  });
  return mock;
}

/**
 * Resolves a promise when a spy has been called a configurable number of times.
 * @param {!Object} spy
 * @param {number=} opt_callCount
 * @return {!Promise}
 */
export function whenCalled(spy, opt_callCount = 1) {
  return poll(
    `Spy was called ${opt_callCount} times`,
    () => spy.callCount === opt_callCount
  );
}

/**
 * Resolves a promise when the callback returns a truthy value.
 * @param {function():?} callback
 * @param {string} errorMessage
 * @return {!Promise}
 */
export function waitFor(callback, errorMessage) {
  return poll(
    errorMessage,
    callback,
    undefined /* opt_onError */,
    200 /* opt_timeout */
  );
}

const noneValues = {
  'animation-name': ['none', 'initial'],
  'animation-duration': ['0s', 'initial'],
  'animation-timing-function': ['ease', 'initial'],
  'animation-delay': ['0s', 'initial'],
  'animation-iteration-count': ['1', 'initial'],
  'animation-direction': ['normal', 'initial'],
  'animation-fill-mode': ['none', 'initial'],
  'animation-play-state': ['running', 'initial'],
};

/**
 * Browsers are inconsistent when accessing the value for 'animation: none'.
 * Some return 'none', some return the full shorthand, some give the full
 * shorthand in a different order.
 * @param {!Element} element
 * @return {boolean}
 */
export function isAnimationNone(element) {
  for (const property in noneValues) {
    const value = getStyle(element, property);
    const expectedValues = noneValues[property];
    if (!expectedValues.some((expectedValue) => value == expectedValue)) {
      return false;
    }
  }
  return true;
}

/**
 * Asserts that the given element is only visible to screen readers.
 * @param {!Element} node
 * @param {{
 *   index: (number|undefined),
 * }} options
 */
export function assertScreenReaderElement(element, {index = 0} = {}) {
  const offset = index * 8;
  expect(element).to.exist;
  expect(element.classList.contains('i-amphtml-screen-reader')).to.be.true;
  const win = element.ownerDocument.defaultView;
  const computedStyle = win.getComputedStyle(element);
  expect(computedStyle.getPropertyValue('position')).to.equal('fixed');
  expect(computedStyle.getPropertyValue('top')).to.equal('0px');
  expect(computedStyle.getPropertyValue('left')).to.equal(`${offset}px`);
  expect(computedStyle.getPropertyValue('width')).to.equal('4px');
  expect(computedStyle.getPropertyValue('height')).to.equal('4px');
  expect(computedStyle.getPropertyValue('opacity')).to.equal('0');
  expect(computedStyle.getPropertyValue('overflow')).to.equal('hidden');
  expect(computedStyle.getPropertyValue('border')).to.contain('none');
  expect(computedStyle.getPropertyValue('margin')).to.equal('0px');
  expect(computedStyle.getPropertyValue('padding')).to.equal('0px');
  expect(computedStyle.getPropertyValue('display')).to.equal('block');
  expect(computedStyle.getPropertyValue('visibility')).to.equal('visible');
}

// Use a browserId to avoid cross-browser race conditions.
// TODO(amphtml): Remove browserId now that we no longer test on Sauce Labs.
/** @const {string} */
const browserId = (Date.now() + Math.random()).toString(32);

/** @const {string} */
const REQUEST_URL = '//localhost:9876/amp4test/request-bank/' + browserId;

/**
 * A server side temporary request storage which is useful for testing
 * browser sent HTTP requests.
 */
export class RequestBank {
  static getBrowserId() {
    return browserId;
  }

  /**
   * Returns the URL for depositing a request.
   *
   * @param {number|string|undefined} requestId
   * @returns {string}
   */
  static getUrl(requestId) {
    return `${REQUEST_URL}/deposit/${requestId}/`;
  }

  /**
   * Returns a Promise that resolves when the request of given ID is deposited.
   * The returned promise resolves to an JsonObject contains the request info:
   * {
   *   url: string
   *   headers: JsonObject
   *   body: string
   * }
   * @param {number|string|undefined} requestId
   * @returns {Promise<JsonObject>}
   */
  static withdraw(requestId) {
    const url = `${REQUEST_URL}/withdraw/${requestId}/`;
    return RequestBank.fetch_(url, `withdraw(${requestId ?? ''})`).then((res) =>
      res.json()
    );
  }

  static tearDown() {
    const url = `${REQUEST_URL}/teardown/`;
    return RequestBank.fetch_(url, 'tearDown');
  }

  static fetch_(url, action, timeout = 10000) {
    const xhr = fetch(url).then((response) => {
      const {ok, status, statusText} = response;
      if (!ok) {
        throw new Error(
          `RequestBank.${action}: HTTP ${status} error -- ${statusText}`
        );
      }
      return response;
    });
    if (timeout <= 0) {
      return xhr;
    }
    const timer = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(`"RequestBank.${action}" timed out after ${timeout} ms.`)
        );
      }, timeout);
    });
    return Promise.race([xhr, timer]);
  }
}

export class BrowserController {
  constructor(win, opt_rootNode) {
    this.win_ = win;
    this.rootNode_ = opt_rootNode || this.win_.document;
  }

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * @param {string} hostSelector
   * @param {number=} timeout
   * @return {!Promise}
   */
  waitForShadowRoot(hostSelector, timeout = 10000) {
    const element = this.rootNode_.querySelector(hostSelector);
    if (!element) {
      throw new Error(`BrowserController query failed: ${hostSelector}`);
    }
    return poll(
      `"${hostSelector}" to host shadow doc`,
      () => !!element.shadowRoot,
      /* onError */ undefined,
      timeout
    );
  }

  /**
   * @param {string} selector
   * @param {number=} timeout
   * @return {!Promise}
   */
  waitForElementBuild(selector, timeout = 5000) {
    const elements = this.rootNode_.querySelectorAll(selector);
    if (!elements.length) {
      throw new Error(`BrowserController query failed: ${selector}`);
    }
    return poll(
      `"${selector}" to build`,
      () => {
        const someNotBuilt = [].some.call(elements, (e) =>
          e.classList.contains('i-amphtml-notbuilt')
        );
        return !someNotBuilt;
      },
      /* onError */ undefined,
      timeout
    );
  }

  /**
   * @param {string} selector
   * @param {number=} timeout
   * @return {!Promise}
   */
  waitForElementLayout(selector, timeout = 10000) {
    const elements = this.rootNode_.querySelectorAll(selector);
    if (!elements.length) {
      throw new Error(`BrowserController query failed: ${selector}`);
    }
    return poll(
      `"${selector}" to layout`,
      () => {
        // AMP elements set `readyState` to complete when their
        // layoutCallback() promise is resolved.
        const someNotReady = [].some.call(
          elements,
          (e) => e.readyState !== 'complete'
        );
        return !someNotReady;
      },
      /* onError */ undefined,
      timeout
    );
  }

  click(selector) {
    const element = this.rootNode_.querySelector(selector);
    if (element) {
      element.dispatchEvent(new /*OK*/ CustomEvent('click', {bubbles: true}));
    }
  }

  scrollTo(px) {
    this.win_.scrollTo(0, px);
  }
}

export function createPointerEvent(type, x, y) {
  const event = new /*OK*/ CustomEvent(type, {bubbles: true});
  event.clientX = x;
  event.clientY = y;
  event.pageX = x;
  event.pageY = y;
  event.touches = [
    {
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
    },
  ];
  return event;
}

export class ImagePixelVerifier {
  constructor(windowInterface) {
    this.imagePixels_ = [];
    const FakeImage = () => {
      const pixel = {};
      this.imagePixels_.push(pixel);
      return pixel;
    };
    windowInterface.getImage.returns(FakeImage);
  }

  hasRequestSent() {
    return this.imagePixels_.length > 0;
  }

  verifyRequest(url, referrerPolicy) {
    const pixel = this.imagePixels_.shift();
    expect(pixel.src).to.equal(url);
    expect(pixel.referrerPolicy).to.equal(referrerPolicy);
  }

  verifyRequestMatch(regex) {
    const pixel = this.imagePixels_.shift();
    expect(pixel.src).to.match(regex);
  }

  getLastRequestUrl() {
    if (!this.hasRequestSent()) {
      return null;
    }
    return this.imagePixels_[this.imagePixels_.length - 1].src;
  }

  verifyAndRemoveRequestUrl(url) {
    for (let i = this.imagePixels_.length - 1; i >= 0; i--) {
      if (this.imagePixels_[i].src == url) {
        this.imagePixels_.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

export function measureMutateElementStub(measure, mutate) {
  return Promise.resolve().then(measure).then(mutate);
}

export function measureElementStub(measure) {
  return measureMutateElementStub(measure);
}

export function mutateElementStub(mutate) {
  return measureMutateElementStub(undefined, mutate);
}
