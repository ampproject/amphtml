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

/**
 * @fileoverview
 *
 * describes.js helps save you from writing a lot of boilerplate test code.
 * It also helps avoid mutating global state in tests by providing mock globals
 * like FakeWindow.
 *
 * `describes` is a global test variable that wraps and augments Mocha's test
 * methods. For each test method, it takes an additional `spec` parameter and
 * returns an `env` object containing mocks, etc. that help testing.
 *
 * For example, a typical Mocha test may look like:
 *
 *     describe('myTest', () => {
 *       // I gotta do this sandbox creation and restore for every test? Ugh...
 *       let sandbox;
 *       beforeEach(() => { sandbox = sinon.sandbox.create(); })
 *       it('stubbing', () => { sandbox.stub(foo, 'bar'); });
 *       afterEach(() => { sandbox.restore(); });
 *     });
 *
 * A test that uses describes.js can save you the work of setting up sandboxes,
 * embedded iframes, mock windows, etc. For example:
 *
 *     // Yay! describes.sandboxed() sets up the sandbox for me.
 *     // Note the second `spec` param, and the returned `env` object.
 *     describes.sandboxed('myTest', {}, env => {
 *       it('stubbing', () => { env.sandbox.stub(foo, 'bar'); });
 *     });
 *
 * In addition to `sandboxed()`, describes.js has three other modes of
 * operation (that actually all support `env.sandbox`):
 *
 * 1. `sandboxed()` just helps you set up and tear down a sinon sandbox.
 *    Use this to save some sinon boilerplate code.
 *
 * 2. `fakeWin()` provides a fake Window (fake-dom.js#FakeWindow) in `env.win`.
 *    Use this when you're testing APIs that don't heavily depend on the DOM.
 *
 * 3. `realWin()` provides a real Window in an embedded iframe in `env.win`.
 *    Use this when you're testing APIs that need a real DOM.
 *
 * 4. `integration()` also provides a real Window in an embedded iframe, but
 *    the iframe contains an AMP doc where you can specify its <body> markup.
 *    Use this to save boilerplate for setting up the DOM of the iframe.
 *
 * The returned `env` object contains different objects depending on (A) the
 * mode of operation and (B) the `spec` object you provide it.
 *
 * - `fakeWin()` and `realWin()` both read `spec.amp`, which configures
 *   the AMP runtime on the returned window (see AmpTestSpec). You can also
 *   pass `false` to `spec.amp` to disable the AMP runtime if you just need
 *   a plain, non-AMP window.
 *
 *   Several AMP runtime objects (e.g. AmpDoc, AmpDocService) are returned to
 *   the test method in `env.amp`. See AmpTestEnv for details.
 *
 * - `integration()` reads `spec.body` and sets the string literal as the
 *   innerHTML of the embedded iframe's AMP document's <body>.
 *
 * The are more advanced usages of the various `spec` and returned `env`
 * objects. See the type definitions for `sandboxed`, `fakeWin`, `realWin`,
 * and `integration` below.
 */

import fetchMock from 'fetch-mock';
import installCustomElements from
    'document-register-element/build/document-register-element.node';
import {BaseElement} from '../src/base-element';
import {
  FakeCustomElements,
  FakeLocation,
  FakeWindow,
  interceptEventListeners,
} from './fake-dom';
import {stubService} from './test-helper';
import {installFriendlyIframeEmbed} from '../src/friendly-iframe-embed';
import {doNotLoadExternalResourcesInTest} from './iframe';
import {Services} from '../src/services';
import {
  adopt,
  adoptShadowMode,
  installAmpdocServices,
  installRuntimeServices,
} from '../src/runtime';
import {createElementWithAttributes} from '../src/dom';
import {addParamsToUrl} from '../src/url';
import {cssText} from '../build/css';
import {CSS} from '../build/amp-ad-0.1.css.js';
import {createAmpElementProtoForTesting} from '../src/custom-element';
import {installDocService} from '../src/service/ampdoc-impl';
import {
  installBuiltinElements,
  installExtensionsService,
  registerExtension,
} from '../src/service/extensions-impl';
import {
  resetScheduledElementForTesting,
} from '../src/service/custom-element-registry';
import {setStyles} from '../src/style';
import * as sinon from 'sinon';

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';


/** @type {number} */
let iframeCount = 0;


/**
 * @const {!Object<string, function(!Object)>}
 */
const extensionsBuffer = {};


/**
 * @param {string} name
 * @param {function(!Object)} installer
 * @const
 */
export function bufferExtension(name, installer) {
  extensionsBuffer[name] = installer;
}


/**
 * @typedef {{
 *   fakeRegisterElement: (boolean|undefined),
 * }}
 */
export let TestSpec;


/**
 * An object specifying the configuration of an AmpFixture.
 *
 * - ampdoc: "single", "shadow", "multi", "none", "fie".
 *
 * @typedef {{
 *   runtimeOn: (boolean|undefined),
 *   extensions: (!Array<string>|undefined),
 *   canonicalUrl: (string|undefined),
 *   ampdoc: (string|undefined),
 *   params: (!Object<string, string>|undefined),
 * }}
 */
export let AmpTestSpec;


/**
 * An object containing artifacts of AmpFixture that's returned to test methods.
 * @typedef {{
 *   win: !Window,
 *   extensions: !Extensions,
 *   ampdocService: !AmpDocService,
 *   ampdoc: (!AmpDoc|undefined),
 *   flushVsync: function(),
 * }}
 */
export let AmpTestEnv;


/**
 * A test with a sandbox.
 * @param {string} name
 * @param {!TestSpec} spec
 * @param {function()} fn
 */
export const sandboxed = describeEnv(spec => []);


/**
 * A test with a fake window.
 * @param {string} name
 * @param {{
 *   win: !FakeWindowSpec,
 *   amp: (boolean|!AmpTestSpec|undefined),
 * }} spec
 * @param {function({
 *   win: !FakeWindow,
 *   amp: (!AmpTestEnv|undefined),
 * })} fn
 */
export const fakeWin = describeEnv(spec => [
  new FakeWinFixture(spec),
  new AmpFixture(spec),
]);


/**
 * A test with a real (iframed) window.
 * @param {string} name
 * @param {{
 *   fakeRegisterElement: (boolean|undefined),
 *   amp: (boolean|!AmpTestSpec|undefined),
 * }} spec
 * @param {function({
 *   win: !Window,
 *   iframe: !HTMLIFrameElement,
 *   amp: (!AmpTestEnv|undefined),
 * })} fn
 */
export const realWin = describeEnv(spec => [
  new RealWinFixture(spec),
  new AmpFixture(spec),
]);


/**
 * A test that loads HTML markup in `spec.body` into an embedded iframe.
 * @param {string} name
 * @param {{
 *   body: string,
 *   css: (string|undefined),
 *   hash: (string|undefined),
 * }} spec
 * @param {function({
 *   win: !Window,
 *   iframe: !HTMLIFrameElement,
 * })} fn
 */
export const integration = describeEnv(spec => [
  new IntegrationFixture(spec),
]);


/**
 * A repeating test.
 * @param {string} name
 * @param {!Object<string, *>} variants
 * @param {function(string, *)} fn
 */
export const repeated = (function() {
  /**
   * @param {string} name
   * @param {!Object<string, *>} variants
   * @param {function(string, *)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function(name, variants, fn, describeFunc) {
    return describeFunc(name, function() {
      for (const name in variants) {
        describe(name ? ` ${name} ` : SUB, function() {
          fn.call(this, name, variants[name]);
        });
      }
    });
  };

  /**
   * @param {string} name
   * @param {!Object<string, *>} variants
   * @param {function(string, *)} fn
   */
  const mainFunc = function(name, variants, fn) {
    return templateFunc(name, variants, fn, describe);
  };

  /**
   * @param {string} name
   * @param {!Object<string, *>} variants
   * @param {function(string, *)} fn
   */
  mainFunc.only = function(name, variants, fn) {
    return templateFunc(name, variants, fn, describe./*OK*/only);
  };

  return mainFunc;
})();


/**
 * Mocks Window.fetch in the given environment and exposes `env.fetchMock`. For
 * convenience, also exposes fetch-mock's mock() function as
 * `env.expectFetch(matcher, response)`.
 *
 * @param {!Object} env
 * @see http://www.wheresrhys.co.uk/fetch-mock/quickstart
 */
function attachFetchMock(env) {
  fetchMock.global = env.win;
  fetchMock._mock();

  env.fetchMock = fetchMock;
  env.expectFetch = fetchMock.mock.bind(fetchMock);
}


/**
 * Returns a wrapped version of Mocha's describe(), it() and only() methods
 * that also sets up the provided fixtures and returns the corresponding
 * environment objects of each fixture to the test method.
 * @param {function(!Object):!Array<?Fixture>} factory
 */
function describeEnv(factory) {
  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function(name, spec, fn, describeFunc) {
    const fixtures = [new SandboxFixture(spec)];
    factory(spec).forEach(fixture => {
      if (fixture && fixture.isOn()) {
        fixtures.push(fixture);
      }
    });
    return describeFunc(name, function() {
      const env = Object.create(null);

      beforeEach(() => {
        let totalPromise = undefined;
        // Set up all fixtures.
        fixtures.forEach((fixture, index) => {
          if (totalPromise) {
            totalPromise = totalPromise.then(() => fixture.setup(env));
          } else {
            const res = fixture.setup(env);
            if (res && typeof res.then == 'function') {
              totalPromise = res;
            }
          }
        });
        return totalPromise;
      });

      afterEach(() => {
        // Tear down all fixtures.
        fixtures.slice(0).reverse().forEach(fixture => {
          fixture.teardown(env);
        });

        // Delete all other keys.
        for (const key in env) {
          delete env[key];
        }
      });

      describe(SUB, function() {
        fn.call(this, env);
      });
    });
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  const mainFunc = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe);
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  mainFunc.only = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe./*OK*/only);
  };

  mainFunc.skip = function(name, variants, fn) {
    return templateFunc(name, variants, fn, describe.skip);
  };

  return mainFunc;
}


/** @interface */
class Fixture {

  /** @return {boolean} */
  isOn() {}

  /**
   * @param {!Object} env
   * @return {!Promise|undefined}
   */
  setup(env) {}

  /**
   * @param {!Object} env
   */
  teardown(env) {}
}


/** @implements {Fixture} */
class SandboxFixture {

  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;

    /** @private {boolean} */
    this.sandboxOwner_ = false;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    const spec = this.spec;

    // Sandbox.
    let sandbox = global.sandbox;
    if (!sandbox) {
      sandbox = global.sandbox = sinon.sandbox.create();
      this.sandboxOwner_ = true;
    }
    env.sandbox = sandbox;
  }

  /** @override */
  teardown(env) {
    // Sandbox.
    if (this.sandboxOwner_) {
      env.sandbox.restore();
      delete global.sandbox;
      this.sandboxOwner_ = false;
    }
  }
}

/** @implements {Fixture} */
class IntegrationFixture {

  /** @param {!{body: string}} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;

    /** @const {string} */
    this.hash = spec.hash || '';
    delete spec.hash;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    const body = typeof this.spec.body == 'function' ?
          this.spec.body() : this.spec.body;
    const css = typeof this.spec.css == 'function' ?
          this.spec.css() : this.spec.css;
    const experiments = this.spec.experiments == undefined ?
        undefined : this.spec.experiments.join(',');
    const extensions = this.spec.extensions == undefined ?
        undefined : this.spec.extensions.join(',');

    return new Promise((resolve, reject) => {
      env.iframe = createElementWithAttributes(document, 'iframe', {
        src: addParamsToUrl('/amp4test/compose-doc',
            {body, css, experiments, extensions}) + `#${this.hash}`,
      });
      env.iframe.onload = function() {
        env.win = env.iframe.contentWindow;
        resolve();
      };
      env.iframe.onerror = reject;
      document.body.appendChild(env.iframe);
    });
  }

  /** @override */
  teardown(env) {
    if (env.iframe.parentNode) {
      env.iframe.parentNode.removeChild(env.iframe);
    }
  }
}

/** @implements {Fixture} */
class FakeWinFixture {

  /** @param {!{win: !FakeWindowSpec}} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    env.win = new FakeWindow(this.spec.win || {});

    if (this.spec.mockFetch !== false) {
      attachFetchMock(env);
    }
  }

  /** @override */
  teardown(env) {
    if (this.spec.mockFetch !== false) {
      fetchMock./*OK*/restore();
    }
  }
}


/** @implements {Fixture} */
class RealWinFixture {

  /** @param {!{
  *   fakeRegisterElement: boolean,
  *   ampCss: boolean,
  *   allowExternalResources: boolean,
  *   ampAdCss: boolean
  * }} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    const spec = this.spec;
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      env.iframe = iframe;
      iframe.name = 'test_' + iframeCount++;
      iframe.srcdoc = '<!doctype html><html><head>' +
          '<style>.i-amphtml-element {display: block;}</style>' +
          '<body style="margin:0"><div id=parent></div>';
      iframe.onload = function() {
        const win = iframe.contentWindow;
        env.win = win;

        // Flag as being a test window.
        win.AMP_TEST_IFRAME = true;
        // Set the testLocation on iframe to parent's location since location of
        // the test iframe is about:srcdoc.
        // Unfortunately location object is not configurable, so we have to
        // define a new property.
        win.testLocation = new FakeLocation(window.location.href, win);

        if (!spec.allowExternalResources) {
          doNotLoadExternalResourcesInTest(win);
        }

        // Install AMP CSS if requested.
        if (spec.ampCss) {
          installRuntimeStylesPromise(win);
        }

        // Install AMP AD CSS if requested.
        if (spec.ampAdCss) {
          installAmpAdStylesPromise(win);
        }

        if (spec.fakeRegisterElement) {
          const customElements = new FakeCustomElements(win);
          Object.defineProperty(win, 'customElements', {
            get: () => customElements,
          });
        } else {
          installCustomElements(win);
        }

        // Intercept event listeners
        interceptEventListeners(win);
        interceptEventListeners(win.document);
        interceptEventListeners(win.document.documentElement);
        interceptEventListeners(win.document.body);
        env.interceptEventListeners = interceptEventListeners;

        if (spec.mockFetch !== false) {
          attachFetchMock(env);
        }

        resolve();
      };
      iframe.onerror = reject;
      document.body.appendChild(iframe);
    });
  }

  /** @override */
  teardown(env) {
    // TODO(dvoytenko): test that window is returned in a good condition.
    if (env.iframe.parentNode) {
      env.iframe.parentNode.removeChild(env.iframe);
    }
    if (this.spec.mockFetch !== false) {
      fetchMock./*OK*/restore();
    }
  }
}


/** @implements {Fixture} */
class AmpFixture {

  /**
   * @param {!{amp: (boolean|!AmpTestSpec)}} spec
   */
  constructor(spec) {
    /** @const */
    this.spec = spec;
  }

  /** @override */
  isOn() {
    return !!this.spec.amp;
  }

  /** @override */
  setup(env) {
    const spec = this.spec.amp;
    const win = env.win;
    let completePromise;

    // Configure mode.
    configureAmpTestMode(win);

    // AMP requires canonical URL.
    const link = win.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', spec.canonicalUrl || window.location.href);
    win.document.head.appendChild(link);

    if (!spec.runtimeOn) {
      win.name = '__AMP__off=1';
    }
    const ampdocType = spec.ampdoc || 'single';
    const singleDoc = ampdocType == 'single' || ampdocType == 'fie';
    installDocService(win, singleDoc);
    const ampdocService = Services.ampdocServiceFor(win);
    env.ampdocService = ampdocService;
    installExtensionsService(win);
    env.extensions = Services.extensionsFor(win);
    installBuiltinElements(win);
    installRuntimeServices(win);
    env.flushVsync = function() {
      win.services.vsync.obj.runScheduledTasks_();
    };
    if (singleDoc) {
      // Install AMP CSS for main runtime, if it hasn't been installed yet.
      completePromise = installRuntimeStylesPromise(win);
      const ampdoc = ampdocService.getAmpDoc(win.document);
      env.ampdoc = ampdoc;
      installAmpdocServices(ampdoc, spec.params);
      adopt(win);
      Services.resourcesForDoc(ampdoc).ampInitComplete();
    } else if (ampdocType == 'multi' || ampdocType == 'shadow') {
      adoptShadowMode(win);
      // Notice that ampdoc's themselves install runtime styles in shadow roots.
      // Thus, not changes needed here.
    }
    const extensionIds = [];
    if (spec.extensions) {
      spec.extensions.forEach(extensionIdWithVersion => {
        const tuple = extensionIdWithVersion.split(':');
        const extensionId = tuple[0];
        extensionIds.push(extensionId);
        // Default to 0.1 if no version was provided.
        const version = tuple[1] || '0.1';
        const installer = extensionsBuffer[`${extensionId}:${version}`];
        if (installer) {
          if (env.ampdoc) {
            env.ampdoc.declareExtension_(extensionId);
          }
          registerExtension(env.extensions, extensionId, installer, win.AMP);
        }
      });
    }

    /**
     * Stubs a method of a service object using Sinon.
     *
     * @param {string} serviceId
     * @param {string} method
     * @return {!sinon.stub}
     */
    env.stubService = (serviceId, method) => {
      return stubService(env.sandbox, env.win, serviceId, method);
    };

    /**
     * Installs the specified extension.
     * @param {string} extensionId
     * @param {string=} opt_version
     */
    env.installExtension = function(extensionId, opt_version) {
      const version = opt_version || '0.1';
      const installer = extensionsBuffer[`${extensionId}:${version}`];
      if (!installer) {
        throw new Error(`extension not found: ${extensionId}:${version}.` +
            ' Make sure the module is imported');
      }
      if (env.ampdoc) {
        env.ampdoc.declareExtension_(extensionId);
      }
      registerExtension(env.extensions, extensionId, installer, win.AMP);
    };

    /**
     * Creates a custom element without registration.
     * @param {string=} opt_name
     * @param {function(new:./base-element.BaseElement, !Element)} opt_implementationClass
     * @return {!AmpElement}
     */
    env.createAmpElement = createAmpElement.bind(null, win);

    // Friendly embed setup.
    if (ampdocType == 'fie') {
      const container = win.document.createElement('div');
      const embedIframe = win.document.createElement('iframe');
      container.appendChild(embedIframe);
      embedIframe.setAttribute('frameborder', '0');
      embedIframe.setAttribute('allowfullscreen', '');
      embedIframe.setAttribute('scrolling', 'no');
      setStyles(embedIframe, {
        width: '300px',
        height: '150px',
      });
      win.document.body.appendChild(container);
      const html = '<!doctype html>'
          + '<html amp4ads>'
          + '<head></head>'
          + '<body></body>'
          + '</html>';
      const promise = installFriendlyIframeEmbed(
          embedIframe, container, {
            url: 'http://ads.localhost:8000/example',
            html,
            extensionIds,
          }, embedWin => {
            interceptEventListeners(embedWin);
            interceptEventListeners(embedWin.document);
            interceptEventListeners(embedWin.document.documentElement);
            interceptEventListeners(embedWin.document.body);
          }).then(embed => {
            env.embed = embed;
            env.parentWin = env.win;
            env.win = embed.win;
            configureAmpTestMode(embed.win);
          });
      completePromise = completePromise ?
          completePromise.then(() => promise) : promise;
    } else if (ampdocType == 'shadow') {
      const hostElement = win.document.createElement('div');
      win.document.body.appendChild(hostElement);
      const importDoc = win.document.implementation.createHTMLDocument('');
      const ret = win.AMP.attachShadowDoc(
          hostElement, importDoc, win.location.href);
      const ampdoc = ret.ampdoc;
      env.ampdoc = ampdoc;
      const promise = Promise.all([
        env.extensions.installExtensionsInDoc_(ampdoc, extensionIds),
        ampdoc.whenReady(),
      ]);
      completePromise = completePromise ?
          completePromise.then(() => promise) : promise;
    }

    return completePromise;
  }

  /** @override */
  teardown(env) {
    const win = env.win;
    if (env.embed) {
      env.embed.destroy();
    }
    if (win.customElements && win.customElements.elements) {
      for (const k in win.customElements.elements) {
        resetScheduledElementForTesting(win, k);
      }
    }
    if (this.spec.amp.extensions) {
      this.spec.amp.extensions.forEach(extensionId => {
        if (extensionId.indexOf(':') != -1) {
          extensionId = extensionId.substring(0, extensionId.indexOf(':'));
        }
        resetScheduledElementForTesting(win, extensionId);
      });
    }
  }
}


/**
 * @param {!Window} win
 */
function configureAmpTestMode(win) {
  win.AMP_TEST = true;
}


/**
 * @param {!Window} win
 */
function installRuntimeStylesPromise(win) {
  if (win.document.querySelector('style[amp-runtime]')) {
    // Already installed.
    return;
  }
  const style = document.createElement('style');
  style.setAttribute('amp-runtime', '');
  style./*OK*/textContent = cssText;
  win.document.head.appendChild(style);
}

/**
 * @param {!Window} win
 */
function installAmpAdStylesPromise(win) {
  if (win.document.querySelector('style[amp-extension="amp-ad"]')) {
    // Already installed.
    return;
  }
  const style = document.createElement('style');
  style.setAttribute('amp-extension', 'amp-ad');
  style./*OK*/textContent = CSS;
  win.document.head.appendChild(style);
}



/**
 * Creates a custom element without registration.
 * @param {!Window} win
 * @param {string=} opt_name
 * @param {function(new:./base-element.BaseElement, !Element)} opt_implementationClass
 * @return {!AmpElement}
 */
function createAmpElement(win, opt_name, opt_implementationClass) {
  // Create prototype and constructor.
  const name = opt_name || 'amp-element';
  const proto = createAmpElementProtoForTesting(win, name);
  const ctor = function() {
    const el = win.document.createElement(name);
    el.__proto__ = proto;
    return el;
  };
  ctor.prototype = proto;
  proto.constructor = ctor;

  // Create the element instance.
  const element = new ctor();
  element.implementationClassForTesting =
      opt_implementationClass || BaseElement;
  element.createdCallback();
  element.classList.add('i-amphtml-element');
  return element;
};
