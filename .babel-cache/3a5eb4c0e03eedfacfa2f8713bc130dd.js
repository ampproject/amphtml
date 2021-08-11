function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Deferred } from "../core/data-structures/promise";
import { rethrowAsync } from "../core/error";
import { map } from "../core/types/object";

import { Services } from "./";

import {
copyElementToChildWindow,
stubElementIfNotKnown,
upgradeOrRegisterElement } from "./custom-element-registry";

import { createExtensionScript, getExtensionScripts } from "./extension-script";
import { registerExtendedTemplateForDoc } from "./template-impl";

import { dev, devAssert, user } from "../log";
import { getMode } from "../mode";
import {
registerServiceBuilder,
registerServiceBuilderForDoc } from "../service-helpers";

import { installStylesForDoc } from "../style-installer";

export var LEGACY_ELEMENTS = ['amp-ad', 'amp-embed', 'amp-video'];
var TAG = 'extensions';
var DEFAULT_VERSION = '0.1';
var LATEST_VERSION = 'latest';
var UNKNOWN_EXTENSION = '_UNKNOWN_';
var LOADER_PROP = '__AMP_EXT_LDR';
var SCRIPT_LOADED_PROP = '__AMP_SCR_LOADED';

/**
 * Contains data for the declaration of a custom element.
 *
 * @typedef {{
 *   implementationClass:
 *       typeof ../base-element.BaseElement,
 *   css: (?string|undefined),
 * }}
 */
var ExtensionElementDef;

/**
 * Contains data for the declaration of an extension service.
 *
 * @typedef {{serviceName: string, serviceClass: function(new:Object, !./ampdoc-impl.AmpDoc)}}
 */
var ExtensionServiceDef;

/**
 * The structure that contains the resources declared by an extension.
 *
 * @typedef {{
 *   elements: !Object<string, !ExtensionElementDef>,
 *   services: !Object<string, !ExtensionServiceDef>,
 * }}
 */
var ExtensionDef;

/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   version: string,
 *   latest: boolean,
 *   extension: !ExtensionDef,
 *   auto: boolean,
 *   docFactories: !Array<function(!./ampdoc-impl.AmpDoc)>,
 *   promise: (!Promise<!ExtensionDef>|undefined),
 *   resolve: (function(!ExtensionDef)|undefined),
 *   reject: (function(!Error)|undefined),
 *   loaded: (boolean|undefined),
 *   error: (!Error|undefined),
 *   scriptPresent: (boolean|undefined),
 * }}
 * @private
 */
var ExtensionHolderDef;

/**
 * Install extensions service.
 * @param {!Window} window
 * @restricted
 */
export function installExtensionsService(window) {
  registerServiceBuilder(window, 'extensions', Extensions);
}

/**
 * The services that manages extensions in the runtime.
 * @visibleForTesting
 */
export var Extensions = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Extensions(win) {_classCallCheck(this, Extensions);
    /** @const {!Window} */
    this.win = win;

    /** @const @private */
    this.ampdocService_ = Services.ampdocServiceFor(win);

    /** @private @const {!Object<string, !ExtensionHolderDef>} */
    this.extensions_ = {};

    /** @private {?string} */
    this.currentExtensionId_ = null;

    /** @private {?string} */
    this.currentExtensionVersion_ = null;

    /** @private {?boolean} */
    this.currentExtensionLatest_ = null;
  }

  /**
   * Register and process the specified extension. The factory is called
   * immediately, which in turn is expected to register elements, templates,
   * services and document factories. This method is called by the extension's
   * script itself when it's loaded using the regular `AMP.push()` callback.
   * @param {string} extensionId
   * @param {string} version
   * @param {boolean} latest
   * @param {function(!Object, !Object)} factory
   * @param {!Object} arg
   * @restricted
   */_createClass(Extensions, [{ key: "registerExtension", value:
    function registerExtension(extensionId, version, latest, factory, arg) {var _latestHolder$auto;
      var latestHolder = latest ?
      this.extensions_[extensionKey(extensionId, LATEST_VERSION)] :
      null;
      var holder = this.getExtensionHolder_(
      extensionId,
      version,
      // Inherit the `auto` (auto-install) flag from the "latest" version
      // when available. If the "latest" has been added as a non-auto-install
      // then this registration should not auto-install either. If the numeric
      // version was independently added to the document, then it's auto-install
      // will be preserved.
      (_latestHolder$auto = (latestHolder === null || latestHolder === void 0) ? (void 0) : latestHolder.auto) !== null && _latestHolder$auto !== void 0 ? _latestHolder$auto : true);

      holder.latest = latest;

      if (holder.loaded) {
        // This extension has already been registered. This could be a
        // a "latest" script requested for a previously loaded numeric
        // version or vice versa.
        return;
      }

      // Replace the "latest": both numerical and "latest" will be pointing to
      // the same record.
      if (latest) {
        this.extensions_[extensionKey(extensionId, LATEST_VERSION)] = holder;
      }

      try {var _holder$resolve, _latestHolder$resolve;
        this.currentExtensionId_ = extensionId;
        this.currentExtensionVersion_ = version;
        this.currentExtensionLatest_ = latest;
        factory(arg, arg['_']);
        if (false || false) {
          if (Object.freeze) {
            var m = holder.extension;
            m.elements = Object.freeze(m.elements);
            holder.extension = Object.freeze(m);
          }
        }
        holder.loaded = true;
        ((_holder$resolve = holder.resolve) === null || _holder$resolve === void 0) ? (void 0) : _holder$resolve.call(holder, holder.extension);
        (latestHolder === null || latestHolder === void 0) ? (void 0) : ((_latestHolder$resolve = latestHolder.resolve) === null || _latestHolder$resolve === void 0) ? (void 0) : _latestHolder$resolve.call(latestHolder, holder.extension);
      } catch (e) {var _holder$reject, _latestHolder$reject;
        holder.error = e;
        ((_holder$reject = holder.reject) === null || _holder$reject === void 0) ? (void 0) : _holder$reject.call(holder, e);
        (latestHolder === null || latestHolder === void 0) ? (void 0) : ((_latestHolder$reject = latestHolder.reject) === null || _latestHolder$reject === void 0) ? (void 0) : _latestHolder$reject.call(latestHolder, e);
        throw e;
      } finally {
        this.currentExtensionId_ = null;
        this.currentExtensionVersion_ = null;
        this.currentExtensionLatest_ = null;
      }
    }

    /**
     * Waits for the previously included extension to complete
     * loading/registration.
     * @param {string} extensionId
     * @param {string} version
     * @return {!Promise<?ExtensionDef>}
     */ }, { key: "waitForExtension", value:
    function waitForExtension(extensionId, version) {
      var wait = this.waitFor_(this.getExtensionHolder_(extensionId, version));

      return Services.timerFor(this.win).
      timeoutPromise(16000, wait).
      catch(function (err) {
        if (!err.message.includes('timeout')) {
          throw err;
        }

        user().error(TAG, "Waited over 16s to load extension ".concat(extensionId, "."));
        return wait;
      });
    }

    /**
     * Returns the promise that will be resolved when the extension has been
     * loaded. If necessary, adds the extension script to the page.
     * @param {string} extensionId
     * @param {string=} version
     * @return {!Promise<!ExtensionDef>}
     */ }, { key: "preloadExtension", value:
    function preloadExtension(extensionId) {var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_VERSION;
      if (extensionId == 'amp-embed') {
        extensionId = 'amp-ad';
      }
      var holder = this.getExtensionHolder_(extensionId, version);
      this.insertExtensionScriptIfNeeded_(extensionId, version, holder);
      return this.waitFor_(holder);
    }

    /**
     * Returns the promise that will be resolved when the extension has been
     * loaded. If necessary, adds the extension script to the page.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {string} extensionId
     * @param {string=} version
     * @return {!Promise<!ExtensionDef>}
     */ }, { key: "installExtensionForDoc", value:
    function installExtensionForDoc(ampdoc, extensionId) {var _this = this;var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_VERSION;
      var rootNode = ampdoc.getRootNode();
      var extLoaders = rootNode[LOADER_PROP];
      if (!extLoaders) {
        extLoaders = rootNode[LOADER_PROP] = map();
      }
      if (extLoaders[extensionId]) {
        return extLoaders[extensionId];
      }
      ampdoc.declareExtension(extensionId, version);
      stubElementIfNotKnown(ampdoc.win, extensionId);
      return (extLoaders[extensionId] = this.preloadExtension(
      extensionId,
      version).
      then(function () {return _this.installExtensionInDoc(ampdoc, extensionId, version);}));
    }

    /**
     * Reloads the new version of the extension.
     * @param {string} extensionId
     * @param {string} version
     * @param {boolean} latest
     * @return {!Promise<!ExtensionDef>}
     */ }, { key: "reloadExtension", value:
    function reloadExtension(extensionId, version, latest) {
      // Ignore inserted script elements to prevent recursion.
      var els = getExtensionScripts(
      this.win,
      extensionId,
      version,
      latest,
      /* includeInserted */false);

      // The previously awaited extension loader must not have finished or
      // failed.
      var holder = this.extensions_[extensionKey(extensionId, version)];
      if (holder) {
        devAssert(!holder.loaded && !holder.error);
        holder.scriptPresent = false;
      }
      els.forEach(function (el) {return (
          el.setAttribute('i-amphtml-loaded-new-version', extensionId));});

      return this.preloadExtension(extensionId, version);
    }

    /**
     * @param {!Window} win
     * @param {string} extensionId
     * @param {string=} version
     * @param {boolean=} latest
     * @return {!Promise}
     */ }, { key: "importUnwrapped", value:
    function importUnwrapped(win, extensionId) {var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_VERSION;var latest = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var scriptsInHead = getExtensionScripts(
      win,
      extensionId,
      version,
      latest);

      var scriptElement = scriptsInHead.length > 0 ? scriptsInHead[0] : null;
      var promise;
      if (scriptElement) {
        promise = scriptElement[SCRIPT_LOADED_PROP];
      } else {
        scriptElement = createExtensionScript(this.win, extensionId, version);
        promise = scriptElement[SCRIPT_LOADED_PROP] = new Promise(
        function (resolve, reject) {
          scriptElement.onload = resolve;
          scriptElement.onerror = reject;
        });

        win.document.head.appendChild(scriptElement);
      }
      return promise;
    }

    /**
     * Returns the promise that will be resolved with the extension element's
     * class when the extension has been loaded. If necessary, adds the extension
     * script to the page.
     * @param {string} elementName
     * @param {string} version
     * @return {!Promise<typeof ../base-element.BaseElement>}
     */ }, { key: "loadElementClass", value:
    function loadElementClass(elementName) {var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_VERSION;
      return this.preloadExtension(elementName, version).then(function (extension) {
        var element = devAssert(
        extension.elements[elementName]);



        return element.implementationClass;
      });
    }

    /**
     * Add an element to the extension currently being registered. This is a
     * restricted method and it's allowed to be called only during the overall
     * extension registration.
     * @param {string} name
     * @param {typeof ../base-element.BaseElement} implementationClass
     * @param {?string|undefined} css
     * @restricted
     */ }, { key: "addElement", value:
    function addElement(name, implementationClass, css) {var _this2 = this;
      var holder = this.getCurrentExtensionHolder_(name);
      holder.extension.elements[name] = { implementationClass: implementationClass, css: css };
      this.addDocFactory(function (ampdoc) {
        _this2.installElement_(ampdoc, name, implementationClass, css);
      });
    }

    /**
     * Add a template type to the extension currently being registered. This is a
     * restricted method and it's allowed to be called only during the overall
     * extension registration.
     * @param {string} name
     * @param {typeof ../base-template.BaseTemplate} implementationClass
     * @restricted
     */ }, { key: "addTemplate", value:
    function addTemplate(name, implementationClass) {
      this.addDocFactory(function (ampdoc) {
        registerExtendedTemplateForDoc(ampdoc, name, implementationClass);
      });
    }

    /**
     * Installs the specified element implementation in the ampdoc.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {string} name
     * @param {typeof ../base-element.BaseElement} implementationClass
     * @param {?string|undefined} css
     * @private
     */ }, { key: "installElement_", value:
    function installElement_(ampdoc, name, implementationClass, css) {var _this3 = this;
      if (css) {
        installStylesForDoc(
        ampdoc,
        css,
        function () {
          _this3.registerElementInWindow_(ampdoc.win, name, implementationClass);
        },
        /* isRuntimeCss */false,
        name);

      } else {
        this.registerElementInWindow_(ampdoc.win, name, implementationClass);
      }
    }

    /**
     * @param {!Window} win
     * @param {string} name
     * @param {typeof ../base-element.BaseElement} implementationClass
     * @private
     */ }, { key: "registerElementInWindow_", value:
    function registerElementInWindow_(win, name, implementationClass) {
      // Register the element in the window.
      upgradeOrRegisterElement(win, name, implementationClass);
      // Register this extension to resolve its Service Promise.
      registerServiceBuilder(win, name, emptyService);
    }

    /**
     * Add a service to the extension currently being registered. This is a
     * restricted method and it's allowed to be called only during the overall
     * extension registration.
     * @param {string} name
     * @param {function(new:Object, !./ampdoc-impl.AmpDoc)} implementationClass
     */ }, { key: "addService", value:
    function addService(name, implementationClass) {
      var holder = this.getCurrentExtensionHolder_(name);
      holder.extension.services.push(
      /** @type {!ExtensionServiceDef} */({
        serviceName: name,
        serviceClass: implementationClass }));


      this.addDocFactory(function (ampdoc) {
        registerServiceBuilderForDoc(
        ampdoc,
        name,
        implementationClass,
        /* instantiate */true);

      });
    }

    /**
     * Add a ampdoc factory to the extension currently being registered. This is a
     * restricted method and it's allowed to be called only during the overall
     * extension registration.
     * @param {function(!./ampdoc-impl.AmpDoc)} factory
     * @param {string=} opt_forName
     * @restricted
     */ }, { key: "addDocFactory", value:
    function addDocFactory(factory, opt_forName) {
      var holder = this.getCurrentExtensionHolder_(opt_forName);
      holder.docFactories.push(factory);

      // If a single-doc mode, run factory right away if it's included by the doc.
      if (this.currentExtensionId_ && this.ampdocService_.isSingleDoc()) {
        var ampdoc = this.ampdocService_.getAmpDoc(this.win.document);
        var extensionId = /** @type {string} */(this.currentExtensionId_);
        var version = /** @type {string} */(this.currentExtensionVersion_);
        var latest = this.currentExtensionLatest_ || false;
        // Note that this won't trigger for FIE extensions that are not present
        // in the parent doc.
        if (
        ampdoc.declaresExtension(extensionId, version) || (
        latest && ampdoc.declaresExtension(extensionId, LATEST_VERSION)) ||
        holder.auto)
        {
          factory(ampdoc);
        }
      }
    }

    /**
     * Preinstalls built-ins and legacy elements in the emebedded ampdoc.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
     * @restricted
     */ }, { key: "preinstallEmbed", value:
    function preinstallEmbed(ampdoc, extensions) {
      var topWin = this.win;
      var childWin = ampdoc.win;

      // Install built-ins and legacy elements.
      copyBuiltinElementsToChildWindow(topWin, childWin);
      stubLegacyElements(childWin);

      // Stub extensions.
      extensions.forEach(function (_ref) {var extensionId = _ref.extensionId,extensionVersion = _ref.extensionVersion;
        // Declare the extension version on ampdoc so it doesn't request the
        // extension again.
        ampdoc.declareExtension(extensionId, extensionVersion);

        // This will extend automatic upgrade of custom elements from top
        // window to the child window.
        if (!LEGACY_ELEMENTS.includes(extensionId)) {
          stubElementIfNotKnown(childWin, extensionId);
        }
      });
    }

    /**
     * Installs all ampdoc factories previously registered with
     * `addDocFactory`.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
     * @return {!Promise}
     * @restricted
     */ }, { key: "installExtensionsInDoc", value:
    function installExtensionsInDoc(ampdoc, extensions) {var _this4 = this;
      return Promise.all(
      extensions.map(function (_ref2) {var extensionId = _ref2.extensionId,extensionVersion = _ref2.extensionVersion;return (
          _this4.installExtensionInDoc(ampdoc, extensionId, extensionVersion));}));


    }

    /**
     * Installs all ampdoc factories for the specified extension.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {string} extensionId
     * @param {string=} version
     * @return {!Promise}
     */ }, { key: "installExtensionInDoc", value:
    function installExtensionInDoc(ampdoc, extensionId) {var _this5 = this;var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_VERSION;
      ampdoc.declareExtension(extensionId, version);
      return this.waitFor_(this.getExtensionHolder_(extensionId, version)).then(
      function () {
        var holder = _this5.getExtensionHolder_(extensionId, version);
        holder.docFactories.forEach(function (factory) {
          try {
            factory(ampdoc);
          } catch (e) {
            rethrowAsync('Doc factory failed: ', e, extensionId);
          }
        });
      });

    }

    /**
     * Creates or returns an existing extension holder.
     * @param {string} extensionId
     * @param {string} version
     * @param {boolean=} opt_auto
     * @return {!ExtensionHolderDef}
     * @private
     */ }, { key: "getExtensionHolder_", value:
    function getExtensionHolder_(extensionId, version, opt_auto) {
      var key = extensionKey(extensionId, version);
      var holder = this.extensions_[key];
      if (!holder) {
        var extension = /** @type {ExtensionDef} */({
          elements: {},
          services: [] });

        holder = /** @type {ExtensionHolderDef} */({
          version: version,
          // Usually a version starts "unknown" and the latest becomes known
          // when it has been loaded.
          latest: version == LATEST_VERSION,
          extension: extension,
          auto: opt_auto || false,
          docFactories: [],
          promise: undefined,
          resolve: undefined,
          reject: undefined,
          loaded: undefined,
          error: undefined,
          scriptPresent: undefined });

        this.extensions_[key] = holder;
      }
      return holder;
    }

    /**
     * Returns the holder for the extension currently being registered.
     * @param {string=} opt_forName Used for logging only.
     * @return {!ExtensionHolderDef}
     * @private
     */ }, { key: "getCurrentExtensionHolder_", value:
    function getCurrentExtensionHolder_(opt_forName) {
      if (!this.currentExtensionId_ && !false) {
        dev().error(TAG, 'unknown extension for ', opt_forName);
      }
      return this.getExtensionHolder_(
      this.currentExtensionId_ || UNKNOWN_EXTENSION,
      this.currentExtensionVersion_ || '');

    }

    /**
     * Creates or returns an existing promise that will yield as soon as the
     * extension has been loaded.
     * @param {!ExtensionHolderDef} holder
     * @return {!Promise<!ExtensionDef>}
     * @private
     */ }, { key: "waitFor_", value:
    function waitFor_(holder) {
      if (!holder.promise) {
        if (holder.loaded) {
          holder.promise = Promise.resolve(holder.extension);
        } else if (holder.error) {
          holder.promise = Promise.reject(holder.error);
        } else {
          var deferred = new Deferred();
          holder.promise = deferred.promise;
          holder.resolve = deferred.resolve;
          holder.reject = deferred.reject;
        }
      }
      return holder.promise;
    }

    /**
     * Ensures that the script has already been injected in the page.
     * @param {string} extensionId
     * @param {string} version
     * @param {!ExtensionHolderDef} holder
     * @private
     */ }, { key: "insertExtensionScriptIfNeeded_", value:
    function insertExtensionScriptIfNeeded_(extensionId, version, holder) {
      if (this.isExtensionScriptRequired_(extensionId, version, holder)) {
        var scriptElement = createExtensionScript(
        this.win,
        extensionId,
        version);

        this.win.document.head.appendChild(scriptElement);
        holder.scriptPresent = true;
      }
    }

    /**
     * Determine the need to add amp extension script to document.
     * @param {string} extensionId
     * @param {string} version
     * @param {!ExtensionHolderDef} holder
     * @return {boolean}
     * @private
     */ }, { key: "isExtensionScriptRequired_", value:
    function isExtensionScriptRequired_(extensionId, version, holder) {
      if (holder.loaded || holder.error) {
        return false;
      }
      if (holder.scriptPresent === undefined) {
        var scriptsInHead = getExtensionScripts(
        this.win,
        extensionId,
        version,
        holder.latest);

        holder.scriptPresent = scriptsInHead.length > 0;
      }
      return !holder.scriptPresent;
    } }]);return Extensions;}();


/**
 * @param {!Window} win
 */
export function stubLegacyElements(win) {
  LEGACY_ELEMENTS.forEach(function (name) {
    stubElementIfNotKnown(win, name);
  });
}

/**
 * Copy builtins to a child window.
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function copyBuiltinElementsToChildWindow(parentWin, childWin) {
  copyElementToChildWindow(parentWin, childWin, 'amp-img');
  copyElementToChildWindow(parentWin, childWin, 'amp-pixel');
}

/**
 * @return {!Object}
 */
function emptyService() {
  // All services need to resolve to an object.
  return {};
}

/**
 * @param {string} extensionId
 * @param {string} version
 * @return {string}
 */
function extensionKey(extensionId, version) {
  return "".concat(extensionId, ":").concat(version);
}
// /Users/mszylkowski/src/amphtml/src/service/extensions-impl.js