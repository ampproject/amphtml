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

import {evaluateBindExpr} from './bind-expr';
import {getMode} from '../../../src/mode';
import {user} from '../../../src/log';
import {vsyncFor} from '../../../src/vsync';

const TAG_ = 'AMP-BIND';

/**
 * @typedef {{
 *   property: !string,
 *   expression: !string,
 *   element: !Element
 * }}
 */
let BindingDef;

export class Bind {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Array<BindingDef>} */
    this.bindings_ = [];

    /** @const {!Object} */
    this.scope_ = Object.create(null);

    /** @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @const {!Array<string>} */
    this.protocolWhitelist_ = ['http', 'https'];

    this.ampdoc.whenBodyAvailable().then(body => {
      this.bindings_ = this.scanForBindings_(body);

      // Trigger verify-only digest in development.
      if (getMode().development) {
        this.digest_(true);
      }
    });
  }

  /**
   * @param {!Object} state
   * @param {boolean=} opt_skipDigest
   */
  setState(state, opt_skipDigest) {
    Object.assign(this.scope_, state);

    if (!opt_skipDigest) {
      this.digest_();
    }
  }

  /**
   * Scans children for attributes that conform to bind syntax and returns
   * all bindings.
   * @param {!Element} body
   * @return {!Array<BindingDef>}
   * @private
   */
  scanForBindings_(body) {
    const bindings = [];
    const elements = body.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const attributes = el.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const binding = this.bindingForAttribute_(attributes[j], el);
        if (binding) {
          bindings.push(binding);
        }
      }
    }
    return bindings;
  }

  /**
   * Returns a struct representing the binding corresponding to the
   * attribute param, if applicable.
   * @param {!Attr} attribute
   * @param {!Element} element
   * @return {?BindingDef}
   * @private
   */
  bindingForAttribute_(attribute, element) {
    // TODO: Disallow binding to blacklisted attributes.

    if (attribute.name.length <= 2) {
      return null;
    }
    const name = attribute.name;
    if (name.charAt(0) === '[' && name.charAt(name.length - 1) === ']') {
      return {
        property: name.substr(1, name.length - 2),
        expression: attribute.value,
        element,
      };
    }
  }

  /**
   * Schedules a vsync task to reevaluate all binding expressions.
   * @param {boolean=} opt_verifyOnly
   * @private
   */
  digest_(opt_verifyOnly) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];

      /** {!VsyncTaskSpecDef} */
      const task = {
        measure: state => {
          state.result = evaluateBindExpr(binding.expression, this.scope_);
        },
        mutate: state => {
          if (opt_verifyOnly) {
            this.verifyBinding_(binding, state.result);
          } else {
            this.applyBinding_(binding, state.result);
          }
        },
      };
      this.vsync_.run(task, {});
    }
  }

  /**
   * Applies `newValue` to the element bound in `binding`.
   * @param {!BindingDef} binding
   * @param {(Object|Array|string|number|boolean|null)} newValue
   * @private
   */
  applyBinding_(binding, newValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO: Support arrays for classes and objects for attributes.

    if (property === 'text') {
      element.textContent = newValue;
    } else if (property === 'class') {
      element.classList = newValue;
    } else {
      if (newValue === true) {
        element.setAttribute(property, '');
      } else if (newValue === false) {
        element.removeAttribute(property);
      } else {
        const oldValue = element.getAttribute(property);
        const sanitizedValue = this.sanitizeAttribute_(newValue);

        if (oldValue === sanitizedValue) {
          return;
        }

        element.setAttribute(property, sanitizedValue);

        // Update internal state for AMP elements.
        if (element.classList.contains('-amp-element')) {
          const resources = element.getResources();
          if (property === 'width') {
            resources.changeSize(element, undefined, sanitizedValue);
          } else if (property === 'height') {
            resources.changeSize(element, sanitizedValue, undefined);
          }
          element.attributeChangedCallback(property, oldValue, sanitizedValue);
        }
      }
    }
  }

  /**
   * If the current value of `binding` equals `expectedValue`, returns true.
   * Otherwise, returns false.
   * @param {!BindingDef} binding
   * @param {?(Object|Array|string|number|boolean)} expectedValue
   * @private
   */
  verifyBinding_(binding, expectedValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO: Support arrays for classes and objects for attributes.

    let initialValue;
    if (property === 'text') {
      initialValue = element.textContent;
    } else if (property === 'class') {
      initialValue = element.classList;
    } else {
      const attribute = element.getAttribute(property);
      if (typeof expectedValue === 'boolean') {
        initialValue = !!attribute;
      } else {
        initialValue = attribute;
      }
    }

    if (initialValue != expectedValue) {
      user().error(TAG_,
        `<${element.tagName}> element [${property}] binding ` +
        `default value (${initialValue}) does not match first expression ` +
        `result (${expectedValue}).`);
    }
  }

  /**
   * Sanitizes unsafe protocols in attributes, e.g. "javascript:".
   * @param {(Object|Array|string|number|boolean|null)} value
   * @return {string}
   * @private
   */
  sanitizeAttribute_(value) {
    if (typeof value === 'string') {
      const split = value.split(':');
      if (split.length > 1 && this.protocolWhitelist_.indexOf(split[0]) < 0) {
        return 'unsafe:' + value;
      }
    }
    return value;
  }
}
