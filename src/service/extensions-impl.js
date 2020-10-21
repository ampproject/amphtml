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
import {
  calculateExtensionScriptUrl,
  parseExtensionUrl,
} from './extension-location';
import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  upgradeOrRegisterElement,
} from './custom-element-registry';
import {dev, devAssert, rethrowAsync, user} from '../log';
import {getMode} from '../mode';
import {installStylesForDoc} from '../style-installer';
import {map} from '../utils/object';
import {registerServiceBuilder, registerServiceBuilderForDoc} from '../service';

export const LEGACY_ELEMENTS = ['amp-ad', 'amp-embed', 'amp-video'];
const TAG = 'extensions';
const UNKNOWN_EXTENSION = '_UNKNOWN_';
const CUSTOM_TEMPLATES = ['amp-mustache'];
const LOADER_PROP = '__AMP_EXT_LDR';

/**
 * Default milliseconds to wait for all extensions to load before erroring.
 * (8 seconds is the same as the CSS boilerplate timoeout)
 * @const
 */
const LOAD_TIMEOUT = 16000;

/**
 * Contains data for the declaration of a custom element.
 *
 * @typedef {{
 *   implementationClass:
 *       typeof ../base-element.BaseElement,
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
  return extensionId.startsWith('_');
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
      if (getMode(this.win).localDev || getMode(this.win).test) {
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
    ).then(() => this.installExtensionInDoc(ampdoc, extensionId)));
  }

  /**
   * Reloads the new version of the extension.
   * @param {string} extensionId
   * @return {?Promise<!ExtensionDef>}
   */
  reloadExtension(extensionId) {
    // Ignore inserted script elements to prevent recursion.
    const els = this.getExtensionScripts_(
      extensionId,
      /* includeInserted */ false
    );
    if (!els.length) {
      const TAG = 'reloadExtension';
      user().error(
        TAG,
        'Extension script for "%s" is missing or was already reloaded.',
        extensionId
      );
      return null;
    }
    // The previously awaited extension loader must not have finished or
    // failed.
    const holder = this.extensions_[extensionId];
    if (holder) {
      devAssert(!holder.loaded && !holder.error);
      holder.scriptPresent = false;
    }
    els.forEach((el) =>
      el.setAttribute('i-amphtml-loaded-new-version', extensionId)
    );
    const urlParts = parseExtensionUrl(els[0].src);
    return this.preloadExtension(extensionId, urlParts.extensionVersion);
  }

  /**
   * Returns the extension <script> element and attribute for the given
   * extension ID, if it exists. Otherwise, returns null.
   * @param {string} extensionId
   * @param {boolean=} includeInserted If true, includes script elements that
   *   are inserted by the runtime dynamically. Default is true.
   * @return {!Array<!Element>}
   * @private
   */
  getExtensionScripts_(extensionId, includeInserted = true) {
    // Always ignore <script> elements that have a mismatched RTV.
    const modifier =
      ':not([i-amphtml-loaded-new-version])' +
      (includeInserted ? '' : ':not([i-amphtml-inserted])');
    // We have to match against "src" because a few extensions, such as
    // "amp-viewer-integration", do not have "custom-element" attribute.
    const matches = this.win.document.head./*OK*/ querySelectorAll(
      `script[src*="/${extensionId}-"]` + modifier
    );
    const filtered = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const urlParts = parseExtensionUrl(match.src);
      if (urlParts.extensionId === extensionId) {
        filtered.push(match);
      }
    }
    return filtered;
  }

  /**
   * Returns the promise that will be resolved with the extension element's
   * class when the extension has been loaded. If necessary, adds the extension
   * script to the page.
   * @param {string} elementName
   * @return {!Promise<typeof ../base-element.BaseElement>}
   */
  loadElementClass(elementName) {
    return this.preloadExtension(elementName).then((extension) => {
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
   * @param {typeof ../base-element.BaseElement} implementationClass
   * @param {?string|undefined} css
   * @restricted
   */
  addElement(name, implementationClass, css) {
    const holder = this.getCurrentExtensionHolder_(name);
    holder.extension.elements[name] = {implementationClass, css};
    this.addDocFactory((ampdoc) => {
      this.installElement_(ampdoc, name, implementationClass, css);
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
   * @param {typeof ../base-element.BaseElement} implementationClass
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
    this.addDocFactory((ampdoc) => {
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
   * Preinstalls built-ins and legacy elements in the emebedded ampdoc.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Array<string>} extensionIds
   * @restricted
   */
  preinstallEmbed(ampdoc, extensionIds) {
    const topWin = this.win;
    const childWin = ampdoc.win;

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    // Stub extensions.
    extensionIds.forEach((extensionId) => {
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
   * @param {!Array<string>} extensionIds
   * @return {!Promise}
   * @restricted
   */
  installExtensionsInDoc(ampdoc, extensionIds) {
    return Promise.all(
      extensionIds.map((extensionId) =>
        this.installExtensionInDoc(ampdoc, extensionId)
      )
    );
  }

  /**
   * Installs all ampdoc factories for the specified extension.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {string} extensionId
   * @return {!Promise}
   */
  installExtensionInDoc(ampdoc, extensionId) {
    const holder = this.getExtensionHolder_(extensionId, /* auto */ false);
    return this.waitFor_(holder).then(() => {
      ampdoc.declareExtension(extensionId);
      holder.docFactories.forEach((factory) => {
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
    if (!this.currentExtensionId_ && !getMode(this.win).test) {
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
      const scriptsInHead = this.getExtensionScripts_(extensionId);
      holder.scriptPresent = scriptsInHead.length > 0;
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
        this.attributeForExtension_(extensionId),
        extensionId
      );
    }
    scriptElement.setAttribute('data-script', extensionId);
    scriptElement.setAttribute('i-amphtml-inserted', '');
    if (getMode().esm) {
      scriptElement.setAttribute('type', 'module');
    }

    // Propagate nonce to all generated script tags.
    const currentScript = this.win.document.head.querySelector('script[nonce]');
    if (currentScript) {
      scriptElement.setAttribute('nonce', currentScript.getAttribute('nonce'));
    }

    // Allow error information to be collected
    // https://github.com/ampproject/amphtml/issues/7353
    scriptElement.setAttribute('crossorigin', 'anonymous');
    let loc = this.win.location;
    if (getMode(this.win).test && this.win.testLocation) {
      loc = this.win.testLocation;
    }
    const scriptSrc = calculateExtensionScriptUrl(
      loc,
      extensionId,
      opt_extensionVersion,
      getMode(this.win).localDev
    );
    scriptElement.src = scriptSrc;
    return scriptElement;
  }

  /**
   * @param {string} extensionId
   * @return {string}
   * @private
   */
  attributeForExtension_(extensionId) {
    return isTemplateExtension(extensionId)
      ? 'custom-template'
      : 'custom-element';
  }
}

/**
 * @param {!Window} win
 */
export function stubLegacyElements(win) {
  LEGACY_ELEMENTS.forEach((name) => {
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
