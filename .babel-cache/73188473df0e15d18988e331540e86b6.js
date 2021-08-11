function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Deferred } from "../core/data-structures/promise";
import { rethrowAsync } from "../core/error";
import { map } from "../core/types/object";
import { Services } from "./";
import { copyElementToChildWindow, stubElementIfNotKnown, upgradeOrRegisterElement } from "./custom-element-registry";
import { createExtensionScript, getExtensionScripts } from "./extension-script";
import { registerExtendedTemplateForDoc } from "./template-impl";
import { dev, devAssert, user } from "../log";
import { getMode } from "../mode";
import { registerServiceBuilder, registerServiceBuilderForDoc } from "../service-helpers";
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
  function Extensions(win) {
    _classCallCheck(this, Extensions);

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
   */
  _createClass(Extensions, [{
    key: "registerExtension",
    value: function registerExtension(extensionId, version, latest, factory, arg) {
      var _latestHolder$auto;

      var latestHolder = latest ? this.extensions_[extensionKey(extensionId, LATEST_VERSION)] : null;
      var holder = this.getExtensionHolder_(extensionId, version, // Inherit the `auto` (auto-install) flag from the "latest" version
      // when available. If the "latest" has been added as a non-auto-install
      // then this registration should not auto-install either. If the numeric
      // version was independently added to the document, then it's auto-install
      // will be preserved.
      (_latestHolder$auto = latestHolder == null ? void 0 : latestHolder.auto) != null ? _latestHolder$auto : true);
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

      try {
        this.currentExtensionId_ = extensionId;
        this.currentExtensionVersion_ = version;
        this.currentExtensionLatest_ = latest;
        factory(arg, arg['_']);

        if (getMode(this.win).localDev || getMode(this.win).test) {
          if (Object.freeze) {
            var m = holder.extension;
            m.elements = Object.freeze(m.elements);
            holder.extension = Object.freeze(m);
          }
        }

        holder.loaded = true;
        holder.resolve == null ? void 0 : holder.resolve(holder.extension);
        latestHolder == null ? void 0 : latestHolder.resolve == null ? void 0 : latestHolder.resolve(holder.extension);
      } catch (e) {
        holder.error = e;
        holder.reject == null ? void 0 : holder.reject(e);
        latestHolder == null ? void 0 : latestHolder.reject == null ? void 0 : latestHolder.reject(e);
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
     */

  }, {
    key: "waitForExtension",
    value: function waitForExtension(extensionId, version) {
      var wait = this.waitFor_(this.getExtensionHolder_(extensionId, version));
      return Services.timerFor(this.win).timeoutPromise(16000, wait).catch(function (err) {
        if (!err.message.includes('timeout')) {
          throw err;
        }

        user().error(TAG, "Waited over 16s to load extension " + extensionId + ".");
        return wait;
      });
    }
    /**
     * Returns the promise that will be resolved when the extension has been
     * loaded. If necessary, adds the extension script to the page.
     * @param {string} extensionId
     * @param {string=} version
     * @return {!Promise<!ExtensionDef>}
     */

  }, {
    key: "preloadExtension",
    value: function preloadExtension(extensionId, version) {
      if (version === void 0) {
        version = DEFAULT_VERSION;
      }

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
     */

  }, {
    key: "installExtensionForDoc",
    value: function installExtensionForDoc(ampdoc, extensionId, version) {
      var _this = this;

      if (version === void 0) {
        version = DEFAULT_VERSION;
      }

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
      return extLoaders[extensionId] = this.preloadExtension(extensionId, version).then(function () {
        return _this.installExtensionInDoc(ampdoc, extensionId, version);
      });
    }
    /**
     * Reloads the new version of the extension.
     * @param {string} extensionId
     * @param {string} version
     * @param {boolean} latest
     * @return {!Promise<!ExtensionDef>}
     */

  }, {
    key: "reloadExtension",
    value: function reloadExtension(extensionId, version, latest) {
      // Ignore inserted script elements to prevent recursion.
      var els = getExtensionScripts(this.win, extensionId, version, latest,
      /* includeInserted */
      false);
      // The previously awaited extension loader must not have finished or
      // failed.
      var holder = this.extensions_[extensionKey(extensionId, version)];

      if (holder) {
        devAssert(!holder.loaded && !holder.error);
        holder.scriptPresent = false;
      }

      els.forEach(function (el) {
        return el.setAttribute('i-amphtml-loaded-new-version', extensionId);
      });
      return this.preloadExtension(extensionId, version);
    }
    /**
     * @param {!Window} win
     * @param {string} extensionId
     * @param {string=} version
     * @param {boolean=} latest
     * @return {!Promise}
     */

  }, {
    key: "importUnwrapped",
    value: function importUnwrapped(win, extensionId, version, latest) {
      if (version === void 0) {
        version = DEFAULT_VERSION;
      }

      if (latest === void 0) {
        latest = true;
      }

      var scriptsInHead = getExtensionScripts(win, extensionId, version, latest);
      var scriptElement = scriptsInHead.length > 0 ? scriptsInHead[0] : null;
      var promise;

      if (scriptElement) {
        promise = scriptElement[SCRIPT_LOADED_PROP];
      } else {
        scriptElement = createExtensionScript(this.win, extensionId, version);
        promise = scriptElement[SCRIPT_LOADED_PROP] = new Promise(function (resolve, reject) {
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
     */

  }, {
    key: "loadElementClass",
    value: function loadElementClass(elementName, version) {
      if (version === void 0) {
        version = DEFAULT_VERSION;
      }

      return this.preloadExtension(elementName, version).then(function (extension) {
        var element = devAssert(extension.elements[elementName], 'Element not found: %s', elementName);
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
     */

  }, {
    key: "addElement",
    value: function addElement(name, implementationClass, css) {
      var _this2 = this;

      var holder = this.getCurrentExtensionHolder_(name);
      holder.extension.elements[name] = {
        implementationClass: implementationClass,
        css: css
      };
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
     */

  }, {
    key: "addTemplate",
    value: function addTemplate(name, implementationClass) {
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
     */

  }, {
    key: "installElement_",
    value: function installElement_(ampdoc, name, implementationClass, css) {
      var _this3 = this;

      if (css) {
        installStylesForDoc(ampdoc, css, function () {
          _this3.registerElementInWindow_(ampdoc.win, name, implementationClass);
        },
        /* isRuntimeCss */
        false, name);
      } else {
        this.registerElementInWindow_(ampdoc.win, name, implementationClass);
      }
    }
    /**
     * @param {!Window} win
     * @param {string} name
     * @param {typeof ../base-element.BaseElement} implementationClass
     * @private
     */

  }, {
    key: "registerElementInWindow_",
    value: function registerElementInWindow_(win, name, implementationClass) {
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
     */

  }, {
    key: "addService",
    value: function addService(name, implementationClass) {
      var holder = this.getCurrentExtensionHolder_(name);
      holder.extension.services.push(
      /** @type {!ExtensionServiceDef} */
      {
        serviceName: name,
        serviceClass: implementationClass
      });
      this.addDocFactory(function (ampdoc) {
        registerServiceBuilderForDoc(ampdoc, name, implementationClass,
        /* instantiate */
        true);
      });
    }
    /**
     * Add a ampdoc factory to the extension currently being registered. This is a
     * restricted method and it's allowed to be called only during the overall
     * extension registration.
     * @param {function(!./ampdoc-impl.AmpDoc)} factory
     * @param {string=} opt_forName
     * @restricted
     */

  }, {
    key: "addDocFactory",
    value: function addDocFactory(factory, opt_forName) {
      var holder = this.getCurrentExtensionHolder_(opt_forName);
      holder.docFactories.push(factory);

      // If a single-doc mode, run factory right away if it's included by the doc.
      if (this.currentExtensionId_ && this.ampdocService_.isSingleDoc()) {
        var ampdoc = this.ampdocService_.getAmpDoc(this.win.document);
        var extensionId = dev().assertString(this.currentExtensionId_);
        var version = dev().assertString(this.currentExtensionVersion_);
        var latest = this.currentExtensionLatest_ || false;

        // Note that this won't trigger for FIE extensions that are not present
        // in the parent doc.
        if (ampdoc.declaresExtension(extensionId, version) || latest && ampdoc.declaresExtension(extensionId, LATEST_VERSION) || holder.auto) {
          factory(ampdoc);
        }
      }
    }
    /**
     * Preinstalls built-ins and legacy elements in the emebedded ampdoc.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
     * @restricted
     */

  }, {
    key: "preinstallEmbed",
    value: function preinstallEmbed(ampdoc, extensions) {
      var topWin = this.win;
      var childWin = ampdoc.win;
      // Install built-ins and legacy elements.
      copyBuiltinElementsToChildWindow(topWin, childWin);
      stubLegacyElements(childWin);
      // Stub extensions.
      extensions.forEach(function (_ref) {
        var extensionId = _ref.extensionId,
            extensionVersion = _ref.extensionVersion;
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
     */

  }, {
    key: "installExtensionsInDoc",
    value: function installExtensionsInDoc(ampdoc, extensions) {
      var _this4 = this;

      return Promise.all(extensions.map(function (_ref2) {
        var extensionId = _ref2.extensionId,
            extensionVersion = _ref2.extensionVersion;
        return _this4.installExtensionInDoc(ampdoc, extensionId, extensionVersion);
      }));
    }
    /**
     * Installs all ampdoc factories for the specified extension.
     * @param {!./ampdoc-impl.AmpDoc} ampdoc
     * @param {string} extensionId
     * @param {string=} version
     * @return {!Promise}
     */

  }, {
    key: "installExtensionInDoc",
    value: function installExtensionInDoc(ampdoc, extensionId, version) {
      var _this5 = this;

      if (version === void 0) {
        version = DEFAULT_VERSION;
      }

      ampdoc.declareExtension(extensionId, version);
      return this.waitFor_(this.getExtensionHolder_(extensionId, version)).then(function () {
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
     */

  }, {
    key: "getExtensionHolder_",
    value: function getExtensionHolder_(extensionId, version, opt_auto) {
      var key = extensionKey(extensionId, version);
      var holder = this.extensions_[key];

      if (!holder) {
        var extension =
        /** @type {ExtensionDef} */
        {
          elements: {},
          services: []
        };
        holder =
        /** @type {ExtensionHolderDef} */
        {
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
          scriptPresent: undefined
        };
        this.extensions_[key] = holder;
      }

      return holder;
    }
    /**
     * Returns the holder for the extension currently being registered.
     * @param {string=} opt_forName Used for logging only.
     * @return {!ExtensionHolderDef}
     * @private
     */

  }, {
    key: "getCurrentExtensionHolder_",
    value: function getCurrentExtensionHolder_(opt_forName) {
      if (!this.currentExtensionId_ && !getMode(this.win).test) {
        dev().error(TAG, 'unknown extension for ', opt_forName);
      }

      return this.getExtensionHolder_(this.currentExtensionId_ || UNKNOWN_EXTENSION, this.currentExtensionVersion_ || '');
    }
    /**
     * Creates or returns an existing promise that will yield as soon as the
     * extension has been loaded.
     * @param {!ExtensionHolderDef} holder
     * @return {!Promise<!ExtensionDef>}
     * @private
     */

  }, {
    key: "waitFor_",
    value: function waitFor_(holder) {
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
     */

  }, {
    key: "insertExtensionScriptIfNeeded_",
    value: function insertExtensionScriptIfNeeded_(extensionId, version, holder) {
      if (this.isExtensionScriptRequired_(extensionId, version, holder)) {
        var scriptElement = createExtensionScript(this.win, extensionId, version);
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
     */

  }, {
    key: "isExtensionScriptRequired_",
    value: function isExtensionScriptRequired_(extensionId, version, holder) {
      if (holder.loaded || holder.error) {
        return false;
      }

      if (holder.scriptPresent === undefined) {
        var scriptsInHead = getExtensionScripts(this.win, extensionId, version, holder.latest);
        holder.scriptPresent = scriptsInHead.length > 0;
      }

      return !holder.scriptPresent;
    }
  }]);

  return Extensions;
}();

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
  return extensionId + ":" + version;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4dGVuc2lvbnMtaW1wbC5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsInJldGhyb3dBc3luYyIsIm1hcCIsIlNlcnZpY2VzIiwiY29weUVsZW1lbnRUb0NoaWxkV2luZG93Iiwic3R1YkVsZW1lbnRJZk5vdEtub3duIiwidXBncmFkZU9yUmVnaXN0ZXJFbGVtZW50IiwiY3JlYXRlRXh0ZW5zaW9uU2NyaXB0IiwiZ2V0RXh0ZW5zaW9uU2NyaXB0cyIsInJlZ2lzdGVyRXh0ZW5kZWRUZW1wbGF0ZUZvckRvYyIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJnZXRNb2RlIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJpbnN0YWxsU3R5bGVzRm9yRG9jIiwiTEVHQUNZX0VMRU1FTlRTIiwiVEFHIiwiREVGQVVMVF9WRVJTSU9OIiwiTEFURVNUX1ZFUlNJT04iLCJVTktOT1dOX0VYVEVOU0lPTiIsIkxPQURFUl9QUk9QIiwiU0NSSVBUX0xPQURFRF9QUk9QIiwiRXh0ZW5zaW9uRWxlbWVudERlZiIsIkV4dGVuc2lvblNlcnZpY2VEZWYiLCJFeHRlbnNpb25EZWYiLCJFeHRlbnNpb25Ib2xkZXJEZWYiLCJpbnN0YWxsRXh0ZW5zaW9uc1NlcnZpY2UiLCJ3aW5kb3ciLCJFeHRlbnNpb25zIiwid2luIiwiYW1wZG9jU2VydmljZV8iLCJhbXBkb2NTZXJ2aWNlRm9yIiwiZXh0ZW5zaW9uc18iLCJjdXJyZW50RXh0ZW5zaW9uSWRfIiwiY3VycmVudEV4dGVuc2lvblZlcnNpb25fIiwiY3VycmVudEV4dGVuc2lvbkxhdGVzdF8iLCJleHRlbnNpb25JZCIsInZlcnNpb24iLCJsYXRlc3QiLCJmYWN0b3J5IiwiYXJnIiwibGF0ZXN0SG9sZGVyIiwiZXh0ZW5zaW9uS2V5IiwiaG9sZGVyIiwiZ2V0RXh0ZW5zaW9uSG9sZGVyXyIsImF1dG8iLCJsb2FkZWQiLCJsb2NhbERldiIsInRlc3QiLCJPYmplY3QiLCJmcmVlemUiLCJtIiwiZXh0ZW5zaW9uIiwiZWxlbWVudHMiLCJyZXNvbHZlIiwiZSIsImVycm9yIiwicmVqZWN0Iiwid2FpdCIsIndhaXRGb3JfIiwidGltZXJGb3IiLCJ0aW1lb3V0UHJvbWlzZSIsImNhdGNoIiwiZXJyIiwibWVzc2FnZSIsImluY2x1ZGVzIiwiaW5zZXJ0RXh0ZW5zaW9uU2NyaXB0SWZOZWVkZWRfIiwiYW1wZG9jIiwicm9vdE5vZGUiLCJnZXRSb290Tm9kZSIsImV4dExvYWRlcnMiLCJkZWNsYXJlRXh0ZW5zaW9uIiwicHJlbG9hZEV4dGVuc2lvbiIsInRoZW4iLCJpbnN0YWxsRXh0ZW5zaW9uSW5Eb2MiLCJlbHMiLCJzY3JpcHRQcmVzZW50IiwiZm9yRWFjaCIsImVsIiwic2V0QXR0cmlidXRlIiwic2NyaXB0c0luSGVhZCIsInNjcmlwdEVsZW1lbnQiLCJsZW5ndGgiLCJwcm9taXNlIiwiUHJvbWlzZSIsIm9ubG9hZCIsIm9uZXJyb3IiLCJkb2N1bWVudCIsImhlYWQiLCJhcHBlbmRDaGlsZCIsImVsZW1lbnROYW1lIiwiZWxlbWVudCIsImltcGxlbWVudGF0aW9uQ2xhc3MiLCJuYW1lIiwiY3NzIiwiZ2V0Q3VycmVudEV4dGVuc2lvbkhvbGRlcl8iLCJhZGREb2NGYWN0b3J5IiwiaW5zdGFsbEVsZW1lbnRfIiwicmVnaXN0ZXJFbGVtZW50SW5XaW5kb3dfIiwiZW1wdHlTZXJ2aWNlIiwic2VydmljZXMiLCJwdXNoIiwic2VydmljZU5hbWUiLCJzZXJ2aWNlQ2xhc3MiLCJvcHRfZm9yTmFtZSIsImRvY0ZhY3RvcmllcyIsImlzU2luZ2xlRG9jIiwiZ2V0QW1wRG9jIiwiYXNzZXJ0U3RyaW5nIiwiZGVjbGFyZXNFeHRlbnNpb24iLCJleHRlbnNpb25zIiwidG9wV2luIiwiY2hpbGRXaW4iLCJjb3B5QnVpbHRpbkVsZW1lbnRzVG9DaGlsZFdpbmRvdyIsInN0dWJMZWdhY3lFbGVtZW50cyIsImV4dGVuc2lvblZlcnNpb24iLCJhbGwiLCJvcHRfYXV0byIsImtleSIsInVuZGVmaW5lZCIsImRlZmVycmVkIiwiaXNFeHRlbnNpb25TY3JpcHRSZXF1aXJlZF8iLCJwYXJlbnRXaW4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUNFQyx3QkFERixFQUVFQyxxQkFGRixFQUdFQyx3QkFIRjtBQUtBLFNBQVFDLHFCQUFSLEVBQStCQyxtQkFBL0I7QUFDQSxTQUFRQyw4QkFBUjtBQUVBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYixFQUF3QkMsSUFBeEI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FDRUMsc0JBREYsRUFFRUMsNEJBRkY7QUFJQSxTQUFRQyxtQkFBUjtBQUVBLE9BQU8sSUFBTUMsZUFBZSxHQUFHLENBQUMsUUFBRCxFQUFXLFdBQVgsRUFBd0IsV0FBeEIsQ0FBeEI7QUFDUCxJQUFNQyxHQUFHLEdBQUcsWUFBWjtBQUNBLElBQU1DLGVBQWUsR0FBRyxLQUF4QjtBQUNBLElBQU1DLGNBQWMsR0FBRyxRQUF2QjtBQUNBLElBQU1DLGlCQUFpQixHQUFHLFdBQTFCO0FBQ0EsSUFBTUMsV0FBVyxHQUFHLGVBQXBCO0FBQ0EsSUFBTUMsa0JBQWtCLEdBQUcsa0JBQTNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLG1CQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxtQkFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsWUFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxrQkFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyx3QkFBVCxDQUFrQ0MsTUFBbEMsRUFBMEM7QUFDL0NmLEVBQUFBLHNCQUFzQixDQUFDZSxNQUFELEVBQVMsWUFBVCxFQUF1QkMsVUFBdkIsQ0FBdEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFBLFVBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxzQkFBWUMsR0FBWixFQUFpQjtBQUFBOztBQUNmO0FBQ0EsU0FBS0EsR0FBTCxHQUFXQSxHQUFYOztBQUVBO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQjdCLFFBQVEsQ0FBQzhCLGdCQUFULENBQTBCRixHQUExQixDQUF0Qjs7QUFFQTtBQUNBLFNBQUtHLFdBQUwsR0FBbUIsRUFBbkI7O0FBRUE7QUFDQSxTQUFLQyxtQkFBTCxHQUEyQixJQUEzQjs7QUFFQTtBQUNBLFNBQUtDLHdCQUFMLEdBQWdDLElBQWhDOztBQUVBO0FBQ0EsU0FBS0MsdUJBQUwsR0FBK0IsSUFBL0I7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFuQ0E7QUFBQTtBQUFBLFdBb0NFLDJCQUFrQkMsV0FBbEIsRUFBK0JDLE9BQS9CLEVBQXdDQyxNQUF4QyxFQUFnREMsT0FBaEQsRUFBeURDLEdBQXpELEVBQThEO0FBQUE7O0FBQzVELFVBQU1DLFlBQVksR0FBR0gsTUFBTSxHQUN2QixLQUFLTixXQUFMLENBQWlCVSxZQUFZLENBQUNOLFdBQUQsRUFBY2xCLGNBQWQsQ0FBN0IsQ0FEdUIsR0FFdkIsSUFGSjtBQUdBLFVBQU15QixNQUFNLEdBQUcsS0FBS0MsbUJBQUwsQ0FDYlIsV0FEYSxFQUViQyxPQUZhLEVBR2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBhLDRCQVFiSSxZQVJhLG9CQVFiQSxZQUFZLENBQUVJLElBUkQsaUNBUVMsSUFSVCxDQUFmO0FBVUFGLE1BQUFBLE1BQU0sQ0FBQ0wsTUFBUCxHQUFnQkEsTUFBaEI7O0FBRUEsVUFBSUssTUFBTSxDQUFDRyxNQUFYLEVBQW1CO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlSLE1BQUosRUFBWTtBQUNWLGFBQUtOLFdBQUwsQ0FBaUJVLFlBQVksQ0FBQ04sV0FBRCxFQUFjbEIsY0FBZCxDQUE3QixJQUE4RHlCLE1BQTlEO0FBQ0Q7O0FBRUQsVUFBSTtBQUNGLGFBQUtWLG1CQUFMLEdBQTJCRyxXQUEzQjtBQUNBLGFBQUtGLHdCQUFMLEdBQWdDRyxPQUFoQztBQUNBLGFBQUtGLHVCQUFMLEdBQStCRyxNQUEvQjtBQUNBQyxRQUFBQSxPQUFPLENBQUNDLEdBQUQsRUFBTUEsR0FBRyxDQUFDLEdBQUQsQ0FBVCxDQUFQOztBQUNBLFlBQUk3QixPQUFPLENBQUMsS0FBS2tCLEdBQU4sQ0FBUCxDQUFrQmtCLFFBQWxCLElBQThCcEMsT0FBTyxDQUFDLEtBQUtrQixHQUFOLENBQVAsQ0FBa0JtQixJQUFwRCxFQUEwRDtBQUN4RCxjQUFJQyxNQUFNLENBQUNDLE1BQVgsRUFBbUI7QUFDakIsZ0JBQU1DLENBQUMsR0FBR1IsTUFBTSxDQUFDUyxTQUFqQjtBQUNBRCxZQUFBQSxDQUFDLENBQUNFLFFBQUYsR0FBYUosTUFBTSxDQUFDQyxNQUFQLENBQWNDLENBQUMsQ0FBQ0UsUUFBaEIsQ0FBYjtBQUNBVixZQUFBQSxNQUFNLENBQUNTLFNBQVAsR0FBbUJILE1BQU0sQ0FBQ0MsTUFBUCxDQUFjQyxDQUFkLENBQW5CO0FBQ0Q7QUFDRjs7QUFDRFIsUUFBQUEsTUFBTSxDQUFDRyxNQUFQLEdBQWdCLElBQWhCO0FBQ0FILFFBQUFBLE1BQU0sQ0FBQ1csT0FBUCxvQkFBQVgsTUFBTSxDQUFDVyxPQUFQLENBQWlCWCxNQUFNLENBQUNTLFNBQXhCO0FBQ0FYLFFBQUFBLFlBQVksUUFBWixZQUFBQSxZQUFZLENBQUVhLE9BQWQsb0JBQUFiLFlBQVksQ0FBRWEsT0FBZCxDQUF3QlgsTUFBTSxDQUFDUyxTQUEvQjtBQUNELE9BZkQsQ0FlRSxPQUFPRyxDQUFQLEVBQVU7QUFDVlosUUFBQUEsTUFBTSxDQUFDYSxLQUFQLEdBQWVELENBQWY7QUFDQVosUUFBQUEsTUFBTSxDQUFDYyxNQUFQLG9CQUFBZCxNQUFNLENBQUNjLE1BQVAsQ0FBZ0JGLENBQWhCO0FBQ0FkLFFBQUFBLFlBQVksUUFBWixZQUFBQSxZQUFZLENBQUVnQixNQUFkLG9CQUFBaEIsWUFBWSxDQUFFZ0IsTUFBZCxDQUF1QkYsQ0FBdkI7QUFDQSxjQUFNQSxDQUFOO0FBQ0QsT0FwQkQsU0FvQlU7QUFDUixhQUFLdEIsbUJBQUwsR0FBMkIsSUFBM0I7QUFDQSxhQUFLQyx3QkFBTCxHQUFnQyxJQUFoQztBQUNBLGFBQUtDLHVCQUFMLEdBQStCLElBQS9CO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxHQTtBQUFBO0FBQUEsV0FtR0UsMEJBQWlCQyxXQUFqQixFQUE4QkMsT0FBOUIsRUFBdUM7QUFDckMsVUFBTXFCLElBQUksR0FBRyxLQUFLQyxRQUFMLENBQWMsS0FBS2YsbUJBQUwsQ0FBeUJSLFdBQXpCLEVBQXNDQyxPQUF0QyxDQUFkLENBQWI7QUFFQSxhQUFPcEMsUUFBUSxDQUFDMkQsUUFBVCxDQUFrQixLQUFLL0IsR0FBdkIsRUFDSmdDLGNBREksQ0FDVyxLQURYLEVBQ2tCSCxJQURsQixFQUVKSSxLQUZJLENBRUUsVUFBQ0MsR0FBRCxFQUFTO0FBQ2QsWUFBSSxDQUFDQSxHQUFHLENBQUNDLE9BQUosQ0FBWUMsUUFBWixDQUFxQixTQUFyQixDQUFMLEVBQXNDO0FBQ3BDLGdCQUFNRixHQUFOO0FBQ0Q7O0FBRURyRCxRQUFBQSxJQUFJLEdBQUc4QyxLQUFQLENBQWF4QyxHQUFiLHlDQUF1RG9CLFdBQXZEO0FBQ0EsZUFBT3NCLElBQVA7QUFDRCxPQVRJLENBQVA7QUFVRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhIQTtBQUFBO0FBQUEsV0F5SEUsMEJBQWlCdEIsV0FBakIsRUFBOEJDLE9BQTlCLEVBQXlEO0FBQUEsVUFBM0JBLE9BQTJCO0FBQTNCQSxRQUFBQSxPQUEyQixHQUFqQnBCLGVBQWlCO0FBQUE7O0FBQ3ZELFVBQUltQixXQUFXLElBQUksV0FBbkIsRUFBZ0M7QUFDOUJBLFFBQUFBLFdBQVcsR0FBRyxRQUFkO0FBQ0Q7O0FBQ0QsVUFBTU8sTUFBTSxHQUFHLEtBQUtDLG1CQUFMLENBQXlCUixXQUF6QixFQUFzQ0MsT0FBdEMsQ0FBZjtBQUNBLFdBQUs2Qiw4QkFBTCxDQUFvQzlCLFdBQXBDLEVBQWlEQyxPQUFqRCxFQUEwRE0sTUFBMUQ7QUFDQSxhQUFPLEtBQUtnQixRQUFMLENBQWNoQixNQUFkLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBeklBO0FBQUE7QUFBQSxXQTBJRSxnQ0FBdUJ3QixNQUF2QixFQUErQi9CLFdBQS9CLEVBQTRDQyxPQUE1QyxFQUF1RTtBQUFBOztBQUFBLFVBQTNCQSxPQUEyQjtBQUEzQkEsUUFBQUEsT0FBMkIsR0FBakJwQixlQUFpQjtBQUFBOztBQUNyRSxVQUFNbUQsUUFBUSxHQUFHRCxNQUFNLENBQUNFLFdBQVAsRUFBakI7QUFDQSxVQUFJQyxVQUFVLEdBQUdGLFFBQVEsQ0FBQ2hELFdBQUQsQ0FBekI7O0FBQ0EsVUFBSSxDQUFDa0QsVUFBTCxFQUFpQjtBQUNmQSxRQUFBQSxVQUFVLEdBQUdGLFFBQVEsQ0FBQ2hELFdBQUQsQ0FBUixHQUF3QnBCLEdBQUcsRUFBeEM7QUFDRDs7QUFDRCxVQUFJc0UsVUFBVSxDQUFDbEMsV0FBRCxDQUFkLEVBQTZCO0FBQzNCLGVBQU9rQyxVQUFVLENBQUNsQyxXQUFELENBQWpCO0FBQ0Q7O0FBQ0QrQixNQUFBQSxNQUFNLENBQUNJLGdCQUFQLENBQXdCbkMsV0FBeEIsRUFBcUNDLE9BQXJDO0FBQ0FsQyxNQUFBQSxxQkFBcUIsQ0FBQ2dFLE1BQU0sQ0FBQ3RDLEdBQVIsRUFBYU8sV0FBYixDQUFyQjtBQUNBLGFBQVFrQyxVQUFVLENBQUNsQyxXQUFELENBQVYsR0FBMEIsS0FBS29DLGdCQUFMLENBQ2hDcEMsV0FEZ0MsRUFFaENDLE9BRmdDLEVBR2hDb0MsSUFIZ0MsQ0FHM0I7QUFBQSxlQUFNLEtBQUksQ0FBQ0MscUJBQUwsQ0FBMkJQLE1BQTNCLEVBQW1DL0IsV0FBbkMsRUFBZ0RDLE9BQWhELENBQU47QUFBQSxPQUgyQixDQUFsQztBQUlEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaktBO0FBQUE7QUFBQSxXQWtLRSx5QkFBZ0JELFdBQWhCLEVBQTZCQyxPQUE3QixFQUFzQ0MsTUFBdEMsRUFBOEM7QUFDNUM7QUFDQSxVQUFNcUMsR0FBRyxHQUFHckUsbUJBQW1CLENBQzdCLEtBQUt1QixHQUR3QixFQUU3Qk8sV0FGNkIsRUFHN0JDLE9BSDZCLEVBSTdCQyxNQUo2QjtBQUs3QjtBQUFzQixXQUxPLENBQS9CO0FBT0E7QUFDQTtBQUNBLFVBQU1LLE1BQU0sR0FBRyxLQUFLWCxXQUFMLENBQWlCVSxZQUFZLENBQUNOLFdBQUQsRUFBY0MsT0FBZCxDQUE3QixDQUFmOztBQUNBLFVBQUlNLE1BQUosRUFBWTtBQUNWbEMsUUFBQUEsU0FBUyxDQUFDLENBQUNrQyxNQUFNLENBQUNHLE1BQVIsSUFBa0IsQ0FBQ0gsTUFBTSxDQUFDYSxLQUEzQixDQUFUO0FBQ0FiLFFBQUFBLE1BQU0sQ0FBQ2lDLGFBQVAsR0FBdUIsS0FBdkI7QUFDRDs7QUFDREQsTUFBQUEsR0FBRyxDQUFDRSxPQUFKLENBQVksVUFBQ0MsRUFBRDtBQUFBLGVBQ1ZBLEVBQUUsQ0FBQ0MsWUFBSCxDQUFnQiw4QkFBaEIsRUFBZ0QzQyxXQUFoRCxDQURVO0FBQUEsT0FBWjtBQUdBLGFBQU8sS0FBS29DLGdCQUFMLENBQXNCcEMsV0FBdEIsRUFBbUNDLE9BQW5DLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlMQTtBQUFBO0FBQUEsV0ErTEUseUJBQWdCUixHQUFoQixFQUFxQk8sV0FBckIsRUFBa0NDLE9BQWxDLEVBQTZEQyxNQUE3RCxFQUE0RTtBQUFBLFVBQTFDRCxPQUEwQztBQUExQ0EsUUFBQUEsT0FBMEMsR0FBaENwQixlQUFnQztBQUFBOztBQUFBLFVBQWZxQixNQUFlO0FBQWZBLFFBQUFBLE1BQWUsR0FBTixJQUFNO0FBQUE7O0FBQzFFLFVBQU0wQyxhQUFhLEdBQUcxRSxtQkFBbUIsQ0FDdkN1QixHQUR1QyxFQUV2Q08sV0FGdUMsRUFHdkNDLE9BSHVDLEVBSXZDQyxNQUp1QyxDQUF6QztBQU1BLFVBQUkyQyxhQUFhLEdBQUdELGFBQWEsQ0FBQ0UsTUFBZCxHQUF1QixDQUF2QixHQUEyQkYsYUFBYSxDQUFDLENBQUQsQ0FBeEMsR0FBOEMsSUFBbEU7QUFDQSxVQUFJRyxPQUFKOztBQUNBLFVBQUlGLGFBQUosRUFBbUI7QUFDakJFLFFBQUFBLE9BQU8sR0FBR0YsYUFBYSxDQUFDNUQsa0JBQUQsQ0FBdkI7QUFDRCxPQUZELE1BRU87QUFDTDRELFFBQUFBLGFBQWEsR0FBRzVFLHFCQUFxQixDQUFDLEtBQUt3QixHQUFOLEVBQVdPLFdBQVgsRUFBd0JDLE9BQXhCLENBQXJDO0FBQ0E4QyxRQUFBQSxPQUFPLEdBQUdGLGFBQWEsQ0FBQzVELGtCQUFELENBQWIsR0FBb0MsSUFBSStELE9BQUosQ0FDNUMsVUFBQzlCLE9BQUQsRUFBVUcsTUFBVixFQUFxQjtBQUNuQndCLFVBQUFBLGFBQWEsQ0FBQ0ksTUFBZCxHQUF1Qi9CLE9BQXZCO0FBQ0EyQixVQUFBQSxhQUFhLENBQUNLLE9BQWQsR0FBd0I3QixNQUF4QjtBQUNELFNBSjJDLENBQTlDO0FBTUE1QixRQUFBQSxHQUFHLENBQUMwRCxRQUFKLENBQWFDLElBQWIsQ0FBa0JDLFdBQWxCLENBQThCUixhQUE5QjtBQUNEOztBQUNELGFBQU9FLE9BQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOU5BO0FBQUE7QUFBQSxXQStORSwwQkFBaUJPLFdBQWpCLEVBQThCckQsT0FBOUIsRUFBeUQ7QUFBQSxVQUEzQkEsT0FBMkI7QUFBM0JBLFFBQUFBLE9BQTJCLEdBQWpCcEIsZUFBaUI7QUFBQTs7QUFDdkQsYUFBTyxLQUFLdUQsZ0JBQUwsQ0FBc0JrQixXQUF0QixFQUFtQ3JELE9BQW5DLEVBQTRDb0MsSUFBNUMsQ0FBaUQsVUFBQ3JCLFNBQUQsRUFBZTtBQUNyRSxZQUFNdUMsT0FBTyxHQUFHbEYsU0FBUyxDQUN2QjJDLFNBQVMsQ0FBQ0MsUUFBVixDQUFtQnFDLFdBQW5CLENBRHVCLEVBRXZCLHVCQUZ1QixFQUd2QkEsV0FIdUIsQ0FBekI7QUFLQSxlQUFPQyxPQUFPLENBQUNDLG1CQUFmO0FBQ0QsT0FQTSxDQUFQO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbFBBO0FBQUE7QUFBQSxXQW1QRSxvQkFBV0MsSUFBWCxFQUFpQkQsbUJBQWpCLEVBQXNDRSxHQUF0QyxFQUEyQztBQUFBOztBQUN6QyxVQUFNbkQsTUFBTSxHQUFHLEtBQUtvRCwwQkFBTCxDQUFnQ0YsSUFBaEMsQ0FBZjtBQUNBbEQsTUFBQUEsTUFBTSxDQUFDUyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQndDLElBQTFCLElBQWtDO0FBQUNELFFBQUFBLG1CQUFtQixFQUFuQkEsbUJBQUQ7QUFBc0JFLFFBQUFBLEdBQUcsRUFBSEE7QUFBdEIsT0FBbEM7QUFDQSxXQUFLRSxhQUFMLENBQW1CLFVBQUM3QixNQUFELEVBQVk7QUFDN0IsUUFBQSxNQUFJLENBQUM4QixlQUFMLENBQXFCOUIsTUFBckIsRUFBNkIwQixJQUE3QixFQUFtQ0QsbUJBQW5DLEVBQXdERSxHQUF4RDtBQUNELE9BRkQ7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbFFBO0FBQUE7QUFBQSxXQW1RRSxxQkFBWUQsSUFBWixFQUFrQkQsbUJBQWxCLEVBQXVDO0FBQ3JDLFdBQUtJLGFBQUwsQ0FBbUIsVUFBQzdCLE1BQUQsRUFBWTtBQUM3QjVELFFBQUFBLDhCQUE4QixDQUFDNEQsTUFBRCxFQUFTMEIsSUFBVCxFQUFlRCxtQkFBZixDQUE5QjtBQUNELE9BRkQ7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaFJBO0FBQUE7QUFBQSxXQWlSRSx5QkFBZ0J6QixNQUFoQixFQUF3QjBCLElBQXhCLEVBQThCRCxtQkFBOUIsRUFBbURFLEdBQW5ELEVBQXdEO0FBQUE7O0FBQ3RELFVBQUlBLEdBQUosRUFBUztBQUNQaEYsUUFBQUEsbUJBQW1CLENBQ2pCcUQsTUFEaUIsRUFFakIyQixHQUZpQixFQUdqQixZQUFNO0FBQ0osVUFBQSxNQUFJLENBQUNJLHdCQUFMLENBQThCL0IsTUFBTSxDQUFDdEMsR0FBckMsRUFBMENnRSxJQUExQyxFQUFnREQsbUJBQWhEO0FBQ0QsU0FMZ0I7QUFNakI7QUFBbUIsYUFORixFQU9qQkMsSUFQaUIsQ0FBbkI7QUFTRCxPQVZELE1BVU87QUFDTCxhQUFLSyx3QkFBTCxDQUE4Qi9CLE1BQU0sQ0FBQ3RDLEdBQXJDLEVBQTBDZ0UsSUFBMUMsRUFBZ0RELG1CQUFoRDtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdFNBO0FBQUE7QUFBQSxXQXVTRSxrQ0FBeUIvRCxHQUF6QixFQUE4QmdFLElBQTlCLEVBQW9DRCxtQkFBcEMsRUFBeUQ7QUFDdkQ7QUFDQXhGLE1BQUFBLHdCQUF3QixDQUFDeUIsR0FBRCxFQUFNZ0UsSUFBTixFQUFZRCxtQkFBWixDQUF4QjtBQUNBO0FBQ0FoRixNQUFBQSxzQkFBc0IsQ0FBQ2lCLEdBQUQsRUFBTWdFLElBQU4sRUFBWU0sWUFBWixDQUF0QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcFRBO0FBQUE7QUFBQSxXQXFURSxvQkFBV04sSUFBWCxFQUFpQkQsbUJBQWpCLEVBQXNDO0FBQ3BDLFVBQU1qRCxNQUFNLEdBQUcsS0FBS29ELDBCQUFMLENBQWdDRixJQUFoQyxDQUFmO0FBQ0FsRCxNQUFBQSxNQUFNLENBQUNTLFNBQVAsQ0FBaUJnRCxRQUFqQixDQUEwQkMsSUFBMUI7QUFDRTtBQUFxQztBQUNuQ0MsUUFBQUEsV0FBVyxFQUFFVCxJQURzQjtBQUVuQ1UsUUFBQUEsWUFBWSxFQUFFWDtBQUZxQixPQUR2QztBQU1BLFdBQUtJLGFBQUwsQ0FBbUIsVUFBQzdCLE1BQUQsRUFBWTtBQUM3QnRELFFBQUFBLDRCQUE0QixDQUMxQnNELE1BRDBCLEVBRTFCMEIsSUFGMEIsRUFHMUJELG1CQUgwQjtBQUkxQjtBQUFrQixZQUpRLENBQTVCO0FBTUQsT0FQRDtBQVFEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5VUE7QUFBQTtBQUFBLFdBK1VFLHVCQUFjckQsT0FBZCxFQUF1QmlFLFdBQXZCLEVBQW9DO0FBQ2xDLFVBQU03RCxNQUFNLEdBQUcsS0FBS29ELDBCQUFMLENBQWdDUyxXQUFoQyxDQUFmO0FBQ0E3RCxNQUFBQSxNQUFNLENBQUM4RCxZQUFQLENBQW9CSixJQUFwQixDQUF5QjlELE9BQXpCOztBQUVBO0FBQ0EsVUFBSSxLQUFLTixtQkFBTCxJQUE0QixLQUFLSCxjQUFMLENBQW9CNEUsV0FBcEIsRUFBaEMsRUFBbUU7QUFDakUsWUFBTXZDLE1BQU0sR0FBRyxLQUFLckMsY0FBTCxDQUFvQjZFLFNBQXBCLENBQThCLEtBQUs5RSxHQUFMLENBQVMwRCxRQUF2QyxDQUFmO0FBQ0EsWUFBTW5ELFdBQVcsR0FBRzVCLEdBQUcsR0FBR29HLFlBQU4sQ0FBbUIsS0FBSzNFLG1CQUF4QixDQUFwQjtBQUNBLFlBQU1JLE9BQU8sR0FBRzdCLEdBQUcsR0FBR29HLFlBQU4sQ0FBbUIsS0FBSzFFLHdCQUF4QixDQUFoQjtBQUNBLFlBQU1JLE1BQU0sR0FBRyxLQUFLSCx1QkFBTCxJQUFnQyxLQUEvQzs7QUFDQTtBQUNBO0FBQ0EsWUFDRWdDLE1BQU0sQ0FBQzBDLGlCQUFQLENBQXlCekUsV0FBekIsRUFBc0NDLE9BQXRDLEtBQ0NDLE1BQU0sSUFBSTZCLE1BQU0sQ0FBQzBDLGlCQUFQLENBQXlCekUsV0FBekIsRUFBc0NsQixjQUF0QyxDQURYLElBRUF5QixNQUFNLENBQUNFLElBSFQsRUFJRTtBQUNBTixVQUFBQSxPQUFPLENBQUM0QixNQUFELENBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMVdBO0FBQUE7QUFBQSxXQTJXRSx5QkFBZ0JBLE1BQWhCLEVBQXdCMkMsVUFBeEIsRUFBb0M7QUFDbEMsVUFBTUMsTUFBTSxHQUFHLEtBQUtsRixHQUFwQjtBQUNBLFVBQU1tRixRQUFRLEdBQUc3QyxNQUFNLENBQUN0QyxHQUF4QjtBQUVBO0FBQ0FvRixNQUFBQSxnQ0FBZ0MsQ0FBQ0YsTUFBRCxFQUFTQyxRQUFULENBQWhDO0FBQ0FFLE1BQUFBLGtCQUFrQixDQUFDRixRQUFELENBQWxCO0FBRUE7QUFDQUYsTUFBQUEsVUFBVSxDQUFDakMsT0FBWCxDQUFtQixnQkFBcUM7QUFBQSxZQUFuQ3pDLFdBQW1DLFFBQW5DQSxXQUFtQztBQUFBLFlBQXRCK0UsZ0JBQXNCLFFBQXRCQSxnQkFBc0I7QUFDdEQ7QUFDQTtBQUNBaEQsUUFBQUEsTUFBTSxDQUFDSSxnQkFBUCxDQUF3Qm5DLFdBQXhCLEVBQXFDK0UsZ0JBQXJDOztBQUVBO0FBQ0E7QUFDQSxZQUFJLENBQUNwRyxlQUFlLENBQUNrRCxRQUFoQixDQUF5QjdCLFdBQXpCLENBQUwsRUFBNEM7QUFDMUNqQyxVQUFBQSxxQkFBcUIsQ0FBQzZHLFFBQUQsRUFBVzVFLFdBQVgsQ0FBckI7QUFDRDtBQUNGLE9BVkQ7QUFXRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBeFlBO0FBQUE7QUFBQSxXQXlZRSxnQ0FBdUIrQixNQUF2QixFQUErQjJDLFVBQS9CLEVBQTJDO0FBQUE7O0FBQ3pDLGFBQU8xQixPQUFPLENBQUNnQyxHQUFSLENBQ0xOLFVBQVUsQ0FBQzlHLEdBQVgsQ0FBZTtBQUFBLFlBQUVvQyxXQUFGLFNBQUVBLFdBQUY7QUFBQSxZQUFlK0UsZ0JBQWYsU0FBZUEsZ0JBQWY7QUFBQSxlQUNiLE1BQUksQ0FBQ3pDLHFCQUFMLENBQTJCUCxNQUEzQixFQUFtQy9CLFdBQW5DLEVBQWdEK0UsZ0JBQWhELENBRGE7QUFBQSxPQUFmLENBREssQ0FBUDtBQUtEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdlpBO0FBQUE7QUFBQSxXQXdaRSwrQkFBc0JoRCxNQUF0QixFQUE4Qi9CLFdBQTlCLEVBQTJDQyxPQUEzQyxFQUFzRTtBQUFBOztBQUFBLFVBQTNCQSxPQUEyQjtBQUEzQkEsUUFBQUEsT0FBMkIsR0FBakJwQixlQUFpQjtBQUFBOztBQUNwRWtELE1BQUFBLE1BQU0sQ0FBQ0ksZ0JBQVAsQ0FBd0JuQyxXQUF4QixFQUFxQ0MsT0FBckM7QUFDQSxhQUFPLEtBQUtzQixRQUFMLENBQWMsS0FBS2YsbUJBQUwsQ0FBeUJSLFdBQXpCLEVBQXNDQyxPQUF0QyxDQUFkLEVBQThEb0MsSUFBOUQsQ0FDTCxZQUFNO0FBQ0osWUFBTTlCLE1BQU0sR0FBRyxNQUFJLENBQUNDLG1CQUFMLENBQXlCUixXQUF6QixFQUFzQ0MsT0FBdEMsQ0FBZjs7QUFDQU0sUUFBQUEsTUFBTSxDQUFDOEQsWUFBUCxDQUFvQjVCLE9BQXBCLENBQTRCLFVBQUN0QyxPQUFELEVBQWE7QUFDdkMsY0FBSTtBQUNGQSxZQUFBQSxPQUFPLENBQUM0QixNQUFELENBQVA7QUFDRCxXQUZELENBRUUsT0FBT1osQ0FBUCxFQUFVO0FBQ1Z4RCxZQUFBQSxZQUFZLENBQUMsc0JBQUQsRUFBeUJ3RCxDQUF6QixFQUE0Qm5CLFdBQTVCLENBQVo7QUFDRDtBQUNGLFNBTkQ7QUFPRCxPQVZJLENBQVA7QUFZRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL2FBO0FBQUE7QUFBQSxXQWdiRSw2QkFBb0JBLFdBQXBCLEVBQWlDQyxPQUFqQyxFQUEwQ2dGLFFBQTFDLEVBQW9EO0FBQ2xELFVBQU1DLEdBQUcsR0FBRzVFLFlBQVksQ0FBQ04sV0FBRCxFQUFjQyxPQUFkLENBQXhCO0FBQ0EsVUFBSU0sTUFBTSxHQUFHLEtBQUtYLFdBQUwsQ0FBaUJzRixHQUFqQixDQUFiOztBQUNBLFVBQUksQ0FBQzNFLE1BQUwsRUFBYTtBQUNYLFlBQU1TLFNBQVM7QUFBRztBQUE2QjtBQUM3Q0MsVUFBQUEsUUFBUSxFQUFFLEVBRG1DO0FBRTdDK0MsVUFBQUEsUUFBUSxFQUFFO0FBRm1DLFNBQS9DO0FBSUF6RCxRQUFBQSxNQUFNO0FBQUc7QUFBbUM7QUFDMUNOLFVBQUFBLE9BQU8sRUFBUEEsT0FEMEM7QUFFMUM7QUFDQTtBQUNBQyxVQUFBQSxNQUFNLEVBQUVELE9BQU8sSUFBSW5CLGNBSnVCO0FBSzFDa0MsVUFBQUEsU0FBUyxFQUFUQSxTQUwwQztBQU0xQ1AsVUFBQUEsSUFBSSxFQUFFd0UsUUFBUSxJQUFJLEtBTndCO0FBTzFDWixVQUFBQSxZQUFZLEVBQUUsRUFQNEI7QUFRMUN0QixVQUFBQSxPQUFPLEVBQUVvQyxTQVJpQztBQVMxQ2pFLFVBQUFBLE9BQU8sRUFBRWlFLFNBVGlDO0FBVTFDOUQsVUFBQUEsTUFBTSxFQUFFOEQsU0FWa0M7QUFXMUN6RSxVQUFBQSxNQUFNLEVBQUV5RSxTQVhrQztBQVkxQy9ELFVBQUFBLEtBQUssRUFBRStELFNBWm1DO0FBYTFDM0MsVUFBQUEsYUFBYSxFQUFFMkM7QUFiMkIsU0FBNUM7QUFlQSxhQUFLdkYsV0FBTCxDQUFpQnNGLEdBQWpCLElBQXdCM0UsTUFBeEI7QUFDRDs7QUFDRCxhQUFPQSxNQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBamRBO0FBQUE7QUFBQSxXQWtkRSxvQ0FBMkI2RCxXQUEzQixFQUF3QztBQUN0QyxVQUFJLENBQUMsS0FBS3ZFLG1CQUFOLElBQTZCLENBQUN0QixPQUFPLENBQUMsS0FBS2tCLEdBQU4sQ0FBUCxDQUFrQm1CLElBQXBELEVBQTBEO0FBQ3hEeEMsUUFBQUEsR0FBRyxHQUFHZ0QsS0FBTixDQUFZeEMsR0FBWixFQUFpQix3QkFBakIsRUFBMkN3RixXQUEzQztBQUNEOztBQUNELGFBQU8sS0FBSzVELG1CQUFMLENBQ0wsS0FBS1gsbUJBQUwsSUFBNEJkLGlCQUR2QixFQUVMLEtBQUtlLHdCQUFMLElBQWlDLEVBRjVCLENBQVA7QUFJRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxlQTtBQUFBO0FBQUEsV0FtZUUsa0JBQVNTLE1BQVQsRUFBaUI7QUFDZixVQUFJLENBQUNBLE1BQU0sQ0FBQ3dDLE9BQVosRUFBcUI7QUFDbkIsWUFBSXhDLE1BQU0sQ0FBQ0csTUFBWCxFQUFtQjtBQUNqQkgsVUFBQUEsTUFBTSxDQUFDd0MsT0FBUCxHQUFpQkMsT0FBTyxDQUFDOUIsT0FBUixDQUFnQlgsTUFBTSxDQUFDUyxTQUF2QixDQUFqQjtBQUNELFNBRkQsTUFFTyxJQUFJVCxNQUFNLENBQUNhLEtBQVgsRUFBa0I7QUFDdkJiLFVBQUFBLE1BQU0sQ0FBQ3dDLE9BQVAsR0FBaUJDLE9BQU8sQ0FBQzNCLE1BQVIsQ0FBZWQsTUFBTSxDQUFDYSxLQUF0QixDQUFqQjtBQUNELFNBRk0sTUFFQTtBQUNMLGNBQU1nRSxRQUFRLEdBQUcsSUFBSTFILFFBQUosRUFBakI7QUFDQTZDLFVBQUFBLE1BQU0sQ0FBQ3dDLE9BQVAsR0FBaUJxQyxRQUFRLENBQUNyQyxPQUExQjtBQUNBeEMsVUFBQUEsTUFBTSxDQUFDVyxPQUFQLEdBQWlCa0UsUUFBUSxDQUFDbEUsT0FBMUI7QUFDQVgsVUFBQUEsTUFBTSxDQUFDYyxNQUFQLEdBQWdCK0QsUUFBUSxDQUFDL0QsTUFBekI7QUFDRDtBQUNGOztBQUNELGFBQU9kLE1BQU0sQ0FBQ3dDLE9BQWQ7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXpmQTtBQUFBO0FBQUEsV0EwZkUsd0NBQStCL0MsV0FBL0IsRUFBNENDLE9BQTVDLEVBQXFETSxNQUFyRCxFQUE2RDtBQUMzRCxVQUFJLEtBQUs4RSwwQkFBTCxDQUFnQ3JGLFdBQWhDLEVBQTZDQyxPQUE3QyxFQUFzRE0sTUFBdEQsQ0FBSixFQUFtRTtBQUNqRSxZQUFNc0MsYUFBYSxHQUFHNUUscUJBQXFCLENBQ3pDLEtBQUt3QixHQURvQyxFQUV6Q08sV0FGeUMsRUFHekNDLE9BSHlDLENBQTNDO0FBS0EsYUFBS1IsR0FBTCxDQUFTMEQsUUFBVCxDQUFrQkMsSUFBbEIsQ0FBdUJDLFdBQXZCLENBQW1DUixhQUFuQztBQUNBdEMsUUFBQUEsTUFBTSxDQUFDaUMsYUFBUCxHQUF1QixJQUF2QjtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdnQkE7QUFBQTtBQUFBLFdBOGdCRSxvQ0FBMkJ4QyxXQUEzQixFQUF3Q0MsT0FBeEMsRUFBaURNLE1BQWpELEVBQXlEO0FBQ3ZELFVBQUlBLE1BQU0sQ0FBQ0csTUFBUCxJQUFpQkgsTUFBTSxDQUFDYSxLQUE1QixFQUFtQztBQUNqQyxlQUFPLEtBQVA7QUFDRDs7QUFDRCxVQUFJYixNQUFNLENBQUNpQyxhQUFQLEtBQXlCMkMsU0FBN0IsRUFBd0M7QUFDdEMsWUFBTXZDLGFBQWEsR0FBRzFFLG1CQUFtQixDQUN2QyxLQUFLdUIsR0FEa0MsRUFFdkNPLFdBRnVDLEVBR3ZDQyxPQUh1QyxFQUl2Q00sTUFBTSxDQUFDTCxNQUpnQyxDQUF6QztBQU1BSyxRQUFBQSxNQUFNLENBQUNpQyxhQUFQLEdBQXVCSSxhQUFhLENBQUNFLE1BQWQsR0FBdUIsQ0FBOUM7QUFDRDs7QUFDRCxhQUFPLENBQUN2QyxNQUFNLENBQUNpQyxhQUFmO0FBQ0Q7QUE1aEJIOztBQUFBO0FBQUE7O0FBK2hCQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNzQyxrQkFBVCxDQUE0QnJGLEdBQTVCLEVBQWlDO0FBQ3RDZCxFQUFBQSxlQUFlLENBQUM4RCxPQUFoQixDQUF3QixVQUFDZ0IsSUFBRCxFQUFVO0FBQ2hDMUYsSUFBQUEscUJBQXFCLENBQUMwQixHQUFELEVBQU1nRSxJQUFOLENBQXJCO0FBQ0QsR0FGRDtBQUdEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTb0IsZ0NBQVQsQ0FBMENTLFNBQTFDLEVBQXFEVixRQUFyRCxFQUErRDtBQUM3RDlHLEVBQUFBLHdCQUF3QixDQUFDd0gsU0FBRCxFQUFZVixRQUFaLEVBQXNCLFNBQXRCLENBQXhCO0FBQ0E5RyxFQUFBQSx3QkFBd0IsQ0FBQ3dILFNBQUQsRUFBWVYsUUFBWixFQUFzQixXQUF0QixDQUF4QjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLFNBQVNiLFlBQVQsR0FBd0I7QUFDdEI7QUFDQSxTQUFPLEVBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU3pELFlBQVQsQ0FBc0JOLFdBQXRCLEVBQW1DQyxPQUFuQyxFQUE0QztBQUMxQyxTQUFVRCxXQUFWLFNBQXlCQyxPQUF6QjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7cmV0aHJvd0FzeW5jfSBmcm9tICcjY29yZS9lcnJvcic7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge1xuICBjb3B5RWxlbWVudFRvQ2hpbGRXaW5kb3csXG4gIHN0dWJFbGVtZW50SWZOb3RLbm93bixcbiAgdXBncmFkZU9yUmVnaXN0ZXJFbGVtZW50LFxufSBmcm9tICcuL2N1c3RvbS1lbGVtZW50LXJlZ2lzdHJ5JztcbmltcG9ydCB7Y3JlYXRlRXh0ZW5zaW9uU2NyaXB0LCBnZXRFeHRlbnNpb25TY3JpcHRzfSBmcm9tICcuL2V4dGVuc2lvbi1zY3JpcHQnO1xuaW1wb3J0IHtyZWdpc3RlckV4dGVuZGVkVGVtcGxhdGVGb3JEb2N9IGZyb20gJy4vdGVtcGxhdGUtaW1wbCc7XG5cbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXJ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcixcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyxcbn0gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7aW5zdGFsbFN0eWxlc0ZvckRvY30gZnJvbSAnLi4vc3R5bGUtaW5zdGFsbGVyJztcblxuZXhwb3J0IGNvbnN0IExFR0FDWV9FTEVNRU5UUyA9IFsnYW1wLWFkJywgJ2FtcC1lbWJlZCcsICdhbXAtdmlkZW8nXTtcbmNvbnN0IFRBRyA9ICdleHRlbnNpb25zJztcbmNvbnN0IERFRkFVTFRfVkVSU0lPTiA9ICcwLjEnO1xuY29uc3QgTEFURVNUX1ZFUlNJT04gPSAnbGF0ZXN0JztcbmNvbnN0IFVOS05PV05fRVhURU5TSU9OID0gJ19VTktOT1dOXyc7XG5jb25zdCBMT0FERVJfUFJPUCA9ICdfX0FNUF9FWFRfTERSJztcbmNvbnN0IFNDUklQVF9MT0FERURfUFJPUCA9ICdfX0FNUF9TQ1JfTE9BREVEJztcblxuLyoqXG4gKiBDb250YWlucyBkYXRhIGZvciB0aGUgZGVjbGFyYXRpb24gb2YgYSBjdXN0b20gZWxlbWVudC5cbiAqXG4gKiBAdHlwZWRlZiB7e1xuICogICBpbXBsZW1lbnRhdGlvbkNsYXNzOlxuICogICAgICAgdHlwZW9mIC4uL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudCxcbiAqICAgY3NzOiAoP3N0cmluZ3x1bmRlZmluZWQpLFxuICogfX1cbiAqL1xubGV0IEV4dGVuc2lvbkVsZW1lbnREZWY7XG5cbi8qKlxuICogQ29udGFpbnMgZGF0YSBmb3IgdGhlIGRlY2xhcmF0aW9uIG9mIGFuIGV4dGVuc2lvbiBzZXJ2aWNlLlxuICpcbiAqIEB0eXBlZGVmIHt7c2VydmljZU5hbWU6IHN0cmluZywgc2VydmljZUNsYXNzOiBmdW5jdGlvbihuZXc6T2JqZWN0LCAhLi9hbXBkb2MtaW1wbC5BbXBEb2MpfX1cbiAqL1xubGV0IEV4dGVuc2lvblNlcnZpY2VEZWY7XG5cbi8qKlxuICogVGhlIHN0cnVjdHVyZSB0aGF0IGNvbnRhaW5zIHRoZSByZXNvdXJjZXMgZGVjbGFyZWQgYnkgYW4gZXh0ZW5zaW9uLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGVsZW1lbnRzOiAhT2JqZWN0PHN0cmluZywgIUV4dGVuc2lvbkVsZW1lbnREZWY+LFxuICogICBzZXJ2aWNlczogIU9iamVjdDxzdHJpbmcsICFFeHRlbnNpb25TZXJ2aWNlRGVmPixcbiAqIH19XG4gKi9cbmxldCBFeHRlbnNpb25EZWY7XG5cbi8qKlxuICogSW50ZXJuYWwgc3RydWN0dXJlIHRoYXQgbWFpbnRhaW5zIHRoZSBzdGF0ZSBvZiBhbiBleHRlbnNpb24gdGhyb3VnaCBsb2FkaW5nLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHZlcnNpb246IHN0cmluZyxcbiAqICAgbGF0ZXN0OiBib29sZWFuLFxuICogICBleHRlbnNpb246ICFFeHRlbnNpb25EZWYsXG4gKiAgIGF1dG86IGJvb2xlYW4sXG4gKiAgIGRvY0ZhY3RvcmllczogIUFycmF5PGZ1bmN0aW9uKCEuL2FtcGRvYy1pbXBsLkFtcERvYyk+LFxuICogICBwcm9taXNlOiAoIVByb21pc2U8IUV4dGVuc2lvbkRlZj58dW5kZWZpbmVkKSxcbiAqICAgcmVzb2x2ZTogKGZ1bmN0aW9uKCFFeHRlbnNpb25EZWYpfHVuZGVmaW5lZCksXG4gKiAgIHJlamVjdDogKGZ1bmN0aW9uKCFFcnJvcil8dW5kZWZpbmVkKSxcbiAqICAgbG9hZGVkOiAoYm9vbGVhbnx1bmRlZmluZWQpLFxuICogICBlcnJvcjogKCFFcnJvcnx1bmRlZmluZWQpLFxuICogICBzY3JpcHRQcmVzZW50OiAoYm9vbGVhbnx1bmRlZmluZWQpLFxuICogfX1cbiAqIEBwcml2YXRlXG4gKi9cbmxldCBFeHRlbnNpb25Ib2xkZXJEZWY7XG5cbi8qKlxuICogSW5zdGFsbCBleHRlbnNpb25zIHNlcnZpY2UuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICogQHJlc3RyaWN0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxFeHRlbnNpb25zU2VydmljZSh3aW5kb3cpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW5kb3csICdleHRlbnNpb25zJywgRXh0ZW5zaW9ucyk7XG59XG5cbi8qKlxuICogVGhlIHNlcnZpY2VzIHRoYXQgbWFuYWdlcyBleHRlbnNpb25zIGluIHRoZSBydW50aW1lLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHRlbnNpb25zIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuYW1wZG9jU2VydmljZV8gPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUV4dGVuc2lvbkhvbGRlckRlZj59ICovXG4gICAgdGhpcy5leHRlbnNpb25zXyA9IHt9O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMuY3VycmVudEV4dGVuc2lvbklkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5jdXJyZW50RXh0ZW5zaW9uVmVyc2lvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmN1cnJlbnRFeHRlbnNpb25MYXRlc3RfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbmQgcHJvY2VzcyB0aGUgc3BlY2lmaWVkIGV4dGVuc2lvbi4gVGhlIGZhY3RvcnkgaXMgY2FsbGVkXG4gICAqIGltbWVkaWF0ZWx5LCB3aGljaCBpbiB0dXJuIGlzIGV4cGVjdGVkIHRvIHJlZ2lzdGVyIGVsZW1lbnRzLCB0ZW1wbGF0ZXMsXG4gICAqIHNlcnZpY2VzIGFuZCBkb2N1bWVudCBmYWN0b3JpZXMuIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgZXh0ZW5zaW9uJ3NcbiAgICogc2NyaXB0IGl0c2VsZiB3aGVuIGl0J3MgbG9hZGVkIHVzaW5nIHRoZSByZWd1bGFyIGBBTVAucHVzaCgpYCBjYWxsYmFjay5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4dGVuc2lvbklkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGF0ZXN0XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdCwgIU9iamVjdCl9IGZhY3RvcnlcbiAgICogQHBhcmFtIHshT2JqZWN0fSBhcmdcbiAgICogQHJlc3RyaWN0ZWRcbiAgICovXG4gIHJlZ2lzdGVyRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCB2ZXJzaW9uLCBsYXRlc3QsIGZhY3RvcnksIGFyZykge1xuICAgIGNvbnN0IGxhdGVzdEhvbGRlciA9IGxhdGVzdFxuICAgICAgPyB0aGlzLmV4dGVuc2lvbnNfW2V4dGVuc2lvbktleShleHRlbnNpb25JZCwgTEFURVNUX1ZFUlNJT04pXVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IGhvbGRlciA9IHRoaXMuZ2V0RXh0ZW5zaW9uSG9sZGVyXyhcbiAgICAgIGV4dGVuc2lvbklkLFxuICAgICAgdmVyc2lvbixcbiAgICAgIC8vIEluaGVyaXQgdGhlIGBhdXRvYCAoYXV0by1pbnN0YWxsKSBmbGFnIGZyb20gdGhlIFwibGF0ZXN0XCIgdmVyc2lvblxuICAgICAgLy8gd2hlbiBhdmFpbGFibGUuIElmIHRoZSBcImxhdGVzdFwiIGhhcyBiZWVuIGFkZGVkIGFzIGEgbm9uLWF1dG8taW5zdGFsbFxuICAgICAgLy8gdGhlbiB0aGlzIHJlZ2lzdHJhdGlvbiBzaG91bGQgbm90IGF1dG8taW5zdGFsbCBlaXRoZXIuIElmIHRoZSBudW1lcmljXG4gICAgICAvLyB2ZXJzaW9uIHdhcyBpbmRlcGVuZGVudGx5IGFkZGVkIHRvIHRoZSBkb2N1bWVudCwgdGhlbiBpdCdzIGF1dG8taW5zdGFsbFxuICAgICAgLy8gd2lsbCBiZSBwcmVzZXJ2ZWQuXG4gICAgICBsYXRlc3RIb2xkZXI/LmF1dG8gPz8gdHJ1ZVxuICAgICk7XG4gICAgaG9sZGVyLmxhdGVzdCA9IGxhdGVzdDtcblxuICAgIGlmIChob2xkZXIubG9hZGVkKSB7XG4gICAgICAvLyBUaGlzIGV4dGVuc2lvbiBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQuIFRoaXMgY291bGQgYmUgYVxuICAgICAgLy8gYSBcImxhdGVzdFwiIHNjcmlwdCByZXF1ZXN0ZWQgZm9yIGEgcHJldmlvdXNseSBsb2FkZWQgbnVtZXJpY1xuICAgICAgLy8gdmVyc2lvbiBvciB2aWNlIHZlcnNhLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlcGxhY2UgdGhlIFwibGF0ZXN0XCI6IGJvdGggbnVtZXJpY2FsIGFuZCBcImxhdGVzdFwiIHdpbGwgYmUgcG9pbnRpbmcgdG9cbiAgICAvLyB0aGUgc2FtZSByZWNvcmQuXG4gICAgaWYgKGxhdGVzdCkge1xuICAgICAgdGhpcy5leHRlbnNpb25zX1tleHRlbnNpb25LZXkoZXh0ZW5zaW9uSWQsIExBVEVTVF9WRVJTSU9OKV0gPSBob2xkZXI7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY3VycmVudEV4dGVuc2lvbklkXyA9IGV4dGVuc2lvbklkO1xuICAgICAgdGhpcy5jdXJyZW50RXh0ZW5zaW9uVmVyc2lvbl8gPSB2ZXJzaW9uO1xuICAgICAgdGhpcy5jdXJyZW50RXh0ZW5zaW9uTGF0ZXN0XyA9IGxhdGVzdDtcbiAgICAgIGZhY3RvcnkoYXJnLCBhcmdbJ18nXSk7XG4gICAgICBpZiAoZ2V0TW9kZSh0aGlzLndpbikubG9jYWxEZXYgfHwgZ2V0TW9kZSh0aGlzLndpbikudGVzdCkge1xuICAgICAgICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgICAgICAgIGNvbnN0IG0gPSBob2xkZXIuZXh0ZW5zaW9uO1xuICAgICAgICAgIG0uZWxlbWVudHMgPSBPYmplY3QuZnJlZXplKG0uZWxlbWVudHMpO1xuICAgICAgICAgIGhvbGRlci5leHRlbnNpb24gPSBPYmplY3QuZnJlZXplKG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBob2xkZXIubG9hZGVkID0gdHJ1ZTtcbiAgICAgIGhvbGRlci5yZXNvbHZlPy4oaG9sZGVyLmV4dGVuc2lvbik7XG4gICAgICBsYXRlc3RIb2xkZXI/LnJlc29sdmU/Lihob2xkZXIuZXh0ZW5zaW9uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBob2xkZXIuZXJyb3IgPSBlO1xuICAgICAgaG9sZGVyLnJlamVjdD8uKGUpO1xuICAgICAgbGF0ZXN0SG9sZGVyPy5yZWplY3Q/LihlKTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY3VycmVudEV4dGVuc2lvbklkXyA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRFeHRlbnNpb25WZXJzaW9uXyA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRFeHRlbnNpb25MYXRlc3RfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBwcmV2aW91c2x5IGluY2x1ZGVkIGV4dGVuc2lvbiB0byBjb21wbGV0ZVxuICAgKiBsb2FkaW5nL3JlZ2lzdHJhdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4dGVuc2lvbklkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9FeHRlbnNpb25EZWY+fVxuICAgKi9cbiAgd2FpdEZvckV4dGVuc2lvbihleHRlbnNpb25JZCwgdmVyc2lvbikge1xuICAgIGNvbnN0IHdhaXQgPSB0aGlzLndhaXRGb3JfKHRoaXMuZ2V0RXh0ZW5zaW9uSG9sZGVyXyhleHRlbnNpb25JZCwgdmVyc2lvbikpO1xuXG4gICAgcmV0dXJuIFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKVxuICAgICAgLnRpbWVvdXRQcm9taXNlKDE2MDAwLCB3YWl0KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgaWYgKCFlcnIubWVzc2FnZS5pbmNsdWRlcygndGltZW91dCcpKSB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG5cbiAgICAgICAgdXNlcigpLmVycm9yKFRBRywgYFdhaXRlZCBvdmVyIDE2cyB0byBsb2FkIGV4dGVuc2lvbiAke2V4dGVuc2lvbklkfS5gKTtcbiAgICAgICAgcmV0dXJuIHdhaXQ7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoZSBleHRlbnNpb24gaGFzIGJlZW5cbiAgICogbG9hZGVkLiBJZiBuZWNlc3NhcnksIGFkZHMgdGhlIGV4dGVuc2lvbiBzY3JpcHQgdG8gdGhlIHBhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHZlcnNpb25cbiAgICogQHJldHVybiB7IVByb21pc2U8IUV4dGVuc2lvbkRlZj59XG4gICAqL1xuICBwcmVsb2FkRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCB2ZXJzaW9uID0gREVGQVVMVF9WRVJTSU9OKSB7XG4gICAgaWYgKGV4dGVuc2lvbklkID09ICdhbXAtZW1iZWQnKSB7XG4gICAgICBleHRlbnNpb25JZCA9ICdhbXAtYWQnO1xuICAgIH1cbiAgICBjb25zdCBob2xkZXIgPSB0aGlzLmdldEV4dGVuc2lvbkhvbGRlcl8oZXh0ZW5zaW9uSWQsIHZlcnNpb24pO1xuICAgIHRoaXMuaW5zZXJ0RXh0ZW5zaW9uU2NyaXB0SWZOZWVkZWRfKGV4dGVuc2lvbklkLCB2ZXJzaW9uLCBob2xkZXIpO1xuICAgIHJldHVybiB0aGlzLndhaXRGb3JfKGhvbGRlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB0aGUgZXh0ZW5zaW9uIGhhcyBiZWVuXG4gICAqIGxvYWRlZC4gSWYgbmVjZXNzYXJ5LCBhZGRzIHRoZSBleHRlbnNpb24gc2NyaXB0IHRvIHRoZSBwYWdlLlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHZlcnNpb25cbiAgICogQHJldHVybiB7IVByb21pc2U8IUV4dGVuc2lvbkRlZj59XG4gICAqL1xuICBpbnN0YWxsRXh0ZW5zaW9uRm9yRG9jKGFtcGRvYywgZXh0ZW5zaW9uSWQsIHZlcnNpb24gPSBERUZBVUxUX1ZFUlNJT04pIHtcbiAgICBjb25zdCByb290Tm9kZSA9IGFtcGRvYy5nZXRSb290Tm9kZSgpO1xuICAgIGxldCBleHRMb2FkZXJzID0gcm9vdE5vZGVbTE9BREVSX1BST1BdO1xuICAgIGlmICghZXh0TG9hZGVycykge1xuICAgICAgZXh0TG9hZGVycyA9IHJvb3ROb2RlW0xPQURFUl9QUk9QXSA9IG1hcCgpO1xuICAgIH1cbiAgICBpZiAoZXh0TG9hZGVyc1tleHRlbnNpb25JZF0pIHtcbiAgICAgIHJldHVybiBleHRMb2FkZXJzW2V4dGVuc2lvbklkXTtcbiAgICB9XG4gICAgYW1wZG9jLmRlY2xhcmVFeHRlbnNpb24oZXh0ZW5zaW9uSWQsIHZlcnNpb24pO1xuICAgIHN0dWJFbGVtZW50SWZOb3RLbm93bihhbXBkb2Mud2luLCBleHRlbnNpb25JZCk7XG4gICAgcmV0dXJuIChleHRMb2FkZXJzW2V4dGVuc2lvbklkXSA9IHRoaXMucHJlbG9hZEV4dGVuc2lvbihcbiAgICAgIGV4dGVuc2lvbklkLFxuICAgICAgdmVyc2lvblxuICAgICkudGhlbigoKSA9PiB0aGlzLmluc3RhbGxFeHRlbnNpb25JbkRvYyhhbXBkb2MsIGV4dGVuc2lvbklkLCB2ZXJzaW9uKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbG9hZHMgdGhlIG5ldyB2ZXJzaW9uIG9mIHRoZSBleHRlbnNpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxhdGVzdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRXh0ZW5zaW9uRGVmPn1cbiAgICovXG4gIHJlbG9hZEV4dGVuc2lvbihleHRlbnNpb25JZCwgdmVyc2lvbiwgbGF0ZXN0KSB7XG4gICAgLy8gSWdub3JlIGluc2VydGVkIHNjcmlwdCBlbGVtZW50cyB0byBwcmV2ZW50IHJlY3Vyc2lvbi5cbiAgICBjb25zdCBlbHMgPSBnZXRFeHRlbnNpb25TY3JpcHRzKFxuICAgICAgdGhpcy53aW4sXG4gICAgICBleHRlbnNpb25JZCxcbiAgICAgIHZlcnNpb24sXG4gICAgICBsYXRlc3QsXG4gICAgICAvKiBpbmNsdWRlSW5zZXJ0ZWQgKi8gZmFsc2VcbiAgICApO1xuICAgIC8vIFRoZSBwcmV2aW91c2x5IGF3YWl0ZWQgZXh0ZW5zaW9uIGxvYWRlciBtdXN0IG5vdCBoYXZlIGZpbmlzaGVkIG9yXG4gICAgLy8gZmFpbGVkLlxuICAgIGNvbnN0IGhvbGRlciA9IHRoaXMuZXh0ZW5zaW9uc19bZXh0ZW5zaW9uS2V5KGV4dGVuc2lvbklkLCB2ZXJzaW9uKV07XG4gICAgaWYgKGhvbGRlcikge1xuICAgICAgZGV2QXNzZXJ0KCFob2xkZXIubG9hZGVkICYmICFob2xkZXIuZXJyb3IpO1xuICAgICAgaG9sZGVyLnNjcmlwdFByZXNlbnQgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzLmZvckVhY2goKGVsKSA9PlxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtbG9hZGVkLW5ldy12ZXJzaW9uJywgZXh0ZW5zaW9uSWQpXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5wcmVsb2FkRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCB2ZXJzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uSWRcbiAgICogQHBhcmFtIHtzdHJpbmc9fSB2ZXJzaW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxhdGVzdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGltcG9ydFVud3JhcHBlZCh3aW4sIGV4dGVuc2lvbklkLCB2ZXJzaW9uID0gREVGQVVMVF9WRVJTSU9OLCBsYXRlc3QgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2NyaXB0c0luSGVhZCA9IGdldEV4dGVuc2lvblNjcmlwdHMoXG4gICAgICB3aW4sXG4gICAgICBleHRlbnNpb25JZCxcbiAgICAgIHZlcnNpb24sXG4gICAgICBsYXRlc3RcbiAgICApO1xuICAgIGxldCBzY3JpcHRFbGVtZW50ID0gc2NyaXB0c0luSGVhZC5sZW5ndGggPiAwID8gc2NyaXB0c0luSGVhZFswXSA6IG51bGw7XG4gICAgbGV0IHByb21pc2U7XG4gICAgaWYgKHNjcmlwdEVsZW1lbnQpIHtcbiAgICAgIHByb21pc2UgPSBzY3JpcHRFbGVtZW50W1NDUklQVF9MT0FERURfUFJPUF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjcmlwdEVsZW1lbnQgPSBjcmVhdGVFeHRlbnNpb25TY3JpcHQodGhpcy53aW4sIGV4dGVuc2lvbklkLCB2ZXJzaW9uKTtcbiAgICAgIHByb21pc2UgPSBzY3JpcHRFbGVtZW50W1NDUklQVF9MT0FERURfUFJPUF0gPSBuZXcgUHJvbWlzZShcbiAgICAgICAgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNjcmlwdEVsZW1lbnQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgICAgICBzY3JpcHRFbGVtZW50Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB3aW4uZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHRFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgZXh0ZW5zaW9uIGVsZW1lbnQnc1xuICAgKiBjbGFzcyB3aGVuIHRoZSBleHRlbnNpb24gaGFzIGJlZW4gbG9hZGVkLiBJZiBuZWNlc3NhcnksIGFkZHMgdGhlIGV4dGVuc2lvblxuICAgKiBzY3JpcHQgdG8gdGhlIHBhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbGVtZW50TmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTx0eXBlb2YgLi4vYmFzZS1lbGVtZW50LkJhc2VFbGVtZW50Pn1cbiAgICovXG4gIGxvYWRFbGVtZW50Q2xhc3MoZWxlbWVudE5hbWUsIHZlcnNpb24gPSBERUZBVUxUX1ZFUlNJT04pIHtcbiAgICByZXR1cm4gdGhpcy5wcmVsb2FkRXh0ZW5zaW9uKGVsZW1lbnROYW1lLCB2ZXJzaW9uKS50aGVuKChleHRlbnNpb24pID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkZXZBc3NlcnQoXG4gICAgICAgIGV4dGVuc2lvbi5lbGVtZW50c1tlbGVtZW50TmFtZV0sXG4gICAgICAgICdFbGVtZW50IG5vdCBmb3VuZDogJXMnLFxuICAgICAgICBlbGVtZW50TmFtZVxuICAgICAgKTtcbiAgICAgIHJldHVybiBlbGVtZW50LmltcGxlbWVudGF0aW9uQ2xhc3M7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIGV4dGVuc2lvbiBjdXJyZW50bHkgYmVpbmcgcmVnaXN0ZXJlZC4gVGhpcyBpcyBhXG4gICAqIHJlc3RyaWN0ZWQgbWV0aG9kIGFuZCBpdCdzIGFsbG93ZWQgdG8gYmUgY2FsbGVkIG9ubHkgZHVyaW5nIHRoZSBvdmVyYWxsXG4gICAqIGV4dGVuc2lvbiByZWdpc3RyYXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7dHlwZW9mIC4uL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudH0gaW1wbGVtZW50YXRpb25DbGFzc1xuICAgKiBAcGFyYW0gez9zdHJpbmd8dW5kZWZpbmVkfSBjc3NcbiAgICogQHJlc3RyaWN0ZWRcbiAgICovXG4gIGFkZEVsZW1lbnQobmFtZSwgaW1wbGVtZW50YXRpb25DbGFzcywgY3NzKSB7XG4gICAgY29uc3QgaG9sZGVyID0gdGhpcy5nZXRDdXJyZW50RXh0ZW5zaW9uSG9sZGVyXyhuYW1lKTtcbiAgICBob2xkZXIuZXh0ZW5zaW9uLmVsZW1lbnRzW25hbWVdID0ge2ltcGxlbWVudGF0aW9uQ2xhc3MsIGNzc307XG4gICAgdGhpcy5hZGREb2NGYWN0b3J5KChhbXBkb2MpID0+IHtcbiAgICAgIHRoaXMuaW5zdGFsbEVsZW1lbnRfKGFtcGRvYywgbmFtZSwgaW1wbGVtZW50YXRpb25DbGFzcywgY3NzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0ZW1wbGF0ZSB0eXBlIHRvIHRoZSBleHRlbnNpb24gY3VycmVudGx5IGJlaW5nIHJlZ2lzdGVyZWQuIFRoaXMgaXMgYVxuICAgKiByZXN0cmljdGVkIG1ldGhvZCBhbmQgaXQncyBhbGxvd2VkIHRvIGJlIGNhbGxlZCBvbmx5IGR1cmluZyB0aGUgb3ZlcmFsbFxuICAgKiBleHRlbnNpb24gcmVnaXN0cmF0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3R5cGVvZiAuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZX0gaW1wbGVtZW50YXRpb25DbGFzc1xuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgYWRkVGVtcGxhdGUobmFtZSwgaW1wbGVtZW50YXRpb25DbGFzcykge1xuICAgIHRoaXMuYWRkRG9jRmFjdG9yeSgoYW1wZG9jKSA9PiB7XG4gICAgICByZWdpc3RlckV4dGVuZGVkVGVtcGxhdGVGb3JEb2MoYW1wZG9jLCBuYW1lLCBpbXBsZW1lbnRhdGlvbkNsYXNzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YWxscyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW1wbGVtZW50YXRpb24gaW4gdGhlIGFtcGRvYy5cbiAgICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3R5cGVvZiAuLi9iYXNlLWVsZW1lbnQuQmFzZUVsZW1lbnR9IGltcGxlbWVudGF0aW9uQ2xhc3NcbiAgICogQHBhcmFtIHs/c3RyaW5nfHVuZGVmaW5lZH0gY3NzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbnN0YWxsRWxlbWVudF8oYW1wZG9jLCBuYW1lLCBpbXBsZW1lbnRhdGlvbkNsYXNzLCBjc3MpIHtcbiAgICBpZiAoY3NzKSB7XG4gICAgICBpbnN0YWxsU3R5bGVzRm9yRG9jKFxuICAgICAgICBhbXBkb2MsXG4gICAgICAgIGNzcyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucmVnaXN0ZXJFbGVtZW50SW5XaW5kb3dfKGFtcGRvYy53aW4sIG5hbWUsIGltcGxlbWVudGF0aW9uQ2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKiBpc1J1bnRpbWVDc3MgKi8gZmFsc2UsXG4gICAgICAgIG5hbWVcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVnaXN0ZXJFbGVtZW50SW5XaW5kb3dfKGFtcGRvYy53aW4sIG5hbWUsIGltcGxlbWVudGF0aW9uQ2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3R5cGVvZiAuLi9iYXNlLWVsZW1lbnQuQmFzZUVsZW1lbnR9IGltcGxlbWVudGF0aW9uQ2xhc3NcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyRWxlbWVudEluV2luZG93Xyh3aW4sIG5hbWUsIGltcGxlbWVudGF0aW9uQ2xhc3MpIHtcbiAgICAvLyBSZWdpc3RlciB0aGUgZWxlbWVudCBpbiB0aGUgd2luZG93LlxuICAgIHVwZ3JhZGVPclJlZ2lzdGVyRWxlbWVudCh3aW4sIG5hbWUsIGltcGxlbWVudGF0aW9uQ2xhc3MpO1xuICAgIC8vIFJlZ2lzdGVyIHRoaXMgZXh0ZW5zaW9uIHRvIHJlc29sdmUgaXRzIFNlcnZpY2UgUHJvbWlzZS5cbiAgICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbiwgbmFtZSwgZW1wdHlTZXJ2aWNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzZXJ2aWNlIHRvIHRoZSBleHRlbnNpb24gY3VycmVudGx5IGJlaW5nIHJlZ2lzdGVyZWQuIFRoaXMgaXMgYVxuICAgKiByZXN0cmljdGVkIG1ldGhvZCBhbmQgaXQncyBhbGxvd2VkIHRvIGJlIGNhbGxlZCBvbmx5IGR1cmluZyB0aGUgb3ZlcmFsbFxuICAgKiBleHRlbnNpb24gcmVnaXN0cmF0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG5ldzpPYmplY3QsICEuL2FtcGRvYy1pbXBsLkFtcERvYyl9IGltcGxlbWVudGF0aW9uQ2xhc3NcbiAgICovXG4gIGFkZFNlcnZpY2UobmFtZSwgaW1wbGVtZW50YXRpb25DbGFzcykge1xuICAgIGNvbnN0IGhvbGRlciA9IHRoaXMuZ2V0Q3VycmVudEV4dGVuc2lvbkhvbGRlcl8obmFtZSk7XG4gICAgaG9sZGVyLmV4dGVuc2lvbi5zZXJ2aWNlcy5wdXNoKFxuICAgICAgLyoqIEB0eXBlIHshRXh0ZW5zaW9uU2VydmljZURlZn0gKi8gKHtcbiAgICAgICAgc2VydmljZU5hbWU6IG5hbWUsXG4gICAgICAgIHNlcnZpY2VDbGFzczogaW1wbGVtZW50YXRpb25DbGFzcyxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLmFkZERvY0ZhY3RvcnkoKGFtcGRvYykgPT4ge1xuICAgICAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICAgICAgYW1wZG9jLFxuICAgICAgICBuYW1lLFxuICAgICAgICBpbXBsZW1lbnRhdGlvbkNsYXNzLFxuICAgICAgICAvKiBpbnN0YW50aWF0ZSAqLyB0cnVlXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGFtcGRvYyBmYWN0b3J5IHRvIHRoZSBleHRlbnNpb24gY3VycmVudGx5IGJlaW5nIHJlZ2lzdGVyZWQuIFRoaXMgaXMgYVxuICAgKiByZXN0cmljdGVkIG1ldGhvZCBhbmQgaXQncyBhbGxvd2VkIHRvIGJlIGNhbGxlZCBvbmx5IGR1cmluZyB0aGUgb3ZlcmFsbFxuICAgKiBleHRlbnNpb24gcmVnaXN0cmF0aW9uLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCEuL2FtcGRvYy1pbXBsLkFtcERvYyl9IGZhY3RvcnlcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfZm9yTmFtZVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgYWRkRG9jRmFjdG9yeShmYWN0b3J5LCBvcHRfZm9yTmFtZSkge1xuICAgIGNvbnN0IGhvbGRlciA9IHRoaXMuZ2V0Q3VycmVudEV4dGVuc2lvbkhvbGRlcl8ob3B0X2Zvck5hbWUpO1xuICAgIGhvbGRlci5kb2NGYWN0b3JpZXMucHVzaChmYWN0b3J5KTtcblxuICAgIC8vIElmIGEgc2luZ2xlLWRvYyBtb2RlLCBydW4gZmFjdG9yeSByaWdodCBhd2F5IGlmIGl0J3MgaW5jbHVkZWQgYnkgdGhlIGRvYy5cbiAgICBpZiAodGhpcy5jdXJyZW50RXh0ZW5zaW9uSWRfICYmIHRoaXMuYW1wZG9jU2VydmljZV8uaXNTaW5nbGVEb2MoKSkge1xuICAgICAgY29uc3QgYW1wZG9jID0gdGhpcy5hbXBkb2NTZXJ2aWNlXy5nZXRBbXBEb2ModGhpcy53aW4uZG9jdW1lbnQpO1xuICAgICAgY29uc3QgZXh0ZW5zaW9uSWQgPSBkZXYoKS5hc3NlcnRTdHJpbmcodGhpcy5jdXJyZW50RXh0ZW5zaW9uSWRfKTtcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBkZXYoKS5hc3NlcnRTdHJpbmcodGhpcy5jdXJyZW50RXh0ZW5zaW9uVmVyc2lvbl8pO1xuICAgICAgY29uc3QgbGF0ZXN0ID0gdGhpcy5jdXJyZW50RXh0ZW5zaW9uTGF0ZXN0XyB8fCBmYWxzZTtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdvbid0IHRyaWdnZXIgZm9yIEZJRSBleHRlbnNpb25zIHRoYXQgYXJlIG5vdCBwcmVzZW50XG4gICAgICAvLyBpbiB0aGUgcGFyZW50IGRvYy5cbiAgICAgIGlmIChcbiAgICAgICAgYW1wZG9jLmRlY2xhcmVzRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCB2ZXJzaW9uKSB8fFxuICAgICAgICAobGF0ZXN0ICYmIGFtcGRvYy5kZWNsYXJlc0V4dGVuc2lvbihleHRlbnNpb25JZCwgTEFURVNUX1ZFUlNJT04pKSB8fFxuICAgICAgICBob2xkZXIuYXV0b1xuICAgICAgKSB7XG4gICAgICAgIGZhY3RvcnkoYW1wZG9jKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJlaW5zdGFsbHMgYnVpbHQtaW5zIGFuZCBsZWdhY3kgZWxlbWVudHMgaW4gdGhlIGVtZWJlZGRlZCBhbXBkb2MuXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHshQXJyYXk8e2V4dGVuc2lvbklkOiBzdHJpbmcsIGV4dGVuc2lvblZlcnNpb246IHN0cmluZ30+fSBleHRlbnNpb25zXG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBwcmVpbnN0YWxsRW1iZWQoYW1wZG9jLCBleHRlbnNpb25zKSB7XG4gICAgY29uc3QgdG9wV2luID0gdGhpcy53aW47XG4gICAgY29uc3QgY2hpbGRXaW4gPSBhbXBkb2Mud2luO1xuXG4gICAgLy8gSW5zdGFsbCBidWlsdC1pbnMgYW5kIGxlZ2FjeSBlbGVtZW50cy5cbiAgICBjb3B5QnVpbHRpbkVsZW1lbnRzVG9DaGlsZFdpbmRvdyh0b3BXaW4sIGNoaWxkV2luKTtcbiAgICBzdHViTGVnYWN5RWxlbWVudHMoY2hpbGRXaW4pO1xuXG4gICAgLy8gU3R1YiBleHRlbnNpb25zLlxuICAgIGV4dGVuc2lvbnMuZm9yRWFjaCgoe2V4dGVuc2lvbklkLCBleHRlbnNpb25WZXJzaW9ufSkgPT4ge1xuICAgICAgLy8gRGVjbGFyZSB0aGUgZXh0ZW5zaW9uIHZlcnNpb24gb24gYW1wZG9jIHNvIGl0IGRvZXNuJ3QgcmVxdWVzdCB0aGVcbiAgICAgIC8vIGV4dGVuc2lvbiBhZ2Fpbi5cbiAgICAgIGFtcGRvYy5kZWNsYXJlRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCBleHRlbnNpb25WZXJzaW9uKTtcblxuICAgICAgLy8gVGhpcyB3aWxsIGV4dGVuZCBhdXRvbWF0aWMgdXBncmFkZSBvZiBjdXN0b20gZWxlbWVudHMgZnJvbSB0b3BcbiAgICAgIC8vIHdpbmRvdyB0byB0aGUgY2hpbGQgd2luZG93LlxuICAgICAgaWYgKCFMRUdBQ1lfRUxFTUVOVFMuaW5jbHVkZXMoZXh0ZW5zaW9uSWQpKSB7XG4gICAgICAgIHN0dWJFbGVtZW50SWZOb3RLbm93bihjaGlsZFdpbiwgZXh0ZW5zaW9uSWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbGxzIGFsbCBhbXBkb2MgZmFjdG9yaWVzIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCB3aXRoXG4gICAqIGBhZGREb2NGYWN0b3J5YC5cbiAgICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0geyFBcnJheTx7ZXh0ZW5zaW9uSWQ6IHN0cmluZywgZXh0ZW5zaW9uVmVyc2lvbjogc3RyaW5nfT59IGV4dGVuc2lvbnNcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBpbnN0YWxsRXh0ZW5zaW9uc0luRG9jKGFtcGRvYywgZXh0ZW5zaW9ucykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIGV4dGVuc2lvbnMubWFwKCh7ZXh0ZW5zaW9uSWQsIGV4dGVuc2lvblZlcnNpb259KSA9PlxuICAgICAgICB0aGlzLmluc3RhbGxFeHRlbnNpb25JbkRvYyhhbXBkb2MsIGV4dGVuc2lvbklkLCBleHRlbnNpb25WZXJzaW9uKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFsbHMgYWxsIGFtcGRvYyBmYWN0b3JpZXMgZm9yIHRoZSBzcGVjaWZpZWQgZXh0ZW5zaW9uLlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHZlcnNpb25cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBpbnN0YWxsRXh0ZW5zaW9uSW5Eb2MoYW1wZG9jLCBleHRlbnNpb25JZCwgdmVyc2lvbiA9IERFRkFVTFRfVkVSU0lPTikge1xuICAgIGFtcGRvYy5kZWNsYXJlRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCB2ZXJzaW9uKTtcbiAgICByZXR1cm4gdGhpcy53YWl0Rm9yXyh0aGlzLmdldEV4dGVuc2lvbkhvbGRlcl8oZXh0ZW5zaW9uSWQsIHZlcnNpb24pKS50aGVuKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBob2xkZXIgPSB0aGlzLmdldEV4dGVuc2lvbkhvbGRlcl8oZXh0ZW5zaW9uSWQsIHZlcnNpb24pO1xuICAgICAgICBob2xkZXIuZG9jRmFjdG9yaWVzLmZvckVhY2goKGZhY3RvcnkpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmFjdG9yeShhbXBkb2MpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldGhyb3dBc3luYygnRG9jIGZhY3RvcnkgZmFpbGVkOiAnLCBlLCBleHRlbnNpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgb3IgcmV0dXJucyBhbiBleGlzdGluZyBleHRlbnNpb24gaG9sZGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uSWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2F1dG9cbiAgICogQHJldHVybiB7IUV4dGVuc2lvbkhvbGRlckRlZn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEV4dGVuc2lvbkhvbGRlcl8oZXh0ZW5zaW9uSWQsIHZlcnNpb24sIG9wdF9hdXRvKSB7XG4gICAgY29uc3Qga2V5ID0gZXh0ZW5zaW9uS2V5KGV4dGVuc2lvbklkLCB2ZXJzaW9uKTtcbiAgICBsZXQgaG9sZGVyID0gdGhpcy5leHRlbnNpb25zX1trZXldO1xuICAgIGlmICghaG9sZGVyKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSAvKiogQHR5cGUge0V4dGVuc2lvbkRlZn0gKi8gKHtcbiAgICAgICAgZWxlbWVudHM6IHt9LFxuICAgICAgICBzZXJ2aWNlczogW10sXG4gICAgICB9KTtcbiAgICAgIGhvbGRlciA9IC8qKiBAdHlwZSB7RXh0ZW5zaW9uSG9sZGVyRGVmfSAqLyAoe1xuICAgICAgICB2ZXJzaW9uLFxuICAgICAgICAvLyBVc3VhbGx5IGEgdmVyc2lvbiBzdGFydHMgXCJ1bmtub3duXCIgYW5kIHRoZSBsYXRlc3QgYmVjb21lcyBrbm93blxuICAgICAgICAvLyB3aGVuIGl0IGhhcyBiZWVuIGxvYWRlZC5cbiAgICAgICAgbGF0ZXN0OiB2ZXJzaW9uID09IExBVEVTVF9WRVJTSU9OLFxuICAgICAgICBleHRlbnNpb24sXG4gICAgICAgIGF1dG86IG9wdF9hdXRvIHx8IGZhbHNlLFxuICAgICAgICBkb2NGYWN0b3JpZXM6IFtdLFxuICAgICAgICBwcm9taXNlOiB1bmRlZmluZWQsXG4gICAgICAgIHJlc29sdmU6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVqZWN0OiB1bmRlZmluZWQsXG4gICAgICAgIGxvYWRlZDogdW5kZWZpbmVkLFxuICAgICAgICBlcnJvcjogdW5kZWZpbmVkLFxuICAgICAgICBzY3JpcHRQcmVzZW50OiB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZXh0ZW5zaW9uc19ba2V5XSA9IGhvbGRlcjtcbiAgICB9XG4gICAgcmV0dXJuIGhvbGRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBob2xkZXIgZm9yIHRoZSBleHRlbnNpb24gY3VycmVudGx5IGJlaW5nIHJlZ2lzdGVyZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2Zvck5hbWUgVXNlZCBmb3IgbG9nZ2luZyBvbmx5LlxuICAgKiBAcmV0dXJuIHshRXh0ZW5zaW9uSG9sZGVyRGVmfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Q3VycmVudEV4dGVuc2lvbkhvbGRlcl8ob3B0X2Zvck5hbWUpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudEV4dGVuc2lvbklkXyAmJiAhZ2V0TW9kZSh0aGlzLndpbikudGVzdCkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHLCAndW5rbm93biBleHRlbnNpb24gZm9yICcsIG9wdF9mb3JOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0RXh0ZW5zaW9uSG9sZGVyXyhcbiAgICAgIHRoaXMuY3VycmVudEV4dGVuc2lvbklkXyB8fCBVTktOT1dOX0VYVEVOU0lPTixcbiAgICAgIHRoaXMuY3VycmVudEV4dGVuc2lvblZlcnNpb25fIHx8ICcnXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG9yIHJldHVybnMgYW4gZXhpc3RpbmcgcHJvbWlzZSB0aGF0IHdpbGwgeWllbGQgYXMgc29vbiBhcyB0aGVcbiAgICogZXh0ZW5zaW9uIGhhcyBiZWVuIGxvYWRlZC5cbiAgICogQHBhcmFtIHshRXh0ZW5zaW9uSG9sZGVyRGVmfSBob2xkZXJcbiAgICogQHJldHVybiB7IVByb21pc2U8IUV4dGVuc2lvbkRlZj59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB3YWl0Rm9yXyhob2xkZXIpIHtcbiAgICBpZiAoIWhvbGRlci5wcm9taXNlKSB7XG4gICAgICBpZiAoaG9sZGVyLmxvYWRlZCkge1xuICAgICAgICBob2xkZXIucHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShob2xkZXIuZXh0ZW5zaW9uKTtcbiAgICAgIH0gZWxzZSBpZiAoaG9sZGVyLmVycm9yKSB7XG4gICAgICAgIGhvbGRlci5wcm9taXNlID0gUHJvbWlzZS5yZWplY3QoaG9sZGVyLmVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgICAgIGhvbGRlci5wcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgaG9sZGVyLnJlc29sdmUgPSBkZWZlcnJlZC5yZXNvbHZlO1xuICAgICAgICBob2xkZXIucmVqZWN0ID0gZGVmZXJyZWQucmVqZWN0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaG9sZGVyLnByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBzY3JpcHQgaGFzIGFscmVhZHkgYmVlbiBpbmplY3RlZCBpbiB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4dGVuc2lvbklkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gICAqIEBwYXJhbSB7IUV4dGVuc2lvbkhvbGRlckRlZn0gaG9sZGVyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbnNlcnRFeHRlbnNpb25TY3JpcHRJZk5lZWRlZF8oZXh0ZW5zaW9uSWQsIHZlcnNpb24sIGhvbGRlcikge1xuICAgIGlmICh0aGlzLmlzRXh0ZW5zaW9uU2NyaXB0UmVxdWlyZWRfKGV4dGVuc2lvbklkLCB2ZXJzaW9uLCBob2xkZXIpKSB7XG4gICAgICBjb25zdCBzY3JpcHRFbGVtZW50ID0gY3JlYXRlRXh0ZW5zaW9uU2NyaXB0KFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgZXh0ZW5zaW9uSWQsXG4gICAgICAgIHZlcnNpb25cbiAgICAgICk7XG4gICAgICB0aGlzLndpbi5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdEVsZW1lbnQpO1xuICAgICAgaG9sZGVyLnNjcmlwdFByZXNlbnQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgdGhlIG5lZWQgdG8gYWRkIGFtcCBleHRlbnNpb24gc2NyaXB0IHRvIGRvY3VtZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uSWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAgICogQHBhcmFtIHshRXh0ZW5zaW9uSG9sZGVyRGVmfSBob2xkZXJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzRXh0ZW5zaW9uU2NyaXB0UmVxdWlyZWRfKGV4dGVuc2lvbklkLCB2ZXJzaW9uLCBob2xkZXIpIHtcbiAgICBpZiAoaG9sZGVyLmxvYWRlZCB8fCBob2xkZXIuZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGhvbGRlci5zY3JpcHRQcmVzZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHNjcmlwdHNJbkhlYWQgPSBnZXRFeHRlbnNpb25TY3JpcHRzKFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgZXh0ZW5zaW9uSWQsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICAgIGhvbGRlci5sYXRlc3RcbiAgICAgICk7XG4gICAgICBob2xkZXIuc2NyaXB0UHJlc2VudCA9IHNjcmlwdHNJbkhlYWQubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgcmV0dXJuICFob2xkZXIuc2NyaXB0UHJlc2VudDtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHViTGVnYWN5RWxlbWVudHMod2luKSB7XG4gIExFR0FDWV9FTEVNRU5UUy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgc3R1YkVsZW1lbnRJZk5vdEtub3duKHdpbiwgbmFtZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIENvcHkgYnVpbHRpbnMgdG8gYSBjaGlsZCB3aW5kb3cuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpblxuICogQHBhcmFtIHshV2luZG93fSBjaGlsZFdpblxuICovXG5mdW5jdGlvbiBjb3B5QnVpbHRpbkVsZW1lbnRzVG9DaGlsZFdpbmRvdyhwYXJlbnRXaW4sIGNoaWxkV2luKSB7XG4gIGNvcHlFbGVtZW50VG9DaGlsZFdpbmRvdyhwYXJlbnRXaW4sIGNoaWxkV2luLCAnYW1wLWltZycpO1xuICBjb3B5RWxlbWVudFRvQ2hpbGRXaW5kb3cocGFyZW50V2luLCBjaGlsZFdpbiwgJ2FtcC1waXhlbCcpO1xufVxuXG4vKipcbiAqIEByZXR1cm4geyFPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGVtcHR5U2VydmljZSgpIHtcbiAgLy8gQWxsIHNlcnZpY2VzIG5lZWQgdG8gcmVzb2x2ZSB0byBhbiBvYmplY3QuXG4gIHJldHVybiB7fTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uSWRcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGV4dGVuc2lvbktleShleHRlbnNpb25JZCwgdmVyc2lvbikge1xuICByZXR1cm4gYCR7ZXh0ZW5zaW9uSWR9OiR7dmVyc2lvbn1gO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/extensions-impl.js