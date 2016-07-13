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

import {dev} from '../log';
import {getMode} from '../mode';

import {fromClass} from '../service';


const TAG = 'extensions';
const UNKNOWN_EXTENSION = '_UNKNOWN_';


/**
 * @typedef {{}}
 */
let ExtensionHolderDef;


/**
 * @typedef {{}}
 */
let ExtensionDef;


/**
 * @param {!Window} window
 * @restricted
 */
export function installExtensionsService(window) {
  return fromClass(window, 'extensions', Extensions);
}


/**
 * @param {!Extensions} extensions
 * @param {string} name
 * @param {function(!Object)} factory
 * @param {!Object} arg
 * @restricted
 */
export function registerExtension(extensions, name, factory, arg) {
  extensions.registerExtension_(name, factory, arg);
}


/**
 * @param {!Extensions} extensions
 * @param {!./ampdoc-impl/AmpDoc} ampdoc
 * @param {!Array<string>} extensionIds
 * @restricted
 */
export function instrumentShadowDocExtensions(extensions, ampdoc, extensionIds) {
  extensions.instrumentShadowDoc_(ampdoc, extensionIds);
}


/**
 * @param {!Extensions} extensions
 * @param {string} elementName
 * @param {function(new:../base-element.BaseElement, !Element)}
 *     implementationClass
 * @restricted
 */
export function addElementToExtension(extensions, elementName,
    implementationClass) {
  extensions.addElement_(elementName, implementationClass);
}


/**
 * @param {!Extensions} extensions
 * @param {function(!./ampdoc-impl/AmpDoc)} factory
 * @param {string=} opt_forName
 * @restricted
 */
export function addDocFactoryToExtension(extensions, factory, opt_forName) {
  extensions.addDocFactory_(factory, opt_forName);
}


/**
 */
class Extensions {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win = win;

    /** @private @const {!Object<string, !ExtensionHolderDef>} */
    this.extensions_ = {};

    /** @private {?string} */
    this.currentExtensionName_ = null;
  }

  /**
   * Registers a new extension. This method is called by the extension's script
   * itself when it's loaded using the regular `AMP.push()` callback.
   * @param {string} name
   * @param {function(!Object)} factory
   * @param {!Object} arg
   * @private
   * @restricted
   */
  registerExtension_(name, factory, arg) {
    const holder = this.getExtensionHolder_(name);
    try {
      this.currentExtensionName_ = name;
      factory(arg);
      if (getMode().localDev || getMode().test) {
        if (Object.freeze) {
          const m = holder.extension;
          m.elements = Object.freeze(m.elements);
          m.docFactories_ = Object.freeze(m.docFactories_);
          holder.extension = Object.freeze(m);
        }
      }
      holder.resolve(holder.extension);
    } catch (e) {
      holder.reject(e);
      throw e;
    } finally {
      this.currentExtensionName_ = null;
    }
  }

  /**
   * Waits for the previously included extension to complete
   * loading/registration.
   * @param {string} name
   * @return {!Promise<!ExtensionDef>}
   */
  waitForExtension(name) {
    return this.getExtensionHolder_(name).promise;
  }

  /**
   * Check script info in HTML head and make update if necessary. Returns the
   * promise that will be resolved when the extension has been loaded.
   * @param {string} name
   * @return {!Promise<!ExtensionDef>}
   */
  loadExtension(name) {
    if (name == 'amp-embed') {
      name = 'amp-ad';
    }
    const holder = this.getExtensionHolder_(name);
    // DO NOT SUBMIT: complete migration from insert-extension.js
    if (isAmpExtensionScriptRequired(this.win, name)) {
      const ampExtensionScript = createAmpExtensionScript(this.win, name);
      this.win.document.head.appendChild(ampExtensionScript);
    }
    return holder.promise;
  }

  /**
   * Registers the element implementation with the current extension.
   * @param {string} name
   * @param {!Function} implementationClass
   * @private
   * @restricted
   */
  addElement_(name, implementationClass) {
    const holder = this.getCurrentExtensionHolder_(name);
    holder.extension.elements[name] = {implementationClass};
  }

  /**
   * Registers an ampdoc factory.
   * @param {function()} factory
   * @param {string=} opt_name
   * @private
   * @restricted
   */
  addDocFactory_(factory, opt_name) {
    const holder = this.getCurrentExtensionHolder_(opt_name);
    holder.extension.docFactories_.push(factory);
  }

  /**
   * Installs all ampdoc factories previously registered with
   * `addDocFactory_`.
   * @param {!./ampdoc-impl/AmpDoc} ampdoc
   * @param {!Array<string>} extensionIds
   * @private
   * @restricted
   */
  instrumentShadowDoc_(ampdoc, extensionIds) {
    extensionIds.forEach(extensionId => {
      this.waitForExtension(extensionId).then(extension => {
        extension.docFactories_.forEach(factory => factory(ampdoc));
      });
    });
  }

  /**
   * @param {string} name
   * @return {!ExtensionHolderDef}
   * @private
   */
  getExtensionHolder_(name) {
    let holder = this.extensions_[name];
    if (!holder) {
      let resolve, reject;
      const promise = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
      });
      const extension = {
        elements: {},
        templates: {},
        docFactories_: [],
      };
      holder = {
        extension,
        promise,
        resolve,
        reject,
      };
      this.extensions_[name] = holder;
    }
    return holder;
  }

  /**
   * Returns the holder for the extension currently being registered.
   * @param {string=} opt_forName
   * @return {!ExtensionHolderDef}
   * @private
   */
  getCurrentExtensionHolder_(opt_forName) {
    if (!this.currentExtensionName_) {
      dev.error(TAG, 'unknown extension for ', opt_forName);
    }
    return this.getExtensionHolder_(
        this.currentExtensionName_ || UNKNOWN_EXTENSION);
  }
}
