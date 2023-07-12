'use strict';

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
 *       beforeEach(() => { sandbox = sinon.sandbox; })
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

import fetchMock from 'fetch-mock/es5/client-bundle';
import sinon from /*OK*/ 'sinon';

import {CSS} from '#build/amp-ad-0.1.css';

import {createElementWithAttributes} from '#core/dom';
import {setStyles} from '#core/dom/style';

import {install as installCustomElements} from '#polyfills/custom-elements';
import {install as installIntersectionObserver} from '#polyfills/intersection-observer';
import {install as installResizeObserver} from '#polyfills/resize-observer';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {
  installAmpdocServices,
  installBuiltinElements,
  installRuntimeServices,
} from '#service/core-services';
import {resetScheduledElementForTesting} from '#service/custom-element-registry';
import {installExtensionsService} from '#service/extensions-impl';

import {
  FakeCustomElements,
  FakeLocation,
  FakeWindow,
  interceptEventListeners,
} from './fake-dom';
import {stubService} from './helpers/service';
import {doNotLoadExternalResourcesInTest} from './iframe';
import {TestConfig} from './test-config';

import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {BaseElement} from '../src/base-element';
import {createAmpElementForTesting} from '../src/custom-element';
import {installFriendlyIframeEmbed} from '../src/friendly-iframe-embed';
import {
  maybeTrackImpression,
  resetTrackImpressionPromiseForTesting,
} from '../src/impression';
import {adopt, adoptShadowMode} from '../src/runtime';
import {addParamsToUrl} from '../src/url';

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';

/** @type {number} */
let iframeCount = 0;

/**
 * @const {!{[key: string]: function(!Object)}}
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
 *   params: (!{[key: string]: string}|undefined),
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
export const sandboxed = createConfigurableRunner((unusedSpec) => []);

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
export const fakeWin = createConfigurableRunner((spec) => [
  new FakeWinFixture(spec),
  new AmpFixture(spec),
]);

/**
 * A test with a real (iframed) window.
 * @param {string} name
 * @param {{
 *   fakeRegisterElement: (boolean|undefined),
 *   skipCustomElementsPolyfill: (boolean|undefined),
 *   amp: (boolean|!AmpTestSpec|undefined),
 * }} spec
 * @param {function({
 *   win: !Window,
 *   iframe: !HTMLIFrameElement,
 *   amp: (!AmpTestEnv|undefined),
 * })} fn
 */
export const realWin = createConfigurableRunner((spec) => [
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
 *   amp: (boolean),
 *   timeout: (number),
 * }} spec
 * @param {function({
 *   win: !Window,
 *   iframe: !HTMLIFrameElement,
 * })} fn
 */
export const integration = createConfigurableRunner((spec) => [
  new IntegrationFixture(spec),
]);

/**
 * A repeated test within a sandboxed wrapper.
 * @param {string} name
 * @param {!{[key: string]: *}} variants
 * @param {function()} fn
 */
export const repeated = createRepeatedRunner();

/**
 * Defines a repeating test within a sandboxed wrapper.
 */
function repeatedEnv() {
  /**
   * @param {string} name
   * @param {!{[key: string]: *}} variants
   * @param {function(string, *)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function (name, variants, fn, describeFunc) {
    return describeFunc(name, function () {
      for (const name in variants) {
        sandboxed(name ? ` ${name} ` : SUB, {}, function (env) {
          fn.call(this, name, variants[name], env);
        });
      }
    });
  };

  const createTemplate = (describeFunc) => (name, variants, fn) =>
    templateFunc(name, variants, fn, describeFunc);

  const mainFunc = createTemplate(describe);
  mainFunc.only = createTemplate(describe.only);
  mainFunc.skip = createTemplate(describe.skip);
  return mainFunc;
}

/**
 * Creates a repeated version of a top-level describes runner.
 */
function createRepeatedRunner() {
  const runner = repeatedEnv();
  runner.configure = () => new TestConfig(runner);
  return runner;
}

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
   * @param {?boolean} configured
   */
  const templateFunc = function (name, spec, fn, describeFunc, configured) {
    const fixtures = [new SandboxFixture(spec)].concat(
      factory(spec).filter((fixture) => fixture && fixture.isOn())
    );

    return describeFunc(name, () => {
      const env = Object.create(null);

      // Note: If this `beforeEach` function is made async/always returns a
      // Promise, even if it resolves immediately, tests start failing. It's
      // not entirely clear why. Don't refactor this to be an async for-loop
      // like the `afterEach` below.
      beforeEach(() => {
        let totalPromise = undefined;
        // Set up all fixtures.
        fixtures.forEach((fixture) => {
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

      afterEach(async () => {
        // Tear down all fixtures in reverse order.
        for (let i = fixtures.length - 1; i >= 0; --i) {
          await fixtures[i].teardown(env);
        }

        // Delete all other keys.
        for (const key in env) {
          delete env[key];
        }
      });

      function execute() {
        if (spec.timeout) {
          this.timeout(spec.timeout);
        }
        fn.call(this, env);
      }

      // Don't re-configure the inner describe() if the outer describes() was
      // already configured.
      if (configured) {
        describe(SUB, execute);
      } else {
        describe.configure().run(SUB, execute);
      }
    });
  };

  const createTemplate = (describeFunc) => (name, spec, fn, configured) =>
    templateFunc(name, spec, fn, describeFunc, configured);

  const mainFunc = createTemplate(describe);
  mainFunc.only = createTemplate(describe.only);
  mainFunc.skip = createTemplate(describe.skip);
  return mainFunc;
}

/**
 * Creates a configurable version of a top-level describes runner.
 * @param {function(!Object):!Array<?Fixture>} factory
 */
function createConfigurableRunner(factory) {
  const runner = describeEnv(factory);
  runner.configure = () => new TestConfig(runner);
  return runner;
}

/** @interface */
class FixtureInterface {
  /** @return {boolean} */
  isOn() {}

  /**
   * @param {!Object} env
   * @return {!Promise|undefined}
   */
  setup(unusedEnv) {}

  /**
   * @param {!Object} env
   * @return {!Promise|undefined}
   */
  teardown(unusedEnv) {}
}

/** @implements {FixtureInterface} */
class SandboxFixture {
  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;
    this.defineProperties_ = [];
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    env.sandbox = sinon.createSandbox();
    env.sandbox.defineProperty = this.defineProperty_.bind(this);
    env.sandbox.deleteProperty = (obj, propertyKey) => {
      this.defineProperty_(obj, propertyKey, undefined);
    };
  }

  /** @override */
  teardown(env) {
    this.restoreDefineProperty_();
    env.sandbox.restore();
  }

  defineProperty_(obj, propertyKey, descriptor) {
    this.defineProperties_.push({
      obj,
      propertyKey,
      descriptor: Object.getOwnPropertyDescriptor(obj, propertyKey),
    });

    if (descriptor) {
      if (descriptor.configurable === false) {
        throw new Error(
          `sandbox.defineProperty(${obj.constructor.name},${propertyKey},{configurable=false}); ` +
            `With configurable=false, you will not be able to restore the property!`
        );
      }
      descriptor.configurable = true;
      Object.defineProperty(obj, propertyKey, descriptor);
    } else {
      delete obj[propertyKey];
    }
  }

  restoreDefineProperty_() {
    this.defineProperties_.forEach((item) => {
      try {
        if (item.descriptor === undefined) {
          delete item.obj[item.propertyKey];
        } else {
          Object.defineProperty(item.obj, item.propertyKey, item.descriptor);
        }
      } catch (e) {
        throw new Error(
          `Failed to restore sandbox.defineProperty(${item.obj.constructor.name},${item.propertyKey}); ${e}`
        );
      }
    });
  }
}

/** @implements {FixtureInterface} */
class IntegrationFixture {
  /** @param {!{body: string}} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;
    if (this.spec.timeout === undefined) {
      this.spec.timeout = 15000;
    }
    /** @const {string} */
    this.hash = spec.hash || '';
    delete spec.hash;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  async setup(env) {
    const body =
      typeof this.spec.body == 'function' ? this.spec.body() : this.spec.body;
    const css =
      typeof this.spec.css == 'function' ? this.spec.css() : this.spec.css;
    const experiments =
      this.spec.experiments == undefined
        ? undefined
        : this.spec.experiments.join(',');
    const extensions =
      this.spec.extensions == undefined
        ? undefined
        : this.spec.extensions.join(',');
    const ampDocType = this.spec.ampdoc || 'single';
    const style = this.spec.frameStyle;

    let url =
      this.spec.amp === false
        ? '/amp4test/compose-html'
        : '/amp4test/compose-doc';

    if (this.spec.params) {
      url = addParamsToUrl(url, this.spec.params);
    }

    const docUrl =
      addParamsToUrl(url, {
        body,
        css,
        experiments,
        extensions,
      }) + `#${this.hash}`;

    // If shadow mode, wrap doc in shadow viewer.
    const src =
      ampDocType == 'shadow'
        ? addParamsToUrl('/amp4test/compose-shadow', {docUrl})
        : docUrl;

    env.iframe = createElementWithAttributes(document, 'iframe', {
      src,
      style,
    });

    return new Promise((resolve, reject) => {
      env.iframe.onload = function () {
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

/** @implements {FixtureInterface} */
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

    if (!this.spec.Promise) {
      env.win.Promise = window.Promise;
    }
  }

  /** @override */
  teardown(unusedEnv) {
    if (this.spec.mockFetch !== false) {
      fetchMock./*OK*/ restore();
    }
  }
}

/** @implements {FixtureInterface} */
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
    const {spec} = this;
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      env.iframe = iframe;
      iframe.name = 'test_' + iframeCount++;
      iframe.srcdoc =
        '<!doctype html><html><head>' +
        '<style>.i-amphtml-element {display: block;}</style>' +
        '<body style="margin:0"><div id=parent></div>';
      iframe.onload = function () {
        const win = iframe.contentWindow;
        env.win = win;

        // Flag as being a test window.
        win.__AMP_TEST_IFRAME = true;
        // Set the testLocation on iframe to parent's location since location of
        // the test iframe is about:srcdoc.
        // Unfortunately location object is not configurable, so we have to
        // define a new property.
        win.testLocation = new FakeLocation(window.location.href, win);

        if (!spec.allowExternalResources) {
          doNotLoadExternalResourcesInTest(win, env.sandbox);
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
        } else if (!spec.skipCustomElementsPolyfill) {
          // The anonymous class parameter allows us to detect native classes
          // vs transpiled classes.
          installCustomElements(win, class {});
        }

        // Install IntersectionObserver polyfill.
        installIntersectionObserver(win);
        installResizeObserver(win);

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
      document.body.insertBefore(iframe, document.body.firstChild);
    });
  }

  /** @override */
  teardown(env) {
    // TODO(dvoytenko): test that window is returned in a good condition.
    if (env.iframe.parentNode) {
      env.iframe.parentNode.removeChild(env.iframe);
    }
    if (this.spec.mockFetch !== false) {
      fetchMock./*OK*/ restore();
    }
  }
}

/** @implements {FixtureInterface} */
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
    const {win} = env;
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
    installDocService(win, singleDoc, spec.params);
    const ampdocService = Services.ampdocServiceFor(win);
    env.ampdocService = ampdocService;
    installExtensionsService(win);
    env.extensions = Services.extensionsFor(win);
    installBuiltinElements(win);
    installRuntimeServices(win);
    env.flushVsync = function () {
      win.__AMP_SERVICES.vsync.obj.runScheduledTasks_();
    };
    if (singleDoc) {
      // Install AMP CSS for main runtime, if it hasn't been installed yet.
      completePromise = installRuntimeStylesPromise(win);
      const ampdoc = ampdocService.getAmpDoc(win.document);
      env.ampdoc = ampdoc;
      installAmpdocServices(ampdoc);
      adopt(win);
      Services.resourcesForDoc(ampdoc).ampInitComplete();
      // Ensure cached meta name/content pairs are cleared before each test
      ampdoc.meta_ = null;
      maybeTrackImpression(win);
    } else if (ampdocType == 'multi' || ampdocType == 'shadow') {
      adoptShadowMode(win);
      // Notice that ampdoc's themselves install runtime styles in shadow roots.
      // Thus, not changes needed here.
    }
    const extensions = [];
    if (spec.extensions) {
      spec.extensions.forEach((extensionIdWithVersion) => {
        const tuple = extensionIdWithVersion.split(':');
        const extensionId = tuple[0];
        // Default to 0.1 if no version was provided.
        const extensionVersion = tuple[1] || '0.1';
        extensions.push({extensionId, extensionVersion});
        const installer =
          extensionsBuffer[`${extensionId}:${extensionVersion}`];
        if (installer) {
          if (env.ampdoc) {
            env.ampdoc.declareExtension(extensionId, extensionVersion);
          }
          env.extensions.registerExtension(
            extensionId,
            extensionVersion,
            /* latest */ false,
            installer,
            win.AMP
          );
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
     * @param {string=} version
     * @param {boolean=} latest
     * @param {boolean=} auto
     */
    env.installExtension = function (
      extensionId,
      version = '0.1',
      latest = false,
      auto = true
    ) {
      const installer = extensionsBuffer[`${extensionId}:${version}`];
      if (!installer) {
        throw new Error(
          `extension not found: ${extensionId}:${version}.` +
            ' Make sure the module is imported'
        );
      }
      if (env.ampdoc && auto) {
        env.ampdoc.declareExtension(extensionId, version);
      }
      env.extensions.registerExtension(
        extensionId,
        version,
        latest,
        installer,
        win.AMP
      );
    };

    /**
     * Creates a custom element without registration.
     * @param {string=} opt_name
     * @param {typeof ./base-element.BaseElement} opt_implementationClass
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
      const html =
        '<!doctype html>' +
        '<html amp4ads>' +
        '<head></head>' +
        '<body></body>' +
        '</html>';
      const promise = installFriendlyIframeEmbed(
        embedIframe,
        container,
        {
          url: 'http://ads.localhost:8000/example',
          html,
          extensions,
        },
        (embedWin) => {
          interceptEventListeners(embedWin);
          interceptEventListeners(embedWin.document);
          interceptEventListeners(embedWin.document.documentElement);
          interceptEventListeners(embedWin.document.body);
        }
      ).then((embed) => {
        env.embed = embed;
        env.parentWin = env.win;
        env.win = embed.win;
        env.parentAmpdoc = env.ampdoc;
        env.ampdoc = embed.ampdoc;
        configureAmpTestMode(embed.win);
      });
      completePromise = completePromise
        ? completePromise.then(() => promise)
        : promise;
    } else if (ampdocType == 'shadow') {
      const hostElement = win.document.createElement('div');
      win.document.body.appendChild(hostElement);
      const importDoc = win.document.implementation.createHTMLDocument('');
      const ret = win.AMP.attachShadowDoc(
        hostElement,
        importDoc,
        win.location.href
      );
      const {ampdoc} = ret;
      env.ampdoc = ampdoc;
      const promise = Promise.all([
        env.extensions.installExtensionsInDoc(ampdoc, extensions),
        ampdoc.whenReady(),
      ]);
      ampdoc.setExtensionsKnown();
      completePromise = completePromise
        ? completePromise.then(() => promise)
        : promise;
    }

    return completePromise;
  }

  /** @override */
  teardown(env) {
    const {win} = env;
    resetTrackImpressionPromiseForTesting();
    if (env.embed) {
      env.embed.destroy();
    }
    if (win.customElements && win.customElements.elements) {
      for (const k in win.customElements.elements) {
        resetScheduledElementForTesting(win, k);
      }
    }
    if (this.spec.amp.extensions) {
      this.spec.amp.extensions.forEach((extensionId) => {
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
  win.__AMP_TEST = true;
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
  style./*OK*/ textContent = ampDocCss + ampSharedCss;
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
  style./*OK*/ textContent = CSS;
  win.document.head.appendChild(style);
}

/**
 * Creates a custom element without registration.
 * @param {!Window} win
 * @param {string=} opt_name
 * @param {typeof ./base-element.BaseElement} opt_implementationClass
 * @return {!AmpElement}
 */
function createAmpElement(win, opt_name, opt_implementationClass) {
  // Create prototype and constructor.
  const name = opt_name || 'amp-element';
  const proto = createAmpElementForTesting(win).prototype;
  const ctor = function () {
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
}
