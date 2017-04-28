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
import {deepMerge} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {formOrNullForElement} from '../../../src/form';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {invokeWebWorker} from '../../../src/web-worker/amp-worker';
import {isFiniteNumber} from '../../../src/types';
import {reportError} from '../../../src/error';
import {
  ampFormServiceForDoc,
  resourcesForDoc,
  viewerForDoc,
} from '../../../src/services';
import {filterSplice} from '../../../src/utils/array';
import {rewriteAttributeValue} from '../../../src/sanitizer';

const TAG = 'amp-bind';

/**
 * Regular expression that identifies AMP CSS classes.
 * Includes 'i-amphtml-', '-amp-', and 'amp-' prefixes.
 * @type {!RegExp}
 */
const AMP_CSS_RE = /^(i?-)?amp(html)?-/;

/**
 * Maximum depth for state merge.
 * @type {number}
 */
const MAX_MERGE_DEPTH = 10;

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
    // Allow integration test to access this class in testing mode.
    /** @const @private {boolean} */
    this.enabled_ = isBindEnabledFor(ampdoc.win);
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!Array<BoundElementDef>} */
    this.boundElements_ = [];

    /**
     * Upper limit on number of bindings for performance.
     * @private {number}
     */
    this.maxNumberOfBindings_ = 2000; // Based on ~1ms to parse an expression.

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
     * @const @private {MutationObserver}
     */
    this.mutationObserver_ =
        new MutationObserver(this.onMutationsObserved_.bind(this));

    /** @const @private {boolean} */
    this.workerExperimentEnabled_ = isExperimentOn(this.win_, 'web-worker');

    if (!this.workerExperimentEnabled_) {
      this.evaluator_ = new BindEvaluator();
    }

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.ampdoc);

    /**
     * Resolved when the service is fully initialized.
     * @const @private {Promise}
     */
    this.initializePromise_ = Promise.all([
      this.ampdoc.whenReady(),
      this.viewer_.whenFirstVisible(), // Don't initialize in prerender mode.
    ]).then(() => this.initialize_());

    /**
     * Form implementations are not filled in until ampdoc is ready.
     * So we must wait for that to finish before scanning form elements
     * for dynamic components.
     * @private {!Promise}
     */
    this.formInitializationPromise_ =
        ampFormServiceForDoc(this.ampdoc).then(ampFormService => {
          return ampFormService.whenInitialized();
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
    try {
      deepMerge(this.scope_, state, MAX_MERGE_DEPTH);
    } catch (e) {
      user().error(TAG, 'Failed to merge scope.', e);
    }

    if (!opt_skipDigest) {
      this.setStatePromise_ = this.initializePromise_.then(() => {
        user().fine(TAG, 'State updated; re-evaluating expressions...');
        return this.digest_();
      });
      if (getMode().test) {
        this.setStatePromise_.then(() => {
          this.dispatchEventForTesting_('amp:bind:setState');
        });
      }
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
    user().assert(this.enabled_, `Experiment "${TAG}" is disabled.`);

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
      const {result, error} = returnValue;
      if (error) {
        const userError = user().createError(`${TAG}: AMP.setState() failed `
            + `with error: ${error.message}`);
        userError.stack = error.stack;
        reportError(userError);
      } else {
        return this.setState(result);
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
    const promise = this.addBindingsForNode_(this.ampdoc.getBody());
    // Check default values against initial expression results in development.
    if (getMode().development) {
      promise.then(() => {
        this.digest_(/* opt_verifyOnly */ true);
      });
    }
    if (getMode().test) {
      promise.then(() => {
        this.dispatchEventForTesting_('amp:bind:initialize');
      });
    }
    return promise;
  }

  /**
   * The current number of bindings.
   * @return {number}
   * @private
   */
  numberOfBindings_() {
    return this.boundElements_.reduce((number, boundElement) => {
      return number + boundElement.boundProperties.length;
    }, 0);
  }

  /**
   * @param {number} value
   * @visibleForTesting
   */
  setMaxNumberOfBindingsForTesting(value) {
    this.maxNumberOfBindings_ = value;
  }

  /**
   * Scans the substree rooted at `node` and adds bindings for nodes
   * that contain bindable elements. This function is not idempotent.
   *
   * Returns a promise that resolves after bindings have been added.
   *
   * @param {!Element} node
   * @return {!Promise}
   * @private
   */
  addBindingsForNode_(node) {
    // Limit number of total bindings (unless in local manual testing).
    const limit = (getMode().localDev && !getMode().test)
        ? Number.POSITIVE_INFINITY
        : this.maxNumberOfBindings_ - this.numberOfBindings_();
    return this.scanNode_(node, limit).then(results => {
      const {
        boundElements, bindings, expressionToElements, limitExceeded,
      } = results;

      this.boundElements_ = this.boundElements_.concat(boundElements);
      Object.assign(this.expressionToElements_, expressionToElements);

      dev().fine(TAG, `Scanned ${bindings.length} bindings from ` +
          `${boundElements.length} elements.`);

      if (limitExceeded) {
        user().error(TAG, `Maximum number of bindings reached ` +
            `(${this.maxNumberOfBindings_}). Additional elements with ` +
            `bindings will be ignored.`);
      }

      if (bindings.length == 0) {
        return {};
      } else if (this.workerExperimentEnabled_) {
        dev().fine(TAG, `Asking worker to parse expressions...`);
        return invokeWebWorker(this.win_, 'bind.addBindings', [bindings]);
      } else {
        const parseErrors = this.evaluator_.addBindings(bindings);
        return parseErrors;
      }
    }).then(parseErrors => {
      // Report each parse error.
      Object.keys(parseErrors).forEach(expressionString => {
        const elements = this.expressionToElements_[expressionString];
        if (elements.length > 0) {
          const parseError = parseErrors[expressionString];
          const userError = user().createError(
              `${TAG}: Expression compilation error in "${expressionString}". `
              + parseError.message);
          userError.stack = parseError.stack;
          reportError(userError, elements[0]);
        }
      });

      dev().fine(TAG, `Finished parsing expressions with ` +
          `${Object.keys(parseErrors).length} errors.`);
    });
  }

  /**
   * Removes all bindings nodes with `node` as their parent.
   *
   * Returns a promise that resolves after bindings have been removed.
   *
   * @param {!Element} node
   * @return {!Promise}
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
      if (deletedExpressions.length > 0) {
        if (this.workerExperimentEnabled_) {
          dev().fine(TAG, `Asking worker to remove expressions...`);
          return invokeWebWorker(this.win_,
              'bind.removeBindingsWithExpressionStrings', [deletedExpressions]);
        } else {
          this.evaluator_.removeBindingsWithExpressionStrings(
              deletedExpressions);
        }
      }

      resolve();
    });
  }

  /**
   * Scans `node` for attributes that conform to bind syntax and returns
   * a tuple containing bound elements and binding data for the evaluator.
   * @param {!Node} node
   * @param {number} limit
   * @return {
   *   !Promise<{
   *     boundElements: !Array<BoundElementDef>,
   *     bindings: !Array<./bind-evaluator.BindingDef>,
   *     expressionToElements: !Object<string, !Array<!Element>>,
   *     limitExceeded: boolean,
   *   }>
   * }
   * @private
   */
  scanNode_(node, limit) {
    /** @type {!Array<BoundElementDef>} */
    const boundElements = [];
    /** @type {!Array<./bind-evaluator.BindingDef>} */
    const bindings = [];
    /** @type {!Object<string, !Array<!Element>>} */
    const expressionToElements = Object.create(null);

    const doc = dev().assert(
      node.ownerDocument, 'ownerDocument is null.');
    const walker = doc.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

    // Set to true if number of bindings in `node` exceeds `limit`.
    let limitExceeded = false;

    // Helper function for scanning the tree walker's next node.
    // Returns true if the walker has no more nodes.
    const scanNextNode_ = () => {
      const node = walker.currentNode;
      if (!node) {
        return true;
      }
      const element = dev().assertElement(node);
      const tagName = element.tagName;
      const observeElement = elementToObserve => {
        this.mutationObserver_.observe(elementToObserve, {childList: true});
      };

      if (typeof element.getDynamicElementContainers === 'function') {
        element.getDynamicElementContainers().forEach(observeElement);
      } else if (element.tagName === 'FORM') {
        this.formInitializationPromise_.then(() => {
          const form = formOrNullForElement(element);
          dev().assert(form, 'could not find form implementation');
          form.getDynamicElementContainers().forEach(observeElement);
        });
      }

      let boundProperties = this.scanElement_(element);
      // Stop scanning once |limit| bindings are reached.
      if (bindings.length + boundProperties.length > limit) {
        boundProperties = boundProperties.slice(0, limit - bindings.length);
        limitExceeded = true;
      }
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
      return !walker.nextNode() || limitExceeded;
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
          resolve({
            boundElements, bindings, expressionToElements, limitExceeded,
          });
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
    const tagName = element.tagName;
    const name = attribute.name;
    if (name.length > 2 && name[0] === '[' && name[name.length - 1] === ']') {
      const property = name.substr(1, name.length - 2);
      if (this.validator_.canBind(tagName, property)) {
        return {property, expressionString: attribute.value};
      } else {
        const err = user().createError(
            `${TAG}: Binding to [${property}] on <${tagName}> is not allowed.`);
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
          const userError = user().createError(
              `${TAG}: Expression evaluation error in "${expressionString}". `
              + evalError.message);
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

      // TODO(choumx): We should avoid triggering a mutation if the expression
      // results don't affect this element.
      const applyPromise = this.resources_.mutateElement(element, () => {
        const mutations = {};
        let width, height;

        boundProperties.forEach(boundProperty => {
          const {property, expressionString, previousResult} =
              boundProperty;

          const newValue = results[expressionString];

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

          switch (property) {
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
          // Prevent an exception in the callback from interrupting execution,
          // instead wrap in user error and give a helpful message.
          try {
            element.mutatedAttributesCallback(mutations);
          } catch (e) {
            const error = user().createError(`${TAG}: Applying expression ` +
                `results (${JSON.stringify(mutations)}) failed with error`, e);
            reportError(error, element);
          }
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
              `${TAG}: "${newValue}" is not a valid result for [class].`);
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
          // TODO(choumx): Perform in worker with URL API.
          // Rewrite attribute value if necessary. This is not done in the
          // worker since it relies on `url#parseUrl`, which uses DOM APIs.
          let rewrittenNewValue;
          try {
            rewrittenNewValue = rewriteAttributeValue(
                element.tagName, property, String(newValue));
          } catch (e) {
            const err = user().createError(`${TAG}: "${newValue}" is not a ` +
                `valid result for [${property}]`, e);
            reportError(err, element);
          }
          // Rewriting can fail due to e.g. invalid URL.
          if (rewrittenNewValue !== undefined) {
            element.setAttribute(property, rewrittenNewValue);
            attributeChanged = true;
          }
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
        for (let i = 0; i < element.classList.length; i++) {
          const cssClass = element.classList[i];
          // Ignore internal AMP classes.
          if (AMP_CSS_RE.test(cssClass)) {
            continue;
          }
          initialValue.push(cssClass);
        }
        /** @type {!Array<string>} */
        let classes = [];
        if (Array.isArray(expectedValue)) {
          classes = expectedValue;
        } else if (typeof expectedValue === 'string') {
          classes = expectedValue.split(' ');
        } else {
          const err = user().createError(
              `${TAG}: "${expectedValue}" is not a valid result for [class].`);
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
      const err = user().createError(`${TAG}: ` +
        `Default value for [${property}] does not match first expression ` +
        `result (${expectedValue}). This can result in unexpected behavior ` +
        `after the next state change.`);
      reportError(err, element);
    }
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
      });
      // TODO(kmh287): Come up with a strategy for evaluating new bindings
      // added here that mitigates FOUC.
      if (getMode().test) {
        mutationPromise.then(() => {
          this.dispatchEventForTesting_('amp:bind:mutated');
        });
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
   * @param {string} name
   * @private
   */
  dispatchEventForTesting_(name) {
    if (getMode().test) {
      this.win_.dispatchEvent(new Event(name));
    }
  }
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
export function isBindEnabledFor(win) {
  // Allow integration tests access.
  if (getMode().test) {
    return true;
  }
  if (isExperimentOn(win, TAG)) {
    return true;
  }
  // TODO(choumx): Replace with real origin trial feature when implemented.
  const token =
      win.document.head.querySelector('meta[name="amp-experiment-token"]');
  if (token && token.getAttribute('content') === 'HfmyLgNLmblRg3Alqy164Vywr') {
    return true;
  }
  return false;
}
