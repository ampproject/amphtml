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

import {poll} from './iframe';
import {xhrServiceForTesting} from '../src/service/xhr-impl';
import {
  getService,
  getServiceForDoc,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../src/service';
import {WindowInterface} from '../src/window-interface';

export function stubService(sandbox, win, serviceId, method) {
  // Register if not already registered.
  registerServiceBuilder(win, serviceId, function() {
    return {
      [method]: () => {},
    };
  });
  const service = getService(win, serviceId);
  return sandbox.stub(service, method);
}

export function stubServiceForDoc(sandbox, ampdoc, serviceId, method) {
  // Register if not already registered.
  registerServiceBuilderForDoc(ampdoc, serviceId, function() {
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
  methods.forEach(method => {
    impl[method] = () => {};
  });
  registerServiceBuilderForDoc(ampdoc, serviceId, () => impl);
  const mock = {};
  methods.forEach(method => {
    mock[method] = sandbox.stub(impl, method);
  });
  return mock;
}

export function mockWindowInterface(sandbox) {
  const methods = Object.getOwnPropertyNames(WindowInterface)
      .filter(p => typeof WindowInterface[p] === 'function');
  const mock = {};
  methods.forEach(method => {
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
  return poll(`Spy was called ${opt_callCount} times`,
      () => spy.callCount === opt_callCount);
}

/**
 * Asserts that the given element is only visible to screen readers.
 * @param {!Element} node
 */
export function assertScreenReaderElement(element) {
  expect(element).to.exist;
  expect(element.classList.contains('i-amphtml-screen-reader')).to.be.true;
  const win = element.ownerDocument.defaultView;
  const computedStyle = win.getComputedStyle(element);
  expect(computedStyle.getPropertyValue('position')).to.equal('fixed');
  expect(computedStyle.getPropertyValue('top')).to.equal('0px');
  expect(computedStyle.getPropertyValue('left')).to.equal('0px');
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

/**
 * Expects the function call to generate console error messages.
 *
 * The expectedErrorMessages parameter is a list of strings or RegExp objects
 * to match against the output of each call to console.error.
 *
 * e.g.:
 * expectConsoleError(() => {
 *   console.error('This is the first error');
 *   console.warn('Warns and logs are not caught');
 *   console.error('This is the second error');
 * }, ['This is the first error', /second/]);
 *
 * @param {function()} func Code to be tested
 * @param {!Array<string, !RegExp>} expectedErrorMessages list of expected
 * messages to match against the output of calling console.error
 */
export function expectConsoleError(func, expectedErrorMessages) {
  let callIndex = 0;
  console.error.callsFake((...messages) => {
    // On every call to console.error assert that there are still expected
    // error messages left, and assert that the message matches the one
    // that was expected for this call.
    if (callIndex >= expectedErrorMessages.length) {
      throw new Error(`Console.error was called ${callIndex + 1} times.` +
          `Expected it to be called ${expectedErrorMessages.length} times.`);
    }
    const errorMessage = messages.join(' ');
    const expectedErrorMessage = expectedErrorMessages[callIndex];
    if (expectedErrorMessage instanceof RegExp) {
      expect(errorMessage).to.match(expectedErrorMessage);
    } else {
      expect(errorMessage).to.equal(expectedErrorMessage);
    }
    callIndex++;
  });

  // Call the function that is expected to cause the error messages.
  func();
  expect(console.error).to.be.callCount(expectedErrorMessages.length);

  // Restore the stubbed code for console.error(...) in _init_tests.js.
  console.error.callsFake((...messages) => {
    throw new Error(messages.join(' '));
  });
}

/////////////////
// Request Bank
// A server side temporary request storage which is useful for testing
// browser sent HTTP requests.
/////////////////

/** @const {string} */
const REQUEST_URL = '//localhost:9876/amp4test/request-bank/';

/**
 * Append user agent to request-bank deposit/withdraw IDs to avoid
 * cross-browser race conditions when testing in Saucelabs.
 * @const {string}
 */
const userAgent = encodeURIComponent(window.navigator.userAgent);

export function depositRequestUrl(id) {
  return `${REQUEST_URL}deposit/${id}-${userAgent}`;
}

export function withdrawRequest(win, id) {
  const url = `${REQUEST_URL}withdraw/${id}-${userAgent}`;
  return xhrServiceForTesting(win).fetchJson(url, {
    method: 'GET',
    ampCors: false,
    credentials: 'omit',
  }).then(res => res.json());
}
