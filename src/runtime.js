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

import {BaseElement} from './base-element';
import {BaseTemplate, registerExtendedTemplate} from './service/template-impl';
import {
  LogLevel, // eslint-disable-line no-unused-vars
  dev,
  initLogConstructor,
  overrideLogLevel,
  setReportError,
} from './log';
import {MultidocManager} from './multidoc-manager';
import {Services} from './services';
import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {config} from './config';
import {getMode} from './mode';
import {hasRenderDelayingServices} from './render-delaying-services';
import {
  installAmpdocServices,
  installRuntimeServices,
} from './service/core-services';
import {
  installExtensionsService,
  stubLegacyElements,
} from './service/extensions-impl';
import {internalRuntimeVersion} from './internal-version';
import {isExperimentOn, toggleExperiment} from './experiments';
import {reportErrorForWin} from './error';
import {scheduleUpgradeIfNeeded as scheduleInObUpgradeIfNeeded} from './polyfillstub/intersection-observer-stub';
import {setStyle} from './style';
import {startupChunk} from './chunk';
import {stubElementsForDoc} from './service/custom-element-registry';
import {waitForBodyOpenPromise} from './dom';

initLogConstructor();
setReportError(reportErrorForWin.bind(null, self));

/** @const @private {string} */
const TAG = 'runtime';

/**
 * @typedef {{
 *  url: (string|undefined),
 *  title: (string|undefined),
 *  canonicalUrl: (string|undefined),
 *  head: (Element|undefined),
 *  ampdoc: (!./service/ampdoc-impl.AmpDoc | undefined),
 *  setVisibilityState: (function(!VisibilityState)|undefined),
 *  postMessage: (function()|undefined),
 *  onMessage: (function()|undefined),
 *  close: (function()|undefined),
 *  getState: (function()|undefined),
 *  setState: (function()|undefined),
 *  toggleRuntime: (function()|undefined),
 *  resources: (!./service/resources-interface.ResourcesInterface | undefined)
 * }}
 */
export let ShadowDoc;

/**
 * Applies the runtime to a given global scope for a single-doc mode. Multi
 * frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @param {function(!Window, !./service/extensions-impl.Extensions):!Promise} callback
 * @return {!Promise}
 */
function adoptShared(global, callback) {
  // Tests can adopt the same window twice. sigh.
  if (global.__AMP_TAG) {
    return Promise.resolve();
  }
  global.__AMP_TAG = true;
  // If there is already a global AMP object we assume it is an array
  // of functions
  /** @const {!Array<function(!Object)|!ExtensionPayload>} */
  const preregisteredExtensions = global.AMP || [];

  installExtensionsService(global);
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = Services.extensionsFor(global);
  installRuntimeServices(global);
  stubLegacyElements(global);

  global.AMP = {
    win: global,
    // Might not be available in tests.
    '_': global.AMP ? global.AMP['_'] : undefined,
  };

  // `AMP.extension()` function is only installed in a non-minified mode.
  // This function is meant to play the same role for development and testing
  // as `AMP.push()` in production.
  if (!getMode().minified) {
    /**
     * @param {string} unusedName
     * @param {string} unusedVersion
     * @param {function(!Object)} installer
     * @const
     */
    global.AMP.extension = function (unusedName, unusedVersion, installer) {
      installer(global.AMP);
    };
  }

  /** @const */
  global.AMP.config = config;

  global.AMP.BaseElement = BaseElement;

  global.AMP.BaseTemplate = BaseTemplate;

  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {typeof BaseElement} implementationClass
   * @param {string=} opt_css
   */
  global.AMP.registerElement = extensions.addElement.bind(extensions);

  /**
   * Registers an extended template.
   * @param {string} name
   * @param {typeof BaseTemplate} implementationClass
   */
  global.AMP.registerTemplate = function (name, implementationClass) {
    registerExtendedTemplate(global, name, implementationClass);
  };

  /**
   * Registers an ampdoc service.
   * @param {string} name
   * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)} implementationClass
   */
  global.AMP.registerServiceForDoc = extensions.addService.bind(extensions);

  // Experiments.
  /**
   * @param {string} experimentId
   * @return {boolean}
   */
  global.AMP.isExperimentOn = isExperimentOn.bind(null, global);

  /**
   * @param {string} experimentId
   * @param {boolean=} opt_on
   * @return {boolean}
   */
  global.AMP.toggleExperiment = toggleExperiment.bind(null, global);

  /**
   * @param {!LogLevel} level
   */
  global.AMP.setLogLevel = overrideLogLevel.bind(null);

  /**
   * Sets the function to forward tick events to.
   * @param {function(string,?string=,number=)} unusedFn
   * @param {function()=} opt_flush
   * @deprecated
   * @export
   */
  global.AMP.setTickFunction = (unusedFn, opt_flush) => {};

  // Run specific setup for a single-doc or shadow-doc mode.
  const iniPromise = callback(global, extensions);

  /**
   * @param {function(!Object,!Object)|!ExtensionPayload} fnOrStruct
   */
  function installExtension(fnOrStruct) {
    const register = () => {
      iniPromise.then(() => {
        if (typeof fnOrStruct == 'function') {
          fnOrStruct(global.AMP, global.AMP._);
        } else {
          extensions.registerExtension(fnOrStruct.n, fnOrStruct.f, global.AMP);
        }
      });
    };

    // We support extension declarations which declare they have an
    // "intermediate" dependency that needs to be loaded before they
    // can execute.
    if (!(typeof fnOrStruct == 'function') && fnOrStruct.i) {
      preloadDeps(extensions, fnOrStruct).then(function () {
        return startRegisterOrChunk(global, fnOrStruct, register);
      });
    } else {
      startRegisterOrChunk(global, fnOrStruct, register);
    }
  }

  // Handle high priority extensions now, and if necessary issue
  // requests for new extensions (used for experimental version
  // locking).
  for (let i = 0; i < preregisteredExtensions.length; i++) {
    const fnOrStruct = preregisteredExtensions[i];
    if (maybeLoadCorrectVersion(global, fnOrStruct)) {
      preregisteredExtensions.splice(i--, 1);
    } else if (typeof fnOrStruct == 'function' || fnOrStruct.p == 'high') {
      try {
        installExtension(fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev().error(TAG, 'Extension failed: ', e, fnOrStruct.n);
      }
      // We handled the entry. Remove from set for future execution.
      preregisteredExtensions.splice(i--, 1);
    }
  }

  maybePumpEarlyFrame(global, () => {
    /**
     * Registers a new custom element.
     * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
     */
    global.AMP.push = function (fnOrStruct) {
      if (maybeLoadCorrectVersion(global, fnOrStruct)) {
        return;
      }
      installExtension(fnOrStruct);
    };
    // Execute asynchronously scheduled elements.
    for (let i = 0; i < preregisteredExtensions.length; i++) {
      const fnOrStruct = preregisteredExtensions[i];
      if (maybeLoadCorrectVersion(global, fnOrStruct)) {
        continue;
      }
      try {
        installExtension(fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev().error(TAG, 'Extension failed: ', e, fnOrStruct.n);
      }
    }
    // Make sure we empty the array of preregistered extensions.
    // Technically this is only needed for testing, as everything should
    // go out of scope here, but just making sure.
    preregisteredExtensions.length = 0;
  });
  // If the closure passed to maybePumpEarlyFrame didn't execute
  // immediately we need to keep pushing onto preregisteredExtensions
  if (!global.AMP.push) {
    global.AMP.push = /** @type {function((ExtensionPayload|function(!Object, !Object): ?))} */ (preregisteredExtensions.push.bind(
      preregisteredExtensions
    ));
  }

  // For iOS we need to set `cursor:pointer` to ensure that click events are
  // delivered.
  if (Services.platformFor(global).isIos()) {
    setStyle(global.document.documentElement, 'cursor', 'pointer');
  }

  // Some deferred polyfills.
  scheduleInObUpgradeIfNeeded(global);

  return iniPromise;
}

/**
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @return {!Promise}
 */
function preloadDeps(extensions, fnOrStruct) {
  // Allow a single string as the intermediate dependency OR allow
  // for an array if intermediate dependencies that needs to be
  // resolved first before executing this current extension.
  if (Array.isArray(fnOrStruct.i)) {
    const promises = fnOrStruct.i.map((dep) => {
      return extensions.preloadExtension(dep);
    });
    return Promise.all(promises);
  } else if (typeof fnOrStruct.i == 'string') {
    return extensions.preloadExtension(fnOrStruct.i);
  }
  dev().error(
    'RUNTIME',
    'dependency is neither an array or a string',
    fnOrStruct.i
  );
  return Promise.resolve();
}

/**
 * @param {!Window} global Global scope to adopt.
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @param {function()} register
 */
function startRegisterOrChunk(global, fnOrStruct, register) {
  if (typeof fnOrStruct == 'function' || fnOrStruct.p == 'high') {
    // "High priority" extensions do not go through chunking.
    // This should be used for extensions that need to run early.
    // One example would be viewer communication that is required
    // to transition document from pre-render to visible (which
    // affects chunking itself).
    // We consider functions as high priority, because
    // - if in doubt, that is a better default
    // - the only actual  user is a viewer integration that should
    //   be high priority.
    Promise.resolve().then(register);
  } else {
    register.displayName = fnOrStruct.n;
    startupChunk(global.document, register);
  }
}

/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adopt(global) {
  return adoptShared(global, (global) => {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);

    return waitForBodyOpenPromise(global.document).then(() => {
      // Ensure that all declared extensions are marked and stubbed.
      stubElementsForDoc(global.AMP.ampdoc);
    });
  });
}

/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adoptWithMultidocDeps(global) {
  return adoptShared(global, (global) => {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);

    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);

    return waitForBodyOpenPromise(global.document).then(() => {
      // Ensure that all declared extensions are marked and stubbed.
      stubElementsForDoc(global.AMP.ampdoc);
    });
  });
}

/**
 * Adopt shared runtimes variables between both multi-doc and single-doc pages
 * @param {!Window} global Global scope to adopt.
 */
function adoptServicesAndResources(global) {
  const {documentElement} = global.document;

  const ampdocService = Services.ampdocServiceFor(global);
  const ampdoc = ampdocService.getSingleDoc();
  global.AMP.ampdoc = ampdoc;

  const viewer = Services.viewerForDoc(documentElement);
  global.AMP.viewer = viewer;

  if (getMode().development) {
    global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
    global.AMP.resources = Services.resourcesForDoc(documentElement);
  }

  const viewport = Services.viewportForDoc(documentElement);
  global.AMP.viewport = {};
  global.AMP.viewport.getScrollLeft = viewport.getScrollLeft.bind(viewport);
  global.AMP.viewport.getScrollWidth = viewport.getScrollWidth.bind(viewport);
  global.AMP.viewport.getWidth = viewport.getWidth.bind(viewport);
}

/**
 * Adopt MultiDocManager dependencies
 * @param {!Window} global Global scope to adopt.
 */
function adoptMultiDocDeps(global) {
  global.AMP.installAmpdocServices = installAmpdocServices.bind(null);
  global.AMP.combinedCss = ampDocCss + ampSharedCss;
}

/**
 * Applies the runtime to a given global scope for shadow mode.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adoptShadowMode(global) {
  return adoptShared(global, (global, extensions) => {
    // shadow mode already adopted
    if (global.AMP.attachShadowDoc) {
      return Promise.resolve();
    }

    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);

    const manager = new MultidocManager(
      global,
      Services.ampdocServiceFor(global),
      extensions,
      Services.timerFor(global)
    );

    /**
     * Registers a shadow root document via a fully fetched document.
     * @param {!Element} hostElement
     * @param {!Document} doc
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDoc = manager.attachShadowDoc.bind(manager);

    /**
     * Registers a shadow root document via a stream.
     * @param {!Element} hostElement
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDocAsStream = manager.attachShadowDocAsStream.bind(
      manager
    );

    return waitForBodyOpenPromise(global.document);
  });
}

/**
 * For a given extension, checks that its version is the same
 * as the version of the main AMP binary.
 * If yes, returns false and does nothing else.
 * If they are different, returns false, and initiates a load
 * of the respective extension via a versioned URL.
 *
 * This is currently guarded by the 'version-locking' experiment.
 * With this active, all scripts in a given page are guaranteed
 * to have the same AMP release version.
 *
 * @param {!Window} win
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @return {boolean}
 */
function maybeLoadCorrectVersion(win, fnOrStruct) {
  if (!isExperimentOn(win, 'version-locking')) {
    return false;
  }
  if (typeof fnOrStruct == 'function') {
    return false;
  }
  const {v} = fnOrStruct;
  // This is non-obvious, but we only care about the release version,
  // not about the full rtv version, because these only differ
  // in the config that is fully determined by the primary binary.
  if (internalRuntimeVersion() == v) {
    return false;
  }
  Services.extensionsFor(win).reloadExtension(fnOrStruct.n);
  return true;
}

/**
 * If it makes sense, let the browser paint the current frame before
 * executing the callback.
 * @param {!Window} win
 * @param {function()} cb Callback that should run after a frame was
 *     pumped.
 */
function maybePumpEarlyFrame(win, cb) {
  if (!isExperimentOn(win, 'pump-early-frame')) {
    cb();
    return;
  }
  // There is definitely nothing to draw yet, so we might as well
  // proceed.
  if (!win.document.body) {
    cb();
    return;
  }
  if (hasRenderDelayingServices(win)) {
    cb();
    return;
  }
  Services.timerFor(win).delay(cb, 1);
}
