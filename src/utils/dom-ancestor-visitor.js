import {devAssert, devAssertElement} from '#core/assert';
import {computedStyle} from '#core/dom/style';

import {dev} from '#utils/log';

/** @typedef {
 *    function(!Element, !{[key: string]: string}): *
 *  }
 */
export let VisitorCallbackTypeDef;

/**
 * Utility class that will visit every ancestor of a given element, and call
 * the provided callback functions on each element, passing in the element and
 * its computed styles as arguments to the callbacks. Callbacks may cease
 * visiting further nodes by returning a value, which may later be retrieved by
 * calling 'getValueFor(visitorName)'. Once all visitors have returned or hit
 * their maximum nodes to visit, no more nodes will be visited.
 *
 * Example usage:
 * new DomAncestorVisitor()
 *   .addVisitor((el, style) => { ... })
 *   .addVisitor((el, style) => { ... })
 *   ...
 *   .visitAncestorsStartingFrom(someElement);
 */
export class DomAncestorVisitor {
  /** @param {!Window=} win */
  constructor(win = window) {
    /**
     * List of tasks to execute during each visit.
     * @private @const {!Array<!Visitor>}
     */
    this.visitors_ = [];

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /**
   * Returns a list of visitors that have not yet been marked completed.
   * @return {!Array<!Visitor>}
   * @private
   */
  getActiveVisitors_() {
    return this.visitors_.filter((visitor) => !visitor.complete);
  }

  /**
   * @param {!VisitorCallbackTypeDef} callback
   * @param {number=} maxAncestorsToVisit The limit of how many ancestors this
   *   task should be executed on. Must be positive.
   * @return {!DomAncestorVisitor}
   */
  addVisitor(callback, maxAncestorsToVisit = 100) {
    this.visitors_.push(new Visitor(callback, maxAncestorsToVisit));
    return this;
  }

  /**
   * @param {?Element} element
   */
  visitAncestorsStartingFrom(element) {
    let el = element;
    let visitors = [];
    while (el && (visitors = this.getActiveVisitors_()).length) {
      const style = computedStyle(this.win_, el);
      visitors.forEach((visitor) =>
        visitor.callback(devAssertElement(el), style)
      );
      el = el.parentElement;
    }
    this.visitors_.forEach((visitor) => (visitor.complete = true));
  }
}

class Visitor {
  /**
   * @param {!VisitorCallbackTypeDef} callback
   * @param {number} maxAncestorsToVisit
   */
  constructor(callback, maxAncestorsToVisit) {
    devAssert(
      maxAncestorsToVisit > 0,
      'maxAncestorsToVisit must be a positive value.'
    );

    /** @private @const {!VisitorCallbackTypeDef} */
    this.callback_ = callback;

    /** @private {number} */
    this.maxAncestorsToVisit_ = maxAncestorsToVisit;

    /** @type {boolean} */
    this.complete = false;
  }

  /**
   * @param {!Element} element
   * @param {!{[key: string]: string}} style
   */
  callback(element, style) {
    devAssert(
      !this.complete,
      'Attempted to execute callback on completed visitor.'
    );
    let result;
    try {
      result = this.callback_(element, style);
    } catch (e) {
      dev().warn(
        'DOM-ANCESTOR-VISITOR',
        `Visitor encountered error during callback execution: "${e}".`
      );
    }
    if (!--this.maxAncestorsToVisit_ || result != undefined) {
      this.complete = true;
    }
  }
}
