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

import {BindEvaluator} from './bind-evaluator';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {isFiniteNumber} from '../../../src/types';
import {vsyncFor} from '../../../src/vsync';

const TAG = 'AMP-BIND';

/**
 * A single binding, e.g. <element [property]="expression"></element>.
 * `previousResult` is the result of this expression during the last digest.
 * @typedef {{
 *   property: !string,
 *   expression: !string,
 *   element: !Element,
 *   previousResult: (BindExpressionResultDef|undefined)
 * }}
 */
let BindingDef;

/**
 * The state passed through vsync measure/mutate during a Bind digest cycle.
 * @typedef {{
 *   results: !Object<string,BindExpressionResultDef>,
 *   verifyOnly: boolean
 * }}
 */
let BindVsyncStateDef;

/**
 * Possible types of a Bind expression evaluation.
 * @typedef {(null|boolean|string|number|Array|Object)}
 */
let BindExpressionResultDef;

/**
 * Bind is the service that handles the Bind lifecycle, from identifying
 * bindings in the document to scope mutations to reevaluating expressions
 * during a digest.
 */
export class Bind {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {boolean} */
    this.enabled_ = isExperimentOn(ampdoc.win, TAG);
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** {!Array<BindingDef>} */
    this.bindings_ = [];

    /** @const {!Object} */
    this.scope_ = Object.create(null);

    /** {?./bind-evaluator.BindEvaluator} */
    this.evaluator_ = null;

    /** {?Promise<!Object<string,*>>} */
    this.evaluatePromise_ = null;

    /** @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @const {!Function} */
    this.boundMeasure_ = this.measure_.bind(this);

    /** @const {!Function} */
    this.boundMutate_ = this.mutate_.bind(this);

    /**
     * Keys correspond to valid attribute value types.
     * @const {!Object<string,boolean>}
     */
    this.attributeValueTypes_ = {
      'string': true,
      'boolean': true,
      'number': true,
    };

    this.ampdoc.whenBodyAvailable().then(body => {
      const {bindings, expressions} = this.scanForBindings_(body);
      this.bindings_ = bindings;
      this.evaluator_ = new BindEvaluator(expressions);

      // Trigger verify-only digest in development.
      if (getMode().development) {
        this.digest_(true);
      }
    });
  }

  /**
   * Merges `state` into the current scope and immediately triggers a digest
   * unless `opt_skipDigest` is false.
   * @param {!Object} state
   * @param {boolean=} opt_skipDigest
   */
  setState(state, opt_skipDigest) {
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    Object.assign(this.scope_, state);

    if (!opt_skipDigest) {
      this.digest_();
    }
  }

  /**
   * Scans children for attributes that conform to bind syntax and returns
   * all bindings.
   * @param {!Element} body
   * @return {{bindings: !Array<BindingDef>, expressions: !Array<string>}}
   * @private
   */
  scanForBindings_(body) {
    // TODO(choumx): Chunk if taking too long in a single frame.

    const bindings = [];
    const expressions = [];
    const elements = body.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const attributes = el.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const binding = this.bindingForAttribute_(attributes[j], el);
        if (binding) {
          bindings.push(binding);
          expressions.push(binding.expression);
        }
      }
    }
    return {bindings, expressions};
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

    this.evaluatePromise_ = this.evaluator_.evaluate(this.scope_);
    this.evaluatePromise_.then(results => {
      /** {!VsyncTaskSpecDef} */
      const task = {measure: this.boundMeasure_, mutate: this.boundMutate_};
      this.vsync_.run(task, {
        results,
        verifyOnly: !!opt_verifyOnly,
      });
    }).catch(error => {
      user().error(TAG, error);
    });
  }

  /**
   * @param {BindVsyncStateDef} unusedState
   * @private
   */
  measure_(unusedState) {
    // TODO(choumx): Validate here or in applyBinding_()?
  }

  /**
   * Either applies or verifies the binding evaluation results in `state`.
   * @param {BindVsyncStateDef} state
   * @private
   */
  mutate_(state) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];
      const expression = binding.expression;
      const result = state.results[expression];

      // Don't apply mutation if the result hasn't changed.
      if (this.shallowEquals_(result, binding.previousResult)) {
        continue;
      } else {
        binding.previousResult = result;
      }

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

    // TODO(choumx): Does `element.tagName` support binding to `property`?
    // TODO(choumx): Support objects for attributes.

    if (property === 'text') {
      // TODO(choumx): How to trigger reflow when necessary?

      element.textContent = newValue;
    } else if (property === 'class') {
      // TODO(choumx): SVG elements are an issue, should disallow in validator.
      // TODO(choumx): Avoid removing internal classes for AMP elements.

      if (Array.isArray(newValue)) {
        element.className = newValue.join(' ');
      } else if (typeof newValue === 'string') {
        element.className = newValue;
      } else {
        user().error(TAG, 'Invalid result for class binding', newValue);
      }
    } else {
      const isAmpElement = element.classList.contains('-amp-element');
      const oldValue = element.getAttribute(property);
      /** @type {(boolean|number|string|null|undefined)} */
      let attributeValue;

      if (newValue === true) {
        element.setAttribute(property, '');
        attributeValue = '';
      } else if (newValue === false) {
        element.removeAttribute(property);
        attributeValue = null;
      } else {
        dev().assert(oldValue !== newValue,
          `Applying [${property}] binding but value hasn't changed.`);

        attributeValue = this.attributeValueOf_(newValue);
        if (attributeValue === null) {
          user().error(TAG, 'Invalid result for attribute binding', newValue);
          return;
        }

        // TODO(choumx): Does `newValue` pass validator value_casei,
        // value_regex, blacklisted_value_regex, value_url>allowed_protocol,
        // mandatory?

        element.setAttribute(property, attributeValue);

        // Update internal state for AMP elements.
        if (isAmpElement) {
          const resources = element.getResources();
          if (property === 'width') {
            user().assert(isFiniteNumber(attributeValue),
                'Invalid result for [width]: %s', attributeValue);
            resources./*OK*/changeSize(element, undefined, attributeValue);
          } else if (property === 'height') {
            user().assert(isFiniteNumber(attributeValue),
                'Invalid result for [height]: %s', attributeValue);
            resources./*OK*/changeSize(element, attributeValue, undefined);
          }
        }
      }

      if (isAmpElement) {
        element.attributeChangedCallback(property, oldValue, attributeValue);
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
      expectedValue = Object.prototype.toString.call(expectedValue);
      match = (initialValue.trim() === expectedValue.trim());
    } else if (property === 'class') {
      initialValue = element.classList;
      /** @type {!Array<string>} */
      let classes = [];
      if (Array.isArray(expectedValue)) {
        classes = expectedValue;
      } else if (typeof expectedValue === 'string') {
        classes = expectedValue.split(' ');
      } else {
        user().error(TAG,
            'Unsupported result for class binding', expectedValue);
      }
      match = this.compareStringArrays_(initialValue, classes);
    } else {
      const attribute = element.getAttribute(property);
      initialValue = attribute;
      // Boolean attributes return values of either '' or null.
      if (expectedValue === true) {
        match = (initialValue === '');
      } else if (expectedValue === false) {
        match = (initialValue === null);
      } else {
        match = (initialValue === expectedValue);
      }
    }

    if (!match) {
      user().error(TAG,
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
    const sortedA = (isArray(a) ? a : toArray(a)).sort();
    const sortedB = (isArray(b) ? b : toArray(b)).sort();
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
    if (this.attributeValueTypes_[typeof value]) {
      return /** @type {(string|boolean|number)} */ (value);
    } else {
      return null;
    }
  }

  /**
   * Checks strict equality of 1D children in arrays and objects.
   * @param {BindExpressionResultDef|undefined} a
   * @param {BindExpressionResultDef|undefined} b
   * @return {boolean}
   */
  shallowEquals_(a, b) {
    if (a === b) {
      return true;
    }

    if (a === null || b === null) {
      return false;
    }

    if (typeof a !== typeof b) {
      return false;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) {
        return false;
      }
      for (let i = 0; i < keysA.length; i++) {
        const keyA = keysA[i];
        if (a[keyA] !== b[keyA]) {
          return false;
        }
      }
      return true;
    }

    return false;
  }
}
