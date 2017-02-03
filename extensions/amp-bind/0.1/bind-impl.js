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
import {BindValidator} from './bind-validator';
import {chunk, ChunkPriority} from '../../../src/chunk';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {isFiniteNumber} from '../../../src/types';
import {resourcesForDoc} from '../../../src/resources';

const TAG = 'amp-bind';

/**
 * Regular expression that identifies AMP CSS classes.
 * Includes 'i-amphtml-', '-amp-', and 'amp-' prefixes.
 * @type {!RegExp}
 */
const AMP_CSS_RE = /^(i?-)?amp(html)?-/;

/**
 * A bound property, e.g. [property]="expression".
 * `previousResult` is the result of this expression during the last digest.
 * @typedef {{
 *   property: string,
 *   expressionString: string,
 *   previousResult: (./bind-expression.BindExpressionResultDef|undefined),
 * }}
 */
let BoundPropertyDef;

/**
 * A tuple containing a single element and all of its bound properties.
 * @typedef {{
 *   boundProperties: !Array<BoundPropertyDef>,
 *   element: !Element,
 * }}
 */
let BoundElementDef;

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
    /** @const @private {boolean} */
    this.enabled_ = isExperimentOn(ampdoc.win, TAG);
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private {!Array<BoundElementDef>} */
    this.boundElements_ = [];

    /** @const @private {!./bind-validator.BindValidator} */
    this.validator_ = new BindValidator();

    /** @const @private {!Object} */
    this.scope_ = Object.create(null);

    /** @private {?./bind-evaluator.BindEvaluator} */
    this.evaluator_ = null;

    /** @visibleForTesting {?Promise<!Object<string,*>>} */
    this.evaluatePromise_ = null;

    /** @visibleForTesting {?Promise} */
    this.scanPromise_ = null;

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resourcesForDoc(ampdoc);

    /**
     * True if a digest is triggered before scan for bindings completes.
     * @private {boolean}
     */
    this.digestQueuedAfterScan_ = false;

    this.ampdoc.whenReady().then(() => {
      this.initialize_();
    });

    // Expose for testing on dev.
    if (getMode().localDev) {
      AMP.reinitializeBind = this.initialize_.bind(this);
    }
  }

  /**
   * Merges `state` into the current scope and immediately triggers a digest
   * unless `opt_skipDigest` is false.
   * @param {!Object} state
   * @param {boolean=} opt_skipDigest
   */
  setState(state, opt_skipDigest) {
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    // TODO(choumx): What if `state` contains references to globals?
    Object.assign(this.scope_, state);

    if (!opt_skipDigest) {
      // If scan hasn't completed yet, set `digestQueuedAfterScan_`.
      if (this.evaluator_) {
        this.digest_();
      } else {
        this.digestQueuedAfterScan_ = true;
      }
      user().fine(TAG, 'State updated; re-evaluating expressions...');
    }
  }

  /**
   * Scans the ampdoc for bindings and creates the expression evaluator.
   * @private
   */
  initialize_() {
    this.scanPromise_ = this.scanBody_(this.ampdoc.getBody());
    this.scanPromise_.then(results => {
      const {boundElements, bindings} = results;

      this.boundElements_ = boundElements;
      this.evaluator_ = new BindEvaluator(bindings);

      // Trigger verify-only digest in development.
      if (getMode().development || this.digestQueuedAfterScan_) {
        this.digest_(/* opt_verifyOnly */ !this.digestQueuedAfterScan_);
      }

      dev().fine(TAG, `Initialized ${bindings.length} bindings from ` +
          `${boundElements.length} elements.`);
    });
  }

  /**
   * Scans `body` for attributes that conform to bind syntax and returns
   * a tuple containing bound elements and binding data for the evaluator.
   * @param {!Element} body
   * @return {
   *   !Promise<{
   *     boundElements: !Array<BoundElementDef>,
   *     bindings: !Array<./bind-evaluator.BindingDef>
   *   }>
   * }
   * @private
   */
  scanBody_(body) {
    /** @type {!Array<BoundElementDef>} */
    const boundElements = [];
    /** @type {!Array<./bind-evaluator.BindingDef>} */
    const bindings = [];

    const doc = dev().assert(body.ownerDocument, 'ownerDocument is null.');
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);

    // Helper function for scanning the tree walker's next node.
    // Returns true if the walker has no more nodes.
    const scanNextNode_ = () => {
      const element = walker.nextNode();
      if (!element) {
        return true;
      }
      const tagName = element.tagName;
      const boundProperties = this.scanElement_(element);
      if (boundProperties.length > 0) {
        boundElements.push({element, boundProperties});
      }
      // Append (element, property, expressionString) tuples to `bindings`.
      boundProperties.forEach(boundProperty => {
        const {property, expressionString} = boundProperty;
        bindings.push({tagName, property, expressionString});
      });
      return false;
    };

    return new Promise(resolve => {
      const chunktion = idleDeadline => {
        let completed = false;
        // If `requestIdleCallback` is available, scan elements until
        // idle time runs out.
        if (idleDeadline && !idleDeadline.didTimeout) {
          while (idleDeadline.timeRemaining() > 1 && !completed) {
            completed = scanNextNode_();
          }
        } else {
          // If `requestIdleCallback` isn't available, scan elements in buckets.
          // Bucket size is a magic number that fits within a single frame.
          const bucketSize = 250;
          for (let i = 0; i < bucketSize && !completed; i++) {
            completed = scanNextNode_();
          }
        }

        // If we scanned all elements, resolve. Otherwise, continue chunking.
        if (completed) {
          resolve({boundElements, bindings});
        } else {
          chunk(this.ampdoc, chunktion, ChunkPriority.LOW);
        }
      };
      chunk(this.ampdoc, chunktion, ChunkPriority.LOW);
    });
  }

  /**
   * Returns bound properties for an element.
   * @param {!Element} element
   * @return {!Array<{property: string, expressionString: string}>}
   * @private
   */
  scanElement_(element) {
    const boundProperties = [];
    const attrs = element.attributes;
    for (let i = 0, numberOfAttrs = attrs.length; i < numberOfAttrs; i++) {
      const attr = attrs[i];
      const boundProperty = this.scanAttribute_(attr, element);
      if (boundProperty) {
        boundProperties.push(boundProperty);
      }
    }
    return boundProperties;
  }

  /**
   * Returns the bound property and expression string within a given attribute,
   * if it exists. Otherwise, returns null.
   * @param {!Attr} attribute
   * @param {!Element} element
   * @return {?{property: string, expressionString: string}}
   * @private
   */
  scanAttribute_(attribute, element) {
    const name = attribute.name;
    if (name.length > 2 && name[0] === '[' && name[name.length - 1] === ']') {
      const property = name.substr(1, name.length - 2);
      if (this.validator_.canBind(element.tagName, property)) {
        return {property, expressionString: attribute.value};
      } else {
        user().error(TAG,
            `<${element.tagName} [${property}]> binding is not allowed.`);
      }
    }
    return null;
  }

  /**
   * Asynchronously reevaluates all expressions and applies results to DOM.
   * If `opt_verifyOnly` is true, does not apply results but verifies them
   * against current element values instead.
   * @param {boolean=} opt_verifyOnly
   * @private
   */
  digest_(opt_verifyOnly) {
    this.evaluatePromise_ = this.evaluator_.evaluate(this.scope_);
    this.evaluatePromise_.then(results => {
      if (opt_verifyOnly) {
        this.verify_(results);
      } else {
        this.apply_(results);
      }
    }).catch(error => {
      user().error(TAG, error);
    });
  }

  /**
   * Verifies expression results against current DOM state.
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @private
   */
  verify_(results) {
    this.boundElements_.forEach(boundElement => {
      const {element, boundProperties} = boundElement;

      boundProperties.forEach(binding => {
        const newValue = results[binding.expressionString];
        if (newValue !== undefined) {
          this.verifyBinding_(binding, element, newValue);
        }
      });
    });
  }

  /**
   * Applies expression results to DOM.
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @private
   */
  apply_(results) {
    this.boundElements_.forEach(boundElement => {
      const {element, boundProperties} = boundElement;

      this.resources_.mutateElement(element, () => {
        const mutations = {};
        let width, height;

        boundProperties.forEach(boundProperty => {
          const expressionString = boundProperty.expressionString;
          const newValue = results[expressionString];

          // Don't apply if the result hasn't changed or is missing.
          if (newValue === undefined ||
              this.shallowEquals_(newValue, boundProperty.previousResult)) {
            user().fine(TAG, `Expression result unchanged or missing: ` +
                `"${expressionString}"`);
            return;
          } else {
            boundProperty.previousResult = newValue;
          }
          user().fine(TAG, `New expression result: ` +
              `"${expressionString}" -> ${newValue}`);

          const mutation = this.applyBinding_(boundProperty, element, newValue);
          if (mutation) {
            mutations[mutation.name] = mutation.value;
          }

          switch (boundProperty.property) {
            case 'width':
              width = isFiniteNumber(newValue) ? Number(newValue) : width;
              break;
            case 'height':
              height = isFiniteNumber(newValue) ? Number(newValue) : height;
              break;
          }
        });

        if (width !== undefined || height !== undefined) {
          // TODO(choumx): Add new Resources method for adding change-size
          // request without scheduling vsync pass since `mutateElement()`
          // will schedule a pass after a short delay anyways.
          this.resources_./*OK*/changeSize(element, height, width);
        }

        if (typeof element.mutatedAttributesCallback === 'function') {
          element.mutatedAttributesCallback(mutations);
        }
      });
    });
  }

  /**
   * Mutates the bound property of `element` with `newValue`.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {./bind-expression.BindExpressionResultDef} newValue
   * @return (?{name: string, value:./bind-expression.BindExpressionResultDef})
   * @private
   */
  applyBinding_(boundProperty, element, newValue) {
    const property = boundProperty.property;

    switch (property) {
      case 'text':
        element.textContent = String(newValue);
        break;

      case 'class':
        // Preserve internal AMP classes.
        const ampClasses = [];
        for (let i = 0; i < element.classList.length; i++) {
          const cssClass = element.classList[i];
          if (AMP_CSS_RE.test(cssClass)) {
            ampClasses.push(cssClass);
          }
        }
        if (Array.isArray(newValue)) {
          element.className = ampClasses.concat(newValue).join(' ');
        } else if (typeof newValue === 'string') {
          element.className = ampClasses.join(' ') + ' ' + newValue;
        } else if (newValue === null) {
          element.className = ampClasses.join(' ');
        } else {
          user().error(TAG, 'Invalid result for [class]', newValue);
        }
        break;

      default:
        const oldValue = element.getAttribute(property);

        let attributeChanged = false;
        if (typeof newValue === 'boolean') {
          if (newValue && oldValue !== '') {
            element.setAttribute(property, '');
            attributeChanged = true;
          } else if (!newValue && oldValue !== null) {
            element.removeAttribute(property);
            attributeChanged = true;
          }
        } else if (newValue !== oldValue) {
          element.setAttribute(property, String(newValue));
          attributeChanged = true;
        }

        if (attributeChanged) {
          return {name: property, value: newValue};
        }
        break;
    }
    return null;
  }

  /**
   * If current bound element state equals `expectedValue`, returns true.
   * Otherwise, returns false.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {./bind-expression.BindExpressionResultDef} expectedValue
   * @private
   */
  verifyBinding_(boundProperty, element, expectedValue) {
    const property = boundProperty.property;

    let initialValue;
    let match = true;

    switch (property) {
      case 'text':
        initialValue = element.textContent;
        expectedValue = Object.prototype.toString.call(expectedValue);
        match = (initialValue.trim() === expectedValue.trim());
        break;

      case 'class':
        initialValue = [];
        // Ignore internal AMP classes.
        for (let i = 0; i < element.classList.length; i++) {
          const cssClass = element.classList[i];
          if (AMP_CSS_RE.test(cssClass)) {
            initialValue.push(cssClass);
          }
        }
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
        break;

      default:
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
        break;
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
   * Checks strict equality of 1D children in arrays and objects.
   * @param {./bind-expression.BindExpressionResultDef|undefined} a
   * @param {./bind-expression.BindExpressionResultDef|undefined} b
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
