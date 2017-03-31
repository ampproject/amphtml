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

import {dev, user} from '../log';
import {endsWith} from '../string';
import {platformFor} from '../services';
import {getStyle, setStyle, setStyles, computedStyle} from '../style';

const TAG = 'FixedLayer';

const DECLARED_FIXED_PROP = '__AMP_DECLFIXED';
const DECLARED_STICKY_PROP = '__AMP_DECLSTICKY';


/**
 * The fixed layer is a *sibling* of the body element. I.e. it's a direct
 * child of documentElement. It's used to manage the `postition:fixed` and
 * `position:sticky` elements in iOS-iframe case due to the
 * https://bugs.webkit.org/show_bug.cgi?id=154399 bug, which is itself
 * a result of workaround for the issue where scrolling is not supported
 * in iframes (https://bugs.webkit.org/show_bug.cgi?id=149264).
 * This implementation finds all elements that could be `fixed` or `sticky`
 * and checks on major relayouts if they are indeed `fixed`/`sticky`.
 * Some `fixed` elements may be moved into the "transfer layer".
 */
export class FixedLayer {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!./vsync-impl.Vsync} vsync
   * @param {number} borderTop
   * @param {number} paddingTop
   * @param {boolean} transfer
   */
  constructor(ampdoc, vsync, borderTop, paddingTop, transfer) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const */
    this.vsync_ = vsync;

    /** @const @private {number} */
    this.borderTop_ = borderTop;

    /** @private {number} */
    this.paddingTop_ = paddingTop;

    /** @private {number} */
    this.committedPaddingTop_ = paddingTop;

    /** @private @const {boolean} */
    this.transfer_ = transfer && ampdoc.isSingleDoc();

    /** @private {?Element} */
    this.transferLayer_ = null;

    /** @private {number} */
    this.counter_ = 0;

    /** @const @private {!Array<!ElementDef>} */
    this.elements_ = [];
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    if (this.transferLayer_) {
      this.vsync_.mutate(() => {
        setStyle(this.transferLayer_, 'visibility',
            visible ? 'visible' : 'hidden');
      });
    }
  }

  /**
   * Must be always called after DOMReady.
   */
  setup() {
    const stylesheets = this.ampdoc.getRootNode().styleSheets;
    if (!stylesheets) {
      return;
    }

    // Find all `position:fixed` and `sticky` elements.
    const fixedSelectors = [];
    const stickySelectors = [];
    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i];
      if (stylesheet.disabled ||
              !stylesheet.ownerNode ||
              stylesheet.ownerNode.tagName != 'STYLE' ||
              stylesheet.ownerNode.hasAttribute('amp-boilerplate') ||
              stylesheet.ownerNode.hasAttribute('amp-runtime') ||
              stylesheet.ownerNode.hasAttribute('amp-extension')) {
        continue;
      }
      this.discoverSelectors_(
          stylesheet.cssRules, fixedSelectors, stickySelectors);
    }

    this.trySetupSelectorsNoInline(fixedSelectors, stickySelectors);

    // Sort in document order.
    this.sortInDomOrder_();

    const platform = platformFor(this.ampdoc.win);
    if (this.elements_.length > 0 && !this.transfer_ && platform.isIos()) {
      user().warn(TAG, 'Please test this page inside of an AMP Viewer such' +
          ' as Google\'s because the fixed or sticky positioning might have' +
          ' slightly different layout.');
    }

    this.update();
  }

  /**
   * Updates the viewer's padding-top position and recalculates offsets of
   * all elements. The padding update can be transient, in which case the
   * UI itself is not updated leaving the blank space up top, which is invisible
   * due to scroll position. This mode saves significant resources. However,
   * eventhough layout is not updated, the fixed/sticky coordinates still need
   * to be recalculated.
   * @param {number} paddingTop
   * @param {boolean} opt_transient
   */
  updatePaddingTop(paddingTop, opt_transient) {
    this.paddingTop_ = paddingTop;
    if (!opt_transient) {
      this.committedPaddingTop_ = paddingTop;
    }
    this.update();
  }

  /**
   * Apply or reset transform style to fixed elements. The existing transition,
   * if any, is disabled when custom transform is supplied.
   * @param {?string} transform
   */
  transformMutate(transform) {
    // Unfortunately, we can't do anything with sticky elements here. Updating
    // `top` in animation frames causes reflow on all platforms and we can't
    // determine whether an element is currently docked to apply transform.
    if (transform) {
      // Apply transform style to all fixed elements
      this.elements_.forEach(e => {
        if (e.fixedNow && e.top) {
          setStyle(e.element, 'transition', 'none');
          if (e.transform && e.transform != 'none') {
            setStyle(e.element, 'transform', e.transform + ' ' + transform);
          } else {
            setStyle(e.element, 'transform', transform);
          }
        }
      });
    } else {
      // Reset transform style to all fixed elements
      this.elements_.forEach(e => {
        if (e.fixedNow && e.top) {
          setStyles(e.element, {
            transform: '',
            transition: '',
          });
        }
      });
    }
  }

  /**
   * Adds the element directly into the fixed/sticky layer, bypassing discovery.
   * @param {!Element} element
   * @param {boolean=} opt_forceTransfer If set to true , then the element needs
   *    to be forcefully transferred to the transfer layer.
   */
  addElement(element, opt_forceTransfer) {
    this.setupElement_(
        element,
        /* selector */ '*',
        /* position */ 'fixed',
        opt_forceTransfer);
    this.sortInDomOrder_();
    this.update();
  }

  /**
   * Removes the element from the fixed/sticky layer.
   * @param {!Element} element
   */
  removeElement(element) {
    const removed = this.removeElement_(element);
    if (removed.length > 0 && this.transferLayer_) {
      this.vsync_.mutate(() => {
        for (let i = 0; i < removed.length; i++) {
          const fe = removed[i];
          if (fe.position == 'fixed') {
            this.returnFromTransferLayer_(fe);
          }
        }
      });
    }
  }

  /**
   * Whether the element is declared as fixed in any of the user's stylesheets.
   * Will include any matches, not necessarily currently fixed elements.
   * @param {!Element} element
   * @return {boolean}
   */
  isDeclaredFixed(element) {
    return !!element[DECLARED_FIXED_PROP];
  }

  /**
   * Whether the element is declared as sticky in any of the user's stylesheets.
   * Will include any matches, not necessarily currently sticky elements.
   * @param {!Element} element
   * @return {boolean}
   */
  isDeclaredSticky(element) {
    return !!element[DECLARED_STICKY_PROP];
  }

  /**
   * Performs fixed/sticky actions.
   * 1. Updates `top` styling if necessary.
   * 2. On iOS/Iframe moves elements between fixed layer and BODY depending on
   * whether they are currently visible and fixed
   * @return {!Promise}
   */
  update() {
    if (this.elements_.length == 0) {
      return Promise.resolve();
    }

    // Some of the elements may no longer be in DOM.
    /** @type {!Array<!ElementDef>} */
    const toRemove = this.elements_.filter(
        fe => !this.ampdoc.contains(fe.element));
    toRemove.forEach(fe => this.removeElement_(fe.element));

    // Next, the positioning-related properties will be measured. If a
    // potentially fixed/sticky element turns out to be actually fixed/sticky,
    // it will be decorated and possibly move to a separate layer.
    let hasTransferables = false;
    return this.vsync_.runPromise({
      measure: state => {
        const autoTopMap = {};

        // Notice that this code intentionally breaks vsync contract.
        // Unfortunately, there's no way to reliably test whether or not
        // `top` has been set to a non-auto value on all platforms. To work
        // this around, this code compares `offsetTop` values with and without
        // `style.top = auto`.

        // 1. Set all style top to `auto` and calculate the auto-offset.
        this.elements_.forEach(fe => {
          setStyle(fe.element, 'top', 'auto');
        });
        this.elements_.forEach(fe => {
          autoTopMap[fe.id] = fe.element./*OK*/offsetTop;
        });

        // 2. Reset style top.
        this.elements_.forEach(fe => {
          setStyle(fe.element, 'top', '');
        });

        // 3. Calculated fixed/sticky info.
        this.elements_.forEach(fe => {
          const element = fe.element;
          const styles = computedStyle(this.ampdoc.win, element);
          const position = styles.position || '';
          // Element is indeed fixed. Visibility is added to the test to
          // avoid moving around invisible elements.
          const isFixed = (
            position == 'fixed' && (
                fe.forceTransfer || (
                    element./*OK*/offsetWidth > 0 &&
                    element./*OK*/offsetHeight > 0
                )
              )
            );
          // Element is indeed sticky.
          const isSticky = endsWith(position, 'sticky');
          if (!isFixed && !isSticky) {
            state[fe.id] = {
              fixed: false,
              sticky: false,
              transferrable: false,
              top: '',
              zIndex: '',
            };
            return;
          }

          // Calculate top, assuming that it could implicitly be `auto`.
          // `getComputedStyle().top` will return `auto` in Safari and the
          // actual calculated value in all other browsers. To find out whether
          // or not the `top` was actually set in CSS, this method compares
          // `offsetTop` with `style.top = 'auto'` and without.
          let top = styles.top;
          const currentOffsetTop = element./*OK*/offsetTop;
          const isImplicitAuto = currentOffsetTop == autoTopMap[fe.id];
          if ((top == 'auto' || isImplicitAuto) && top != '0px' ||
              // This is workaround for http://crbug.com/703816 in Chrome where
              // `getComputedStyle().top` returns `0px` instead of `auto`.
              (isSticky && top == '0px' && isImplicitAuto &&
                  currentOffsetTop != 0)) {
            top = '';
            if (currentOffsetTop ==
                    this.committedPaddingTop_ + this.borderTop_) {
              top = '0px';
            }
          }

          const bottom = styles.bottom;
          const opacity = parseFloat(styles.opacity);
          // Transferability requires element to be fixed and top or bottom to
          // be styled with `0`. Also, do not transfer transparent
          // elements - that's a lot of work for no benefit.  Additionally,
          // transparent elements used for "service" needs and thus
          // best kept in the original tree. The visibility, however, is not
          // considered because `visibility` CSS is inherited. Also, the
          // `height` is constrained to at most 300px. This is to avoid
          // transfering of more substantial sections for now. Likely to be
          // relaxed in the future.
          const isTransferrable = isFixed && (
              fe.forceTransfer || (
                  opacity > 0 &&
                  element./*OK*/offsetHeight < 300 &&
                  (this.isAllowedCoord_(top) || this.isAllowedCoord_(bottom))));
          if (isTransferrable) {
            hasTransferables = true;
          }
          state[fe.id] = {
            fixed: isFixed,
            sticky: isSticky,
            transferrable: isTransferrable,
            top,
            zIndex: styles.zIndex,
            transform: styles.transform,
          };
        });
      },
      mutate: state => {
        if (hasTransferables && this.transfer_) {
          const transferLayer = this.getTransferLayer_();
          if (transferLayer.className != this.ampdoc.getBody().className) {
            transferLayer.className = this.ampdoc.getBody().className;
          }
        }
        this.elements_.forEach((fe, i) => {
          const feState = state[fe.id];
          if (feState) {
            this.mutateElement_(fe, i, feState);
          }
        });
      },
    }, {}).catch(error => {
      // Fail silently.
      dev().error(TAG, 'Failed to mutate fixed elements:', error);
    });
  }

  /**
   * We currently only allow elements with `top: 0` or `bottom: 0`.
   * @param {string} s
   * @return {boolean}
   */
  isAllowedCoord_(s) {
    return (!!s && parseInt(s, 10) == 0);
  }

  /**
   * Calls `setupSelectors_` in a try-catch.
   * Fails quietly with a dev error if call fails.
   * This method should not be inlined to prevent TryCatch deoptimization.
   * NoInline keyword at the end of function name also prevents Closure compiler
   * from inlining the function.
   * @param {!Array<string>} fixedSelectors
   * @param {!Array<string>} stickySelectors
   * @private
   */
  trySetupSelectorsNoInline(fixedSelectors, stickySelectors) {
    try {
      this.setupSelectors_(fixedSelectors, stickySelectors);
    } catch (e) {
      // Fail quietly.
      dev().error(TAG, 'Failed to setup fixed elements:', e);
    }
  }

  /**
   * Calls `setupElement_` for up to 10 elements matching each selector
   * in `fixedSelectors` and for all selectors in `stickySelectors`.
   * @param {!Array<string>} fixedSelectors
   * @param {!Array<string>} stickySelectors
   * @private
   */
  setupSelectors_(fixedSelectors, stickySelectors) {
    for (let i = 0; i < fixedSelectors.length; i++) {
      const fixedSelector = fixedSelectors[i];
      const elements = this.ampdoc.getRootNode().querySelectorAll(
          fixedSelector);
      for (let j = 0; j < elements.length; j++) {
        if (j > 10) {
          // We shouldn't have too many of `fixed` elements.
          break;
        }
        this.setupElement_(elements[j], fixedSelector, 'fixed');
      }
    }
    for (let i = 0; i < stickySelectors.length; i++) {
      const stickySelector = stickySelectors[i];
      const elements = this.ampdoc.getRootNode().querySelectorAll(
          stickySelector);
      for (let j = 0; j < elements.length; j++) {
        this.setupElement_(elements[j], stickySelector, 'sticky');
      }
    }
  }

  /**
   * This method records the potentially fixed or sticky element. One of a more
   * critical functions - it records all selectors that may apply "fixed"
   * or "sticky" to this element to check them later.
   *
   * @param {!Element} element
   * @param {string} selector
   * @param {string} position
   * @param {boolean=} opt_forceTransfer If set to true , then the element needs
   *    to be forcefully transferred to the transfer layer.
   * @private
   */
  setupElement_(element, selector, position, opt_forceTransfer) {
    let fe = null;
    for (let i = 0; i < this.elements_.length; i++) {
      if (this.elements_[i].element == element &&
              this.elements_[i].position == position) {
        fe = this.elements_[i];
        break;
      }
    }
    const isFixed = position == 'fixed';
    if (fe) {
      // Already seen.
      fe.selectors.push(selector);
    } else {
      // A new entry.
      const id = 'F' + (this.counter_++);
      element.setAttribute('i-amphtml-fixedid', id);
      if (isFixed) {
        element[DECLARED_FIXED_PROP] = true;
      } else {
        element[DECLARED_STICKY_PROP] = true;
      }
      fe = {
        id,
        element,
        position,
        selectors: [selector],
        fixedNow: false,
        stickyNow: false,
      };
      this.elements_.push(fe);
    }

    fe.forceTransfer = isFixed && !!opt_forceTransfer;
  }

  /**
   * Removes element from the fixed layer.
   *
   * @param {!Element} element
   * @return {!Array<!ElementDef>}
   * @private
   */
  removeElement_(element) {
    const removed = [];
    for (let i = 0; i < this.elements_.length; i++) {
      if (this.elements_[i].element == element) {
        this.vsync_.mutate(() => {
          setStyle(element, 'top', '');
        });
        const fe = this.elements_[i];
        this.elements_.splice(i, 1);
        removed.push(fe);
      }
    }
    return removed;
  }

  /** @private */
  sortInDomOrder_() {
    this.elements_.sort(function(fe1, fe2) {
      // 8 | 2 = 0x0A
      // 2 - preceeding
      // 8 - contains
      if (fe1.element.compareDocumentPosition(fe2.element) & 0x0A != 0) {
        return 1;
      }
      return -1;
    });
  }

  /**
   * Mutates the fixed/sticky element. At this point it's determined that the
   * element is indeed fixed/sticky. There are two main functions here:
   *  1. `top` has to be updated to reflect viewer's paddingTop.
   *  2. The element may need to be transfered to the separate fixed layer.
   *
   * @param {!ElementDef} fe
   * @param {number} index
   * @param {!ElementStateDef} state
   * @private
   */
  mutateElement_(fe, index, state) {
    const element = fe.element;
    const oldFixed = fe.fixedNow;
    const oldSticky = fe.stickyNow;

    fe.fixedNow = state.fixed;
    fe.stickyNow = state.sticky;
    fe.top = (state.fixed || state.sticky) ? state.top : '';
    fe.transform = state.transform;

    // Reset `top` which was assigned before.
    if (oldFixed && !state.fixed || oldSticky && !state.sticky) {
      if (getStyle(element, 'top')) {
        setStyle(element, 'top', '');
      }
    }
    // Move back to the BODY layer and reset transfer z-index.
    if (oldFixed && !state.fixed || !state.transferrable) {
      this.returnFromTransferLayer_(fe);
    }

    // Update the new fixed/sticky state.
    if (state.fixed || state.sticky) {
      // Update `top`. This is necessary to adjust position to the viewer's
      // paddingTop.
      setStyle(element, 'top', state.top ?
          `calc(${state.top} + ${this.paddingTop_}px)` :
          '');

      // Move element to the fixed layer.
      if (this.transfer_ &&
              state.fixed && !oldFixed && state.transferrable) {
        this.transferToTransferLayer_(fe, index, state);
      }
    }
  }

  /**
   * @param {!ElementDef} fe
   * @param {number} index
   * @param {!ElementStateDef} state
   * @private
   */
  transferToTransferLayer_(fe, index, state) {
    const element = fe.element;
    if (element.parentElement == this.transferLayer_) {
      return;
    }

    dev().fine(TAG, 'transfer to fixed:', fe.id, fe.element);
    user().warn(TAG, 'In order to improve scrolling performance in Safari,' +
        ' we now move the element to a fixed positioning layer:', fe.element);

    if (!fe.placeholder) {
      // Never been transfered before: ensure that it's properly configured.
      setStyle(element, 'pointer-events', 'initial');
      fe.placeholder = this.ampdoc.win.document.createElement('i-amphtml-fp');
      fe.placeholder.setAttribute('i-amphtml-fixedid', fe.id);
      setStyle(fe.placeholder, 'display', 'none');
    }

    // Calculate z-index based on the declared z-index and DOM position.
    setStyle(element, 'zIndex',
        `calc(${10000 + index} + ${state.zIndex || 0})`);

    element.parentElement.replaceChild(fe.placeholder, element);
    this.getTransferLayer_().appendChild(element);

    // Test if the element still matches one of the `fixed` selectors. If not
    // return it back to BODY.
    const matches = fe.selectors.some(
        selector => this.matches_(element, selector));
    if (!matches) {
      user().warn(TAG,
          'Failed to move the element to the fixed position layer.' +
          ' This is most likely due to the compound CSS selector:',
          fe.element);
      this.returnFromTransferLayer_(fe);
    }
  }

  /**
   * @param {!Element} element
   * @param {string} selector
   * @return {boolean}
   */
  matches_(element, selector) {
    try {
      const matcher = element.matches ||
          element.webkitMatchesSelector ||
          element.mozMatchesSelector ||
          element.msMatchesSelector ||
          element.oMatchesSelector;
      if (matcher) {
        return matcher.call(element, selector);
      }
    } catch (e) {
      // Fail silently.
      dev().error(TAG, 'Failed to test query match:', e);
    }
    return false;
  }

  /**
   * @param {!ElementDef} fe
   * @private
   */
  returnFromTransferLayer_(fe) {
    if (!fe.placeholder || !this.ampdoc.contains(fe.placeholder)) {
      return;
    }
    dev().fine(TAG, 'return from fixed:', fe.id, fe.element);
    if (this.ampdoc.contains(fe.element)) {
      if (getStyle(fe.element, 'zIndex')) {
        setStyle(fe.element, 'zIndex', '');
      }
      fe.placeholder.parentElement.replaceChild(fe.element, fe.placeholder);
    } else {
      fe.placeholder.parentElement.removeChild(fe.placeholder);
    }
  }

  /**
   * @return {?Element}
   */
  getTransferLayer_() {
    // This mode is only allowed for a single-doc case.
    if (!this.transfer_ || this.transferLayer_) {
      return this.transferLayer_;
    }
    const doc = this.ampdoc.win.document;
    this.transferLayer_ = doc.body.cloneNode(/* deep */ false);
    this.transferLayer_.removeAttribute('style');
    setStyles(this.transferLayer_, {
      position: 'absolute',
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      pointerEvents: 'none',
      overflow: 'hidden',

      // Reset possible BODY styles.
      animation: 'none',
      background: 'none',
      border: 'none',
      borderImage: 'none',
      boxSizing: 'border-box',
      boxShadow: 'none',
      display: 'block',
      float: 'none',
      margin: 0,
      opacity: 1,
      outline: 'none',
      padding: 'none',
      transform: 'none',
      transition: 'none',
      visibility: 'visible',
    });
    doc.documentElement.appendChild(this.transferLayer_);
    return this.transferLayer_;
  }

  /**
   * @param {!Array<CSSRule>} rules
   * @param {!Array<string>} foundSelectors
   * @param {!Array<string>} stickySelectors
   * @private
   */
  discoverSelectors_(rules, foundSelectors, stickySelectors) {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.type == /* CSSStyleRule */ 1) {
        if (rule.selectorText != '*' && rule.style.position) {
          if (rule.style.position == 'fixed') {
            foundSelectors.push(rule.selectorText);
          } else if (endsWith(rule.style.position, 'sticky')) {
            stickySelectors.push(rule.selectorText);
          }
        }
      } else if (rule.type == /* CSSMediaRule */ 4) {
        this.discoverSelectors_(rule.cssRules, foundSelectors, stickySelectors);
      } else if (rule.type == /* CSSSupportsRule */ 12) {
        this.discoverSelectors_(rule.cssRules, foundSelectors, stickySelectors);
      }
    }
  }
}


/**
 * @typedef {{
 *   id: string,
 *   selectors: !Array,
 *   element: !Element,
 *   position: string,
 *   placeholder: (?Element|undefined),
 *   fixedNow: boolean,
 *   stickyNow: boolean,
 *   top: (string|undefined),
 *   transform: (string|undefined),
 *   forceTransfer: (boolean|undefined),
 * }}
 */
let ElementDef;

/**
 * @typedef {{
 *   fixed: boolean,
 *   sticky: boolean,
 *   transferrable: boolean,
 *   top: string,
 *   zIndex: string,
 * }}
 */
let ElementStateDef;
