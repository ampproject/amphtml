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
 *   result: BindExpressionResult
 *   verifyOnly: boolean
 * }}
 */
let BindVsyncStateDef;

/** @typedef {(null|boolean|string|number|Array|Object)} */
let BindExpressionResult;

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

    if (attribute.name.length <= 2) {
      return null;
    }
    const name = attribute.name;
    if (name[0] === '[' && name[name.length - 1] === ']') {
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
   * @param {BindExpressionResult} newValue
   * @private
   */
  applyBinding_(binding, newValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO(choumx): Support arrays for classes and objects for attributes.

    if (property === 'text') {
      element.textContent = newValue;
    } else if (property === 'class') {
      // TODO(choumx): SVG elements are an issue, should disallow in validator.
      element.classList = newValue;
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

        // TODO(choumx): Add attribute sanitization in line with validator.

        element.setAttribute(property, newValue);

        // Update internal state for AMP elements.
        if (element.classList.contains('-amp-element')) {
          const resources = element.getResources();
          if (property === 'width') {
            resources./*OK*/changeSize(element, undefined, newValue);
          } else if (property === 'height') {
            resources./*OK*/changeSize(element, newValue, undefined);
          }
          element.attributeChangedCallback(property, oldValue, newValue);
        }
      }
    }
  }

  /**
   * If the current value of `binding` equals `expectedValue`, returns true.
   * Otherwise, returns false.
   * @param {!BindingDef} binding
   * @param {BindExpressionResult} expectedValue
   * @private
   */
  verifyBinding_(binding, expectedValue) {
    const property = binding.property;
    const element = binding.element;

    // TODO(choumx): Support arrays for classes and objects for attributes.

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
}
