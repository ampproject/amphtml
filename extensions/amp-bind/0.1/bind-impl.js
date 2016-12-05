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

/**
 * @typedef {{
 *   results: Array<BindExpressionResultDef>,
 *   verifyOnly: boolean
 * }}
 */
let BindVsyncStateDef;

/** @typedef {(null|boolean|string|number|Array|Object)} */
let BindExpressionResultDef;

export class Bind {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** {!Array<BindingDef>} */
    this.bindings_ = [];

    /** @const {!Object} */
    this.scope_ = Object.create(null);

    /** @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @const {!Function} */
    this.boundMeasure_ = this.measure_.bind(this);

    /** @const {!Function} */
    this.boundMutate_ = this.mutate_.bind(this);

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
    // TODO(choumx): Chunk if taking too long in a single frame.
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
    // TODO(choumx): Only allow binding to attributes allowed by validator.

    const name = attribute.name;
    if (name.length > 2) {
      if (name[0] === '[' && name[name.length - 1] === ']') {
        return {
          property: name.substr(1, name.length - 2),
          expression: attribute.value,
          element,
        };
      }
    }
    return null;
  }

  /**
   * Schedules a vsync task to reevaluate all binding expressions.
   * @param {boolean=} opt_verifyOnly
   * @private
   */
  digest_(opt_verifyOnly) {
    // TODO(choumx): Chunk if takes too long for a single frame.

    /** {!VsyncTaskSpecDef} */
    const task = {measure: this.boundMeasure_, mutate: this.boundMutate_};
    this.vsync_.run(task, {
      results: [],
      verifyOnly: opt_verifyOnly,
    });
  }

  /**
   * Reevaluates all bindings and stores results in `state`.
   * @param {BindVsyncStateDef} state
   * @private
   */
  measure_(state) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];
      state.results[i] = evaluateBindExpr(binding.expression, this.scope_);
    }
  }

  /**
   * Either applies or verifies the binding evaluation results in `state`.
   * @param {BindVsyncStateDef} state
   * @private
   */
  mutate_(state) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];
      const result = state.results[i];
      if (state.verifyOnly) {
        this.verifyBinding_(binding, result);
      } else {
        this.applyBinding_(binding, result);
      }
    }
  }

  /**
   * Applies `newValue` to the element bound in `binding`.
   * @param {!BindingDef} binding
   * @param {BindExpressionResultDef} newValue
   * @private
   */
  applyBinding_(binding, newValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO(choumx): Support objects for attributes.

    if (property === 'text') {
      element.textContent = newValue;
    } else if (property === 'class') {
      // TODO(choumx): SVG elements are an issue, should disallow in validator.

      if (Array.isArray(newValue)) {
        element.className = newValue.join(' ');
      } else if (typeof newValue === 'string') {
        element.className = newValue;
      } else {
        user().error(TAG_, 'Unsupported result for class binding', newValue);
      }
    } else {
      if (newValue === true) {
        element.setAttribute(property, '');
      } else if (newValue === false) {
        element.removeAttribute(property);
      } else {
        const oldValue = element.getAttribute(property);
        if (oldValue === newValue) {
          return;
        }

        /** @type {boolean|number|string|null} */
        const attributeValue = this.attributeValueOf_(newValue);
        if (attributeValue === null) {
          user().error(TAG_,
              'Unsupported result for attribute binding', newValue);
          return;
        }

        // TODO(choumx): Add attribute sanitization in line with validator.

        element.setAttribute(property, attributeValue);

        // Update internal state for AMP elements.
        if (element.classList.contains('-amp-element')) {
          const resources = element.getResources();
          if (typeof attributeValue === 'number') {
            if (property === 'width') {
              resources./*OK*/changeSize(element, undefined, attributeValue);
            } else if (property === 'height') {
              resources./*OK*/changeSize(element, attributeValue, undefined);
            }
          } else {
            user().error(TAG_,
                'Unsupported result for [width] or [height]', attributeValue);
          }
          element.attributeChangedCallback(property, oldValue, attributeValue);
        }
      }
    }
  }

  /**
   * If the current value of `binding` equals `expectedValue`, returns true.
   * Otherwise, returns false.
   * @param {!BindingDef} binding
   * @param {BindExpressionResultDef} expectedValue
   * @private
   */
  verifyBinding_(binding, expectedValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO(choumx): Support objects for attributes.

    let initialValue;
    let match = true;

    if (property === 'text') {
      initialValue = element.textContent;
      match = (initialValue === expectedValue);
    } else if (property === 'class') {
      initialValue = element.classList;

      /** @type {!Array<string>} */
      let classes = [];
      if (Array.isArray(expectedValue)) {
        classes = expectedValue;
      } else if (typeof expectedValue === 'string') {
        classes = expectedValue.split(' ');
      } else {
        user().error(TAG_,
            'Unsupported result for class binding', expectedValue);
      }
      match = this.compareStringArrays_(initialValue, classes);
    } else {
      const attribute = element.getAttribute(property);
      if (typeof expectedValue === 'boolean') {
        initialValue = !!attribute;
      } else {
        initialValue = attribute;
      }
      // Use abstract equality since boolean attributes return value of ''.
      match = (initialValue == expectedValue);
    }

    if (!match) {
      user().error(TAG_,
        `<${element.tagName}> element [${property}] binding ` +
        `default value (${initialValue}) does not match first expression ` +
        `result (${expectedValue}).`);
    }
  }

  /**
   * Returns true if both arrays contain the same strings.
   * @param {!(IArrayLike<string>|Array<string>)} a
   * @param {!(IArrayLike<string>|Array<string>)} b
   * @return {boolean}
   */
  compareStringArrays_(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const sortedA = a.slice().sort();
    const sortedB = b.slice().sort();
    for (let i = 0; i < a.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns `value` if it's an appropriate Element attribute type.
   * Otherwise, returns null.
   * @param {BindExpressionResultDef} value
   * @return {(string|boolean|number|null)}
   */
  attributeValueOf_(value) {
    if (typeof value === 'string' || typeof value === 'boolean'
       || typeof value === 'number') {
      return value;
    } else {
      return null;
    }
  }
}
