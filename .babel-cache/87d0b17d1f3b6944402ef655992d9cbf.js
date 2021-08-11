import { resolvedPromise as _resolvedPromise3 } from "./core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

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
import * as mode from "./core/mode";
import { BaseElement } from "./base-element";
import { startupChunk } from "./chunk";
import { config } from "./config";
import { waitForBodyOpenPromise } from "./core/dom";
import { setStyle } from "./core/dom/style";
import { reportErrorForWin } from "./error-reporting";
import { isExperimentOn, toggleExperiment } from "./experiments";
import { internalRuntimeVersion } from "./internal-version";
import { LogLevel // eslint-disable-line no-unused-vars
, dev, initLogConstructor, overrideLogLevel, setReportError } from "./log";
import { getMode } from "./mode";
import { MultidocManager } from "./multidoc-manager";
import { shouldLoadPolyfill as shouldLoadInObPolyfill } from "./polyfills/stubs/intersection-observer-stub";
import { shouldLoadPolyfill as shouldLoadResObPolyfill } from "./polyfills/stubs/resize-observer-stub";
import { hasRenderDelayingServices } from "./render-delaying-services";
import { Services } from "./service";
import { installAmpdocServices, installRuntimeServices } from "./service/core-services";
import { stubElementsForDoc } from "./service/custom-element-registry";
import { installExtensionsService, stubLegacyElements } from "./service/extensions-impl";
import { cssText as ampDocCss } from "../build/ampdoc.css";
import { cssText as ampSharedCss } from "../build/ampshared.css";
initLogConstructor();
setReportError(reportErrorForWin.bind(null, self));

/** @const @private {string} */
var TAG = 'runtime';

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
export var ShadowDoc;

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
    return _resolvedPromise();
  }

  global.__AMP_TAG = true;
  // If there is already a global AMP object we assume it is an array
  // of functions

  /** @const {!Array<function(!Object)|!ExtensionPayload>} */
  var preregisteredExtensions = global.AMP || [];
  installExtensionsService(global);

  /** @const {!./service/extensions-impl.Extensions} */
  var extensions = Services.extensionsFor(global);
  installRuntimeServices(global);
  stubLegacyElements(global);
  global.AMP = {
    win: global,
    // Might not be available in tests.
    '_': global.AMP ? global.AMP['_'] : undefined
  };

  // `AMP.extension()` function is only installed in a non-minified mode.
  // This function is meant to play the same role for development and testing
  // as `AMP.push()` in production.
  if (!mode.isMinified()) {
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

  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {typeof BaseElement} implementationClass
   * @param {?string|undefined} css
   */
  global.AMP.registerElement = extensions.addElement.bind(extensions);

  /**
   * Registers an extended template.
   * @param {string} name
   * @param {typeof ./base-template.BaseTemplate} implementationClass
   */
  global.AMP.registerTemplate = extensions.addTemplate.bind(extensions);

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
   */
  global.AMP.setTickFunction = function (unusedFn, opt_flush) {};

  // Run specific setup for a single-doc or shadow-doc mode.
  var iniPromise = callback(global, extensions);

  /**
   * @param {function(!Object,!Object)|!ExtensionPayload} fnOrStruct
   */
  function installExtension(fnOrStruct) {
    var register = function register() {
      iniPromise.then(function () {
        if (typeof fnOrStruct == 'function') {
          fnOrStruct(global.AMP, global.AMP._);
        } else {
          extensions.registerExtension(fnOrStruct.n, fnOrStruct.ev, fnOrStruct.l, fnOrStruct.f, global.AMP);
        }
      });
    };

    startRegisterOrChunk(global, fnOrStruct, register);
  }

  // Handle high priority extensions now, and if necessary issue
  // requests for new extensions (used for experimental version
  // locking).
  for (var i = 0; i < preregisteredExtensions.length; i++) {
    var fnOrStruct = preregisteredExtensions[i];

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

  maybePumpEarlyFrame(global, function () {
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
    for (var _i = 0; _i < preregisteredExtensions.length; _i++) {
      var _fnOrStruct = preregisteredExtensions[_i];

      if (maybeLoadCorrectVersion(global, _fnOrStruct)) {
        continue;
      }

      try {
        installExtension(_fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev().error(TAG, 'Extension failed: ', e, _fnOrStruct.n);
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
    global.AMP.push =
    /** @type {function((ExtensionPayload|function(!Object, !Object): ?))} */
    preregisteredExtensions.push.bind(preregisteredExtensions);
  }

  // For iOS we need to set `cursor:pointer` to ensure that click events are
  // delivered.
  if (Services.platformFor(global).isIos()) {
    setStyle(global.document.documentElement, 'cursor', 'pointer');
  }

  // Some deferred polyfills.
  var extensionsFor = Services.extensionsFor(global);

  if (shouldLoadResObPolyfill(global)) {
    extensionsFor.preloadExtension('amp-resize-observer-polyfill');
  }

  if (shouldLoadInObPolyfill(global)) {
    extensionsFor.preloadExtension('amp-intersection-observer-polyfill');
  }

  return iniPromise;
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
    _resolvedPromise2().then(register);
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
  return adoptShared(global, function (global) {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);
    return waitForBodyOpenPromise(global.document).then(function () {
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
  return adoptShared(global, function (global) {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);
    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);
    return waitForBodyOpenPromise(global.document).then(function () {
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
  var documentElement = global.document.documentElement;
  var ampdocService = Services.ampdocServiceFor(global);
  var ampdoc = ampdocService.getSingleDoc();
  global.AMP.ampdoc = ampdoc;
  var viewer = Services.viewerForDoc(documentElement);
  global.AMP.viewer = viewer;

  if (getMode().development) {
    global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
    global.AMP.resources = Services.resourcesForDoc(documentElement);
  }

  var viewport = Services.viewportForDoc(documentElement);
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

  if (false) {
    var style = global.document.querySelector('style[amp-runtime]');
    global.AMP.combinedCss = style ? style.textContent : '';
  } else {
    global.AMP.combinedCss = ampDocCss + ampSharedCss;
  }
}

/**
 * Applies the runtime to a given global scope for shadow mode.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adoptShadowMode(global) {
  return adoptShared(global, function (global, extensions) {
    // shadow mode already adopted
    if (global.AMP.attachShadowDoc) {
      return _resolvedPromise3();
    }

    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);
    var manager = new MultidocManager(global, Services.ampdocServiceFor(global), extensions, Services.timerFor(global));

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
    global.AMP.attachShadowDocAsStream = manager.attachShadowDocAsStream.bind(manager);
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
 * @param {!Window} win
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @return {boolean}
 */
function maybeLoadCorrectVersion(win, fnOrStruct) {
  if (getMode().localDev && isExperimentOn(win, 'disable-version-locking')) {
    return false;
  }

  if (typeof fnOrStruct == 'function') {
    return false;
  }

  if (false) {
    // If we're in a module runtime, trying to execute a nomodule extension
    // simply remove the nomodule extension so that it is not executed.
    if (!fnOrStruct.m) {
      return true;
    }
  } else {
    // If we're in a nomodule runtime, trying to execute a module extension
    // simply remove the module extension so that it is not executed.
    if (fnOrStruct.m) {
      return true;
    }
  }

  var v = fnOrStruct.v;

  // This is non-obvious, but we only care about the release version,
  // not about the full rtv version, because these only differ
  // in the config that is fully determined by the primary binary.
  if (internalRuntimeVersion() == v) {
    return false;
  }

  Services.extensionsFor(win).reloadExtension(fnOrStruct.n, fnOrStruct.ev, fnOrStruct.l);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bnRpbWUuanMiXSwibmFtZXMiOlsibW9kZSIsIkJhc2VFbGVtZW50Iiwic3RhcnR1cENodW5rIiwiY29uZmlnIiwid2FpdEZvckJvZHlPcGVuUHJvbWlzZSIsInNldFN0eWxlIiwicmVwb3J0RXJyb3JGb3JXaW4iLCJpc0V4cGVyaW1lbnRPbiIsInRvZ2dsZUV4cGVyaW1lbnQiLCJpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uIiwiTG9nTGV2ZWwiLCJkZXYiLCJpbml0TG9nQ29uc3RydWN0b3IiLCJvdmVycmlkZUxvZ0xldmVsIiwic2V0UmVwb3J0RXJyb3IiLCJnZXRNb2RlIiwiTXVsdGlkb2NNYW5hZ2VyIiwic2hvdWxkTG9hZFBvbHlmaWxsIiwic2hvdWxkTG9hZEluT2JQb2x5ZmlsbCIsInNob3VsZExvYWRSZXNPYlBvbHlmaWxsIiwiaGFzUmVuZGVyRGVsYXlpbmdTZXJ2aWNlcyIsIlNlcnZpY2VzIiwiaW5zdGFsbEFtcGRvY1NlcnZpY2VzIiwiaW5zdGFsbFJ1bnRpbWVTZXJ2aWNlcyIsInN0dWJFbGVtZW50c0ZvckRvYyIsImluc3RhbGxFeHRlbnNpb25zU2VydmljZSIsInN0dWJMZWdhY3lFbGVtZW50cyIsImNzc1RleHQiLCJhbXBEb2NDc3MiLCJhbXBTaGFyZWRDc3MiLCJiaW5kIiwic2VsZiIsIlRBRyIsIlNoYWRvd0RvYyIsImFkb3B0U2hhcmVkIiwiZ2xvYmFsIiwiY2FsbGJhY2siLCJfX0FNUF9UQUciLCJwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucyIsIkFNUCIsImV4dGVuc2lvbnMiLCJleHRlbnNpb25zRm9yIiwid2luIiwidW5kZWZpbmVkIiwiaXNNaW5pZmllZCIsImV4dGVuc2lvbiIsInVudXNlZE5hbWUiLCJ1bnVzZWRWZXJzaW9uIiwiaW5zdGFsbGVyIiwicmVnaXN0ZXJFbGVtZW50IiwiYWRkRWxlbWVudCIsInJlZ2lzdGVyVGVtcGxhdGUiLCJhZGRUZW1wbGF0ZSIsInJlZ2lzdGVyU2VydmljZUZvckRvYyIsImFkZFNlcnZpY2UiLCJzZXRMb2dMZXZlbCIsInNldFRpY2tGdW5jdGlvbiIsInVudXNlZEZuIiwib3B0X2ZsdXNoIiwiaW5pUHJvbWlzZSIsImluc3RhbGxFeHRlbnNpb24iLCJmbk9yU3RydWN0IiwicmVnaXN0ZXIiLCJ0aGVuIiwiXyIsInJlZ2lzdGVyRXh0ZW5zaW9uIiwibiIsImV2IiwibCIsImYiLCJzdGFydFJlZ2lzdGVyT3JDaHVuayIsImkiLCJsZW5ndGgiLCJtYXliZUxvYWRDb3JyZWN0VmVyc2lvbiIsInNwbGljZSIsInAiLCJlIiwiZXJyb3IiLCJtYXliZVB1bXBFYXJseUZyYW1lIiwicHVzaCIsInBsYXRmb3JtRm9yIiwiaXNJb3MiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInByZWxvYWRFeHRlbnNpb24iLCJkaXNwbGF5TmFtZSIsImFkb3B0IiwiYWRvcHRTZXJ2aWNlc0FuZFJlc291cmNlcyIsImFtcGRvYyIsImFkb3B0V2l0aE11bHRpZG9jRGVwcyIsImFkb3B0TXVsdGlEb2NEZXBzIiwiYW1wZG9jU2VydmljZSIsImFtcGRvY1NlcnZpY2VGb3IiLCJnZXRTaW5nbGVEb2MiLCJ2aWV3ZXIiLCJ2aWV3ZXJGb3JEb2MiLCJkZXZlbG9wbWVudCIsInRvZ2dsZVJ1bnRpbWUiLCJyZXNvdXJjZXMiLCJyZXNvdXJjZXNGb3JEb2MiLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0U2Nyb2xsTGVmdCIsImdldFNjcm9sbFdpZHRoIiwiZ2V0V2lkdGgiLCJzdHlsZSIsInF1ZXJ5U2VsZWN0b3IiLCJjb21iaW5lZENzcyIsInRleHRDb250ZW50IiwiYWRvcHRTaGFkb3dNb2RlIiwiYXR0YWNoU2hhZG93RG9jIiwibWFuYWdlciIsInRpbWVyRm9yIiwiYXR0YWNoU2hhZG93RG9jQXNTdHJlYW0iLCJsb2NhbERldiIsIm0iLCJ2IiwicmVsb2FkRXh0ZW5zaW9uIiwiY2IiLCJib2R5IiwiZGVsYXkiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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eEQsVUFBVSxDQUFDSyxDQURiLEVBRUVMLFVBQVUsQ0FBQ00sRUFGYixFQUdFTixVQUFVLENBQUNPLENBSGI7QUFLQSxTQUFPLElBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNVLG1CQUFULENBQTZCcEMsR0FBN0IsRUFBa0M0RSxFQUFsQyxFQUFzQztBQUNwQztBQUNBO0FBQ0EsTUFBSSxDQUFDNUUsR0FBRyxDQUFDd0MsUUFBSixDQUFhcUMsSUFBbEIsRUFBd0I7QUFDdEJELElBQUFBLEVBQUU7QUFDRjtBQUNEOztBQUNELE1BQUlsRyx5QkFBeUIsQ0FBQ3NCLEdBQUQsQ0FBN0IsRUFBb0M7QUFDbEM0RSxJQUFBQSxFQUFFO0FBQ0Y7QUFDRDs7QUFDRGpHLEVBQUFBLFFBQVEsQ0FBQzJGLFFBQVQsQ0FBa0J0RSxHQUFsQixFQUF1QjhFLEtBQXZCLENBQTZCRixFQUE3QixFQUFpQyxDQUFqQztBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCAqIGFzIG1vZGUgZnJvbSAnI2NvcmUvbW9kZSc7XG5cbmltcG9ydCB7QmFzZUVsZW1lbnR9IGZyb20gJy4vYmFzZS1lbGVtZW50JztcbmltcG9ydCB7c3RhcnR1cENodW5rfSBmcm9tICcuL2NodW5rJztcbmltcG9ydCB7Y29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge3dhaXRGb3JCb2R5T3BlblByb21pc2V9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHtzZXRTdHlsZX0gZnJvbSAnLi9jb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3JlcG9ydEVycm9yRm9yV2lufSBmcm9tICcuL2Vycm9yLXJlcG9ydGluZyc7XG5pbXBvcnQge2lzRXhwZXJpbWVudE9uLCB0b2dnbGVFeHBlcmltZW50fSBmcm9tICcuL2V4cGVyaW1lbnRzJztcbmltcG9ydCB7aW50ZXJuYWxSdW50aW1lVmVyc2lvbn0gZnJvbSAnLi9pbnRlcm5hbC12ZXJzaW9uJztcbmltcG9ydCB7XG4gIExvZ0xldmVsLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIGRldixcbiAgaW5pdExvZ0NvbnN0cnVjdG9yLFxuICBvdmVycmlkZUxvZ0xldmVsLFxuICBzZXRSZXBvcnRFcnJvcixcbn0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuL21vZGUnO1xuaW1wb3J0IHtNdWx0aWRvY01hbmFnZXJ9IGZyb20gJy4vbXVsdGlkb2MtbWFuYWdlcic7XG5pbXBvcnQge3Nob3VsZExvYWRQb2x5ZmlsbCBhcyBzaG91bGRMb2FkSW5PYlBvbHlmaWxsfSBmcm9tICcuL3BvbHlmaWxscy9zdHVicy9pbnRlcnNlY3Rpb24tb2JzZXJ2ZXItc3R1Yic7XG5pbXBvcnQge3Nob3VsZExvYWRQb2x5ZmlsbCBhcyBzaG91bGRMb2FkUmVzT2JQb2x5ZmlsbH0gZnJvbSAnLi9wb2x5ZmlsbHMvc3R1YnMvcmVzaXplLW9ic2VydmVyLXN0dWInO1xuaW1wb3J0IHtoYXNSZW5kZXJEZWxheWluZ1NlcnZpY2VzfSBmcm9tICcuL3JlbmRlci1kZWxheWluZy1zZXJ2aWNlcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuaW1wb3J0IHtcbiAgaW5zdGFsbEFtcGRvY1NlcnZpY2VzLFxuICBpbnN0YWxsUnVudGltZVNlcnZpY2VzLFxufSBmcm9tICcuL3NlcnZpY2UvY29yZS1zZXJ2aWNlcyc7XG5pbXBvcnQge3N0dWJFbGVtZW50c0ZvckRvY30gZnJvbSAnLi9zZXJ2aWNlL2N1c3RvbS1lbGVtZW50LXJlZ2lzdHJ5JztcbmltcG9ydCB7XG4gIGluc3RhbGxFeHRlbnNpb25zU2VydmljZSxcbiAgc3R1YkxlZ2FjeUVsZW1lbnRzLFxufSBmcm9tICcuL3NlcnZpY2UvZXh0ZW5zaW9ucy1pbXBsJztcblxuaW1wb3J0IHtjc3NUZXh0IGFzIGFtcERvY0Nzc30gZnJvbSAnLi4vYnVpbGQvYW1wZG9jLmNzcyc7XG5pbXBvcnQge2Nzc1RleHQgYXMgYW1wU2hhcmVkQ3NzfSBmcm9tICcuLi9idWlsZC9hbXBzaGFyZWQuY3NzJztcblxuaW5pdExvZ0NvbnN0cnVjdG9yKCk7XG5zZXRSZXBvcnRFcnJvcihyZXBvcnRFcnJvckZvcldpbi5iaW5kKG51bGwsIHNlbGYpKTtcblxuLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ3J1bnRpbWUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgdXJsOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiAgdGl0bGU6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqICBjYW5vbmljYWxVcmw6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqICBoZWFkOiAoRWxlbWVudHx1bmRlZmluZWQpLFxuICogIGFtcGRvYzogKCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jIHwgdW5kZWZpbmVkKSxcbiAqICBzZXRWaXNpYmlsaXR5U3RhdGU6IChmdW5jdGlvbighVmlzaWJpbGl0eVN0YXRlKXx1bmRlZmluZWQpLFxuICogIHBvc3RNZXNzYWdlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIG9uTWVzc2FnZTogKGZ1bmN0aW9uKCl8dW5kZWZpbmVkKSxcbiAqICBjbG9zZTogKGZ1bmN0aW9uKCl8dW5kZWZpbmVkKSxcbiAqICBnZXRTdGF0ZTogKGZ1bmN0aW9uKCl8dW5kZWZpbmVkKSxcbiAqICBzZXRTdGF0ZTogKGZ1bmN0aW9uKCl8dW5kZWZpbmVkKSxcbiAqICB0b2dnbGVSdW50aW1lOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIHJlc291cmNlczogKCEuL3NlcnZpY2UvcmVzb3VyY2VzLWludGVyZmFjZS5SZXNvdXJjZXNJbnRlcmZhY2UgfCB1bmRlZmluZWQpXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFNoYWRvd0RvYztcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBydW50aW1lIHRvIGEgZ2l2ZW4gZ2xvYmFsIHNjb3BlIGZvciBhIHNpbmdsZS1kb2MgbW9kZS4gTXVsdGlcbiAqIGZyYW1lIHN1cHBvcnQgaXMgY3VycmVudGx5IGluY29tcGxldGUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IGdsb2JhbCBHbG9iYWwgc2NvcGUgdG8gYWRvcHQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFXaW5kb3csICEuL3NlcnZpY2UvZXh0ZW5zaW9ucy1pbXBsLkV4dGVuc2lvbnMpOiFQcm9taXNlfSBjYWxsYmFja1xuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGFkb3B0U2hhcmVkKGdsb2JhbCwgY2FsbGJhY2spIHtcbiAgLy8gVGVzdHMgY2FuIGFkb3B0IHRoZSBzYW1lIHdpbmRvdyB0d2ljZS4gc2lnaC5cbiAgaWYgKGdsb2JhbC5fX0FNUF9UQUcpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgZ2xvYmFsLl9fQU1QX1RBRyA9IHRydWU7XG4gIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYSBnbG9iYWwgQU1QIG9iamVjdCB3ZSBhc3N1bWUgaXQgaXMgYW4gYXJyYXlcbiAgLy8gb2YgZnVuY3Rpb25zXG4gIC8qKiBAY29uc3QgeyFBcnJheTxmdW5jdGlvbighT2JqZWN0KXwhRXh0ZW5zaW9uUGF5bG9hZD59ICovXG4gIGNvbnN0IHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zID0gZ2xvYmFsLkFNUCB8fCBbXTtcblxuICBpbnN0YWxsRXh0ZW5zaW9uc1NlcnZpY2UoZ2xvYmFsKTtcbiAgLyoqIEBjb25zdCB7IS4vc2VydmljZS9leHRlbnNpb25zLWltcGwuRXh0ZW5zaW9uc30gKi9cbiAgY29uc3QgZXh0ZW5zaW9ucyA9IFNlcnZpY2VzLmV4dGVuc2lvbnNGb3IoZ2xvYmFsKTtcbiAgaW5zdGFsbFJ1bnRpbWVTZXJ2aWNlcyhnbG9iYWwpO1xuICBzdHViTGVnYWN5RWxlbWVudHMoZ2xvYmFsKTtcblxuICBnbG9iYWwuQU1QID0ge1xuICAgIHdpbjogZ2xvYmFsLFxuICAgIC8vIE1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgaW4gdGVzdHMuXG4gICAgJ18nOiBnbG9iYWwuQU1QID8gZ2xvYmFsLkFNUFsnXyddIDogdW5kZWZpbmVkLFxuICB9O1xuXG4gIC8vIGBBTVAuZXh0ZW5zaW9uKClgIGZ1bmN0aW9uIGlzIG9ubHkgaW5zdGFsbGVkIGluIGEgbm9uLW1pbmlmaWVkIG1vZGUuXG4gIC8vIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gcGxheSB0aGUgc2FtZSByb2xlIGZvciBkZXZlbG9wbWVudCBhbmQgdGVzdGluZ1xuICAvLyBhcyBgQU1QLnB1c2goKWAgaW4gcHJvZHVjdGlvbi5cbiAgaWYgKCFtb2RlLmlzTWluaWZpZWQoKSkge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWROYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZFZlcnNpb25cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFPYmplY3QpfSBpbnN0YWxsZXJcbiAgICAgKiBAY29uc3RcbiAgICAgKi9cbiAgICBnbG9iYWwuQU1QLmV4dGVuc2lvbiA9IGZ1bmN0aW9uICh1bnVzZWROYW1lLCB1bnVzZWRWZXJzaW9uLCBpbnN0YWxsZXIpIHtcbiAgICAgIGluc3RhbGxlcihnbG9iYWwuQU1QKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqIEBjb25zdCAqL1xuICBnbG9iYWwuQU1QLmNvbmZpZyA9IGNvbmZpZztcblxuICBnbG9iYWwuQU1QLkJhc2VFbGVtZW50ID0gQmFzZUVsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBleHRlbmRlZCBlbGVtZW50IGFuZCBpbnN0YWxscyBpdHMgc3R5bGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3R5cGVvZiBCYXNlRWxlbWVudH0gaW1wbGVtZW50YXRpb25DbGFzc1xuICAgKiBAcGFyYW0gez9zdHJpbmd8dW5kZWZpbmVkfSBjc3NcbiAgICovXG4gIGdsb2JhbC5BTVAucmVnaXN0ZXJFbGVtZW50ID0gZXh0ZW5zaW9ucy5hZGRFbGVtZW50LmJpbmQoZXh0ZW5zaW9ucyk7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBleHRlbmRlZCB0ZW1wbGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHt0eXBlb2YgLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZX0gaW1wbGVtZW50YXRpb25DbGFzc1xuICAgKi9cbiAgZ2xvYmFsLkFNUC5yZWdpc3RlclRlbXBsYXRlID0gZXh0ZW5zaW9ucy5hZGRUZW1wbGF0ZS5iaW5kKGV4dGVuc2lvbnMpO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gYW1wZG9jIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24obmV3Ok9iamVjdCwgIS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2MpfSBpbXBsZW1lbnRhdGlvbkNsYXNzXG4gICAqL1xuICBnbG9iYWwuQU1QLnJlZ2lzdGVyU2VydmljZUZvckRvYyA9IGV4dGVuc2lvbnMuYWRkU2VydmljZS5iaW5kKGV4dGVuc2lvbnMpO1xuXG4gIC8vIEV4cGVyaW1lbnRzLlxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cGVyaW1lbnRJZFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZ2xvYmFsLkFNUC5pc0V4cGVyaW1lbnRPbiA9IGlzRXhwZXJpbWVudE9uLmJpbmQobnVsbCwgZ2xvYmFsKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cGVyaW1lbnRJZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGdsb2JhbC5BTVAudG9nZ2xlRXhwZXJpbWVudCA9IHRvZ2dsZUV4cGVyaW1lbnQuYmluZChudWxsLCBnbG9iYWwpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFMb2dMZXZlbH0gbGV2ZWxcbiAgICovXG4gIGdsb2JhbC5BTVAuc2V0TG9nTGV2ZWwgPSBvdmVycmlkZUxvZ0xldmVsLmJpbmQobnVsbCk7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGZ1bmN0aW9uIHRvIGZvcndhcmQgdGljayBldmVudHMgdG8uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLD9zdHJpbmc9LG51bWJlcj0pfSB1bnVzZWRGblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk9fSBvcHRfZmx1c2hcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdsb2JhbC5BTVAuc2V0VGlja0Z1bmN0aW9uID0gKHVudXNlZEZuLCBvcHRfZmx1c2gpID0+IHt9O1xuXG4gIC8vIFJ1biBzcGVjaWZpYyBzZXR1cCBmb3IgYSBzaW5nbGUtZG9jIG9yIHNoYWRvdy1kb2MgbW9kZS5cbiAgY29uc3QgaW5pUHJvbWlzZSA9IGNhbGxiYWNrKGdsb2JhbCwgZXh0ZW5zaW9ucyk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdCwhT2JqZWN0KXwhRXh0ZW5zaW9uUGF5bG9hZH0gZm5PclN0cnVjdFxuICAgKi9cbiAgZnVuY3Rpb24gaW5zdGFsbEV4dGVuc2lvbihmbk9yU3RydWN0KSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoKSA9PiB7XG4gICAgICBpbmlQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGZuT3JTdHJ1Y3QgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGZuT3JTdHJ1Y3QoZ2xvYmFsLkFNUCwgZ2xvYmFsLkFNUC5fKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHRlbnNpb25zLnJlZ2lzdGVyRXh0ZW5zaW9uKFxuICAgICAgICAgICAgZm5PclN0cnVjdC5uLFxuICAgICAgICAgICAgZm5PclN0cnVjdC5ldixcbiAgICAgICAgICAgIGZuT3JTdHJ1Y3QubCxcbiAgICAgICAgICAgIGZuT3JTdHJ1Y3QuZixcbiAgICAgICAgICAgIGdsb2JhbC5BTVBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgc3RhcnRSZWdpc3Rlck9yQ2h1bmsoZ2xvYmFsLCBmbk9yU3RydWN0LCByZWdpc3Rlcik7XG4gIH1cblxuICAvLyBIYW5kbGUgaGlnaCBwcmlvcml0eSBleHRlbnNpb25zIG5vdywgYW5kIGlmIG5lY2Vzc2FyeSBpc3N1ZVxuICAvLyByZXF1ZXN0cyBmb3IgbmV3IGV4dGVuc2lvbnMgKHVzZWQgZm9yIGV4cGVyaW1lbnRhbCB2ZXJzaW9uXG4gIC8vIGxvY2tpbmcpLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZm5PclN0cnVjdCA9IHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zW2ldO1xuICAgIGlmIChtYXliZUxvYWRDb3JyZWN0VmVyc2lvbihnbG9iYWwsIGZuT3JTdHJ1Y3QpKSB7XG4gICAgICBwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucy5zcGxpY2UoaS0tLCAxKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBmbk9yU3RydWN0ID09ICdmdW5jdGlvbicgfHwgZm5PclN0cnVjdC5wID09ICdoaWdoJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaW5zdGFsbEV4dGVuc2lvbihmbk9yU3RydWN0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gVGhyb3cgZXJyb3JzIG91dHNpZGUgb2YgbG9vcCBpbiBpdHMgb3duIG1pY3JvIHRhc2sgdG9cbiAgICAgICAgLy8gYXZvaWQgb24gZXJyb3Igc3RvcHBpbmcgb3RoZXIgZXh0ZW5zaW9ucyBmcm9tIGxvYWRpbmcuXG4gICAgICAgIGRldigpLmVycm9yKFRBRywgJ0V4dGVuc2lvbiBmYWlsZWQ6ICcsIGUsIGZuT3JTdHJ1Y3Qubik7XG4gICAgICB9XG4gICAgICAvLyBXZSBoYW5kbGVkIHRoZSBlbnRyeS4gUmVtb3ZlIGZyb20gc2V0IGZvciBmdXR1cmUgZXhlY3V0aW9uLlxuICAgICAgcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnMuc3BsaWNlKGktLSwgMSk7XG4gICAgfVxuICB9XG5cbiAgbWF5YmVQdW1wRWFybHlGcmFtZShnbG9iYWwsICgpID0+IHtcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBuZXcgY3VzdG9tIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0LCAhT2JqZWN0KXwhRXh0ZW5zaW9uUGF5bG9hZH0gZm5PclN0cnVjdFxuICAgICAqL1xuICAgIGdsb2JhbC5BTVAucHVzaCA9IGZ1bmN0aW9uIChmbk9yU3RydWN0KSB7XG4gICAgICBpZiAobWF5YmVMb2FkQ29ycmVjdFZlcnNpb24oZ2xvYmFsLCBmbk9yU3RydWN0KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpbnN0YWxsRXh0ZW5zaW9uKGZuT3JTdHJ1Y3QpO1xuICAgIH07XG4gICAgLy8gRXhlY3V0ZSBhc3luY2hyb25vdXNseSBzY2hlZHVsZWQgZWxlbWVudHMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZm5PclN0cnVjdCA9IHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zW2ldO1xuICAgICAgaWYgKG1heWJlTG9hZENvcnJlY3RWZXJzaW9uKGdsb2JhbCwgZm5PclN0cnVjdCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBpbnN0YWxsRXh0ZW5zaW9uKGZuT3JTdHJ1Y3QpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBUaHJvdyBlcnJvcnMgb3V0c2lkZSBvZiBsb29wIGluIGl0cyBvd24gbWljcm8gdGFzayB0b1xuICAgICAgICAvLyBhdm9pZCBvbiBlcnJvciBzdG9wcGluZyBvdGhlciBleHRlbnNpb25zIGZyb20gbG9hZGluZy5cbiAgICAgICAgZGV2KCkuZXJyb3IoVEFHLCAnRXh0ZW5zaW9uIGZhaWxlZDogJywgZSwgZm5PclN0cnVjdC5uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFrZSBzdXJlIHdlIGVtcHR5IHRoZSBhcnJheSBvZiBwcmVyZWdpc3RlcmVkIGV4dGVuc2lvbnMuXG4gICAgLy8gVGVjaG5pY2FsbHkgdGhpcyBpcyBvbmx5IG5lZWRlZCBmb3IgdGVzdGluZywgYXMgZXZlcnl0aGluZyBzaG91bGRcbiAgICAvLyBnbyBvdXQgb2Ygc2NvcGUgaGVyZSwgYnV0IGp1c3QgbWFraW5nIHN1cmUuXG4gICAgcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnMubGVuZ3RoID0gMDtcbiAgfSk7XG4gIC8vIElmIHRoZSBjbG9zdXJlIHBhc3NlZCB0byBtYXliZVB1bXBFYXJseUZyYW1lIGRpZG4ndCBleGVjdXRlXG4gIC8vIGltbWVkaWF0ZWx5IHdlIG5lZWQgdG8ga2VlcCBwdXNoaW5nIG9udG8gcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnNcbiAgaWYgKCFnbG9iYWwuQU1QLnB1c2gpIHtcbiAgICBnbG9iYWwuQU1QLnB1c2ggPVxuICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbigoRXh0ZW5zaW9uUGF5bG9hZHxmdW5jdGlvbighT2JqZWN0LCAhT2JqZWN0KTogPykpfSAqLyAoXG4gICAgICAgIHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zLnB1c2guYmluZChwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucylcbiAgICAgICk7XG4gIH1cblxuICAvLyBGb3IgaU9TIHdlIG5lZWQgdG8gc2V0IGBjdXJzb3I6cG9pbnRlcmAgdG8gZW5zdXJlIHRoYXQgY2xpY2sgZXZlbnRzIGFyZVxuICAvLyBkZWxpdmVyZWQuXG4gIGlmIChTZXJ2aWNlcy5wbGF0Zm9ybUZvcihnbG9iYWwpLmlzSW9zKCkpIHtcbiAgICBzZXRTdHlsZShnbG9iYWwuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAnY3Vyc29yJywgJ3BvaW50ZXInKTtcbiAgfVxuXG4gIC8vIFNvbWUgZGVmZXJyZWQgcG9seWZpbGxzLlxuICBjb25zdCBleHRlbnNpb25zRm9yID0gU2VydmljZXMuZXh0ZW5zaW9uc0ZvcihnbG9iYWwpO1xuICBpZiAoc2hvdWxkTG9hZFJlc09iUG9seWZpbGwoZ2xvYmFsKSkge1xuICAgIGV4dGVuc2lvbnNGb3IucHJlbG9hZEV4dGVuc2lvbignYW1wLXJlc2l6ZS1vYnNlcnZlci1wb2x5ZmlsbCcpO1xuICB9XG4gIGlmIChzaG91bGRMb2FkSW5PYlBvbHlmaWxsKGdsb2JhbCkpIHtcbiAgICBleHRlbnNpb25zRm9yLnByZWxvYWRFeHRlbnNpb24oJ2FtcC1pbnRlcnNlY3Rpb24tb2JzZXJ2ZXItcG9seWZpbGwnKTtcbiAgfVxuXG4gIHJldHVybiBpbmlQcm9taXNlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gZ2xvYmFsIEdsb2JhbCBzY29wZSB0byBhZG9wdC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdCwgIU9iamVjdCl8IUV4dGVuc2lvblBheWxvYWR9IGZuT3JTdHJ1Y3RcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gcmVnaXN0ZXJcbiAqL1xuZnVuY3Rpb24gc3RhcnRSZWdpc3Rlck9yQ2h1bmsoZ2xvYmFsLCBmbk9yU3RydWN0LCByZWdpc3Rlcikge1xuICBpZiAodHlwZW9mIGZuT3JTdHJ1Y3QgPT0gJ2Z1bmN0aW9uJyB8fCBmbk9yU3RydWN0LnAgPT0gJ2hpZ2gnKSB7XG4gICAgLy8gXCJIaWdoIHByaW9yaXR5XCIgZXh0ZW5zaW9ucyBkbyBub3QgZ28gdGhyb3VnaCBjaHVua2luZy5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSB1c2VkIGZvciBleHRlbnNpb25zIHRoYXQgbmVlZCB0byBydW4gZWFybHkuXG4gICAgLy8gT25lIGV4YW1wbGUgd291bGQgYmUgdmlld2VyIGNvbW11bmljYXRpb24gdGhhdCBpcyByZXF1aXJlZFxuICAgIC8vIHRvIHRyYW5zaXRpb24gZG9jdW1lbnQgZnJvbSBwcmUtcmVuZGVyIHRvIHZpc2libGUgKHdoaWNoXG4gICAgLy8gYWZmZWN0cyBjaHVua2luZyBpdHNlbGYpLlxuICAgIC8vIFdlIGNvbnNpZGVyIGZ1bmN0aW9ucyBhcyBoaWdoIHByaW9yaXR5LCBiZWNhdXNlXG4gICAgLy8gLSBpZiBpbiBkb3VidCwgdGhhdCBpcyBhIGJldHRlciBkZWZhdWx0XG4gICAgLy8gLSB0aGUgb25seSBhY3R1YWwgIHVzZXIgaXMgYSB2aWV3ZXIgaW50ZWdyYXRpb24gdGhhdCBzaG91bGRcbiAgICAvLyAgIGJlIGhpZ2ggcHJpb3JpdHkuXG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihyZWdpc3Rlcik7XG4gIH0gZWxzZSB7XG4gICAgcmVnaXN0ZXIuZGlzcGxheU5hbWUgPSBmbk9yU3RydWN0Lm47XG4gICAgc3RhcnR1cENodW5rKGdsb2JhbC5kb2N1bWVudCwgcmVnaXN0ZXIpO1xuICB9XG59XG5cbi8qKlxuICogQXBwbGllcyB0aGUgcnVudGltZSB0byBhIGdpdmVuIGdsb2JhbCBzY29wZSBmb3IgYSBzaW5nbGUtZG9jIG1vZGUuXG4gKiBNdWx0aSBmcmFtZSBzdXBwb3J0IGlzIGN1cnJlbnRseSBpbmNvbXBsZXRlLlxuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZG9wdChnbG9iYWwpIHtcbiAgcmV0dXJuIGFkb3B0U2hhcmVkKGdsb2JhbCwgKGdsb2JhbCkgPT4ge1xuICAgIC8vIFNoYXJlZCBydW50aW1lcyB2YXJpYWJsZXMgYmV0d2VlbiBib3RoIG11bHRpLWRvYyBhbmQgc2luZ2xlLWRvYyBwYWdlc1xuICAgIGFkb3B0U2VydmljZXNBbmRSZXNvdXJjZXMoZ2xvYmFsKTtcblxuICAgIHJldHVybiB3YWl0Rm9yQm9keU9wZW5Qcm9taXNlKGdsb2JhbC5kb2N1bWVudCkudGhlbigoKSA9PiB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBhbGwgZGVjbGFyZWQgZXh0ZW5zaW9ucyBhcmUgbWFya2VkIGFuZCBzdHViYmVkLlxuICAgICAgc3R1YkVsZW1lbnRzRm9yRG9jKGdsb2JhbC5BTVAuYW1wZG9jKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQXBwbGllcyB0aGUgcnVudGltZSB0byBhIGdpdmVuIGdsb2JhbCBzY29wZSBmb3IgYSBzaW5nbGUtZG9jIG1vZGUuXG4gKiBNdWx0aSBmcmFtZSBzdXBwb3J0IGlzIGN1cnJlbnRseSBpbmNvbXBsZXRlLlxuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZG9wdFdpdGhNdWx0aWRvY0RlcHMoZ2xvYmFsKSB7XG4gIHJldHVybiBhZG9wdFNoYXJlZChnbG9iYWwsIChnbG9iYWwpID0+IHtcbiAgICAvLyBTaGFyZWQgcnVudGltZXMgdmFyaWFibGVzIGJldHdlZW4gYm90aCBtdWx0aS1kb2MgYW5kIHNpbmdsZS1kb2MgcGFnZXNcbiAgICBhZG9wdFNlcnZpY2VzQW5kUmVzb3VyY2VzKGdsb2JhbCk7XG5cbiAgICAvLyBEZXBlbmRlbmNpZXMgdG8gdGhlIE11bHRpRG9jTWFuYWdlclxuICAgIGFkb3B0TXVsdGlEb2NEZXBzKGdsb2JhbCk7XG5cbiAgICByZXR1cm4gd2FpdEZvckJvZHlPcGVuUHJvbWlzZShnbG9iYWwuZG9jdW1lbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYWxsIGRlY2xhcmVkIGV4dGVuc2lvbnMgYXJlIG1hcmtlZCBhbmQgc3R1YmJlZC5cbiAgICAgIHN0dWJFbGVtZW50c0ZvckRvYyhnbG9iYWwuQU1QLmFtcGRvYyk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEFkb3B0IHNoYXJlZCBydW50aW1lcyB2YXJpYWJsZXMgYmV0d2VlbiBib3RoIG11bHRpLWRvYyBhbmQgc2luZ2xlLWRvYyBwYWdlc1xuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICovXG5mdW5jdGlvbiBhZG9wdFNlcnZpY2VzQW5kUmVzb3VyY2VzKGdsb2JhbCkge1xuICBjb25zdCB7ZG9jdW1lbnRFbGVtZW50fSA9IGdsb2JhbC5kb2N1bWVudDtcblxuICBjb25zdCBhbXBkb2NTZXJ2aWNlID0gU2VydmljZXMuYW1wZG9jU2VydmljZUZvcihnbG9iYWwpO1xuICBjb25zdCBhbXBkb2MgPSBhbXBkb2NTZXJ2aWNlLmdldFNpbmdsZURvYygpO1xuICBnbG9iYWwuQU1QLmFtcGRvYyA9IGFtcGRvYztcblxuICBjb25zdCB2aWV3ZXIgPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoZG9jdW1lbnRFbGVtZW50KTtcbiAgZ2xvYmFsLkFNUC52aWV3ZXIgPSB2aWV3ZXI7XG5cbiAgaWYgKGdldE1vZGUoKS5kZXZlbG9wbWVudCkge1xuICAgIGdsb2JhbC5BTVAudG9nZ2xlUnVudGltZSA9IHZpZXdlci50b2dnbGVSdW50aW1lLmJpbmQodmlld2VyKTtcbiAgICBnbG9iYWwuQU1QLnJlc291cmNlcyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICB9XG5cbiAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICBnbG9iYWwuQU1QLnZpZXdwb3J0ID0ge307XG4gIGdsb2JhbC5BTVAudmlld3BvcnQuZ2V0U2Nyb2xsTGVmdCA9IHZpZXdwb3J0LmdldFNjcm9sbExlZnQuYmluZCh2aWV3cG9ydCk7XG4gIGdsb2JhbC5BTVAudmlld3BvcnQuZ2V0U2Nyb2xsV2lkdGggPSB2aWV3cG9ydC5nZXRTY3JvbGxXaWR0aC5iaW5kKHZpZXdwb3J0KTtcbiAgZ2xvYmFsLkFNUC52aWV3cG9ydC5nZXRXaWR0aCA9IHZpZXdwb3J0LmdldFdpZHRoLmJpbmQodmlld3BvcnQpO1xufVxuXG4vKipcbiAqIEFkb3B0IE11bHRpRG9jTWFuYWdlciBkZXBlbmRlbmNpZXNcbiAqIEBwYXJhbSB7IVdpbmRvd30gZ2xvYmFsIEdsb2JhbCBzY29wZSB0byBhZG9wdC5cbiAqL1xuZnVuY3Rpb24gYWRvcHRNdWx0aURvY0RlcHMoZ2xvYmFsKSB7XG4gIGdsb2JhbC5BTVAuaW5zdGFsbEFtcGRvY1NlcnZpY2VzID0gaW5zdGFsbEFtcGRvY1NlcnZpY2VzLmJpbmQobnVsbCk7XG4gIGlmIChJU19FU00pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdsb2JhbC5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdHlsZVthbXAtcnVudGltZV0nKTtcbiAgICBnbG9iYWwuQU1QLmNvbWJpbmVkQ3NzID0gc3R5bGUgPyBzdHlsZS50ZXh0Q29udGVudCA6ICcnO1xuICB9IGVsc2Uge1xuICAgIGdsb2JhbC5BTVAuY29tYmluZWRDc3MgPSBhbXBEb2NDc3MgKyBhbXBTaGFyZWRDc3M7XG4gIH1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBydW50aW1lIHRvIGEgZ2l2ZW4gZ2xvYmFsIHNjb3BlIGZvciBzaGFkb3cgbW9kZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gZ2xvYmFsIEdsb2JhbCBzY29wZSB0byBhZG9wdC5cbiAqIEByZXR1cm4geyFQcm9taXNlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRvcHRTaGFkb3dNb2RlKGdsb2JhbCkge1xuICByZXR1cm4gYWRvcHRTaGFyZWQoZ2xvYmFsLCAoZ2xvYmFsLCBleHRlbnNpb25zKSA9PiB7XG4gICAgLy8gc2hhZG93IG1vZGUgYWxyZWFkeSBhZG9wdGVkXG4gICAgaWYgKGdsb2JhbC5BTVAuYXR0YWNoU2hhZG93RG9jKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgLy8gRGVwZW5kZW5jaWVzIHRvIHRoZSBNdWx0aURvY01hbmFnZXJcbiAgICBhZG9wdE11bHRpRG9jRGVwcyhnbG9iYWwpO1xuXG4gICAgY29uc3QgbWFuYWdlciA9IG5ldyBNdWx0aWRvY01hbmFnZXIoXG4gICAgICBnbG9iYWwsXG4gICAgICBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKGdsb2JhbCksXG4gICAgICBleHRlbnNpb25zLFxuICAgICAgU2VydmljZXMudGltZXJGb3IoZ2xvYmFsKVxuICAgICk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBzaGFkb3cgcm9vdCBkb2N1bWVudCB2aWEgYSBmdWxseSBmZXRjaGVkIGRvY3VtZW50LlxuICAgICAqIEBwYXJhbSB7IUVsZW1lbnR9IGhvc3RFbGVtZW50XG4gICAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+PX0gb3B0X2luaXRQYXJhbXNcbiAgICAgKiBAcmV0dXJuIHshT2JqZWN0fVxuICAgICAqL1xuICAgIGdsb2JhbC5BTVAuYXR0YWNoU2hhZG93RG9jID0gbWFuYWdlci5hdHRhY2hTaGFkb3dEb2MuYmluZChtYW5hZ2VyKTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhIHNoYWRvdyByb290IGRvY3VtZW50IHZpYSBhIHN0cmVhbS5cbiAgICAgKiBAcGFyYW0geyFFbGVtZW50fSBob3N0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+PX0gb3B0X2luaXRQYXJhbXNcbiAgICAgKiBAcmV0dXJuIHshT2JqZWN0fVxuICAgICAqL1xuICAgIGdsb2JhbC5BTVAuYXR0YWNoU2hhZG93RG9jQXNTdHJlYW0gPVxuICAgICAgbWFuYWdlci5hdHRhY2hTaGFkb3dEb2NBc1N0cmVhbS5iaW5kKG1hbmFnZXIpO1xuXG4gICAgcmV0dXJuIHdhaXRGb3JCb2R5T3BlblByb21pc2UoZ2xvYmFsLmRvY3VtZW50KTtcbiAgfSk7XG59XG5cbi8qKlxuICogRm9yIGEgZ2l2ZW4gZXh0ZW5zaW9uLCBjaGVja3MgdGhhdCBpdHMgdmVyc2lvbiBpcyB0aGUgc2FtZVxuICogYXMgdGhlIHZlcnNpb24gb2YgdGhlIG1haW4gQU1QIGJpbmFyeS5cbiAqIElmIHllcywgcmV0dXJucyBmYWxzZSBhbmQgZG9lcyBub3RoaW5nIGVsc2UuXG4gKiBJZiB0aGV5IGFyZSBkaWZmZXJlbnQsIHJldHVybnMgZmFsc2UsIGFuZCBpbml0aWF0ZXMgYSBsb2FkXG4gKiBvZiB0aGUgcmVzcGVjdGl2ZSBleHRlbnNpb24gdmlhIGEgdmVyc2lvbmVkIFVSTC5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0LCAhT2JqZWN0KXwhRXh0ZW5zaW9uUGF5bG9hZH0gZm5PclN0cnVjdFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gbWF5YmVMb2FkQ29ycmVjdFZlcnNpb24od2luLCBmbk9yU3RydWN0KSB7XG4gIGlmIChnZXRNb2RlKCkubG9jYWxEZXYgJiYgaXNFeHBlcmltZW50T24od2luLCAnZGlzYWJsZS12ZXJzaW9uLWxvY2tpbmcnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZW9mIGZuT3JTdHJ1Y3QgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChJU19FU00pIHtcbiAgICAvLyBJZiB3ZSdyZSBpbiBhIG1vZHVsZSBydW50aW1lLCB0cnlpbmcgdG8gZXhlY3V0ZSBhIG5vbW9kdWxlIGV4dGVuc2lvblxuICAgIC8vIHNpbXBseSByZW1vdmUgdGhlIG5vbW9kdWxlIGV4dGVuc2lvbiBzbyB0aGF0IGl0IGlzIG5vdCBleGVjdXRlZC5cbiAgICBpZiAoIWZuT3JTdHJ1Y3QubSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIElmIHdlJ3JlIGluIGEgbm9tb2R1bGUgcnVudGltZSwgdHJ5aW5nIHRvIGV4ZWN1dGUgYSBtb2R1bGUgZXh0ZW5zaW9uXG4gICAgLy8gc2ltcGx5IHJlbW92ZSB0aGUgbW9kdWxlIGV4dGVuc2lvbiBzbyB0aGF0IGl0IGlzIG5vdCBleGVjdXRlZC5cbiAgICBpZiAoZm5PclN0cnVjdC5tKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB7dn0gPSBmbk9yU3RydWN0O1xuICAvLyBUaGlzIGlzIG5vbi1vYnZpb3VzLCBidXQgd2Ugb25seSBjYXJlIGFib3V0IHRoZSByZWxlYXNlIHZlcnNpb24sXG4gIC8vIG5vdCBhYm91dCB0aGUgZnVsbCBydHYgdmVyc2lvbiwgYmVjYXVzZSB0aGVzZSBvbmx5IGRpZmZlclxuICAvLyBpbiB0aGUgY29uZmlnIHRoYXQgaXMgZnVsbHkgZGV0ZXJtaW5lZCBieSB0aGUgcHJpbWFyeSBiaW5hcnkuXG4gIGlmIChpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uKCkgPT0gdikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHdpbikucmVsb2FkRXh0ZW5zaW9uKFxuICAgIGZuT3JTdHJ1Y3QubixcbiAgICBmbk9yU3RydWN0LmV2LFxuICAgIGZuT3JTdHJ1Y3QubFxuICApO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBJZiBpdCBtYWtlcyBzZW5zZSwgbGV0IHRoZSBicm93c2VyIHBhaW50IHRoZSBjdXJyZW50IGZyYW1lIGJlZm9yZVxuICogZXhlY3V0aW5nIHRoZSBjYWxsYmFjay5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNiIENhbGxiYWNrIHRoYXQgc2hvdWxkIHJ1biBhZnRlciBhIGZyYW1lIHdhc1xuICogICAgIHB1bXBlZC5cbiAqL1xuZnVuY3Rpb24gbWF5YmVQdW1wRWFybHlGcmFtZSh3aW4sIGNiKSB7XG4gIC8vIFRoZXJlIGlzIGRlZmluaXRlbHkgbm90aGluZyB0byBkcmF3IHlldCwgc28gd2UgbWlnaHQgYXMgd2VsbFxuICAvLyBwcm9jZWVkLlxuICBpZiAoIXdpbi5kb2N1bWVudC5ib2R5KSB7XG4gICAgY2IoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGhhc1JlbmRlckRlbGF5aW5nU2VydmljZXMod2luKSkge1xuICAgIGNiKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIFNlcnZpY2VzLnRpbWVyRm9yKHdpbikuZGVsYXkoY2IsIDEpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/runtime.js