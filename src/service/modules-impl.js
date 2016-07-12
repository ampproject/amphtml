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

import {fromClass} from './service';


const TAG = 'modules';
const UNKNOWN_MODULE = '_UNKNOWN_';


/**
 * @typedef {{}}
 */
let ModuleHolderDef;


/**
 * @typedef {{}}
 */
let ModuleDef;


/**
 * @param {!Window} window
 * @restricted
 */
export function installModulesService(window) {
  return fromClass(window, 'modules', Modules);
}


/**
 * @param {!Modules} modules
 * @param {string} name
 * @param {function(!Object)} factory
 * @param {!Object} arg
 * @restricted
 */
export function registerModule(modules, name, factory, arg) {
  modules.registerModule_(ampdoc, name, factory, arg);
}


/**
 * @param {!Modules} modules
 * @param {!./ampdoc-impl/AmpDoc} ampdoc
 * @param {!Array<string>} moduleIds
 * @restricted
 */
export function instrumentModuleShadowDoc(modules, ampdoc, moduleIds) {
  modules.instrumentShadowDoc_(ampdoc, moduleIds);
}


/**
 * @param {!Modules} modules
 * @param {string} elementName
 * @param {function(new:../base-element.BaseElement, !Element)}
 *     implementationClass
 * @restricted
 */
export function registerModuleElement(modules, elementName,
    implementationClass) {
  modules.registerElement_(elementName, implementationClass);
}


/**
 * @param {!Modules} modules
 * @param {function(!./ampdoc-impl/AmpDoc)} factory
 * @param {string=} opt_name
 * @restricted
 */
export function registerModuleDocFactory(modules, factory, opt_name) {
  modules.registerDocFactory_(factory);
}


/**
 */
class Modules {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win = win;

    /** @private @const {!Object<string, !ModuleHolderDef>} */
    this.modules_ = {};

    /** @private {?string} */
    this.currentModuleName_ = null;
  }

  /**
   * Registers a new module. This method is called by the module's script
   * itself when it's loaded using the regular `AMP.push()` callback.
   * @param {string} name
   * @param {function(!Object)} factory
   * @param {!Object} arg
   * @private
   * @restricted
   */
  registerModule_(name, factory, arg) {
    const holder = this.getModuleHolder_(name);
    try {
      this.currentModuleName_ = name;
      factory(this.win.AMP);
      if (getMode().localDev || getMode().test) {
        if (Object.freeze) {
          const m = holder.module;
          m.elements = Object.freeze(m.elements);
          m.docFactories_ = Object.freeze(m.docFactories_);
          holder.module = Object.freeze(m);
        }
      }
      holder.resolve(holder.module);
    } catch (e) {
      holder.reject(e);
      throw e;
    } finally {
      this.currentModuleName_ = null;
    }
  }

  /**
   * Waits for the previously included module to complete loading/registration.
   * @param {string} name
   * @return {!Promise<!ModuleDef>}
   */
  waitForModule(name) {
    return this.getModuleHolder_(name).promise;
  }

  /**
   * Check script info in HTML head and make update if necessary. Returns the
   * promise that will be resolved when the module has been loaded.
   * @param {string} name
   * @return {!Promise<!Module>}
   */
  loadModule(name) {
    if (name == 'amp-embed') {
      name = 'amp-ad';
    }
    const holder = this.getModuleHolder_(name);
    // DO NOT SUBMIT: complete migration from insert-extension.js
    if (isAmpExtensionScriptRequired(this.win, name)) {
      const ampExtensionScript = createAmpExtensionScript(this.win, name);
      this.win.document.head.appendChild(ampExtensionScript);
    }
    return holder.promise;
  }

  /**
   * Registers the element implementation with the current module.
   * @param {string} name
   * @param {!Function} implementationClass
   * @private
   * @restricted
   */
  registerElement_(name, implementationClass) {
    const holder = this.getCurrentModuleHolder_(name);
    holder.module.elements[name] = {implementationClass};
  }

  /**
   * Registers an ampdoc factory.
   * @param {function()} factory
   * @param {string=} opt_name
   * @private
   * @restricted
   */
  registerDocFactory_(factory, opt_name) {
    const holder = this.getCurrentModuleHolder_(opt_name);
    holder.module.docFactories_.push(factory);
  }

  /**
   * Installs all ampdoc factories previously registered with
   * `registerDocFactory_`.
   * @param {!./ampdoc-impl/AmpDoc} ampdoc
   * @param {!Array<string>} moduleIds
   * @private
   * @restricted
   */
  instrumentShadowDoc_(ampdoc, moduleIds) {
    moduleIds.forEach(extension => {
      this.waitForModule(extension).then(module => {
        module.docFactories_.forEach(factory => factory(ampdoc));
      });
    });
  }

  /**
   * @param {string} name
   * @return {!ModuleHolderDef}
   * @private
   */
  getModuleHolder_(name) {
    let holder = this.modules_[name];
    if (!holder) {
      let resolve, reject;
      const promise = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
      });
      const module = {
        elements: {},
        templates: {},
        docFactories_: [],
      };
      holder = {
        module,
        promise,
        resolve,
        reject,
      };
    }
    return holder;
  }

  /**
   * Returns the holder for the module currently being registered.
   * @param {string=} opt_forName
   * @return {!ModuleHolderDef}
   * @private
   */
  getCurrentModuleHolder_(opt_forName) {
    if (!this.currentModuleName_) {
      dev.error(TAG, 'unknown module for ', opt_forName);
    }
    return this.getModuleHolder_(this.currentModuleName_ || UNKNOWN_MODULE);
  }
}
