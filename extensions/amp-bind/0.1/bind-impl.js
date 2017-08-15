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

import {AmpEvents} from '../../../src/amp-events';
import {BindEvents} from './bind-events';
import {BindExpressionResultDef} from './bind-expression';
import {BindingDef} from './bind-evaluator';
import {BindValidator} from './bind-validator';
import {Services} from '../../../src/services';
import {chunk, ChunkPriority} from '../../../src/chunk';
import {dev, user} from '../../../src/log';
import {dict, deepMerge} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {filterSplice} from '../../../src/utils/array';
import {installServiceInEmbedScope} from '../../../src/service';
import {invokeWebWorker} from '../../../src/web-worker/amp-worker';
import {isArray, isObject, toArray} from '../../../src/types';
import {isFiniteNumber} from '../../../src/types';
import {map} from '../../../src/utils/object';
import {recursiveEquals} from '../../../src/json';
import {reportError} from '../../../src/error';
import {rewriteAttributeValue} from '../../../src/sanitizer';
import {waitForBodyPromise} from '../../../src/dom';

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
 * `previousResult` is the result of this expression during the last evaluation.
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
 * A map of tag names to arrays of attributes that do not have non-bind
 * counterparts. For instance, amp-carousel allows a `[slide]` attribute,
 * but does not support a `slide` attribute.
 * @const {!Object<string, !Array<string>>}
 */
const BIND_ONLY_ATTRIBUTES = map({
  'AMP-CAROUSEL': ['slide'],
  'AMP-LIST': ['state'],
  'AMP-SELECTOR': ['selected'],
});

/**
 * Bind is an ampdoc-scoped service that handles the Bind lifecycle, from
 * scanning for bindings to evaluating expressions to mutating elements.
 * @implements {../../../src/service.EmbeddableService}
 */
export class Bind {
  /**
   * If `opt_win` is provided, scans its document for bindings instead.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Window=} opt_win
   */
  constructor(ampdoc, opt_win) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /**
     * The window containing the document to scan.
     * May differ from the `ampdoc`'s window e.g. in FIE.
     * @const @private {!Window}
     */
    this.localWin_ = opt_win || ampdoc.win;

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

    /** @const @private {!JsonObject} */
    this.scope_ = dict();

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc);

    const bodyPromise = (opt_win)
        ? waitForBodyPromise(opt_win.document)
            .then(() => dev().assertElement(opt_win.document.body))
        : ampdoc.whenBodyAvailable();

    /**c.
     * Resolved when the service finishes scanning the document for bindings.
     * @const @private {Promise}
     */
    this.initializePromise_ =
        this.viewer_.whenFirstVisible().then(() => bodyPromise).then(body => {
          return this.initialize_(body);
        });

    /** @const @private {!Function} */
    this.boundOnDomUpdate_ = this.onDomUpdate_.bind(this);

    /**
     * @private {?Promise}
     */
    this.setStatePromise_ = null;

    // Expose for testing on dev.
    if (getMode().development || getMode().localDev) {
      AMP.printState = this.printState_.bind(this);
    }
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    installServiceInEmbedScope(
        embedWin, 'bind', new Bind(this.ampdoc, embedWin));
  }

  /**
   * Merges `state` into the current scope and immediately triggers an
   * evaluation unless `opt_skipEval` is false.
   * @param {!Object} state
   * @param {boolean=} opt_skipEval
   * @param {boolean=} opt_isAmpStateMutation
   * @return {!Promise}
   */
  setState(state, opt_skipEval, opt_isAmpStateMutation) {
    // TODO(choumx): What if `state` contains references to globals?
    try {
      deepMerge(this.scope_, state, MAX_MERGE_DEPTH);
    } catch (e) {
      user().error(TAG, 'Failed to merge scope.', e);
    }

    if (opt_skipEval) {
      return Promise.resolve();
    }

    user().fine(TAG, 'State updated; re-evaluating expressions...');

    const promise = this.initializePromise_
        .then(() => this.evaluate_())
        .then(results => this.apply_(results, opt_isAmpStateMutation));

    if (getMode().test) {
      promise.then(() => {
        this.dispatchEventForTesting_(BindEvents.SET_STATE);
      });
    }

    return this.setStatePromise_ = promise;
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
      return this.ww_('bind.evaluateExpression', [expression, scope]);
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
   * Rescans elements for bindings, evaluates corresponding expressions
   * and applies the results to only those elements. Does _not_ mutate other
   * elements in the document.
   *
   * Returned promise is resolved when rescan and evaluation complete.
   * If it doesn't complete within `timeout` ms, the promise is rejected.
   *
   * @param {!Array<!Element>} elements
   * @param {number} timeout Timeout in milliseconds.
   * @return {!Promise}
   */
  rescanAndEvaluate(elements, timeout = 2000) {
    const rescan = this.removeBindingsForNodes_(elements)
        .then(() => this.addBindingsForNodes_(elements))
        .then(numberOfBindingsAdded => {
          // Don't reevaluate/apply if there are no bindings.
          if (numberOfBindingsAdded > 0) {
            return this.evaluate_().then(results =>
                this.applyElements_(results, elements));
          }
        });
    return this.timer_.timeoutPromise(timeout, rescan,
        'Timed out waiting for amp-bind to process rendered template.');
  }

  /**
   * Scans the ampdoc for bindings and creates the expression evaluator.
   * @param {!Node} rootNode
   * @return {!Promise}
   * @private
   */
  initialize_(rootNode) {
    dev().fine(TAG, 'Scanning DOM for bindings...');
    let promise = this.addBindingsForNodes_([rootNode]).then(() => {
      // Listen for DOM updates (e.g. template render) to rescan for bindings.
      rootNode.addEventListener(AmpEvents.DOM_UPDATE, this.boundOnDomUpdate_);
    });
    if (getMode().development) {
      // Check default values against initial expression results.
      promise = promise.then(() =>
        this.evaluate_().then(results => this.verify_(results))
      );
    }
    if (getMode().test) {
      // Signal init completion for integration tests.
      promise.then(() => {
        this.dispatchEventForTesting_(BindEvents.INITIALIZE);
      });
    }
    return promise;
  }

  /**
   * The current number of bindings.
   * @return {number}
   * @visibleForTesting
   */
  numberOfBindings() {
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
   * For each node in an array, scans it and its descendants for bindings.
   * This function is not idempotent.
   *
   * Returns a promise that resolves after bindings have been added.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise<number>}
   * @private
   */
  addBindingsForNodes_(nodes) {
    // For each node, scan it for bindings and store them.
    const scanPromises = nodes.map(node => {
      // Limit number of total bindings (unless in local manual testing).
      const limit = (getMode().localDev && !getMode().test)
          ? Number.POSITIVE_INFINITY
          : this.maxNumberOfBindings_ - this.numberOfBindings();

      return this.scanNode_(node, limit).then(results => {
        const {
          boundElements, bindings, expressionToElements, limitExceeded,
        } = results;

        this.boundElements_ = this.boundElements_.concat(boundElements);
        Object.assign(this.expressionToElements_, expressionToElements);

        dev().fine(TAG, `Scanned ${bindings.length} bindings from ` +
            `${boundElements.length} elements.`);

        if (limitExceeded) {
          user().error(TAG, 'Maximum number of bindings reached ' +
              `(${this.maxNumberOfBindings_}). Additional elements with ` +
              'bindings will be ignored.');
        }

        return bindings;
      });
    });

    // Once all scans are complete, combine the bindings and ask web-worker to
    // evaluate expressions in a single RPC.
    return Promise.all(scanPromises).then(results => {
      // `results` is a 2D array where results[i] is an array of bindings.
      // Flatten this into a 1D array of bindings via concat.
      const bindings = Array.prototype.concat.apply([], results);
      if (bindings.length == 0) {
        return bindings.length;
      } else {
        dev().fine(TAG, 'Asking worker to parse expressions...');
        return this.ww_('bind.addBindings', [bindings]).then(parseErrors => {
          // Report each parse error.
          Object.keys(parseErrors).forEach(expressionString => {
            const elements = this.expressionToElements_[expressionString];
            if (elements.length > 0) {
              const parseError = parseErrors[expressionString];
              const userError = user().createError(
                  `${TAG}: Expression compile error in "${expressionString}". `
                  + parseError.message);
              userError.stack = parseError.stack;
              reportError(userError, elements[0]);
            }
          });
          dev().fine(TAG, 'Finished parsing expressions with ' +
              `${Object.keys(parseErrors).length} errors.`);
          return bindings.length;
        });
      }
    });
  }

  /**
   * For each node in an array, removes all bindings for it and its descendants.
   *
   * Returns a promise that resolves after bindings have been removed.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise}
   * @private
   * @visibleForTesting
   */
  removeBindingsForNodes_(nodes) {
    // Eliminate bound elements that are descendants of `nodes`.
    filterSplice(this.boundElements_, boundElement => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].contains(boundElement.element)) {
          return false;
        }
      }
      return true;
    });

    // Eliminate elements from the expression to elements map that
    // have node as an ancestor. Delete expressions that are no longer
    // bound to elements.
    const deletedExpressions = [];
    for (const expression in this.expressionToElements_) {
      const elements = this.expressionToElements_[expression];
      filterSplice(elements, element => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].contains(element)) {
            return false;
          }
        }
        return true;
      });
      if (elements.length == 0) {
        deletedExpressions.push(expression);
        delete this.expressionToElements_[expression];
      }
    }

    // Remove the bindings from the evaluator.
    if (deletedExpressions.length > 0) {
      dev().fine(TAG, 'Asking worker to remove expressions...');
      return this.ww_(
          'bind.removeBindingsWithExpressionStrings', [deletedExpressions]);
    } else {
      return Promise.resolve();
    }
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

    const doc = dev().assert(node.ownerDocument, 'ownerDocument is null.');
    // Third and fourth params of `createTreeWalker` are not optional on IE11.
    const walker = doc.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null,
        /* entityReferenceExpansion */ false);

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
   * Asynchronously reevaluates all expressions and returns a map of
   * expression strings to evaluated results.
   * @return {!Promise<
   *     !Object<string, ./bind-expression.BindExpressionResultDef>
   * >}
   * @private
   */
  evaluate_() {
    user().fine(TAG, 'Asking worker to re-evaluate expressions...');
    const evaluatePromise = this.ww_('bind.evaluateBindings', [this.scope_]);
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
      return results;
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
   * Determines which properties to update based on results of evaluation
   * of all bound expression strings with the current scope. This method
   * will only return properties that need to be updated along with their
   * new value.
   * @param {!Array<!BoundPropertyDef>} boundProperties
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @return {
   *   !Array<{
   *     boundProperty: !BoundPropertyDef,
   *     newValue: !./bind-expression.BindExpressionResultDef,
   *   }>
   * }
   * @private
   */
  calculateUpdates_(boundProperties, results) {
    const updates = [];
    boundProperties.forEach(boundProperty => {
      const {expressionString, previousResult} = boundProperty;
      const newValue = results[expressionString];
      if (newValue === undefined ||
          recursiveEquals(newValue, previousResult, /* depth */ 3)) {
        user().fine(TAG, 'Expression result unchanged or missing: ' +
            `"${expressionString}"`);
      } else {
        boundProperty.previousResult = newValue;
        user().fine(TAG, 'New expression result: ' +
            `"${expressionString}" -> ${newValue}`);
        updates.push({boundProperty, newValue});
      }
    });
    return updates;
  }

  /**
   * Applies expression results to all elements in the document.
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @param {boolean=} opt_isAmpStateMutation
   * @return {!Promise}
   * @private
   */
  apply_(results, opt_isAmpStateMutation) {
    const promises = this.boundElements_.map(boundElement => {
      // If this "apply" round is triggered by an <amp-state> mutation,
      // ignore updates to <amp-state> element to prevent update cycles.
      if (opt_isAmpStateMutation
          && boundElement.element.tagName == 'AMP-STATE') {
        return Promise.resolve();
      }
      return this.applyBoundElement_(results, boundElement);
    });
    return Promise.all(promises);
  }

  /**
   * Applies expression results to only given elements and their descendants.
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @param {!Array<!Element>} elements
   * @return {!Promise}
   */
  applyElements_(results, elements) {
    const promises = [];
    this.boundElements_.forEach(boundElement => {
      elements.forEach(element => {
        if (element.contains(boundElement.element)) {
          promises.push(this.applyBoundElement_(results, boundElement));
        }
      });
    });
    return Promise.all(promises);
  }

  /**
   * Applies expression results to a single BoundElementDef.
   * @param {Object<string, ./bind-expression.BindExpressionResultDef>} results
   * @param {BoundElementDef} boundElement
   * @return {!Promise}
   */
  applyBoundElement_(results, boundElement) {
    const {element, boundProperties} = boundElement;
    const updates = this.calculateUpdates_(boundProperties, results);
    if (updates.length === 0) {
      return Promise.resolve();
    }
    return this.resources_.mutateElement(element, () => {
      const mutations = dict();
      let width, height;

      updates.forEach(update => {
        const {boundProperty, newValue} = update;
        const mutation = this.applyBinding_(boundProperty, element, newValue);
        if (mutation) {
          mutations[mutation.name] = mutation.value;
          const property = boundProperty.property;
          if (property == 'width') {
            width = isFiniteNumber(newValue) ? Number(newValue) : width;
          } else if (property == 'height') {
            height = isFiniteNumber(newValue) ? Number(newValue) : height;
          }
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
        // Some input elements treat some of their attributes as initial values.
        // Once the user interacts with these elements, the JS properties
        // underlying these attributes must be updated for the change to be
        // visible to the user.
        const updateProperty =
            element.tagName == 'INPUT' && property in element;
        const oldValue = element.getAttribute(property);

        let mutated = false;
        if (typeof newValue === 'boolean') {
          if (updateProperty && element[property] !== newValue) {
            // Property value _must_ be read before the attribute is changed.
            // Before user interaction, attribute updates affect the property.
            element[property] = newValue;
            mutated = true;
          }
          if (newValue && oldValue !== '') {
            element.setAttribute(property, '');
            mutated = true;
          } else if (!newValue && oldValue !== null) {
            element.removeAttribute(property);
            mutated = true;
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
            // TODO(choumx): Don't bother setting for bind-only attrs.
            element.setAttribute(property, rewrittenNewValue);
            if (updateProperty) {
              element[property] = rewrittenNewValue;
            }
            mutated = true;
          }
        }

        if (mutated) {
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

    // Don't show a warning for bind-only attributes,
    // like 'slide' on amp-carousel.
    const bindOnlyAttrs = BIND_ONLY_ATTRIBUTES[element.tagName];
    if (bindOnlyAttrs && bindOnlyAttrs.includes(property)) {
      return;
    }

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
          const trimmed = expectedValue.trim();
          if (trimmed.length > 0) {
            classes = trimmed.split(' ');
          }
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
        'after the next state change.');
      reportError(err, element);
    }
  }

  /**
   * @param {!Event} event
   */
  onDomUpdate_(event) {
    const templateContainer = dev().assertElement(event.target);
    this.removeBindingsForNodes_([templateContainer]).then(() => {
      return this.addBindingsForNodes_([templateContainer]);
    }).then(() => {
      this.dispatchEventForTesting_(BindEvents.RESCAN_TEMPLATE);
    });
  }

  /**
   * Helper for invoking a method on web worker.
   * @param {string} method
   * @param {!Array=} opt_args
   * @return {!Promise}
   */
  ww_(method, opt_args) {
    return invokeWebWorker(this.win_, method, opt_args, this.localWin_);
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
   * Print out the current state in the console.
   * @private
   */
  printState_() {
    const seen = [];
    const s = JSON.stringify(this.scope_, (key, value) => {
      if (isObject(value)) {
        if (seen.includes(value)) {
          return '[Circular]';
        } else {
          seen.push(value);
        }
      }
      return value;
    });
    user().info(TAG, s);
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
      let event;
      if (typeof this.localWin_.Event === 'function') {
        event = new Event(name, {bubbles: true, cancelable: true});
      } else {
        event = this.localWin_.document.createEvent('Event');
        event.initEvent(name, /* bubbles */ true, /* cancelable */ true);
      }
      this.localWin_.dispatchEvent(event);
    }
  }
}
