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

import installCustomElements from
    'document-register-element/build/document-register-element.node';
import {BaseElement} from '../src/base-element';
import {
  FakeCustomElements,
  FakeLocation,
  FakeWindow,
  interceptEventListeners,
} from './fake-dom';
import {installFriendlyIframeEmbed} from '../src/friendly-iframe-embed';
import {doNotLoadExternalResourcesInTest} from './iframe';
import {ampdocServiceFor} from '../src/ampdoc';
import {
  adopt,
  adoptShadowMode,
  installAmpdocServices,
  installRuntimeServices,
  registerElementForTesting,
} from '../src/runtime';
import {cssText} from '../build/css';
import {createAmpElementProto} from '../src/custom-element';
import {installDocService} from '../src/service/ampdoc-impl';
import {
  installBuiltinElements,
  installExtensionsService,
  registerExtension,
} from '../src/service/extensions-impl';
import {extensionsFor, resourcesForDoc} from '../src/services';
import {resetScheduledElementForTesting} from '../src/custom-element';
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
 * - ampdoc: "single", "shadow", "multi", "none".
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
 *   amp: (!AmpTestSpec|undefined),
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
 *   amp: (!AmpTestSpec|undefined),
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
 * A test within a described environment.
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
  }

  /** @override */
  teardown(env) {
  }
}


/** @implements {Fixture} */
class RealWinFixture {

  /** @param {!{
  *   fakeRegisterElement: boolean,
  *   ampCss: boolean,
  *   allowExternalResources: boolean
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
    return new Promise(function(resolve, reject) {
      const iframe = document.createElement('iframe');
      env.iframe = iframe;
      iframe.name = 'test_' + iframeCount++;
      iframe.srcdoc = '<!doctype><html><head>' +
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
    const ampdocService = ampdocServiceFor(win);
    env.ampdocService  = ampdocService;
    installExtensionsService(win);
    env.extensions = extensionsFor(win);
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
      resourcesForDoc(ampdoc).ampInitComplete();
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
          registerExtension(env.extensions, extensionId, installer, win.AMP);
        } else {
          registerElementForTesting(win, extensionId);
        }
      });
    }

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
      const promise = ampdoc.whenReady();
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
 * Creates a custom element without registration.
 * @param {!Window} win
 * @param {string=} opt_name
 * @param {function(new:./base-element.BaseElement, !Element)} opt_implementationClass
 * @return {!AmpElement}
 */
function createAmpElement(win, opt_name, opt_implementationClass) {
  // Create prototype and constructor.
  const name = opt_name || 'amp-element';
  const proto = createAmpElementProto(win, name);
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
