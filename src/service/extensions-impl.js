import {Deferred} from '#core/data-structures/promise';
import {rethrowAsync} from '#core/error';
import {map} from '#core/types/object';

import {Services} from '#service';

import {dev, devAssert, user} from '#utils/log';

import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  upgradeOrRegisterElement,
} from './custom-element-registry';
import {createExtensionScript, getExtensionScripts} from './extension-script';
import {registerExtendedTemplateForDoc} from './template-impl';

import {getMode} from '../mode';
import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
} from '../service-helpers';
import {installStylesForDoc} from '../style-installer';

export const LEGACY_ELEMENTS = ['amp-ad', 'amp-embed', 'amp-video'];
const TAG = 'extensions';
const DEFAULT_VERSION = '0.1';
const LATEST_VERSION = 'latest';
const UNKNOWN_EXTENSION = '_UNKNOWN_';
const LOADER_PROP = '__AMP_EXT_LDR';
const SCRIPT_LOADED_PROP = '__AMP_SCR_LOADED';

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
 *   elements: !{[key: string]: !ExtensionElementDef},
 *   services: !{[key: string]: !ExtensionServiceDef},
 * }}
 */
let ExtensionDef;

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

    /** @private @const {!{[key: string]: !ExtensionHolderDef}} */
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
  registerExtension(extensionId, version, latest, factory, arg) {
    const latestHolder = latest
      ? this.extensions_[extensionKey(extensionId, LATEST_VERSION)]
      : null;
    const holder = this.getExtensionHolder_(
      extensionId,
      version,
      // Inherit the `auto` (auto-install) flag from the "latest" version
      // when available. If the "latest" has been added as a non-auto-install
      // then this registration should not auto-install either. If the numeric
      // version was independently added to the document, then it's auto-install
      // will be preserved.
      latestHolder?.auto ?? true
    );
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
          const m = holder.extension;
          m.elements = Object.freeze(m.elements);
          holder.extension = Object.freeze(m);
        }
      }
      holder.loaded = true;
      holder.resolve?.(holder.extension);
      latestHolder?.resolve?.(holder.extension);
    } catch (e) {
      holder.error = e;
      holder.reject?.(e);
      latestHolder?.reject?.(e);
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
  waitForExtension(extensionId, version) {
    const wait = this.waitFor_(this.getExtensionHolder_(extensionId, version));

    return Services.timerFor(this.win)
      .timeoutPromise(16000, wait)
      .catch((err) => {
        if (!err.message.includes('timeout')) {
          throw err;
        }

        user().error(TAG, `Waited over 16s to load extension ${extensionId}.`);
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
  preloadExtension(extensionId, version = DEFAULT_VERSION) {
    if (extensionId == 'amp-embed') {
      extensionId = 'amp-ad';
    }
    const holder = this.getExtensionHolder_(extensionId, version);
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
  installExtensionForDoc(ampdoc, extensionId, version = DEFAULT_VERSION) {
    const rootNode = ampdoc.getRootNode();
    let extLoaders = rootNode[LOADER_PROP];
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
      version
    ).then(() => this.installExtensionInDoc(ampdoc, extensionId, version)));
  }

  /**
   * Reloads the new version of the extension.
   * @param {string} extensionId
   * @param {string} version
   * @param {boolean} latest
   * @return {!Promise<!ExtensionDef>}
   */
  reloadExtension(extensionId, version, latest) {
    // Ignore inserted script elements to prevent recursion.
    const els = getExtensionScripts(
      this.win,
      extensionId,
      version,
      latest,
      /* includeInserted */ false
    );
    // The previously awaited extension loader must not have finished or
    // failed.
    const holder = this.extensions_[extensionKey(extensionId, version)];
    if (holder) {
      devAssert(!holder.loaded && !holder.error);
      holder.scriptPresent = false;
    }
    els.forEach((el) =>
      el.setAttribute('i-amphtml-loaded-new-version', extensionId)
    );
    return this.preloadExtension(extensionId, version);
  }

  /**
   * @param {!Window} win
   * @param {string} extensionId
   * @param {string=} version
   * @param {boolean=} latest
   * @return {!Promise}
   */
  importUnwrapped(win, extensionId, version = DEFAULT_VERSION, latest = true) {
    const scriptsInHead = getExtensionScripts(
      win,
      extensionId,
      version,
      latest
    );
    let scriptElement = scriptsInHead.length > 0 ? scriptsInHead[0] : null;
    let promise;
    if (scriptElement) {
      promise = scriptElement[SCRIPT_LOADED_PROP];
    } else {
      scriptElement = createExtensionScript(this.win, extensionId, version);
      promise = scriptElement[SCRIPT_LOADED_PROP] = new Promise(
        (resolve, reject) => {
          scriptElement.onload = resolve;
          scriptElement.onerror = reject;
        }
      );
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
  loadElementClass(elementName, version = DEFAULT_VERSION) {
    return this.preloadExtension(elementName, version).then((extension) => {
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
   * Add a template type to the extension currently being registered. This is a
   * restricted method and it's allowed to be called only during the overall
   * extension registration.
   * @param {string} name
   * @param {typeof ../base-template.BaseTemplate} implementationClass
   * @restricted
   */
  addTemplate(name, implementationClass) {
    this.addDocFactory((ampdoc) => {
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
    const holder = this.getCurrentExtensionHolder_(name);
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
      const version = dev().assertString(this.currentExtensionVersion_);
      const latest = this.currentExtensionLatest_ || false;
      // Note that this won't trigger for FIE extensions that are not present
      // in the parent doc.
      if (
        ampdoc.declaresExtension(extensionId, version) ||
        (latest && ampdoc.declaresExtension(extensionId, LATEST_VERSION)) ||
        holder.auto
      ) {
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
  preinstallEmbed(ampdoc, extensions) {
    const topWin = this.win;
    const childWin = ampdoc.win;

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    // Stub extensions.
    extensions.forEach(({extensionId, extensionVersion}) => {
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
  installExtensionsInDoc(ampdoc, extensions) {
    return Promise.all(
      extensions.map(({extensionId, extensionVersion}) =>
        this.installExtensionInDoc(ampdoc, extensionId, extensionVersion)
      )
    );
  }

  /**
   * Installs all ampdoc factories for the specified extension.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {string} extensionId
   * @param {string=} version
   * @return {!Promise}
   */
  installExtensionInDoc(ampdoc, extensionId, version = DEFAULT_VERSION) {
    ampdoc.declareExtension(extensionId, version);
    return this.waitFor_(this.getExtensionHolder_(extensionId, version)).then(
      () => {
        const holder = this.getExtensionHolder_(extensionId, version);
        holder.docFactories.forEach((factory) => {
          try {
            factory(ampdoc);
          } catch (e) {
            rethrowAsync('Doc factory failed: ', e, extensionId);
          }
        });
      }
    );
  }

  /**
   * Creates or returns an existing extension holder.
   * @param {string} extensionId
   * @param {string} version
   * @param {boolean=} opt_auto
   * @return {!ExtensionHolderDef}
   * @private
   */
  getExtensionHolder_(extensionId, version, opt_auto) {
    const key = extensionKey(extensionId, version);
    let holder = this.extensions_[key];
    if (!holder) {
      const extension = /** @type {ExtensionDef} */ ({
        elements: {},
        services: [],
      });
      holder = /** @type {ExtensionHolderDef} */ ({
        version,
        // Usually a version starts "unknown" and the latest becomes known
        // when it has been loaded.
        latest: version == LATEST_VERSION,
        extension,
        auto: opt_auto || false,
        docFactories: [],
        promise: undefined,
        resolve: undefined,
        reject: undefined,
        loaded: undefined,
        error: undefined,
        scriptPresent: undefined,
      });
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
  getCurrentExtensionHolder_(opt_forName) {
    if (!this.currentExtensionId_ && !getMode(this.win).test) {
      dev().error(TAG, 'unknown extension for ', opt_forName);
    }
    return this.getExtensionHolder_(
      this.currentExtensionId_ || UNKNOWN_EXTENSION,
      this.currentExtensionVersion_ || ''
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
   * @param {string} version
   * @param {!ExtensionHolderDef} holder
   * @private
   */
  insertExtensionScriptIfNeeded_(extensionId, version, holder) {
    if (this.isExtensionScriptRequired_(extensionId, version, holder)) {
      const scriptElement = createExtensionScript(
        this.win,
        extensionId,
        version
      );
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
  isExtensionScriptRequired_(extensionId, version, holder) {
    if (holder.loaded || holder.error) {
      return false;
    }
    if (holder.scriptPresent === undefined) {
      const scriptsInHead = getExtensionScripts(
        this.win,
        extensionId,
        version,
        holder.latest
      );
      holder.scriptPresent = scriptsInHead.length > 0;
    }
    return !holder.scriptPresent;
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

/**
 * @param {string} extensionId
 * @param {string} version
 * @return {string}
 */
function extensionKey(extensionId, version) {
  return `${extensionId}:${version}`;
}
