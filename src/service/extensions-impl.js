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

import {Deferred} from '../utils/promise';
import {Services} from '../services';
import {cssText as ampDocCss} from '../../build/ampdoc.css';
import {cssText as ampElementCss} from '../../build/ampelement.css';
import {
  calculateExtensionScriptUrl,
  parseExtensionUrl,
} from './extension-location';
import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  upgradeOrRegisterElement,
} from './custom-element-registry';
import {dev, devAssert, rethrowAsync} from '../log';
import {
  getAmpdoc,
  installServiceInEmbedIfEmbeddable,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  setParentWindow,
} from '../service';
import {getMode} from '../mode';
import {install as installCustomElements} from '../polyfills/custom-elements';
import {install as installDOMTokenListToggle} from '../polyfills/domtokenlist-toggle';
import {install as installDocContains} from '../polyfills/document-contains';
import {installImg} from '../../builtins/amp-img';
import {installLayout} from '../../builtins/amp-layout';
import {installPixel} from '../../builtins/amp-pixel';
import {installCustomElements as installRegisterElement} from 'document-register-element/build/document-register-element.patched';
import {installStylesForDoc, installStylesLegacy} from '../style-installer';
import {installTimerInEmbedWindow} from './timer-impl';
import {isExperimentOn} from '../experiments';
import {map} from '../utils/object';
import {startsWith} from '../string';
import {toWin} from '../types';

const TAG = 'extensions';
const UNKNOWN_EXTENSION = '_UNKNOWN_';
const LEGACY_ELEMENTS = ['amp-ad', 'amp-embed', 'amp-video'];
const CUSTOM_TEMPLATES = ['amp-mustache'];
const LOADER_PROP = '__AMP_EXT_LDR';

/**
 * Default milliseconds to wait for all extensions to load before erroring.
 * (8 seconds is the same as the CSS boilerplate timoeout)
 * @const
 */
const LOAD_TIMEOUT = 8000;

/**
 * Contains data for the declaration of a custom element.
 *
 * @typedef {{
 *   implementationClass:
 *       function(new:../base-element.BaseElement, !Element),
 *   css: (?string|undefined),
 * }}
 */
let ExtensionElementDef;

/**
 * Contains data for the declaration of an extension service.
 *
 * @typedef {{serviceName: string, serviceClass: function(new:Object, !./ampdoc-impl.AmpDoc)}}
 */
let ExtensionServiceDef;

/**
 * The structure that contains the resources declared by an extension.
 *
 * @typedef {{
 *   elements: !Object<string, !ExtensionElementDef>,
 *   services: !Object<string, !ExtensionServiceDef>,
 * }}
 */
let ExtensionDef;

/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
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
let ExtensionHolderDef;

/**
 * @param {string} extensionId
 * @return {boolean}
 */
export function isTemplateExtension(extensionId) {
  return CUSTOM_TEMPLATES.indexOf(extensionId) >= 0;
}

/**
 * @param {string} extensionId
 * @return {boolean}
 */
function isIntermediateExtension(extensionId) {
  return startsWith(extensionId, '_');
}

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
export class Extensions {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @const @private */
    this.ampdocService_ = Services.ampdocServiceFor(win);

    /** @private @const {!Object<string, !ExtensionHolderDef>} */
    this.extensions_ = {};

    /** @private {?string} */
    this.currentExtensionId_ = null;
  }

  /**
   * Register and process the specified extension. The factory is called
   * immediately, which in turn is expected to register elements, templates,
   * services and document factories. This method is called by the extension's
   * script itself when it's loaded using the regular `AMP.push()` callback.
   * @param {string} extensionId
   * @param {function(!Object, !Object)} factory
   * @param {!Object} arg
   * @restricted
   */
  registerExtension(extensionId, factory, arg) {
    const holder = this.getExtensionHolder_(extensionId, /* auto */ true);
    try {
      this.currentExtensionId_ = extensionId;
      factory(arg, arg['_']);
      if (getMode().localDev || getMode().test) {
        if (Object.freeze) {
          const m = holder.extension;
          m.elements = Object.freeze(m.elements);
          holder.extension = Object.freeze(m);
        }
      }
      holder.loaded = true;
      if (holder.resolve) {
        holder.resolve(holder.extension);
      }
    } catch (e) {
      holder.error = e;
      if (holder.reject) {
        holder.reject(e);
      }
      throw e;
    } finally {
      this.currentExtensionId_ = null;
    }
  }

  /**
   * Waits for the previously included extension to complete
   * loading/registration.
   * @param {!Window} win
   * @param {string} extensionId
   * @param {number=} opt_timeout
   * @return {!Promise<?ExtensionDef>}
   */
  waitForExtension(win, extensionId, opt_timeout) {
    return /** @type {!Promise<?ExtensionDef>} */ (Services.timerFor(
      win
    ).timeoutPromise(
      opt_timeout || LOAD_TIMEOUT,
      this.waitFor_(this.getExtensionHolder_(extensionId, /* auto */ false)),
      `Render timeout waiting for extension ${extensionId} to be load.`
    ));
  }

  /**
   * Returns the promise that will be resolved when the extension has been
   * loaded. If necessary, adds the extension script to the page.
   * @param {string} extensionId
   * @param {string=} opt_extensionVersion
   * @return {!Promise<!ExtensionDef>}
   */
  preloadExtension(extensionId, opt_extensionVersion) {
    if (extensionId == 'amp-embed') {
      extensionId = 'amp-ad';
    }
    const holder = this.getExtensionHolder_(extensionId, /* auto */ false);
    this.insertExtensionScriptIfNeeded_(
      extensionId,
      holder,
      opt_extensionVersion
    );
    return this.waitFor_(holder);
  }

  /**
   * Returns the promise that will be resolved when the extension has been
   * loaded. If necessary, adds the extension script to the page.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {string} extensionId
   * @param {string=} opt_extensionVersion
   * @return {!Promise<!ExtensionDef>}
   */
  installExtensionForDoc(ampdoc, extensionId, opt_extensionVersion) {
    const rootNode = ampdoc.getRootNode();
    let extLoaders = rootNode[LOADER_PROP];
    if (!extLoaders) {
      extLoaders = rootNode[LOADER_PROP] = map();
    }
    if (extLoaders[extensionId]) {
      return extLoaders[extensionId];
    }
    stubElementIfNotKnown(ampdoc.win, extensionId);
    return (extLoaders[extensionId] = this.preloadExtension(
      extensionId,
      opt_extensionVersion
    ).then(() => this.installExtensionInDoc_(ampdoc, extensionId)));
  }

  /**
   * Reloads the new version of the extension.
   * @param {string} extensionId
   * @param {!Element} oldScriptElement
   * @return {!Promise<!ExtensionDef>}
   */
  reloadExtension(extensionId, oldScriptElement) {
    // "Disconnect" the old script element and extension record.
    const holder = this.extensions_[extensionId];
    if (holder) {
      devAssert(!holder.loaded && !holder.error);
      delete this.extensions_[extensionId];
    }
    oldScriptElement.removeAttribute('custom-element');
    oldScriptElement.setAttribute('i-amphtml-loaded-new-version', extensionId);
    const urlParts = parseExtensionUrl(oldScriptElement.src);
    return this.preloadExtension(extensionId, urlParts.extensionVersion);
  }

  /**
   * Returns the promise that will be resolved with the extension element's
   * class when the extension has been loaded. If necessary, adds the extension
   * script to the page.
   * @param {string} elementName
   * @return {!Promise<function(new:../base-element.BaseElement, !Element)>}
   */
  loadElementClass(elementName) {
    return this.preloadExtension(elementName).then(extension => {
      const element = devAssert(
        extension.elements[elementName],
        'Element not found: %s',
        elementName
      );
      return element.implementationClass;
    });
  }

  /**
   * Add an element to the extension currently being registered. This is a
   * restricted method and it's allowed to be called only during the overall
   * extension registration.
   * @param {string} name
   * @param {function(new:../base-element.BaseElement, !Element)} implementationClass
   * @param {?string|undefined} css
   * @restricted
   */
  addElement(name, implementationClass, css) {
    const holder = this.getCurrentExtensionHolder_(name);
    holder.extension.elements[name] = {implementationClass, css};
    this.addDocFactory(ampdoc => {
      this.installElement_(ampdoc, name, implementationClass, css);
    });
  }

  /**
   * Installs the specified element implementation in the ampdoc.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {string} name
   * @param {!Function} implementationClass
   * @param {?string|undefined} css
   * @private
   */
  installElement_(ampdoc, name, implementationClass, css) {
    if (css) {
      installStylesForDoc(
        ampdoc,
        css,
        () => {
          this.registerElementInWindow_(ampdoc.win, name, implementationClass);
        },
        /* isRuntimeCss */ false,
        name
      );
    } else {
      this.registerElementInWindow_(ampdoc.win, name, implementationClass);
    }
  }

  /**
   * @param {!Window} win
   * @param {string} name
   * @param {!Function} implementationClass
   * @private
   */
  registerElementInWindow_(win, name, implementationClass) {
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
  addService(name, implementationClass) {
    const holder = this.getCurrentExtensionHolder_();
    holder.extension.services.push(
      /** @type {!ExtensionServiceDef} */ ({
        serviceName: name,
        serviceClass: implementationClass,
      })
    );
    this.addDocFactory(ampdoc => {
      registerServiceBuilderForDoc(
        ampdoc,
        name,
        implementationClass,
        /* instantiate */ true
      );
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
  addDocFactory(factory, opt_forName) {
    const holder = this.getCurrentExtensionHolder_(opt_forName);
    holder.docFactories.push(factory);

    // If a single-doc mode, run factory right away if it's included by the doc.
    if (this.currentExtensionId_ && this.ampdocService_.isSingleDoc()) {
      const ampdoc = this.ampdocService_.getAmpDoc(this.win.document);
      const extensionId = dev().assertString(this.currentExtensionId_);
      // Note that this won't trigger for FIE extensions that are not present
      // in the parent doc.
      if (ampdoc.declaresExtension(extensionId) || holder.auto) {
        factory(ampdoc);
      }
    }
  }

  /**
   * Installs all ampdoc factories previously registered with
   * `addDocFactory`.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Array<string>} extensionIds
   * @return {!Promise}
   * @restricted
   */
  installExtensionsInDoc(ampdoc, extensionIds) {
    const promises = [];
    extensionIds.forEach(extensionId => {
      promises.push(this.installExtensionInDoc_(ampdoc, extensionId));
    });
    return Promise.all(promises);
  }

  /**
   * Installs all ampdoc factories for the specified extension.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {string} extensionId
   * @return {!Promise}
   * @private
   */
  installExtensionInDoc_(ampdoc, extensionId) {
    const holder = this.getExtensionHolder_(extensionId, /* auto */ false);
    return this.waitFor_(holder).then(() => {
      ampdoc.declareExtension(extensionId);
      holder.docFactories.forEach(factory => {
        try {
          factory(ampdoc);
        } catch (e) {
          rethrowAsync('Doc factory failed: ', e, extensionId);
        }
      });
    });
  }

  /**
   * Install extensions in the child window (friendly iframe). The pre-install
   * callback, if specified, is executed after polyfills have been configured
   * but before the first extension is installed.
   * @param {!Window} childWin
   * @param {!Array<string>} extensionIds
   * @param {function(!Window)=} opt_preinstallCallback
   * @return {!Promise}
   * @restricted
   */
  installExtensionsInChildWindow(
    childWin,
    extensionIds,
    opt_preinstallCallback
  ) {
    const topWin = this.win;
    const parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
    setParentWindow(childWin, parentWin);

    // Install necessary polyfills.
    installPolyfillsInChildWindow(parentWin, childWin);

    // Install runtime styles.
    installStylesLegacy(
      childWin.document,
      // TODO(lannka): remove ampDocCss for FIE rendering #22418
      ampDocCss + ampElementCss,
      /* callback */ null,
      /* opt_isRuntimeCss */ true,
      /* opt_ext */ 'amp-runtime'
    );

    // Run pre-install callback.
    if (opt_preinstallCallback) {
      opt_preinstallCallback(childWin);
    }

    // Install embeddable standard services.
    installStandardServicesInEmbed(childWin);

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    const promises = [];
    extensionIds.forEach(extensionId => {
      // This will extend automatic upgrade of custom elements from top
      // window to the child window.
      if (!LEGACY_ELEMENTS.includes(extensionId)) {
        stubElementIfNotKnown(childWin, extensionId);
      }

      // Install CSS.
      const promise = this.preloadExtension(extensionId).then(extension => {
        // Adopt embeddable extension services.
        extension.services.forEach(service => {
          installServiceInEmbedIfEmbeddable(childWin, service.serviceClass);
        });

        // Adopt the custom elements.
        let elementPromises = null;
        for (const elementName in extension.elements) {
          const elementDef = extension.elements[elementName];
          const elementPromise = new Promise(resolve => {
            if (elementDef.css) {
              installStylesLegacy(
                childWin.document,
                elementDef.css,
                /* completeCallback */ resolve,
                /* isRuntime */ false,
                extensionId
              );
            } else {
              resolve();
            }
          }).then(() => {
            upgradeOrRegisterElement(
              childWin,
              elementName,
              elementDef.implementationClass
            );
          });
          if (elementPromises) {
            elementPromises.push(elementPromise);
          } else {
            elementPromises = [elementPromise];
          }
        }
        if (elementPromises) {
          return Promise.all(elementPromises).then(() => extension);
        }
        return extension;
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }

  /**
   * Creates or returns an existing extension holder.
   * @param {string} extensionId
   * @param {boolean} auto
   * @return {!ExtensionHolderDef}
   * @private
   */
  getExtensionHolder_(extensionId, auto) {
    let holder = this.extensions_[extensionId];
    if (!holder) {
      const extension = /** @type {ExtensionDef} */ ({
        elements: {},
        services: [],
      });
      holder = /** @type {ExtensionHolderDef} */ ({
        extension,
        auto,
        docFactories: [],
        promise: undefined,
        resolve: undefined,
        reject: undefined,
        loaded: undefined,
        error: undefined,
        scriptPresent: undefined,
      });
      this.extensions_[extensionId] = holder;
    }
    return holder;
  }

  /**
   * Returns the holder for the extension currently being registered.
   * @param {string=} opt_forName Used for logging only.
   * @return {!ExtensionHolderDef}
   * @private
   */
  getCurrentExtensionHolder_(opt_forName) {
    if (!this.currentExtensionId_ && !getMode().test) {
      dev().error(TAG, 'unknown extension for ', opt_forName);
    }
    return this.getExtensionHolder_(
      this.currentExtensionId_ || UNKNOWN_EXTENSION,
      /* auto */ true
    );
  }

  /**
   * Creates or returns an existing promise that will yield as soon as the
   * extension has been loaded.
   * @param {!ExtensionHolderDef} holder
   * @return {!Promise<!ExtensionDef>}
   * @private
   */
  waitFor_(holder) {
    if (!holder.promise) {
      if (holder.loaded) {
        holder.promise = Promise.resolve(holder.extension);
      } else if (holder.error) {
        holder.promise = Promise.reject(holder.error);
      } else {
        const deferred = new Deferred();
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
   * @param {!ExtensionHolderDef} holder
   * @param {string=} opt_extensionVersion
   * @private
   */
  insertExtensionScriptIfNeeded_(extensionId, holder, opt_extensionVersion) {
    if (this.isExtensionScriptRequired_(extensionId, holder)) {
      const scriptElement = this.createExtensionScript_(
        extensionId,
        opt_extensionVersion
      );
      this.win.document.head.appendChild(scriptElement);
      holder.scriptPresent = true;
    }
  }

  /**
   * Determine the need to add amp extension script to document.
   * @param {string} extensionId
   * @param {!ExtensionHolderDef} holder
   * @return {boolean}
   * @private
   */
  isExtensionScriptRequired_(extensionId, holder) {
    if (holder.loaded || holder.error) {
      return false;
    }
    if (holder.scriptPresent === undefined) {
      const scriptInHead = this.win.document.head./*OK*/ querySelector(
        `[custom-element="${extensionId}"]`
      );
      holder.scriptPresent = !!scriptInHead;
    }
    return !holder.scriptPresent;
  }

  /**
   * Create the missing amp extension HTML script element.
   * @param {string} extensionId
   * @param {string=} opt_extensionVersion
   * @return {!Element} Script object
   * @private
   */
  createExtensionScript_(extensionId, opt_extensionVersion) {
    const scriptElement = this.win.document.createElement('script');
    scriptElement.async = true;
    if (isIntermediateExtension(extensionId)) {
      opt_extensionVersion = '';
    } else {
      scriptElement.setAttribute(
        isTemplateExtension(extensionId) ? 'custom-template' : 'custom-element',
        extensionId
      );
    }
    scriptElement.setAttribute('data-script', extensionId);
    scriptElement.setAttribute('i-amphtml-inserted', '');
    let loc = this.win.location;
    if (getMode().test && this.win.testLocation) {
      loc = this.win.testLocation;
    }
    const scriptSrc = calculateExtensionScriptUrl(
      loc,
      extensionId,
      opt_extensionVersion,
      getMode().localDev
    );
    scriptElement.src = scriptSrc;
    return scriptElement;
  }
}

/**
 * Install builtins.
 * @param {!Window} win
 * @restricted
 */
export function installBuiltinElements(win) {
  installImg(win);
  installPixel(win);
  installLayout(win);
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
 * @param {!Window} win
 */
export function stubLegacyElements(win) {
  LEGACY_ELEMENTS.forEach(name => {
    stubElementIfNotKnown(win, name);
  });
}

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} parentWin
 * @param {!Window} childWin
 * @suppress {suspiciousCode}
 */
function installPolyfillsInChildWindow(parentWin, childWin) {
  installDocContains(childWin);
  installDOMTokenListToggle(childWin);
  // TODO(jridgewell): Ship custom-elements-v1. For now, we use this hack so it
  // is DCE'd from production builds. Note: When the hack is removed, remove the
  // @suppress {suspiciousCode} annotation at the top of this function.
  if (
    (false && isExperimentOn(parentWin, 'custom-elements-v1')) ||
    getMode().test
  ) {
    installCustomElements(childWin);
  } else {
    installRegisterElement(childWin, 'auto');
  }
}

/**
 * Adopt predefined core services for the child window (friendly iframe).
 * @param {!Window} childWin
 * @visibleForTesting
 */
export function installStandardServicesInEmbed(childWin) {
  const frameElement = dev().assertElement(
    childWin.frameElement,
    'frameElement not found for embed'
  );
  const standardServices = [
    // The order of service adoptations is important.
    Services.urlForDoc(frameElement),
    Services.actionServiceForDoc(frameElement),
    Services.standardActionsForDoc(frameElement),
    Services.navigationForDoc(frameElement),
  ];
  const ampdoc = getAmpdoc(frameElement);
  standardServices.forEach(service => {
    // Static functions must be invoked on the class, not the instance.
    service.constructor.installInEmbedWindow(childWin, ampdoc);
  });
  installTimerInEmbedWindow(childWin);
}

/**
 * @return {!Object}
 */
function emptyService() {
  // All services need to resolve to an object.
  return {};
}
