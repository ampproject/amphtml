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


require('../src/polyfills');
import {registerForUnitTest} from '../src/runtime';

var iframeCount = 0;


/**
 * Creates an iframe from an HTML fixture for use in tests.
 *
 * Returns a promise for when the iframe is usable for testing that produces
 * an object with properties related to the created iframe and utility methods:
 * - win: The created window.
 * - doc: The created document.
 * - iframe: The host iframe element. Useful for e.g. resizing.
 * - awaitEvent: A function that returns a promise for when the given custom
 *   event fired at least the given number of times.
 * - errors: Array of console.error fired during page load.
 *
 * @param {string} fixture The name of the fixture file.
 * @param {number} initialIframeHeight in px.
 * @return {!Promise<{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element,
 *   awaitEvent: function(string, number):!Promise
 * }>}
 */
export function createFixtureIframe(fixture, initialIframeHeight, done) {
  return new Promise((resolve, reject) => {
    // Counts the supported custom events.
    const events = {
      'amp:attached': 0,
      'amp:error': 0,
      'amp:stubbed': 0,
      'amp:load:start': 0
    };
    var html = __html__[fixture];
    if (!html) {
      throw new Error('Cannot find fixture: ' + fixture);
    }
    var firstLoad = true;
    // This global function will be called by the iframe immediately when it
    // starts loading. This appears to be the only way to get the correct
    // window object early enough to not miss any events that may get fired
    // on that window.
    window.beforeLoad = function(win) {
      // Flag as being a test window.
      win.AMP_TEST = true;
      // Function that returns a promise for when the given event fired at
      // least count times.
      var awaitEvent = (eventName, count) => {
        if (!(eventName in events)) {
          throw new Error('Unknown custom event ' + eventName);
        }
        return new Promise(function(resolve) {
          if (events[eventName] >= count) {
            resolve();
          } else {
            win.addEventListener(eventName, () => {
              if(events[eventName] == count) {
                resolve();
              }
            });
          }
        });
      };
      // Record firing of custom events.
      for (let name in events) {
        win.addEventListener(name, () => {
          events[name]++;
        });
      }
      win.onerror = function(message, file, line, col, error) {
        throw new Error('Error in frame: ' + message + '\n' +
            file + ':' + line + '\n' +
            (error ? error.stack : 'no stack'));
      };
      var errors = []
      win.console.error = function() {
        errors.push('Error: ' + [].slice.call(arguments).join(' '));
      };
      var timeout = setTimeout(function() {
        reject(new Error('Timeout waiting for elements to start loading.'));
      }, 1000);
      // Declare the test ready to run when the document was fully parsed.
      window.afterLoad = function() {
        resolve({
          win: win,
          doc: win.document,
          iframe: iframe,
          awaitEvent: awaitEvent,
          errors: errors
        });
      };
    };
    // Add before and after load callbacks to the document.
    html = html.replace('>', '><script>parent.beforeLoad(window);</script>');
    html += '<script>parent.afterLoad(window);</script>';
    var iframe = document.createElement('iframe');
    iframe.name = 'test_' + fixture + iframeCount++;
    iframe.onerror = function(event) {
      throw event.error;
    };
    iframe.srcdoc = html;
    iframe.height = initialIframeHeight;
    iframe.width = 500;
    document.body.appendChild(iframe);
  });
}

/**
 * Creates a super simple iframe. Use this in unit tests to register elements
 * in a sandbox.
 * TODO(@cramforce): Remove this function. In this sync mode, the iframe is
 * treated as if it wasn't attached yet and the document actually exchanges
 * when it does. This breaks tests that want to measure things because
 * the iframe is treated as not rendered.
 * @return {{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element
 * }}
 */
export function createIframe() {
  var iframe = document.createElement('iframe');
  iframe.name = 'test_' + iframeCount++;
  var html = '<!doctype><html><head>' +
      '<script src="/base/node_modules/document-register-element/build/' +
      'document-register-element.max.js"></script>' +
      '<script src="/base/build/polyfills.js"></script>' +
      '<body style="margin:0">';
  iframe.setAttribute('html', html);
  iframe.src = 'javascript:window.frameElement.getAttribute("html");';
  document.body.appendChild(iframe);
  registerForUnitTest(iframe.contentWindow);
  // Flag as being a test window.
  iframe.contentWindow.AMP_TEST = true;
  return {
    win: iframe.contentWindow,
    doc: iframe.contentWindow.document,
    iframe: iframe
  };
}

/**
 * Creates a super simple iframe. Use this in unit tests to register elements
 * in a sandbox.
 * @return {{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element
 * }}
 */
export function createIframePromise() {
  return new Promise(function(resolve, reject) {
    var iframe = document.createElement('iframe');
    iframe.name = 'test_' + iframeCount++;
    var html = '<!doctype><html><head>' +
        '<script src="/base/node_modules/document-register-element/build/' +
        'document-register-element.max.js"></script>' +
        '<script src="/base/build/polyfills.js"></script>' +
        '<body style="margin:0">';
    iframe.setAttribute('html', html);
    iframe.onload = function() {
      registerForUnitTest(iframe.contentWindow);
      // Flag as being a test window.
      iframe.contentWindow.AMP_TEST = true;
      resolve({
        win: iframe.contentWindow,
        doc: iframe.contentWindow.document,
        iframe: iframe
      });
    };
    iframe.src = 'javascript:window.frameElement.getAttribute("html");';
    document.body.appendChild(iframe);
    iframe.onerror = reject;
  });
}

/**
 * @param {strin} description
 * @param {fn():boolean} condition
 * @param {fn():!Error=} opt_onError
 * @return {!Promise}
 */
export function poll(description, condition, opt_onError) {
  return new Promise((resolve, reject) => {
    var start = new Date().getTime();
    var interval = setInterval(function() {
      if (condition()) {
        clearInterval(interval);
        resolve();
      } else {
        if (new Date().getTime() - start > 1800) {
          clearInterval(interval);
          if (opt_onError) {
            reject(opt_onError());
            return;
          }
          reject(new Error('Timeout waiting for ' + description));
        }
      }
    }, 50);
  });
}
