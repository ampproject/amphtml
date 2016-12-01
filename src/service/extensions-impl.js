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

import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
} from '../custom-element';
import {cssText} from '../../build/css';
import {dev, rethrowAsync} from '../log';
import {getMode} from '../mode';
import {fromClass, setParentWindow} from '../service';
import installCustomElements from
    'document-register-element/build/document-register-element.node';
import {install as installDocContains} from '../polyfills/document-contains';
import {
  install as installDOMTokenListToggle,
} from '../polyfills/domtokenlist-toggle';
import {installImg} from '../../builtins/amp-img';
import {installPixel} from '../../builtins/amp-pixel';
import {installStyles} from '../style-installer';
import {installVideo} from '../../builtins/amp-video';
import {urls} from '../config';


const TAG = 'extensions';
const UNKNOWN_EXTENSION = '_UNKNOWN_';

/**
 * The structure that contains the declaration of a custom element.
 *
 * @typedef {{
 *   implementationClass:
 *       function(new:../base-element.BaseElement, !Element),
 *   css: (?string|undefined),
 * }}
 */
let ExtensionElementDef;


/**
 * The structure that contains the resources declared by an extension.
 * Currently only limitted to elements.
 *
 * @typedef {{
 *   elements: !Object<string, !ExtensionElementDef>,
 * }}
 */
let ExtensionDef;


/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   extension: !ExtensionDef,
 *   docFactories: !Array<function(!./ampdoc-impl.AmpDoc)>,
 *   shadowRootFactories: !Array<function(!ShadowRoot)>,
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
 * Install extensions service.
 * @param {!Window} window
 * @return {!Extensions}
 * @restricted
 */
export function installExtensionsService(window) {
  return fromClass(window, 'extensions', Extensions);
}


/**
 * Register and process the specified extension. The factory is called
 * immediately, which in turn is expected to register elements, templates,
 * services and document factories.
 * @param {!Extensions} extensions
 * @param {string} extensionId
 * @param {function(!Object)} factory
 * @param {!Object} arg
 * @restricted
 */
export function registerExtension(extensions, extensionId, factory, arg) {
  extensions.registerExtension_(extensionId, factory, arg);
}


/**
 * Apply all registered factories to the specified ampdoc.
 * @param {!Extensions} extensions
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<string>} extensionIds
 * @return {!Promise}
 * @restricted
 */
export function installExtensionsInShadowDoc(extensions, ampdoc, extensionIds) {
  return extensions.installExtensionsInShadowDoc_(ampdoc, extensionIds);
}


/**
 * Add an element to the extension currently being registered. This is a
 * restricted method and it's allowed to be called only during the overall
 * extension registration.
 * @param {!Extensions} extensions
 * @param {string} name
 * @param {function(new:../base-element.BaseElement, !Element)}
 *     implementationClass
 * @param {?string|undefined} css
 * @restricted
 */
export function addElementToExtension(
    extensions, name, implementationClass, css) {
  extensions.addElement_(name, implementationClass, css);
}


/**
 * Add a ampdoc factory to the extension currently being registered. This is a
 * restricted method and it's allowed to be called only during the overall
 * extension registration.
 * @param {!Extensions} extensions
 * @param {function(!./ampdoc-impl.AmpDoc)} factory
 * @param {string=} opt_forName
 * @restricted
 */
export function addDocFactoryToExtension(extensions, factory, opt_forName) {
  extensions.addDocFactory_(factory, opt_forName);
}


/**
 * Add a shadow-root factory to the extension currently being registered. This
 * is a restricted method and it's allowed to be called only during the overall
 * extension registration.
 * @param {!Extensions} extensions
 * @param {function(!ShadowRoot)} factory
 * @param {string=} opt_forName
 * @restricted
 */
export function addShadowRootFactoryToExtension(extensions, factory,
    opt_forName) {
  extensions.addShadowRootFactory_(factory, opt_forName);
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

    /** @private @const {!Object<string, !ExtensionHolderDef>} */
    this.extensions_ = {};

    /** @private {?string} */
    this.currentExtensionId_ = null;
  }

  /**
   * Registers a new extension. This method is called by the extension's script
   * itself when it's loaded using the regular `AMP.push()` callback.
   * @param {string} extensionId
   * @param {function(!Object)} factory
   * @param {!Object} arg
   * @private
   * @restricted
   */
  registerExtension_(extensionId, factory, arg) {
    const holder = this.getExtensionHolder_(extensionId);
    try {
      this.currentExtensionId_ = extensionId;
      factory(arg);
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
   * @param {string} extensionId
   * @return {!Promise<!ExtensionDef>}
   */
  waitForExtension(extensionId) {
    return this.waitFor_(this.getExtensionHolder_(extensionId));
  }

  /**
   * Returns the promise that will be resolved when the extension has been
   * loaded. If necessary, adds the extension script to the page.
   * @param {string} extensionId
   * @param {boolean=} stubElement
   * @return {!Promise<!ExtensionDef>}
   */
  loadExtension(extensionId, stubElement = true) {
    if (extensionId == 'amp-embed') {
      extensionId = 'amp-ad';
    }
    const holder = this.getExtensionHolder_(extensionId);
    this.insertExtensionScriptIfNeeded_(extensionId, holder, stubElement);
    return this.waitFor_(holder);
  }

  /**
   * Returns the promise that will be resolved with the extension element's
   * class when the extension has been loaded. If necessary, adds the extension
   * script to the page.
   * @param {string} elementName
   * @return {!Promise<function(new:../base-element.BaseElement, !Element)>}
   */
  loadElementClass(elementName) {
    return this.loadExtension(elementName).then(extension => {
      const element = dev().assert(extension.elements[elementName],
          'Element not found: %s', elementName);
      return element.implementationClass;
    });
  }

  /**
   * Registers the element implementation with the current extension.
   * @param {string} name
   * @param {!Function} implementationClass
   * @param {?string|undefined} css
   * @private
   * @restricted
   */
  addElement_(name, implementationClass, css) {
    const holder = this.getCurrentExtensionHolder_(name);
    holder.extension.elements[name] = {implementationClass, css};
  }

  /**
   * Registers an ampdoc factory.
   * @param {function(!./ampdoc-impl.AmpDoc)} factory
   * @param {string=} opt_forName
   * @private
   * @restricted
   */
  addDocFactory_(factory, opt_forName) {
    const holder = this.getCurrentExtensionHolder_(opt_forName);
    holder.docFactories.push(factory);
  }

  /**
   * Registers a shadow-root factory.
   * @param {function(!ShadowRoot)} factory
   * @param {string=} opt_forName
   * @private
   * @restricted
   */
  addShadowRootFactory_(factory, opt_forName) {
    const holder = this.getCurrentExtensionHolder_(opt_forName);
    holder.shadowRootFactories.push(factory);
  }

  /**
   * Installs all ampdoc factories previously registered with
   * `addDocFactory_`.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Array<string>} extensionIds
   * @return {!Promise}
   * @private
   * @restricted
   */
  installExtensionsInShadowDoc_(ampdoc, extensionIds) {
    const promises = [];
    extensionIds.forEach(extensionId => {
      const holder = this.getExtensionHolder_(extensionId);
      promises.push(this.waitFor_(holder).then(() => {
        holder.shadowRootFactories.forEach(factory => {
          try {
            factory(/** @type {!ShadowRoot} */ (ampdoc.getRootNode()));
          } catch (e) {
            rethrowAsync('ShadowRoot factory failed: ', e, extensionId);
          }
        });
        holder.docFactories.forEach(factory => {
          try {
            factory(ampdoc);
          } catch (e) {
            rethrowAsync('Doc factory failed: ', e, extensionId);
          }
        });
      }));
    });
    return Promise.all(promises);
  }

  /**
   * Installs all shadow-root factories previously registered with
   * `addShadowRootFactory_`.
   * @param {!ShadowRoot} shadowRoot
   * @param {!Array<string>} extensionIds
   * @return {!Promise}
   * @restricted
   */
  installFactoriesInShadowRoot(shadowRoot, extensionIds) {
    const promises = [];
    extensionIds.forEach(extensionId => {
      const holder = this.getExtensionHolder_(extensionId);
      promises.push(this.waitFor_(holder).then(() => {
        holder.shadowRootFactories.forEach(factory => {
          try {
            factory(/** @type {!ShadowRoot} */ (shadowRoot));
          } catch (e) {
            rethrowAsync('ShadowRoot factory failed: ', e, extensionId);
          }
        });
      }));
    });
    return Promise.all(promises);
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
  installExtensionsInChildWindow(childWin, extensionIds,
      opt_preinstallCallback) {
    const topWin = this.win;
    const parentWin = childWin.frameElement.ownerDocument.defaultView;
    setParentWindow(childWin, parentWin);

    // Install necessary polyfills.
    installPolyfillsInChildWindow(childWin);

    // Install runtime styles.
    installStyles(childWin.document, cssText, () => {},
        /* opt_isRuntimeCss */ true, /* opt_ext */ 'amp-runtime');

    // Run pre-install callback.
    if (opt_preinstallCallback) {
      opt_preinstallCallback(childWin);
    }

    // Install built-ins.
    copyBuiltinElementsToChildWindow(childWin);

    const promises = [];
    extensionIds.forEach(extensionId => {
      // This will extend automatic upgrade of custom elements from top
      // window to the child window.
      stubElementIfNotKnown(topWin, extensionId);
      copyElementToChildWindow(childWin, extensionId);

      // Install CSS.
      const promise = this.loadExtension(extensionId).then(extension => {
        const elementDef = extension.elements[extensionId];
        if (elementDef && elementDef.css) {
          installStyles(childWin.document, elementDef.css, () => {},
              /* isRuntime */ false, extensionId);
        }
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }

  /**
   * Creates or returns an existing extension holder.
   * @param {string} extensionId
   * @return {!ExtensionHolderDef}
   * @private
   */
  getExtensionHolder_(extensionId) {
    let holder = this.extensions_[extensionId];
    if (!holder) {
      const extension = {
        elements: {},
      };
      holder = /** @type {ExtensionHolderDef} */ ({
        extension,
        docFactories: [],
        shadowRootFactories: [],
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
        this.currentExtensionId_ || UNKNOWN_EXTENSION);
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
        holder.promise = new Promise((resolve, reject) => {
          holder.resolve = resolve;
          holder.reject = reject;
        });
      }
    }
    return holder.promise;
  }

  /**
   * Ensures that the script has already been injected in the page.
   * @param {string} extensionId
   * @param {!ExtensionHolderDef} holder
   * @param {boolean} stubElement
   * @private
   */
  insertExtensionScriptIfNeeded_(extensionId, holder, stubElement) {
    if (this.isExtensionScriptRequired_(extensionId, holder)) {
      const scriptElement = this.createExtensionScript_(extensionId);
      this.win.document.head.appendChild(scriptElement);
      holder.scriptPresent = true;
      if (stubElement) {
        stubElementIfNotKnown(this.win, extensionId);
      }
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
      const scriptInHead = this.win.document.head.querySelector(
          `[custom-element="${extensionId}"]`);
      holder.scriptPresent = !!scriptInHead;
    }
    return !holder.scriptPresent;
  }

  /**
   * Create the missing amp extension HTML script element.
   * @param {string} extensionId
   * @return {!Element} Script object
   * @private
   */
  createExtensionScript_(extensionId) {
    const scriptElement = this.win.document.createElement('script');
    scriptElement.async = true;
    scriptElement.setAttribute('custom-element', extensionId);
    scriptElement.setAttribute('data-script', extensionId);
    const loc = this.win.location;
    const useCompiledJs = shouldUseCompiledJs();
    const scriptSrc = calculateExtensionScriptUrl(loc, extensionId,
        getMode().localDev, getMode().test, useCompiledJs);
    scriptElement.src = scriptSrc;
    return scriptElement;
  }
}


/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} isLocalDev
 * @param {boolean=} isTest
 * @return {string}
 */
export function calculateScriptBaseUrl(location, isLocalDev, isTest) {
  if (isLocalDev) {
    if (isTest || isMax(location) || isMin(location)) {
      return `${location.protocol}//${location.host}/dist`;
    }
  }
  return urls.cdn;
}

/**
 * Calculate script url for amp-ad.
 * @param {!Location} location The window's location
 * @param {string} extensionId
 * @param {boolean=} isLocalDev
 * @param {boolean=} isTest
 * @param {boolean=} isUsingCompiledJs
 * @return {string}
 */
export function calculateExtensionScriptUrl(location, extensionId, isLocalDev,
    isTest, isUsingCompiledJs) {
  const base = calculateScriptBaseUrl(location, isLocalDev, isTest);
  if (isLocalDev) {
    if ((isTest && !isUsingCompiledJs) || isMax(location)) {
      return `${base}/v0/${extensionId}-0.1.max.js`;
    }
    return `${base}/v0/${extensionId}-0.1.js`;
  }
  return `${base}/rtv/${getMode().rtvVersion}/v0/${extensionId}-0.1.js`;
}


/**
 * Is this path to a max (unminified) version?
 * @param {!Location} location
 * @return {boolean}
 */
function isMax(location) {
  const path = location.pathname;
  return path.indexOf('.max') >= 0 || path.substr(0, 5) == '/max/';
}

/**
 * Is this path to a minified version?
 * @param {!Location} location
 * @return {boolean}
 */
function isMin(location) {
  const path = location.pathname;
  return path.indexOf('.min') >= 0 || path.substr(0, 5) == '/min/';
}


/**
 * @return {boolean}
 */
function shouldUseCompiledJs() {
  return getMode().test && self.ampTestRuntimeConfig &&
      self.ampTestRuntimeConfig.useCompiledJs;
}


/**
 * Install builtins.
 * @param {!Window} win
 * @restricted
 */
export function installBuiltinElements(win) {
  installImg(win);
  installPixel(win);
  installVideo(win);
}

/**
 * Copy builtins to a child window.
 * @param {!Window} childWin
 */
function copyBuiltinElementsToChildWindow(childWin) {
  copyElementToChildWindow(childWin, 'amp-img');
  copyElementToChildWindow(childWin, 'amp-pixel');
  copyElementToChildWindow(childWin, 'amp-video');
}

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} childWin
 */
function installPolyfillsInChildWindow(childWin) {
  installDocContains(childWin);
  installDOMTokenListToggle(childWin);
  installCustomElements(childWin);
}
