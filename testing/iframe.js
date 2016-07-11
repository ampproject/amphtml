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


import {Timer} from '../src/timer';
import {installRuntimeServices, registerForUnitTest} from '../src/runtime';
import {cssText} from '../build/css';

let iframeCount = 0;


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
 * setTimeout inside the iframe will go 10x normal speed.
 * TODO(@cramforce): Add support for a fake clock.
 *
 * @param {string} fixture The name of the fixture file.
 * @param {number} initialIframeHeight in px.
 * @param {function(!Window)} opt_beforeLoad Called just before any other JS
 *     executes in the window.
 * @return {!Promise<{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element,
 *   awaitEvent: function(string, number):!Promise
 * }>}
 */
export function createFixtureIframe(fixture, initialIframeHeight, opt_beforeLoad) {
  return new Promise((resolve, reject) => {
    // Counts the supported custom events.
    const events = {
      'amp:attached': 0,
      'amp:error': 0,
      'amp:stubbed': 0,
      'amp:load:start': 0
    };
    const messages = [];
    let html = __html__[fixture];
    if (!html) {
      throw new Error('Cannot find fixture: ' + fixture);
    }
    html = maybeSwitchToCompiledJs(html);
    let firstLoad = true;
    window.ENABLE_LOG = true;
    // This global function will be called by the iframe immediately when it
    // starts loading. This appears to be the only way to get the correct
    // window object early enough to not miss any events that may get fired
    // on that window.
    window.beforeLoad = function(win) {
      // Flag as being a test window.
      win.AMP_TEST_IFRAME = true;
      win.AMP_TEST = true;
      win.ampTestRuntimeConfig = window.ampTestRuntimeConfig;
      if (opt_beforeLoad) {
        opt_beforeLoad(win);
      }
      win.addEventListener('message', (event) => {
        if (event.data &&
            // Either non-3P or 3P variant of the sentinel.
            (/^amp/.test(event.data.sentinel) ||
             /^\d+-\d+$/.test(event.data.sentinel))) {
          messages.push(event.data);
        }
      })
      // Function that returns a promise for when the given event fired at
      // least count times.
      let awaitEvent = (eventName, count) => {
        if (!(eventName in events)) {
          throw new Error('Unknown custom event ' + eventName);
        }
        return new Promise(function(resolve) {
          if (events[eventName] >= count) {
            resolve();
          } else {
            win.addEventListener(eventName, () => {
              if (events[eventName] == count) {
                resolve();
              }
            });
          }
        });
      };
      // Record firing of custom events.
      for (const name in events) {
        win.addEventListener(name, () => {
          events[name]++;
        });
      }
      win.onerror = function(message, file, line, col, error) {
        reject(new Error('Error in frame: ' + message + '\n' +
            file + ':' + line + '\n' +
            (error ? error.stack : 'no stack')));
      };
      let errors = [];
      win.console.error = function() {
        errors.push('Error: ' + [].slice.call(arguments).join(' '));
        console.error.apply(console, arguments);
      };
      // Make time go 10x as fast
      let setTimeout = win.setTimeout;
      win.setTimeout = function(fn, ms) {
        ms = ms || 0;
        setTimeout(fn, ms / 10);
      };
      let timeout = setTimeout(function() {
        reject(new Error('Timeout waiting for elements to start loading.'));
      }, 1000);
      // Declare the test ready to run when the document was fully parsed.
      window.afterLoad = function() {
        resolve({
          win: win,
          doc: win.document,
          iframe: iframe,
          awaitEvent: awaitEvent,
          errors: errors,
          messages: messages,
        });
      };
    };
    // Add before and after load callbacks to the document.
    html = html.replace('>', '><script>parent.beforeLoad(window);</script>');
    html += '<script>parent.afterLoad(window);</script>';
    let iframe = document.createElement('iframe');
    iframe.name = 'test_' + fixture + iframeCount++;
    iframe.onerror = function(event) {
      reject(event.error);
    };
    iframe.height = initialIframeHeight;
    iframe.width = 500;
    if ('srcdoc' in iframe) {
      iframe.srcdoc = html;
      document.body.appendChild(iframe);
    } else {
      iframe.src = 'about:blank';
      document.body.appendChild(iframe);
      const idoc = iframe.contentWindow.document;
      idoc.open();
      idoc.write(html);
      idoc.close();
    }
  });
}

/**
 * Creates a super simple iframe. Use this in unit tests to register elements
 * in a sandbox.
 * Returns a promise for an object with:
 * - win: The created window.
 * - doc: The created document.
 * - iframe: The host iframe element. Useful for e.g. resizing.
 * - addElement: Adds an AMP element to the iframe and returns a promise for
 *   that element. When the promise is resolved we will have called the entire
 *   lifecycle including layoutCallback.
 * @param {boolean=} opt_runtimeOff Whether runtime should be turned off.
 * @param {function()=} opt_beforeLayoutCallback
 * @return {!Promise<{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element,
 *   addElement: function(!Element):!Promise
 * }>}
 */
export function createIframePromise(opt_runtimeOff, opt_beforeLayoutCallback) {
  return new Promise(function(resolve, reject) {
    let iframe = document.createElement('iframe');
    iframe.name = 'test_' + iframeCount++;
    iframe.srcdoc = '<!doctype><html><head>' +
        '<style>.-amp-element {display: block;}</style>' +
        '<body style="margin:0"><div id=parent></div>';
    iframe.onload = function() {
      // Flag as being a test window.
      iframe.contentWindow.AMP_TEST_IFRAME = true;
      if (opt_runtimeOff) {
        iframe.contentWindow.name = '__AMP__off=1';
      }
      installRuntimeServices(iframe.contentWindow);
      registerForUnitTest(iframe.contentWindow);
      // Act like no other elements were loaded by default.
      iframe.contentWindow.ampExtendedElements = {};
      resolve({
        win: iframe.contentWindow,
        doc: iframe.contentWindow.document,
        iframe: iframe,
        addElement: function(element) {
          const iWin = iframe.contentWindow;
          const p = onInsert(iWin).then(() => {
            // Make sure it has dimensions since no styles are available.
            element.style.display = 'block';
            element.build(true);
            if (!element.getPlaceholder()) {
              const placeholder = element.createPlaceholder();
              if (placeholder) {
                element.appendChild(placeholder);
              }
            }
            if (element.layoutCount_ == 0) {
              if (opt_beforeLayoutCallback) {
                opt_beforeLayoutCallback(element);
              }
              return element.layoutCallback().then(() => {
                return element;
              });
            }
            return element;
          });
          iWin.document.getElementById('parent')
              .appendChild(element);
          return p;
        }
      });
    };
    iframe.onerror = reject;
    document.body.appendChild(iframe);
  });
}

export function createServedIframe(src) {
  return new Promise(function(resolve, reject) {
    const iframe = document.createElement('iframe');
    iframe.name = 'test_' + iframeCount++;
    iframe.src = src;
    iframe.onload = function() {
      const win = iframe.contentWindow;
      win.AMP_TEST_IFRAME = true;
      win.AMP_TEST = true;
      installRuntimeServices(win);
      registerForUnitTest(win);
      resolve({
        win: win,
        doc: win.document,
        iframe: iframe
      });
    };
    iframe.onerror = reject;
    document.body.appendChild(iframe);
  });
}

/**
 * Returns a promise for when the condition becomes true.
 * @param {string} description
 * @param {fn():T} condition Should return a truthy value when the poll
 *     is done. The return value is then returned with the promise
 *     returned by this function.
 * @param {fn():!Error=} opt_onError
 * @param {number=} opt_timeout
 * @return {!Promise<T>} The polled for value.
 * @template T
 */
export function poll(description, condition, opt_onError, opt_timeout) {
  return new Promise((resolve, reject) => {
    let start = new Date().getTime();
    function poll() {
      const ret = condition();
      if (ret) {
        clearInterval(interval);
        resolve(ret);
      } else {
        if (new Date().getTime() - start > (opt_timeout || 1600)) {
          clearInterval(interval);
          if (opt_onError) {
            reject(opt_onError());
            return;
          }
          reject(new Error('Timeout waiting for ' + description));
        }
      }
    }
    let interval = setInterval(poll, 8);
    poll();
  });
}

/**
 * Polls for the given number of elements to have received layout or
 * be in error state (Better to fail an assertion after this then just time
 * out).
 * @param {!Window} win
 * @param {number} count
 * @param {number=} opt_timeout
 *
 * @return {!Promise}
 */
export function pollForLayout(win, count, opt_timeout) {
  let getCount = () => {
    return win.document.querySelectorAll('.-amp-layout,.-amp-error').length;
  };
  return poll('Waiting for elements to layout: ' + count, () => {
    return getCount() >= count;
  }, () => {
    return new Error('Failed to find elements with layout.' +
        ' Current count: ' + getCount() + ' HTML:\n' +
        win.document.documentElement./*TEST*/innerHTML);
  }, opt_timeout);
}

/**
 * @param {!Window} win
 * @return {!Promise}
 */
export function expectBodyToBecomeVisible(win) {
  return poll('expect body to become visible', () => {
    return win && win.document && win.document.body && (
        (win.document.body.style.visibility == 'visible'
            && win.document.body.style.opacity != '0')
        || win.document.body.style.opacity == '1');
  });
}

/**
 * For the given iframe, makes the creation of iframes and images
 * create elements that do not actually load their underlying
 * resources.
 * Calling `triggerLoad` makes the respective resource appear loaded.
 * Calling `triggerError` on the respective resources makes them
 * appear in error state.
 * @param {!Window} win
 */
export function doNotLoadExternalResourcesInTest(win) {
  const createElement = win.document.createElement;
  win.document.createElement = function(tagName) {
    const element = createElement.apply(this, arguments);
    tagName = tagName.toLowerCase();
    if (tagName == 'iframe' || tagName == 'img') {
      // Make get/set write to a fake property instead of
      // triggering invocation.
      Object.defineProperty(element, 'src', {
        set: function(val) {
          this.fakeSrc = val;
        },
        get: function() {
          return this.fakeSrc;
        }
      });
      // Triggers a load event on the element in the next micro task.
      element.triggerLoad = function() {
        const e = new Event('load');
        Promise.resolve().then(() => {
          this.dispatchEvent(e);
        });
      };
      // Triggers an error event on the element in the next micro task.
      element.triggerError = function() {
        const e = new Event('error');
        Promise.resolve().then(() => {
          this.dispatchEvent(e);
        });
      };
      if (tagName == 'iframe') {
        element.srcdoc = '<h1>Fake iframe</h1>';
      }
    }
    return element;
  };
}

/**
 * Returns a promise for when an element has been added to the given
 * window. This is for use in tests to wait until after the
 * attachment of an element to the DOM should have been registered.
 * @param {!Window} win
 * @return {!Promise<undefined>}
 */
function onInsert(win) {
  return new Promise(resolve => {
    const observer = new win.MutationObserver(() => {
      observer.disconnect();
      resolve();
    });
    observer.observe(win.document.documentElement, {
      childList: true,
      subtree: true,
    });
  })
}

/**
 * Takes a HTML document that is pointing to unminified JS and HTML
 * binaries and massages the URLs to pointed to compiled binaries
 * instead.
 * @param {string} html
 * @return {string}
 */
function maybeSwitchToCompiledJs(html) {
  if (window.ampTestRuntimeConfig.useCompiledJs) {
    return html
        // Main JS
        .replace(/\/dist\/amp\.js/, '/dist/v0.js')
        // Extensions
        .replace(/\.max\.js/g, '.js')
        // 3p html binary
        .replace(/\.max\.html/g, '.html')
        // 3p path
        .replace(/dist\.3p\/current\//g, 'dist.3p/current-min/');
  }
  return html;
}
