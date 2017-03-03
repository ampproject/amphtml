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

import {BindExpressionResultDef} from './bind-expression';
import {BindingDef, BindEvaluator} from './bind-evaluator';
import {BindValidator} from './bind-validator';
import {chunk, ChunkPriority} from '../../../src/chunk';
import {dev, user} from '../../../src/log';
import {fromClassForDoc} from '../../../src/service';
import {getMode} from '../../../src/mode';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {invokeWebWorker} from '../../../src/web-worker/amp-worker';
import {isFiniteNumber} from '../../../src/types';
import {reportError} from '../../../src/error';
import {resourcesForDoc} from '../../../src/resources';
import {filterSplice} from '../../../src/utils/array';
import {rewriteAttributeValue} from '../../../src/sanitizer';
import {timerFor} from '../../../src/timer';

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
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
 * @return {!Bind}
 */
export function installBindForTesting(nodeOrAmpDoc) {
  return fromClassForDoc(nodeOrAmpDoc, 'bind', Bind);
}

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

    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!Array<BoundElementDef>} */
    this.boundElements_ = [];

    /**
     * Maps expression string to the element(s) that contain it.
     * @private @const {!Object<string, !Array<!Element>>}
     */
    this.expressionToElements_ = Object.create(null);

    /** @const @private {!./bind-validator.BindValidator} */
    this.validator_ = new BindValidator();

    /** @const @private {!Object} */
    this.scope_ = Object.create(null);

    /** @private {?./bind-evaluator.BindEvaluator} */
    this.evaluator_ = null;

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resourcesForDoc(ampdoc);

    /**
     * @const @private {!Array<Promise>}
     */
    this.mutationPromises_ = [];

    /**
     * @const @private {MutationObserver}
     */
    this.mutationObserver_ =
        new MutationObserver(this.onMutationsObserved_.bind(this));

    /** @const @private {boolean} */
    this.workerExperimentEnabled_ = isExperimentOn(this.win_, 'web-worker');

    /**
     * Resolved when the service is fully initialized.
     * @const @private {Promise}
     */
    this.initializePromise_ = this.ampdoc.whenReady().then(() => {
      return this.initialize_();
    });

    /**
     * @private {?Promise}
     */
    this.setStatePromise_ = null;

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
   * @return {!Promise}
   */
  setState(state, opt_skipDigest) {
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    // TODO(choumx): What if `state` contains references to globals?
    Object.assign(this.scope_, state);

    if (!opt_skipDigest) {
      this.setStatePromise_ = this.initializePromise_.then(() => {
        user().fine(TAG, 'State updated; re-evaluating expressions...');
        return this.digest_();
      });
      return this.setStatePromise_;
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Parses and evaluates an expression with a given scope and merges the
   * resulting object into current state.
   * @param {string} expression
   * @param {!Object} scope
   * @return {!Promise}
   */
  setStateWithExpression(expression, scope) {
    this.setStatePromise_ = this.initializePromise_.then(() => {
      // Allow expression to reference current scope in addition to event scope.
      Object.assign(scope, this.scope_);
      if (this.workerExperimentEnabled_) {
        return invokeWebWorker(
            this.win_, 'bind.evaluateExpression', [expression, scope]);
      } else {
        return this.evaluator_.evaluateExpression(expression, scope);
      }
    }).then(returnValue => {
      if (returnValue.error) {
        user().error(TAG,
            'AMP.setState() failed with error: ', returnValue.error);
        throw returnValue.error;
      } else {
        return this.setState(returnValue.result);
      }
    });
    return this.setStatePromise_;
  }

  /**
   * Scans the ampdoc for bindings and creates the expression evaluator.
   * @return {!Promise}
   * @private
   */
  initialize_() {
    dev().fine(TAG, 'Scanning DOM for bindings...');
    return this.addBindingsForNode_(this.ampdoc.getBody());
  }

  /**
   * Scans the substree rooted at `node` and adds bindings for nodes
   * that contain bindable elements. This function is not idempotent.
   *
   * Returns a promise that resolves after bindings have been added.
   *
   * @param {!Element} node
   * @return {!Promise}
   *
   * @private
   */
  addBindingsForNode_(node) {
    return this.scanNode_(node).then(results => {
      const {boundElements, bindings, expressionToElements} = results;

      this.boundElements_ = this.boundElements_.concat(boundElements);
      Object.assign(this.expressionToElements_, expressionToElements);
      dev().fine(TAG, `Scanned ${bindings.length} bindings from ` +
          `${boundElements.length} elements.`);

      // Parse on web worker if experiment is enabled.
      if (this.workerExperimentEnabled_) {
        dev().fine(TAG, `Asking worker to parse expressions...`);
        return invokeWebWorker(this.win_, 'bind.addBindings', [bindings]);
      } else {
        this.evaluator_ = this.evaluator_ || new BindEvaluator();
        const parseErrors = this.evaluator_.addBindings(bindings);
        return parseErrors;
      }
    }).then(parseErrors => {
      // Report each parse error.
      Object.keys(parseErrors).forEach(expressionString => {
        const elements = this.expressionToElements_[expressionString];
        if (elements.length > 0) {
          const parseError = parseErrors[expressionString];
          const userError = user().createError(parseError.message);
          userError.stack = parseError.stack;
          reportError(userError, elements[0]);
        }
      });

      dev().fine(TAG, `Finished parsing expressions with ` +
          `${Object.keys(parseErrors).length} errors.`);

      // Trigger verify-only digest in development.
      if (getMode().development) {
        this.digest_(/* opt_verifyOnly */ true);
      }
    });
  }

  /**
   * Removes all bindings nodes with `node` as their parent.
   *
   * Returns a promise that resolves after bindings have been removed.
   *
   * @param {!Element} node
   * @return {!Promise}
   *
   * @private
   */
  removeBindingsForNode_(node) {
    return new Promise(resolve => {
      // Eliminate bound elements that have node as an ancestor.
      filterSplice(this.boundElements_, boundElement => {
        return !node.contains(boundElement.element);
      });

      // Eliminate elements from the expression to elements map that
      // have node as an ancestor. Delete expressions that are no longer
      // bound to elements.
      const deletedExpressions = [];
      for (const expression in this.expressionToElements_) {
        const elements = this.expressionToElements_[expression];
        filterSplice(elements, element => {
          return !node.contains(element);
        });
        if (elements.length == 0) {
          deletedExpressions.push(expression);
          delete this.expressionToElements_[expression];
        }
      }

      // Remove the bindings from the evaluator.
      if (this.workerExperimentEnabled_) {
        dev().fine(TAG, `Asking worker to parse expressions...`);
        return invokeWebWorker(this.win_,
          'bind.removeBindingsWithExpressionStrings',
          [deletedExpressions]);
      } else {
        this.evaluator_.removeBindingsWithExpressionStrings(deletedExpressions);
      }
      resolve();
    });
  }

  /**
   * Scans `node` for attributes that conform to bind syntax and returns
   * a tuple containing bound elements and binding data for the evaluator.
   * @param {!Node} node
   * @return {
   *   !Promise<{
   *     boundElements: !Array<BoundElementDef>,
   *     bindings: !Array<./bind-evaluator.BindingDef>,
   *     expressionToElements: !Object<string, !Array<!Element>>,
   *   }>
   * }
   * @private
   */
  scanNode_(node) {
    /** @type {!Array<BoundElementDef>} */
    const boundElements = [];
    /** @type {!Array<./bind-evaluator.BindingDef>} */
    const bindings = [];
    /** @type {!Object<string, !Array<!Element>>} */
    const expressionToElements = Object.create(null);

    const doc = dev().assert(
      node.ownerDocument, 'ownerDocument is null.');
    const walker = doc.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

    // Helper function for scanning the tree walker's next node.
    // Returns true if the walker has no more nodes.
    const scanNextNode_ = () => {
      const node = walker.currentNode;
      if (!node) {
        return true;
      }
      // Walker is filtered to only return elements
      const element = dev().assertElement(node);
      const tagName = element.tagName;
      if (tagName === 'TEMPLATE') {
        // Listen for changes in amp-mustache templates
        this.observeElementForMutations_(element);
      }

      const boundProperties = this.scanElement_(element);
      if (boundProperties.length > 0) {
        boundElements.push({element, boundProperties});
      }
      boundProperties.forEach(boundProperty => {
        const {property, expressionString} = boundProperty;
        bindings.push({tagName, property, expressionString});

        if (!expressionToElements[expressionString]) {
          expressionToElements[expressionString] = [];
        }
        expressionToElements[expressionString].push(element);
      });
      return !walker.nextNode();
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
          resolve({boundElements, bindings, expressionToElements});
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
        const err = user().createError(`Binding to [${property}] not allowed.`);
        reportError(err, element);
      }
    }
    return null;
  }

  /**
   * Asynchronously reevaluates all expressions and applies results to DOM.
   * If `opt_verifyOnly` is true, does not apply results but verifies them
   * against current element values instead.
   * @param {boolean=} opt_verifyOnly
   * @return {!Promise}
   * @private
   */
  digest_(opt_verifyOnly) {
    let evaluatePromise;
    if (this.workerExperimentEnabled_) {
      user().fine(TAG, 'Asking worker to re-evaluate expressions...');
      evaluatePromise =
          invokeWebWorker(this.win_, 'bind.evaluateBindings', [this.scope_]);
    } else {
      const evaluation = this.evaluator_.evaluateBindings(this.scope_);
      evaluatePromise = Promise.resolve(evaluation);
    }

    return evaluatePromise.then(returnValue => {
      const {results, errors} = returnValue;

      // Report evaluation errors.
      Object.keys(errors).forEach(expressionString => {
        const elements = this.expressionToElements_[expressionString];
        if (elements.length > 0) {
          const evalError = errors[expressionString];
          const userError = user().createError(evalError.message);
          userError.stack = evalError.stack;
          reportError(userError, elements[0]);
        }
      });

      if (opt_verifyOnly) {
        this.verify_(results);
      } else {
        return this.apply_(results);
      }
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
    const applyPromises = this.boundElements_.map(boundElement => {
      const {element, boundProperties} = boundElement;
      const tagName = element.tagName;

      const applyPromise = this.resources_.mutateElement(element, () => {
        const mutations = {};
        let width, height;

        boundProperties.forEach(boundProperty => {
          const {property, expressionString, previousResult} =
              boundProperty;

          // TODO(choumx): Perform in worker with URL API.
          // Rewrite attribute value if necessary. This is not done in the
          // worker since it relies on `url#parseUrl`, which uses DOM APIs.
          let newValue = results[expressionString];
          if (typeof newValue === 'string') {
            newValue = rewriteAttributeValue(tagName, property, newValue);
          }

          // Don't apply if the result hasn't changed or is missing.
          if (newValue === undefined ||
              this.shallowEquals_(newValue, previousResult)) {
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
      return applyPromise;
    });
    return Promise.all(applyPromises);
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
        if (Array.isArray(newValue) || typeof newValue === 'string') {
          element.className = ampClasses.concat(newValue).join(' ');
        } else if (newValue === null) {
          element.className = ampClasses.join(' ');
        } else {
          const err = user().createError(
              `"${newValue} is not a valid result for [class]."`);
          reportError(err, element);
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
        expectedValue = String(expectedValue);
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
          const err = user().createError(
              `"${expectedValue} is not a valid result for [class]."`);
          reportError(err, element);
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
      const err = user().createError(
        `Default value for [${property}] does not match first expression ` +
        `result (${expectedValue}). This can result in unexpected behavior ` +
        `after the next state change.`);
      reportError(err, element);
    }
  }

  /**
   * Begin observing mutations to element. Presently, all supported elements
   * that can add/remove bindings add new elements to their parent, so parent
   * node should be observed for mutations.
   * @private
   */
  observeElementForMutations_(element) {
    // TODO(kmh287): What if parent is the body tag?
    // TODO(kmh287): Generify logic for node observation strategy
    // when bind supprots more dynamic nodes.
    const elementToObserve = element.parentElement;
    this.mutationObserver_.observe(elementToObserve, {childList: true});
  }

  /**
   * Respond to observed mutations. Adds all bindings for newly added elements
   * removes bindings for removed elements, then immediately applies the current
   * scope to the new bindings.
   *
   * @param mutations {Array<MutationRecord>}
   * @private
   */
  onMutationsObserved_(mutations) {
    mutations.forEach(mutation => {
      // Add bindings for new nodes first to ensure that a binding isn't removed
      // and then subsequently re-added.
      const addPromises = [];
      const addedNodes = mutation.addedNodes;
      for (let i = 0; i < addedNodes.length; i++) {
        const addedNode = addedNodes[i];
        if (addedNode.nodeType == Node.ELEMENT_NODE) {
          const addedElement = dev().assertElement(addedNode);
          addPromises.push(this.addBindingsForNode_(addedElement));
        }
      }
      const mutationPromise = Promise.all(addPromises).then(() => {
        const removePromises = [];
        const removedNodes = mutation.removedNodes;
        for (let i = 0; i < removedNodes.length; i++) {
          const removedNode = removedNodes[i];
          if (removedNode.nodeType == Node.ELEMENT_NODE) {
            const removedElement = dev().assertElement(removedNode);
            removePromises.push(this.removeBindingsForNode_(removedElement));
          }
        }
        return Promise.all(removePromises);
      }).then(() => {
        return this.digest_();
      });
      if (getMode().test) {
        this.mutationPromises_.push(mutationPromise);
      }
    });
  }

  /**
   * Returns true if both arrays contain the same strings.
   * @param {!(IArrayLike<string>|Array<string>)} a
   * @param {!(IArrayLike<string>|Array<string>)} b
   * @return {boolean}
   * @private
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
   * @private
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


  /**
   * Wait for bind scan to finish for testing.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  initializePromiseForTesting() {
    return this.initializePromise_;
  }


  /**
   * Wait for bindings to evaluate and apply for testing. Should
   * be called once for each event that changes bindings.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  setStatePromiseForTesting() {
    return this.setStatePromise_;
  }

  /**
   * Wait for DOM mutation observer callbacks to fire. Returns a promise
   * that resolves when mutation callbacks have fired.
   *
   * @return {Promise}
   *
   * @visibleForTesting
   */
  waitForAllMutationsForTesting() {
    return timerFor(this.win_).poll(5, () => {
      return this.mutationPromises_.length > 0;
    }).then(() => {
      return Promise.all(this.mutationPromises_);
    }).then(() => {
      this.mutationPromises_.length = 0;
    });
  }

}
