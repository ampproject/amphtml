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
  adoptServiceForEmbed,
  adoptServiceForEmbedIfEmbeddable,
  registerServiceBuilder,
  setParentWindow,
} from '../service';
import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  stubElementInChildWindow,
  upgradeElementInChildWindow,
} from '../custom-element';
import {cssText} from '../../build/css';
import {dev, rethrowAsync} from '../log';
import {getMode} from '../mode';
import installCustomElements from
    'document-register-element/build/document-register-element.node';
import {install as installDocContains} from '../polyfills/document-contains';
import {
  install as installDOMTokenListToggle,
} from '../polyfills/domtokenlist-toggle';
import {installImg} from '../../builtins/amp-img';
import {installPixel} from '../../builtins/amp-pixel';
import {installStyles} from '../style-installer';
import {calculateExtensionScriptUrl} from './extension-location';

const TAG = 'extensions';
const UNKNOWN_EXTENSION = '_UNKNOWN_';
const LEGACY_ELEMENTS = ['amp-ad', 'amp-embed', 'amp-video'];

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
 *
 * @typedef {{
 *   elements: !Object<string, !ExtensionElementDef>,
 *   services: !Array<string>,
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
 * @restricted
 */
export function installExtensionsService(window) {
  registerServiceBuilder(window, 'extensions', Extensions);
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
 * Add a service to the extension currently being registered. This is a
 * restricted method and it's allowed to be called only during the overall
 * extension registration.
 * @param {!Extensions} extensions
 * @param {string} name
 * @restricted
 */
export function addServiceToExtension(extensions, name) {
  extensions.addService_(name);
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
   * Adds `name` to the list of services registered by the current extension.
   * @param {string} name
   */
  addService_(name) {
    const holder = this.getCurrentExtensionHolder_();
    holder.extension.services.push(name);
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

    // Adopt embeddable services.
    adoptStandardServicesForEmbed(childWin);

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    const promises = [];
    extensionIds.forEach(extensionId => {
      // This will extend automatic upgrade of custom elements from top
      // window to the child window.
      stubElementIfNotKnown(topWin, extensionId);
      if (!LEGACY_ELEMENTS.includes(extensionId)) {
        stubElementInChildWindow(childWin, extensionId);
      }

      // Install CSS.
      const promise = this.loadExtension(extensionId).then(extension => {
        // Adopt embeddable extension services.
        extension.services.forEach(service => {
          adoptServiceForEmbedIfEmbeddable(childWin, service);
        });

        // Adopt the custom element.
        const elementDef = extension.elements[extensionId];
        if (elementDef && elementDef.css) {
          return new Promise(resolve => {
            installStyles(
                childWin.document,
                /** @type {string} */ (elementDef.css),
                /* completeCallback */ resolve,
                /* isRuntime */ false,
                extensionId);
          }).then(() => extension); // Forward `extension` to chained Promise.
        }
        return extension;
      }).then(extension => {
        // Notice that stubbing happens much sooner above
        // (see stubElementInChildWindow).
        Object.keys(extension.elements).forEach(element => {
          upgradeElementInChildWindow(topWin, childWin, element);
        });
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
      const extension = /** @type {ExtensionDef} */ ({
        elements: {},
        services: [],
      });
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
      const scriptInHead = this.win.document.head./*OK*/querySelector(
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
    scriptElement.setAttribute('i-amphtml-inserted', '');
    let loc = this.win.location;
    if (getMode().test && this.win.testLocation) {
      loc = this.win.testLocation;
    }
    const scriptSrc = calculateExtensionScriptUrl(loc, extensionId,
        getMode().localDev);
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
 * @param {!Window} childWin
 */
function installPolyfillsInChildWindow(childWin) {
  installDocContains(childWin);
  installDOMTokenListToggle(childWin);
  installCustomElements(childWin, 'auto');
}


/**
 * Adopt predefined core services for the child window (friendly iframe).
 * @param {!Window} childWin
 */
function adoptStandardServicesForEmbed(childWin) {
  // The order of service adoptations is important.
  // TODO(dvoytenko): Refactor service registration if this set becomes
  // to pass the "embeddable" flag if this set becomes too unwieldy.
  adoptServiceForEmbed(childWin, 'action');
  adoptServiceForEmbed(childWin, 'standard-actions');
  adoptServiceForEmbed(childWin, 'clickhandler');
}
