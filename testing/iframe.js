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

import {AmpEvents} from '../src/amp-events';
import {BindEvents} from '../extensions/amp-bind/0.1/bind-events';
import {FakeLocation} from './fake-dom';
import {FormEvents} from '../extensions/amp-form/0.1/form-events';
import {Services} from '../src/services';
import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {deserializeMessage, isAmpMessage} from '../src/3p-frame-messaging';
import {dev} from '../src/log';
import {
  installAmpdocServices,
  installRuntimeServices,
} from '../src/service/core-services';
import {install as installCustomElements} from '../src/polyfills/custom-elements';
import {installDocService} from '../src/service/ampdoc-impl';
import {installExtensionsService} from '../src/service/extensions-impl';
import {parseIfNeeded} from '../src/iframe-helper';

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
export function createFixtureIframe(
  fixture,
  initialIframeHeight,
  opt_beforeLoad
) {
  dev().assertNumber(
    initialIframeHeight,
    'Attempted to create fixture iframe with non-numeric height'
  );
  return new Promise((resolve, reject) => {
    // Counts the supported custom events.
    const events = {
      [AmpEvents.ATTACHED]: 0,
      [AmpEvents.DOM_UPDATE]: 0,
      [AmpEvents.ERROR]: 0,
      [AmpEvents.LOAD_END]: 0,
      [AmpEvents.LOAD_START]: 0,
      [AmpEvents.STUBBED]: 0,
      [AmpEvents.UNLOAD]: 0,
      [BindEvents.INITIALIZE]: 0,
      [BindEvents.SET_STATE]: 0,
      [BindEvents.RESCAN_TEMPLATE]: 0,
      [FormEvents.SERVICE_INIT]: 0,
    };
    let html = __html__[fixture] // eslint-disable-line no-undef
      .replace(
        /__TEST_SERVER_PORT__/g,
        window.ampTestRuntimeConfig.testServerPort
      );
    if (!html) {
      throw new Error('Cannot find fixture: ' + fixture);
    }
    html = maybeSwitchToCompiledJs(html);
    window.ENABLE_LOG = true;
    // This global function will be called by the iframe immediately when it
    // starts loading. This appears to be the only way to get the correct
    // window object early enough to not miss any events that may get fired
    // on that window.
    window.beforeLoad = function (win) {
      // Flag as being a test window.
      win.__AMP_TEST_IFRAME = true;
      win.__AMP_TEST = true;
      // Set the testLocation on iframe to parent's location since location of
      // the test iframe is about:srcdoc.
      // Unfortunately location object is not configurable, so we have to define
      // a new property.
      win.testLocation = new FakeLocation(window.location.href, win);
      win.ampTestRuntimeConfig = window.ampTestRuntimeConfig;
      if (opt_beforeLoad) {
        opt_beforeLoad(win);
      }
      const messages = new MessageReceiver(win);
      // Function that returns a promise for when the given event fired at
      // least count times.
      const awaitEvent = (eventName, count) => {
        if (!(eventName in events)) {
          throw new Error('Unknown custom event ' + eventName);
        }
        return new Promise(function (resolve) {
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
      win.onerror = function (message, file, line, col, error) {
        reject(
          new Error(
            'Error in frame: ' +
              message +
              '\n' +
              file +
              ':' +
              line +
              '\n' +
              (error ? error.stack : 'no stack')
          )
        );
      };
      const errors = [];
      win.console.error = function () {
        errors.push('Error: ' + [].slice.call(arguments).join(' '));
        console.error.apply(console, arguments);
      };
      // Make time go 10x as fast
      const {setTimeout} = win;
      win.setTimeout = function (fn, ms) {
        ms = ms || 0;
        setTimeout(fn, ms / 10);
      };
      setTimeout(function () {
        reject(new Error('Timeout waiting for elements to start loading.'));
      }, window.ampTestRuntimeConfig.mochaTimeout || 2000);
      // Declare the test ready to run when the document was fully parsed.
      window.afterLoad = function () {
        resolve({
          win,
          doc: win.document,
          iframe,
          awaitEvent,
          errors,
          messages,
        });
      };
    };
    // Add before and after load callbacks to the document.
    html = html.replace('>', '><script>parent.beforeLoad(window);</script>');
    html += '<script>parent.afterLoad(window);</script>';
    const iframe = document.createElement('iframe');
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      iframe.setAttribute('scrolling', 'no');
    }
    iframe.name = 'test_' + fixture + iframeCount++;
    iframe.onerror = function (event) {
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
 *   ampdoc: !../src/service/ampdoc-impl.AmpDoc,
 *   iframe: !Element,
 *   addElement: function(!Element):!Promise
 * }>}
 */
export function createIframePromise(opt_runtimeOff, opt_beforeLayoutCallback) {
  return new Promise(function (resolve, reject) {
    const iframe = document.createElement('iframe');
    iframe.name = 'test_' + iframeCount++;
    iframe.srcdoc = '<!doctype><html><head><body><div id=parent></div>';
    iframe.onload = function () {
      // Flag as being a test window.
      iframe.contentWindow.__AMP_TEST_IFRAME = true;
      iframe.contentWindow.testLocation = new FakeLocation(
        window.location.href,
        iframe.contentWindow
      );
      if (opt_runtimeOff) {
        iframe.contentWindow.name = '__AMP__off=1';
      }
      // Required for timer service, which now refers not to the global
      // Promise but the passed in window Promise in it's constructor as
      // it is an embedabble service. b\17733
      iframe.contentWindow.Promise = window.Promise;
      installDocService(iframe.contentWindow, /* isSingleDoc */ true);
      const ampdoc = Services.ampdocServiceFor(
        iframe.contentWindow
      ).getSingleDoc();
      installExtensionsService(iframe.contentWindow);
      installRuntimeServices(iframe.contentWindow);
      // The anonymous class parameter allows us to detect native classes vs
      // transpiled classes.
      installCustomElements(iframe.contentWindow, class {});
      installAmpdocServices(ampdoc);
      Services.resourcesForDoc(ampdoc).ampInitComplete();
      // Act like no other elements were loaded by default.
      installStylesLegacy(
        iframe.contentWindow.document,
        ampDocCss + ampSharedCss,
        () => {
          resolve({
            win: iframe.contentWindow,
            doc: iframe.contentWindow.document,
            ampdoc,
            iframe,
            addElement: function (element) {
              const iWin = iframe.contentWindow;
              const p = onInsert(iWin)
                .then(() => {
                  return element.buildInternal();
                })
                .then(() => {
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
              iWin.document.getElementById('parent').appendChild(element);
              return p;
            },
          });
        }
      );
    };
    iframe.onerror = reject;
    document.body.appendChild(iframe);
  });
}

/**
 * @param {!Document} doc
 * @param {string} cssText
 * @param {function()} cb
 */
function installStylesLegacy(doc, cssText, cb) {
  const style = doc.createElement('style');
  style.textContent = cssText;
  doc.head.appendChild(style);

  // Styles aren't always available synchronously. E.g. if there is a
  // pending style download, it will have to finish before the new
  // style is visible.
  // For this reason we poll until the style becomes available.
  // Sync case.
  const styleLoaded = () => {
    const sheets = doc.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      if (sheet.ownerNode == style) {
        return true;
      }
    }
    return false;
  };

  if (styleLoaded()) {
    cb();
  } else {
    const interval = setInterval(() => {
      if (styleLoaded()) {
        clearInterval(interval);
        cb();
      }
    }, 4);
  }
}

export function createServedIframe(src) {
  return new Promise(function (resolve, reject) {
    const iframe = document.createElement('iframe');
    iframe.name = 'test_' + iframeCount++;
    iframe.src = src;
    iframe.onload = function () {
      const win = iframe.contentWindow;
      win.__AMP_TEST_IFRAME = true;
      win.__AMP_TEST = true;
      installRuntimeServices(win);
      resolve({
        win,
        doc: win.document,
        iframe,
      });
    };
    iframe.onerror = reject;
    document.body.appendChild(iframe);
  });
}

const IFRAME_STUB_URL =
  '//ads.localhost:9876/test/fixtures/served/iframe-stub.html#';

/**
 * Creates an iframe fixture in the given window that can be used for
 * window.postMessage related tests.
 *
 * It provides functions like:
 * - instruct the iframe to post a message to the parent window
 * - verify the iframe has received a message from the parent window
 *
 * See /test/fixtures/served/iframe-stub.html for implementation.
 *
 * @param {!Window} win
 * @return {!HTMLIFrameElement}
 */
export function createIframeWithMessageStub(win) {
  const element = win.document.createElement('iframe');
  element.src = IFRAME_STUB_URL;

  /**
   * Instructs the iframe to send a message to parent window.
   * @param {!Object} msg
   */
  element.postMessageToParent = (msg) => {
    element.src = IFRAME_STUB_URL + encodeURIComponent(JSON.stringify(msg));
  };

  /**
   * Returns a Promise that resolves when the iframe acknowledged the reception
   * of the specified message.
   * @param {function(?Object, !Object|string)|string} callbackOrType
   *     A callback that determines if this is the message we expected. If a
   *     string is passed, the determination is based on whether the message's
   *     type matches the string.
   */
  element.expectMessageFromParent = (callbackOrType) => {
    let filter;
    if (typeof callbackOrType === 'string') {
      filter = (data) => {
        return 'type' in data && data.type == callbackOrType;
      };
    } else {
      filter = callbackOrType;
    }

    return new Promise((resolve, reject) => {
      function listener(event) {
        if (event.source != element.contentWindow || !event.data.testStubEcho) {
          return;
        }
        const message = event.data.receivedMessage;
        const data = parseIfNeeded(message);
        try {
          if (filter(data, message)) {
            win.removeEventListener('message', listener);
            resolve(data || message);
          }
        } catch (e) {
          win.removeEventListener('message', listener);
          reject(e);
        }
      }
      win.addEventListener('message', listener);
    });
  };

  return element;
}

/**
 * Returns a Promise that resolves when a post message is observed from the
 * given source window to target window.
 *
 * @param {!Window} sourceWin
 * @param {!Window} targetwin
 * @param {!Object} msg
 * @return {!Promise<!Object>}
 */
export function expectPostMessage(sourceWin, targetwin, msg) {
  return new Promise((resolve) => {
    const listener = (event) => {
      if (
        event.source == sourceWin &&
        JSON.stringify(msg) == JSON.stringify(event.data)
      ) {
        targetwin.removeEventListener('message', listener);
        resolve(event.data);
      }
    };
    targetwin.addEventListener('message', listener);
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
    const start = Date.now();
    const end = opt_timeout || 1600;
    function poll() {
      const ret = condition();
      if (ret) {
        clearInterval(interval);
        resolve(ret);
      } else {
        if (Date.now() - start > end) {
          clearInterval(interval);
          if (opt_onError) {
            reject(opt_onError());
            return;
          }
          reject(new Error('Timeout waiting for ' + description));
        }
      }
    }
    const interval = setInterval(poll, 8);
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
  const getCount = () => {
    return win.document.querySelectorAll('.i-amphtml-layout,.i-amphtml-error')
      .length;
  };
  return poll(
    'Waiting for elements to layout: ' + count,
    () => {
      return getCount() >= count;
    },
    () => {
      return new Error(
        'Failed to find elements with layout.' +
          ' Current count: ' +
          getCount() +
          ' HTML:\n' +
          win.document.documentElement./*TEST*/ innerHTML
      );
    },
    opt_timeout
  );
}

/**
 * @param {!Window} win
 * @param {number=} opt_timeout
 * @return {!Promise}
 */
export function expectBodyToBecomeVisible(win, opt_timeout) {
  return poll(
    'expect body to become visible',
    () => {
      return (
        win &&
        win.document &&
        win.document.body &&
        ((win.document.body.style.visibility == 'visible' &&
          win.document.body.style.opacity != '0') ||
          win.document.body.style.opacity == '1')
      );
    },
    undefined,
    opt_timeout || 5000
  );
}

/**
 * For the given iframe, makes the creation of iframes and images
 * create elements that do not actually load their underlying
 * resources.
 * Calling `triggerLoad` makes the respective resource appear loaded.
 * Calling `triggerError` on the respective resources makes them
 * appear in error state.
 * @param {!Window} win
 * @param {!Object} sandbox
 */
export function doNotLoadExternalResourcesInTest(win, sandbox) {
  const {document} = win;
  const {prototype} = win.Document;
  const {createElement} = prototype;
  sandbox.stub(prototype, 'createElement').callsFake(function (tagName) {
    const element = createElement.apply(document, arguments);
    tagName = tagName.toLowerCase();
    if (tagName == 'iframe' || tagName == 'img') {
      // Make get/set write to a fake property instead of
      // triggering invocation.
      element.fakeSrc = '';
      Object.defineProperty(element, 'src', {
        set: function (val) {
          this.fakeSrc = val;
        },
        get: function () {
          return this.fakeSrc;
        },
      });
      // Triggers a load event on the element in the next micro task.
      element.triggerLoad = function () {
        const e = new Event('load');
        Promise.resolve().then(() => {
          this.dispatchEvent(e);
        });
      };
      // Triggers an error event on the element in the next micro task.
      element.triggerError = function () {
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
  });
}

/**
 * Returns a promise for when an element has been added to the given
 * window. This is for use in tests to wait until after the
 * attachment of an element to the DOM should have been registered.
 * @param {!Window} win
 * @return {!Promise<undefined>}
 */
function onInsert(win) {
  return new Promise((resolve) => {
    const observer = new win.MutationObserver(() => {
      observer.disconnect();
      resolve();
    });
    observer.observe(win.document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Takes a HTML document that is pointing to unminified JS and HTML
 * binaries and massages the URLs to pointed to compiled binaries
 * instead.
 * @param {string} html
 * @return {string}
 */
export function maybeSwitchToCompiledJs(html) {
  if (window.ampTestRuntimeConfig.useCompiledJs) {
    return (
      html
        // Main JS
        .replace(/\/dist\/amp\.js/g, '/dist/v0.js')
        // Inabox
        .replace(/\/dist\/amp-inabox/g, '/dist/amp4ads-v0')
        // Extensions
        .replace(/\.max\.js/g, '.js')
        // 3p html binary
        .replace(/\.max\.html/g, '.html')
        // 3p path
        .replace(/dist\.3p\/current\//g, 'dist.3p/current-min/')
    );
  }
  return html;
}

class MessageReceiver {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    this.events_ = [];
    win.addEventListener('message', (event) => {
      const parsedData = this.parseMessageData_(event.data);

      if (
        parsedData &&
        // Either non-3P or 3P variant of the sentinel.
        (/^amp/.test(parsedData.sentinel) ||
          /^\d+-\d+$/.test(parsedData.sentinel))
      ) {
        this.events_.push({
          data: parsedData,
          userActivation: event.userActivation,
        });
      }
    });
  }

  /**
   * @param {string} type
   * @returns {?Event}
   */
  getFirstMessageEventOfType(type) {
    for (let i = 0; i < this.events_.length; ++i) {
      if (this.events_[i].data.type === type) {
        return this.events_[i];
      }
    }
    return null;
  }

  /**
   * @param {*} data
   * @return {?}
   * @private
   */
  parseMessageData_(data) {
    if (typeof data == 'string' && isAmpMessage(data)) {
      return deserializeMessage(data);
    }
    return data;
  }
}
