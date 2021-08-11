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
  if (mode.version() == v) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bnRpbWUuanMiXSwibmFtZXMiOlsibW9kZSIsIkJhc2VFbGVtZW50Iiwic3RhcnR1cENodW5rIiwiY29uZmlnIiwid2FpdEZvckJvZHlPcGVuUHJvbWlzZSIsInNldFN0eWxlIiwicmVwb3J0RXJyb3JGb3JXaW4iLCJpc0V4cGVyaW1lbnRPbiIsInRvZ2dsZUV4cGVyaW1lbnQiLCJMb2dMZXZlbCIsImRldiIsImluaXRMb2dDb25zdHJ1Y3RvciIsIm92ZXJyaWRlTG9nTGV2ZWwiLCJzZXRSZXBvcnRFcnJvciIsImdldE1vZGUiLCJNdWx0aWRvY01hbmFnZXIiLCJzaG91bGRMb2FkUG9seWZpbGwiLCJzaG91bGRMb2FkSW5PYlBvbHlmaWxsIiwic2hvdWxkTG9hZFJlc09iUG9seWZpbGwiLCJoYXNSZW5kZXJEZWxheWluZ1NlcnZpY2VzIiwiU2VydmljZXMiLCJpbnN0YWxsQW1wZG9jU2VydmljZXMiLCJpbnN0YWxsUnVudGltZVNlcnZpY2VzIiwic3R1YkVsZW1lbnRzRm9yRG9jIiwiaW5zdGFsbEV4dGVuc2lvbnNTZXJ2aWNlIiwic3R1YkxlZ2FjeUVsZW1lbnRzIiwiY3NzVGV4dCIsImFtcERvY0NzcyIsImFtcFNoYXJlZENzcyIsImJpbmQiLCJzZWxmIiwiVEFHIiwiU2hhZG93RG9jIiwiYWRvcHRTaGFyZWQiLCJnbG9iYWwiLCJjYWxsYmFjayIsIl9fQU1QX1RBRyIsInByZXJlZ2lzdGVyZWRFeHRlbnNpb25zIiwiQU1QIiwiZXh0ZW5zaW9ucyIsImV4dGVuc2lvbnNGb3IiLCJ3aW4iLCJ1bmRlZmluZWQiLCJpc01pbmlmaWVkIiwiZXh0ZW5zaW9uIiwidW51c2VkTmFtZSIsInVudXNlZFZlcnNpb24iLCJpbnN0YWxsZXIiLCJyZWdpc3RlckVsZW1lbnQiLCJhZGRFbGVtZW50IiwicmVnaXN0ZXJUZW1wbGF0ZSIsImFkZFRlbXBsYXRlIiwicmVnaXN0ZXJTZXJ2aWNlRm9yRG9jIiwiYWRkU2VydmljZSIsInNldExvZ0xldmVsIiwic2V0VGlja0Z1bmN0aW9uIiwidW51c2VkRm4iLCJvcHRfZmx1c2giLCJpbmlQcm9taXNlIiwiaW5zdGFsbEV4dGVuc2lvbiIsImZuT3JTdHJ1Y3QiLCJyZWdpc3RlciIsInRoZW4iLCJfIiwicmVnaXN0ZXJFeHRlbnNpb24iLCJuIiwiZXYiLCJsIiwiZiIsInN0YXJ0UmVnaXN0ZXJPckNodW5rIiwiaSIsImxlbmd0aCIsIm1heWJlTG9hZENvcnJlY3RWZXJzaW9uIiwic3BsaWNlIiwicCIsImUiLCJlcnJvciIsIm1heWJlUHVtcEVhcmx5RnJhbWUiLCJwdXNoIiwicGxhdGZvcm1Gb3IiLCJpc0lvcyIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwicHJlbG9hZEV4dGVuc2lvbiIsImRpc3BsYXlOYW1lIiwiYWRvcHQiLCJhZG9wdFNlcnZpY2VzQW5kUmVzb3VyY2VzIiwiYW1wZG9jIiwiYWRvcHRXaXRoTXVsdGlkb2NEZXBzIiwiYWRvcHRNdWx0aURvY0RlcHMiLCJhbXBkb2NTZXJ2aWNlIiwiYW1wZG9jU2VydmljZUZvciIsImdldFNpbmdsZURvYyIsInZpZXdlciIsInZpZXdlckZvckRvYyIsImRldmVsb3BtZW50IiwidG9nZ2xlUnVudGltZSIsInJlc291cmNlcyIsInJlc291cmNlc0ZvckRvYyIsInZpZXdwb3J0Iiwidmlld3BvcnRGb3JEb2MiLCJnZXRTY3JvbGxMZWZ0IiwiZ2V0U2Nyb2xsV2lkdGgiLCJnZXRXaWR0aCIsInN0eWxlIiwicXVlcnlTZWxlY3RvciIsImNvbWJpbmVkQ3NzIiwidGV4dENvbnRlbnQiLCJhZG9wdFNoYWRvd01vZGUiLCJhdHRhY2hTaGFkb3dEb2MiLCJtYW5hZ2VyIiwidGltZXJGb3IiLCJhdHRhY2hTaGFkb3dEb2NBc1N0cmVhbSIsImxvY2FsRGV2IiwibSIsInYiLCJ2ZXJzaW9uIiwicmVsb2FkRXh0ZW5zaW9uIiwiY2IiLCJib2R5IiwiZGVsYXkiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RUwsVUFBVSxDQUFDTSxFQUZiLEVBR0VOLFVBQVUsQ0FBQ08sQ0FIYjtBQUtBLFNBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU1UsbUJBQVQsQ0FBNkJwQyxHQUE3QixFQUFrQzZFLEVBQWxDLEVBQXNDO0FBQ3BDO0FBQ0E7QUFDQSxNQUFJLENBQUM3RSxHQUFHLENBQUN3QyxRQUFKLENBQWFzQyxJQUFsQixFQUF3QjtBQUN0QkQsSUFBQUEsRUFBRTtBQUNGO0FBQ0Q7O0FBQ0QsTUFBSW5HLHlCQUF5QixDQUFDc0IsR0FBRCxDQUE3QixFQUFvQztBQUNsQzZFLElBQUFBLEVBQUU7QUFDRjtBQUNEOztBQUNEbEcsRUFBQUEsUUFBUSxDQUFDMkYsUUFBVCxDQUFrQnRFLEdBQWxCLEVBQXVCK0UsS0FBdkIsQ0FBNkJGLEVBQTdCLEVBQWlDLENBQWpDO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgbW9kZSBmcm9tICcjY29yZS9tb2RlJztcblxuaW1wb3J0IHtCYXNlRWxlbWVudH0gZnJvbSAnLi9iYXNlLWVsZW1lbnQnO1xuaW1wb3J0IHtzdGFydHVwQ2h1bmt9IGZyb20gJy4vY2h1bmsnO1xuaW1wb3J0IHtjb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7d2FpdEZvckJvZHlPcGVuUHJvbWlzZX0gZnJvbSAnLi9jb3JlL2RvbSc7XG5pbXBvcnQge3NldFN0eWxlfSBmcm9tICcuL2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7cmVwb3J0RXJyb3JGb3JXaW59IGZyb20gJy4vZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7aXNFeHBlcmltZW50T24sIHRvZ2dsZUV4cGVyaW1lbnR9IGZyb20gJy4vZXhwZXJpbWVudHMnO1xuaW1wb3J0IHtcbiAgTG9nTGV2ZWwsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgZGV2LFxuICBpbml0TG9nQ29uc3RydWN0b3IsXG4gIG92ZXJyaWRlTG9nTGV2ZWwsXG4gIHNldFJlcG9ydEVycm9yLFxufSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4vbW9kZSc7XG5pbXBvcnQge011bHRpZG9jTWFuYWdlcn0gZnJvbSAnLi9tdWx0aWRvYy1tYW5hZ2VyJztcbmltcG9ydCB7c2hvdWxkTG9hZFBvbHlmaWxsIGFzIHNob3VsZExvYWRJbk9iUG9seWZpbGx9IGZyb20gJy4vcG9seWZpbGxzL3N0dWJzL2ludGVyc2VjdGlvbi1vYnNlcnZlci1zdHViJztcbmltcG9ydCB7c2hvdWxkTG9hZFBvbHlmaWxsIGFzIHNob3VsZExvYWRSZXNPYlBvbHlmaWxsfSBmcm9tICcuL3BvbHlmaWxscy9zdHVicy9yZXNpemUtb2JzZXJ2ZXItc3R1Yic7XG5pbXBvcnQge2hhc1JlbmRlckRlbGF5aW5nU2VydmljZXN9IGZyb20gJy4vcmVuZGVyLWRlbGF5aW5nLXNlcnZpY2VzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge1xuICBpbnN0YWxsQW1wZG9jU2VydmljZXMsXG4gIGluc3RhbGxSdW50aW1lU2VydmljZXMsXG59IGZyb20gJy4vc2VydmljZS9jb3JlLXNlcnZpY2VzJztcbmltcG9ydCB7c3R1YkVsZW1lbnRzRm9yRG9jfSBmcm9tICcuL3NlcnZpY2UvY3VzdG9tLWVsZW1lbnQtcmVnaXN0cnknO1xuaW1wb3J0IHtcbiAgaW5zdGFsbEV4dGVuc2lvbnNTZXJ2aWNlLFxuICBzdHViTGVnYWN5RWxlbWVudHMsXG59IGZyb20gJy4vc2VydmljZS9leHRlbnNpb25zLWltcGwnO1xuXG5pbXBvcnQge2Nzc1RleHQgYXMgYW1wRG9jQ3NzfSBmcm9tICcuLi9idWlsZC9hbXBkb2MuY3NzJztcbmltcG9ydCB7Y3NzVGV4dCBhcyBhbXBTaGFyZWRDc3N9IGZyb20gJy4uL2J1aWxkL2FtcHNoYXJlZC5jc3MnO1xuXG5pbml0TG9nQ29uc3RydWN0b3IoKTtcbnNldFJlcG9ydEVycm9yKHJlcG9ydEVycm9yRm9yV2luLmJpbmQobnVsbCwgc2VsZikpO1xuXG4vKiogQGNvbnN0IEBwcml2YXRlIHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAncnVudGltZSc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICB1cmw6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqICB0aXRsZTogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogIGNhbm9uaWNhbFVybDogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogIGhlYWQ6IChFbGVtZW50fHVuZGVmaW5lZCksXG4gKiAgYW1wZG9jOiAoIS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2MgfCB1bmRlZmluZWQpLFxuICogIHNldFZpc2liaWxpdHlTdGF0ZTogKGZ1bmN0aW9uKCFWaXNpYmlsaXR5U3RhdGUpfHVuZGVmaW5lZCksXG4gKiAgcG9zdE1lc3NhZ2U6IChmdW5jdGlvbigpfHVuZGVmaW5lZCksXG4gKiAgb25NZXNzYWdlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIGNsb3NlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIGdldFN0YXRlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIHNldFN0YXRlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLFxuICogIHRvZ2dsZVJ1bnRpbWU6IChmdW5jdGlvbigpfHVuZGVmaW5lZCksXG4gKiAgcmVzb3VyY2VzOiAoIS4vc2VydmljZS9yZXNvdXJjZXMtaW50ZXJmYWNlLlJlc291cmNlc0ludGVyZmFjZSB8IHVuZGVmaW5lZClcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgU2hhZG93RG9jO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHJ1bnRpbWUgdG8gYSBnaXZlbiBnbG9iYWwgc2NvcGUgZm9yIGEgc2luZ2xlLWRvYyBtb2RlLiBNdWx0aVxuICogZnJhbWUgc3VwcG9ydCBpcyBjdXJyZW50bHkgaW5jb21wbGV0ZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gZ2xvYmFsIEdsb2JhbCBzY29wZSB0byBhZG9wdC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIVdpbmRvdywgIS4vc2VydmljZS9leHRlbnNpb25zLWltcGwuRXh0ZW5zaW9ucyk6IVByb21pc2V9IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gYWRvcHRTaGFyZWQoZ2xvYmFsLCBjYWxsYmFjaykge1xuICAvLyBUZXN0cyBjYW4gYWRvcHQgdGhlIHNhbWUgd2luZG93IHR3aWNlLiBzaWdoLlxuICBpZiAoZ2xvYmFsLl9fQU1QX1RBRykge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICBnbG9iYWwuX19BTVBfVEFHID0gdHJ1ZTtcbiAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIGdsb2JhbCBBTVAgb2JqZWN0IHdlIGFzc3VtZSBpdCBpcyBhbiBhcnJheVxuICAvLyBvZiBmdW5jdGlvbnNcbiAgLyoqIEBjb25zdCB7IUFycmF5PGZ1bmN0aW9uKCFPYmplY3QpfCFFeHRlbnNpb25QYXlsb2FkPn0gKi9cbiAgY29uc3QgcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnMgPSBnbG9iYWwuQU1QIHx8IFtdO1xuXG4gIGluc3RhbGxFeHRlbnNpb25zU2VydmljZShnbG9iYWwpO1xuICAvKiogQGNvbnN0IHshLi9zZXJ2aWNlL2V4dGVuc2lvbnMtaW1wbC5FeHRlbnNpb25zfSAqL1xuICBjb25zdCBleHRlbnNpb25zID0gU2VydmljZXMuZXh0ZW5zaW9uc0ZvcihnbG9iYWwpO1xuICBpbnN0YWxsUnVudGltZVNlcnZpY2VzKGdsb2JhbCk7XG4gIHN0dWJMZWdhY3lFbGVtZW50cyhnbG9iYWwpO1xuXG4gIGdsb2JhbC5BTVAgPSB7XG4gICAgd2luOiBnbG9iYWwsXG4gICAgLy8gTWlnaHQgbm90IGJlIGF2YWlsYWJsZSBpbiB0ZXN0cy5cbiAgICAnXyc6IGdsb2JhbC5BTVAgPyBnbG9iYWwuQU1QWydfJ10gOiB1bmRlZmluZWQsXG4gIH07XG5cbiAgLy8gYEFNUC5leHRlbnNpb24oKWAgZnVuY3Rpb24gaXMgb25seSBpbnN0YWxsZWQgaW4gYSBub24tbWluaWZpZWQgbW9kZS5cbiAgLy8gVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBwbGF5IHRoZSBzYW1lIHJvbGUgZm9yIGRldmVsb3BtZW50IGFuZCB0ZXN0aW5nXG4gIC8vIGFzIGBBTVAucHVzaCgpYCBpbiBwcm9kdWN0aW9uLlxuICBpZiAoIW1vZGUuaXNNaW5pZmllZCgpKSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZE5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkVmVyc2lvblxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdCl9IGluc3RhbGxlclxuICAgICAqIEBjb25zdFxuICAgICAqL1xuICAgIGdsb2JhbC5BTVAuZXh0ZW5zaW9uID0gZnVuY3Rpb24gKHVudXNlZE5hbWUsIHVudXNlZFZlcnNpb24sIGluc3RhbGxlcikge1xuICAgICAgaW5zdGFsbGVyKGdsb2JhbC5BTVApO1xuICAgIH07XG4gIH1cblxuICAvKiogQGNvbnN0ICovXG4gIGdsb2JhbC5BTVAuY29uZmlnID0gY29uZmlnO1xuXG4gIGdsb2JhbC5BTVAuQmFzZUVsZW1lbnQgPSBCYXNlRWxlbWVudDtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV4dGVuZGVkIGVsZW1lbnQgYW5kIGluc3RhbGxzIGl0cyBzdHlsZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7dHlwZW9mIEJhc2VFbGVtZW50fSBpbXBsZW1lbnRhdGlvbkNsYXNzXG4gICAqIEBwYXJhbSB7P3N0cmluZ3x1bmRlZmluZWR9IGNzc1xuICAgKi9cbiAgZ2xvYmFsLkFNUC5yZWdpc3RlckVsZW1lbnQgPSBleHRlbnNpb25zLmFkZEVsZW1lbnQuYmluZChleHRlbnNpb25zKTtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV4dGVuZGVkIHRlbXBsYXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3R5cGVvZiAuL2Jhc2UtdGVtcGxhdGUuQmFzZVRlbXBsYXRlfSBpbXBsZW1lbnRhdGlvbkNsYXNzXG4gICAqL1xuICBnbG9iYWwuQU1QLnJlZ2lzdGVyVGVtcGxhdGUgPSBleHRlbnNpb25zLmFkZFRlbXBsYXRlLmJpbmQoZXh0ZW5zaW9ucyk7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBhbXBkb2Mgc2VydmljZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtmdW5jdGlvbihuZXc6T2JqZWN0LCAhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvYyl9IGltcGxlbWVudGF0aW9uQ2xhc3NcbiAgICovXG4gIGdsb2JhbC5BTVAucmVnaXN0ZXJTZXJ2aWNlRm9yRG9jID0gZXh0ZW5zaW9ucy5hZGRTZXJ2aWNlLmJpbmQoZXh0ZW5zaW9ucyk7XG5cbiAgLy8gRXhwZXJpbWVudHMuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwZXJpbWVudElkXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBnbG9iYWwuQU1QLmlzRXhwZXJpbWVudE9uID0gaXNFeHBlcmltZW50T24uYmluZChudWxsLCBnbG9iYWwpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwZXJpbWVudElkXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9vblxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZ2xvYmFsLkFNUC50b2dnbGVFeHBlcmltZW50ID0gdG9nZ2xlRXhwZXJpbWVudC5iaW5kKG51bGwsIGdsb2JhbCk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUxvZ0xldmVsfSBsZXZlbFxuICAgKi9cbiAgZ2xvYmFsLkFNUC5zZXRMb2dMZXZlbCA9IG92ZXJyaWRlTG9nTGV2ZWwuYmluZChudWxsKTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgZnVuY3Rpb24gdG8gZm9yd2FyZCB0aWNrIGV2ZW50cyB0by5cbiAgICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsP3N0cmluZz0sbnVtYmVyPSl9IHVudXNlZEZuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKT19IG9wdF9mbHVzaFxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2xvYmFsLkFNUC5zZXRUaWNrRnVuY3Rpb24gPSAodW51c2VkRm4sIG9wdF9mbHVzaCkgPT4ge307XG5cbiAgLy8gUnVuIHNwZWNpZmljIHNldHVwIGZvciBhIHNpbmdsZS1kb2Mgb3Igc2hhZG93LWRvYyBtb2RlLlxuICBjb25zdCBpbmlQcm9taXNlID0gY2FsbGJhY2soZ2xvYmFsLCBleHRlbnNpb25zKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0LCFPYmplY3QpfCFFeHRlbnNpb25QYXlsb2FkfSBmbk9yU3RydWN0XG4gICAqL1xuICBmdW5jdGlvbiBpbnN0YWxsRXh0ZW5zaW9uKGZuT3JTdHJ1Y3QpIHtcbiAgICBjb25zdCByZWdpc3RlciA9ICgpID0+IHtcbiAgICAgIGluaVByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZm5PclN0cnVjdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZm5PclN0cnVjdChnbG9iYWwuQU1QLCBnbG9iYWwuQU1QLl8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4dGVuc2lvbnMucmVnaXN0ZXJFeHRlbnNpb24oXG4gICAgICAgICAgICBmbk9yU3RydWN0Lm4sXG4gICAgICAgICAgICBmbk9yU3RydWN0LmV2LFxuICAgICAgICAgICAgZm5PclN0cnVjdC5sLFxuICAgICAgICAgICAgZm5PclN0cnVjdC5mLFxuICAgICAgICAgICAgZ2xvYmFsLkFNUFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzdGFydFJlZ2lzdGVyT3JDaHVuayhnbG9iYWwsIGZuT3JTdHJ1Y3QsIHJlZ2lzdGVyKTtcbiAgfVxuXG4gIC8vIEhhbmRsZSBoaWdoIHByaW9yaXR5IGV4dGVuc2lvbnMgbm93LCBhbmQgaWYgbmVjZXNzYXJ5IGlzc3VlXG4gIC8vIHJlcXVlc3RzIGZvciBuZXcgZXh0ZW5zaW9ucyAodXNlZCBmb3IgZXhwZXJpbWVudGFsIHZlcnNpb25cbiAgLy8gbG9ja2luZykuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmbk9yU3RydWN0ID0gcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnNbaV07XG4gICAgaWYgKG1heWJlTG9hZENvcnJlY3RWZXJzaW9uKGdsb2JhbCwgZm5PclN0cnVjdCkpIHtcbiAgICAgIHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zLnNwbGljZShpLS0sIDEpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZuT3JTdHJ1Y3QgPT0gJ2Z1bmN0aW9uJyB8fCBmbk9yU3RydWN0LnAgPT0gJ2hpZ2gnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpbnN0YWxsRXh0ZW5zaW9uKGZuT3JTdHJ1Y3QpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBUaHJvdyBlcnJvcnMgb3V0c2lkZSBvZiBsb29wIGluIGl0cyBvd24gbWljcm8gdGFzayB0b1xuICAgICAgICAvLyBhdm9pZCBvbiBlcnJvciBzdG9wcGluZyBvdGhlciBleHRlbnNpb25zIGZyb20gbG9hZGluZy5cbiAgICAgICAgZGV2KCkuZXJyb3IoVEFHLCAnRXh0ZW5zaW9uIGZhaWxlZDogJywgZSwgZm5PclN0cnVjdC5uKTtcbiAgICAgIH1cbiAgICAgIC8vIFdlIGhhbmRsZWQgdGhlIGVudHJ5LiBSZW1vdmUgZnJvbSBzZXQgZm9yIGZ1dHVyZSBleGVjdXRpb24uXG4gICAgICBwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucy5zcGxpY2UoaS0tLCAxKTtcbiAgICB9XG4gIH1cblxuICBtYXliZVB1bXBFYXJseUZyYW1lKGdsb2JhbCwgKCkgPT4ge1xuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhIG5ldyBjdXN0b20gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFPYmplY3QsICFPYmplY3QpfCFFeHRlbnNpb25QYXlsb2FkfSBmbk9yU3RydWN0XG4gICAgICovXG4gICAgZ2xvYmFsLkFNUC5wdXNoID0gZnVuY3Rpb24gKGZuT3JTdHJ1Y3QpIHtcbiAgICAgIGlmIChtYXliZUxvYWRDb3JyZWN0VmVyc2lvbihnbG9iYWwsIGZuT3JTdHJ1Y3QpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGluc3RhbGxFeHRlbnNpb24oZm5PclN0cnVjdCk7XG4gICAgfTtcbiAgICAvLyBFeGVjdXRlIGFzeW5jaHJvbm91c2x5IHNjaGVkdWxlZCBlbGVtZW50cy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBmbk9yU3RydWN0ID0gcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnNbaV07XG4gICAgICBpZiAobWF5YmVMb2FkQ29ycmVjdFZlcnNpb24oZ2xvYmFsLCBmbk9yU3RydWN0KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGluc3RhbGxFeHRlbnNpb24oZm5PclN0cnVjdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFRocm93IGVycm9ycyBvdXRzaWRlIG9mIGxvb3AgaW4gaXRzIG93biBtaWNybyB0YXNrIHRvXG4gICAgICAgIC8vIGF2b2lkIG9uIGVycm9yIHN0b3BwaW5nIG90aGVyIGV4dGVuc2lvbnMgZnJvbSBsb2FkaW5nLlxuICAgICAgICBkZXYoKS5lcnJvcihUQUcsICdFeHRlbnNpb24gZmFpbGVkOiAnLCBlLCBmbk9yU3RydWN0Lm4pO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBNYWtlIHN1cmUgd2UgZW1wdHkgdGhlIGFycmF5IG9mIHByZXJlZ2lzdGVyZWQgZXh0ZW5zaW9ucy5cbiAgICAvLyBUZWNobmljYWxseSB0aGlzIGlzIG9ubHkgbmVlZGVkIGZvciB0ZXN0aW5nLCBhcyBldmVyeXRoaW5nIHNob3VsZFxuICAgIC8vIGdvIG91dCBvZiBzY29wZSBoZXJlLCBidXQganVzdCBtYWtpbmcgc3VyZS5cbiAgICBwcmVyZWdpc3RlcmVkRXh0ZW5zaW9ucy5sZW5ndGggPSAwO1xuICB9KTtcbiAgLy8gSWYgdGhlIGNsb3N1cmUgcGFzc2VkIHRvIG1heWJlUHVtcEVhcmx5RnJhbWUgZGlkbid0IGV4ZWN1dGVcbiAgLy8gaW1tZWRpYXRlbHkgd2UgbmVlZCB0byBrZWVwIHB1c2hpbmcgb250byBwcmVyZWdpc3RlcmVkRXh0ZW5zaW9uc1xuICBpZiAoIWdsb2JhbC5BTVAucHVzaCkge1xuICAgIGdsb2JhbC5BTVAucHVzaCA9XG4gICAgICAvKiogQHR5cGUge2Z1bmN0aW9uKChFeHRlbnNpb25QYXlsb2FkfGZ1bmN0aW9uKCFPYmplY3QsICFPYmplY3QpOiA/KSl9ICovIChcbiAgICAgICAgcHJlcmVnaXN0ZXJlZEV4dGVuc2lvbnMucHVzaC5iaW5kKHByZXJlZ2lzdGVyZWRFeHRlbnNpb25zKVxuICAgICAgKTtcbiAgfVxuXG4gIC8vIEZvciBpT1Mgd2UgbmVlZCB0byBzZXQgYGN1cnNvcjpwb2ludGVyYCB0byBlbnN1cmUgdGhhdCBjbGljayBldmVudHMgYXJlXG4gIC8vIGRlbGl2ZXJlZC5cbiAgaWYgKFNlcnZpY2VzLnBsYXRmb3JtRm9yKGdsb2JhbCkuaXNJb3MoKSkge1xuICAgIHNldFN0eWxlKGdsb2JhbC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICdjdXJzb3InLCAncG9pbnRlcicpO1xuICB9XG5cbiAgLy8gU29tZSBkZWZlcnJlZCBwb2x5ZmlsbHMuXG4gIGNvbnN0IGV4dGVuc2lvbnNGb3IgPSBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKGdsb2JhbCk7XG4gIGlmIChzaG91bGRMb2FkUmVzT2JQb2x5ZmlsbChnbG9iYWwpKSB7XG4gICAgZXh0ZW5zaW9uc0Zvci5wcmVsb2FkRXh0ZW5zaW9uKCdhbXAtcmVzaXplLW9ic2VydmVyLXBvbHlmaWxsJyk7XG4gIH1cbiAgaWYgKHNob3VsZExvYWRJbk9iUG9seWZpbGwoZ2xvYmFsKSkge1xuICAgIGV4dGVuc2lvbnNGb3IucHJlbG9hZEV4dGVuc2lvbignYW1wLWludGVyc2VjdGlvbi1vYnNlcnZlci1wb2x5ZmlsbCcpO1xuICB9XG5cbiAgcmV0dXJuIGluaVByb21pc2U7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0LCAhT2JqZWN0KXwhRXh0ZW5zaW9uUGF5bG9hZH0gZm5PclN0cnVjdFxuICogQHBhcmFtIHtmdW5jdGlvbigpfSByZWdpc3RlclxuICovXG5mdW5jdGlvbiBzdGFydFJlZ2lzdGVyT3JDaHVuayhnbG9iYWwsIGZuT3JTdHJ1Y3QsIHJlZ2lzdGVyKSB7XG4gIGlmICh0eXBlb2YgZm5PclN0cnVjdCA9PSAnZnVuY3Rpb24nIHx8IGZuT3JTdHJ1Y3QucCA9PSAnaGlnaCcpIHtcbiAgICAvLyBcIkhpZ2ggcHJpb3JpdHlcIiBleHRlbnNpb25zIGRvIG5vdCBnbyB0aHJvdWdoIGNodW5raW5nLlxuICAgIC8vIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yIGV4dGVuc2lvbnMgdGhhdCBuZWVkIHRvIHJ1biBlYXJseS5cbiAgICAvLyBPbmUgZXhhbXBsZSB3b3VsZCBiZSB2aWV3ZXIgY29tbXVuaWNhdGlvbiB0aGF0IGlzIHJlcXVpcmVkXG4gICAgLy8gdG8gdHJhbnNpdGlvbiBkb2N1bWVudCBmcm9tIHByZS1yZW5kZXIgdG8gdmlzaWJsZSAod2hpY2hcbiAgICAvLyBhZmZlY3RzIGNodW5raW5nIGl0c2VsZikuXG4gICAgLy8gV2UgY29uc2lkZXIgZnVuY3Rpb25zIGFzIGhpZ2ggcHJpb3JpdHksIGJlY2F1c2VcbiAgICAvLyAtIGlmIGluIGRvdWJ0LCB0aGF0IGlzIGEgYmV0dGVyIGRlZmF1bHRcbiAgICAvLyAtIHRoZSBvbmx5IGFjdHVhbCAgdXNlciBpcyBhIHZpZXdlciBpbnRlZ3JhdGlvbiB0aGF0IHNob3VsZFxuICAgIC8vICAgYmUgaGlnaCBwcmlvcml0eS5cbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKHJlZ2lzdGVyKTtcbiAgfSBlbHNlIHtcbiAgICByZWdpc3Rlci5kaXNwbGF5TmFtZSA9IGZuT3JTdHJ1Y3QubjtcbiAgICBzdGFydHVwQ2h1bmsoZ2xvYmFsLmRvY3VtZW50LCByZWdpc3Rlcik7XG4gIH1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBydW50aW1lIHRvIGEgZ2l2ZW4gZ2xvYmFsIHNjb3BlIGZvciBhIHNpbmdsZS1kb2MgbW9kZS5cbiAqIE11bHRpIGZyYW1lIHN1cHBvcnQgaXMgY3VycmVudGx5IGluY29tcGxldGUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IGdsb2JhbCBHbG9iYWwgc2NvcGUgdG8gYWRvcHQuXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkb3B0KGdsb2JhbCkge1xuICByZXR1cm4gYWRvcHRTaGFyZWQoZ2xvYmFsLCAoZ2xvYmFsKSA9PiB7XG4gICAgLy8gU2hhcmVkIHJ1bnRpbWVzIHZhcmlhYmxlcyBiZXR3ZWVuIGJvdGggbXVsdGktZG9jIGFuZCBzaW5nbGUtZG9jIHBhZ2VzXG4gICAgYWRvcHRTZXJ2aWNlc0FuZFJlc291cmNlcyhnbG9iYWwpO1xuXG4gICAgcmV0dXJuIHdhaXRGb3JCb2R5T3BlblByb21pc2UoZ2xvYmFsLmRvY3VtZW50KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGFsbCBkZWNsYXJlZCBleHRlbnNpb25zIGFyZSBtYXJrZWQgYW5kIHN0dWJiZWQuXG4gICAgICBzdHViRWxlbWVudHNGb3JEb2MoZ2xvYmFsLkFNUC5hbXBkb2MpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBydW50aW1lIHRvIGEgZ2l2ZW4gZ2xvYmFsIHNjb3BlIGZvciBhIHNpbmdsZS1kb2MgbW9kZS5cbiAqIE11bHRpIGZyYW1lIHN1cHBvcnQgaXMgY3VycmVudGx5IGluY29tcGxldGUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IGdsb2JhbCBHbG9iYWwgc2NvcGUgdG8gYWRvcHQuXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkb3B0V2l0aE11bHRpZG9jRGVwcyhnbG9iYWwpIHtcbiAgcmV0dXJuIGFkb3B0U2hhcmVkKGdsb2JhbCwgKGdsb2JhbCkgPT4ge1xuICAgIC8vIFNoYXJlZCBydW50aW1lcyB2YXJpYWJsZXMgYmV0d2VlbiBib3RoIG11bHRpLWRvYyBhbmQgc2luZ2xlLWRvYyBwYWdlc1xuICAgIGFkb3B0U2VydmljZXNBbmRSZXNvdXJjZXMoZ2xvYmFsKTtcblxuICAgIC8vIERlcGVuZGVuY2llcyB0byB0aGUgTXVsdGlEb2NNYW5hZ2VyXG4gICAgYWRvcHRNdWx0aURvY0RlcHMoZ2xvYmFsKTtcblxuICAgIHJldHVybiB3YWl0Rm9yQm9keU9wZW5Qcm9taXNlKGdsb2JhbC5kb2N1bWVudCkudGhlbigoKSA9PiB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBhbGwgZGVjbGFyZWQgZXh0ZW5zaW9ucyBhcmUgbWFya2VkIGFuZCBzdHViYmVkLlxuICAgICAgc3R1YkVsZW1lbnRzRm9yRG9jKGdsb2JhbC5BTVAuYW1wZG9jKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQWRvcHQgc2hhcmVkIHJ1bnRpbWVzIHZhcmlhYmxlcyBiZXR3ZWVuIGJvdGggbXVsdGktZG9jIGFuZCBzaW5nbGUtZG9jIHBhZ2VzXG4gKiBAcGFyYW0geyFXaW5kb3d9IGdsb2JhbCBHbG9iYWwgc2NvcGUgdG8gYWRvcHQuXG4gKi9cbmZ1bmN0aW9uIGFkb3B0U2VydmljZXNBbmRSZXNvdXJjZXMoZ2xvYmFsKSB7XG4gIGNvbnN0IHtkb2N1bWVudEVsZW1lbnR9ID0gZ2xvYmFsLmRvY3VtZW50O1xuXG4gIGNvbnN0IGFtcGRvY1NlcnZpY2UgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKGdsb2JhbCk7XG4gIGNvbnN0IGFtcGRvYyA9IGFtcGRvY1NlcnZpY2UuZ2V0U2luZ2xlRG9jKCk7XG4gIGdsb2JhbC5BTVAuYW1wZG9jID0gYW1wZG9jO1xuXG4gIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICBnbG9iYWwuQU1QLnZpZXdlciA9IHZpZXdlcjtcblxuICBpZiAoZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgZ2xvYmFsLkFNUC50b2dnbGVSdW50aW1lID0gdmlld2VyLnRvZ2dsZVJ1bnRpbWUuYmluZCh2aWV3ZXIpO1xuICAgIGdsb2JhbC5BTVAucmVzb3VyY2VzID0gU2VydmljZXMucmVzb3VyY2VzRm9yRG9jKGRvY3VtZW50RWxlbWVudCk7XG4gIH1cblxuICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKGRvY3VtZW50RWxlbWVudCk7XG4gIGdsb2JhbC5BTVAudmlld3BvcnQgPSB7fTtcbiAgZ2xvYmFsLkFNUC52aWV3cG9ydC5nZXRTY3JvbGxMZWZ0ID0gdmlld3BvcnQuZ2V0U2Nyb2xsTGVmdC5iaW5kKHZpZXdwb3J0KTtcbiAgZ2xvYmFsLkFNUC52aWV3cG9ydC5nZXRTY3JvbGxXaWR0aCA9IHZpZXdwb3J0LmdldFNjcm9sbFdpZHRoLmJpbmQodmlld3BvcnQpO1xuICBnbG9iYWwuQU1QLnZpZXdwb3J0LmdldFdpZHRoID0gdmlld3BvcnQuZ2V0V2lkdGguYmluZCh2aWV3cG9ydCk7XG59XG5cbi8qKlxuICogQWRvcHQgTXVsdGlEb2NNYW5hZ2VyIGRlcGVuZGVuY2llc1xuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICovXG5mdW5jdGlvbiBhZG9wdE11bHRpRG9jRGVwcyhnbG9iYWwpIHtcbiAgZ2xvYmFsLkFNUC5pbnN0YWxsQW1wZG9jU2VydmljZXMgPSBpbnN0YWxsQW1wZG9jU2VydmljZXMuYmluZChudWxsKTtcbiAgaWYgKElTX0VTTSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2xvYmFsLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlW2FtcC1ydW50aW1lXScpO1xuICAgIGdsb2JhbC5BTVAuY29tYmluZWRDc3MgPSBzdHlsZSA/IHN0eWxlLnRleHRDb250ZW50IDogJyc7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLkFNUC5jb21iaW5lZENzcyA9IGFtcERvY0NzcyArIGFtcFNoYXJlZENzcztcbiAgfVxufVxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHJ1bnRpbWUgdG8gYSBnaXZlbiBnbG9iYWwgc2NvcGUgZm9yIHNoYWRvdyBtb2RlLlxuICogQHBhcmFtIHshV2luZG93fSBnbG9iYWwgR2xvYmFsIHNjb3BlIHRvIGFkb3B0LlxuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZG9wdFNoYWRvd01vZGUoZ2xvYmFsKSB7XG4gIHJldHVybiBhZG9wdFNoYXJlZChnbG9iYWwsIChnbG9iYWwsIGV4dGVuc2lvbnMpID0+IHtcbiAgICAvLyBzaGFkb3cgbW9kZSBhbHJlYWR5IGFkb3B0ZWRcbiAgICBpZiAoZ2xvYmFsLkFNUC5hdHRhY2hTaGFkb3dEb2MpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICAvLyBEZXBlbmRlbmNpZXMgdG8gdGhlIE11bHRpRG9jTWFuYWdlclxuICAgIGFkb3B0TXVsdGlEb2NEZXBzKGdsb2JhbCk7XG5cbiAgICBjb25zdCBtYW5hZ2VyID0gbmV3IE11bHRpZG9jTWFuYWdlcihcbiAgICAgIGdsb2JhbCxcbiAgICAgIFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3IoZ2xvYmFsKSxcbiAgICAgIGV4dGVuc2lvbnMsXG4gICAgICBTZXJ2aWNlcy50aW1lckZvcihnbG9iYWwpXG4gICAgKTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhIHNoYWRvdyByb290IGRvY3VtZW50IHZpYSBhIGZ1bGx5IGZldGNoZWQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIHshRWxlbWVudH0gaG9zdEVsZW1lbnRcbiAgICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfaW5pdFBhcmFtc1xuICAgICAqIEByZXR1cm4geyFPYmplY3R9XG4gICAgICovXG4gICAgZ2xvYmFsLkFNUC5hdHRhY2hTaGFkb3dEb2MgPSBtYW5hZ2VyLmF0dGFjaFNoYWRvd0RvYy5iaW5kKG1hbmFnZXIpO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgc2hhZG93IHJvb3QgZG9jdW1lbnQgdmlhIGEgc3RyZWFtLlxuICAgICAqIEBwYXJhbSB7IUVsZW1lbnR9IGhvc3RFbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfaW5pdFBhcmFtc1xuICAgICAqIEByZXR1cm4geyFPYmplY3R9XG4gICAgICovXG4gICAgZ2xvYmFsLkFNUC5hdHRhY2hTaGFkb3dEb2NBc1N0cmVhbSA9XG4gICAgICBtYW5hZ2VyLmF0dGFjaFNoYWRvd0RvY0FzU3RyZWFtLmJpbmQobWFuYWdlcik7XG5cbiAgICByZXR1cm4gd2FpdEZvckJvZHlPcGVuUHJvbWlzZShnbG9iYWwuZG9jdW1lbnQpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGb3IgYSBnaXZlbiBleHRlbnNpb24sIGNoZWNrcyB0aGF0IGl0cyB2ZXJzaW9uIGlzIHRoZSBzYW1lXG4gKiBhcyB0aGUgdmVyc2lvbiBvZiB0aGUgbWFpbiBBTVAgYmluYXJ5LlxuICogSWYgeWVzLCByZXR1cm5zIGZhbHNlIGFuZCBkb2VzIG5vdGhpbmcgZWxzZS5cbiAqIElmIHRoZXkgYXJlIGRpZmZlcmVudCwgcmV0dXJucyBmYWxzZSwgYW5kIGluaXRpYXRlcyBhIGxvYWRcbiAqIG9mIHRoZSByZXNwZWN0aXZlIGV4dGVuc2lvbiB2aWEgYSB2ZXJzaW9uZWQgVVJMLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFPYmplY3QsICFPYmplY3QpfCFFeHRlbnNpb25QYXlsb2FkfSBmbk9yU3RydWN0XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBtYXliZUxvYWRDb3JyZWN0VmVyc2lvbih3aW4sIGZuT3JTdHJ1Y3QpIHtcbiAgaWYgKGdldE1vZGUoKS5sb2NhbERldiAmJiBpc0V4cGVyaW1lbnRPbih3aW4sICdkaXNhYmxlLXZlcnNpb24tbG9ja2luZycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgZm5PclN0cnVjdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKElTX0VTTSkge1xuICAgIC8vIElmIHdlJ3JlIGluIGEgbW9kdWxlIHJ1bnRpbWUsIHRyeWluZyB0byBleGVjdXRlIGEgbm9tb2R1bGUgZXh0ZW5zaW9uXG4gICAgLy8gc2ltcGx5IHJlbW92ZSB0aGUgbm9tb2R1bGUgZXh0ZW5zaW9uIHNvIHRoYXQgaXQgaXMgbm90IGV4ZWN1dGVkLlxuICAgIGlmICghZm5PclN0cnVjdC5tKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgd2UncmUgaW4gYSBub21vZHVsZSBydW50aW1lLCB0cnlpbmcgdG8gZXhlY3V0ZSBhIG1vZHVsZSBleHRlbnNpb25cbiAgICAvLyBzaW1wbHkgcmVtb3ZlIHRoZSBtb2R1bGUgZXh0ZW5zaW9uIHNvIHRoYXQgaXQgaXMgbm90IGV4ZWN1dGVkLlxuICAgIGlmIChmbk9yU3RydWN0Lm0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHt2fSA9IGZuT3JTdHJ1Y3Q7XG4gIC8vIFRoaXMgaXMgbm9uLW9idmlvdXMsIGJ1dCB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIHJlbGVhc2UgdmVyc2lvbixcbiAgLy8gbm90IGFib3V0IHRoZSBmdWxsIHJ0diB2ZXJzaW9uLCBiZWNhdXNlIHRoZXNlIG9ubHkgZGlmZmVyXG4gIC8vIGluIHRoZSBjb25maWcgdGhhdCBpcyBmdWxseSBkZXRlcm1pbmVkIGJ5IHRoZSBwcmltYXJ5IGJpbmFyeS5cbiAgaWYgKG1vZGUudmVyc2lvbigpID09IHYpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih3aW4pLnJlbG9hZEV4dGVuc2lvbihcbiAgICBmbk9yU3RydWN0Lm4sXG4gICAgZm5PclN0cnVjdC5ldixcbiAgICBmbk9yU3RydWN0LmxcbiAgKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogSWYgaXQgbWFrZXMgc2Vuc2UsIGxldCB0aGUgYnJvd3NlciBwYWludCB0aGUgY3VycmVudCBmcmFtZSBiZWZvcmVcbiAqIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2suXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBjYiBDYWxsYmFjayB0aGF0IHNob3VsZCBydW4gYWZ0ZXIgYSBmcmFtZSB3YXNcbiAqICAgICBwdW1wZWQuXG4gKi9cbmZ1bmN0aW9uIG1heWJlUHVtcEVhcmx5RnJhbWUod2luLCBjYikge1xuICAvLyBUaGVyZSBpcyBkZWZpbml0ZWx5IG5vdGhpbmcgdG8gZHJhdyB5ZXQsIHNvIHdlIG1pZ2h0IGFzIHdlbGxcbiAgLy8gcHJvY2VlZC5cbiAgaWYgKCF3aW4uZG9jdW1lbnQuYm9keSkge1xuICAgIGNiKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChoYXNSZW5kZXJEZWxheWluZ1NlcnZpY2VzKHdpbikpIHtcbiAgICBjYigpO1xuICAgIHJldHVybjtcbiAgfVxuICBTZXJ2aWNlcy50aW1lckZvcih3aW4pLmRlbGF5KGNiLCAxKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/runtime.js