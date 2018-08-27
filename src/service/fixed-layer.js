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

import {Services} from '../services';
import {
  computedStyle,
  getVendorJsPropertyName,
  setImportantStyles,
  setStyle,
  setStyles,
} from '../style';
import {dev, user} from '../log';
import {endsWith} from '../string';

const TAG = 'FixedLayer';

const DECLARED_FIXED_PROP = '__AMP_DECLFIXED';
const DECLARED_STICKY_PROP = '__AMP_DECLSTICKY';


/**
 * The fixed layer is a *sibling* of the body element. I.e. it's a direct
 * child of documentElement. It's used to manage the `position:fixed` and
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

    /** @private {?TransferLayerDef} */
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
        setStyle(
            this.transferLayer_.getRoot(),
            'visibility',
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

    const fixedSelectors = [];
    const stickySelectors = [];
    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i];
      const {ownerNode} = stylesheet;
      if (stylesheet.disabled ||
              !ownerNode ||
              ownerNode.tagName != 'STYLE' ||
              ownerNode.hasAttribute('amp-boilerplate') ||
              ownerNode.hasAttribute('amp-runtime') ||
              ownerNode.hasAttribute('amp-extension')) {
        continue;
      }
      this.discoverSelectors_(
          stylesheet.cssRules, fixedSelectors, stickySelectors);
    }

    this.trySetupSelectorsNoInline(fixedSelectors, stickySelectors);

    // Sort in document order.
    this.sortInDomOrder_();

    const platform = Services.platformFor(this.ampdoc.win);
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
   * @return {!Promise}
   */
  addElement(element, opt_forceTransfer) {
    const {win} = this.ampdoc;
    if (!element./*OK*/offsetParent &&
        computedStyle(win, element).display === 'none') {
      dev().error(TAG, 'Tried to add display:none element to FixedLayer',
          element.tagName);
    }
    this.setupElement_(
        element,
        /* selector */ '*',
        /* position */ 'fixed',
        opt_forceTransfer);
    this.sortInDomOrder_();
    return this.update();
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
            this.transferLayer_.returnFrom(fe);
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
    // Some of the elements may no longer be in DOM.
    /** @type {!Array<!ElementDef>} */
    const toRemove = this.elements_.filter(
        fe => !this.ampdoc.contains(fe.element));
    toRemove.forEach(fe => this.removeElement_(fe.element));

    if (this.elements_.length == 0) {
      return Promise.resolve();
    }

    // Next, the positioning-related properties will be measured. If a
    // potentially fixed/sticky element turns out to be actually fixed/sticky,
    // it will be decorated and possibly moved to a separate layer.
    let hasTransferables = false;
    return this.vsync_.runPromise({
      measure: state => {
        const elements = this.elements_;
        const autoTops = [];
        const {win} = this.ampdoc;

        // Notice that this code intentionally breaks vsync contract.
        // Unfortunately, there's no way to reliably test whether or not
        // `top` has been set to a non-auto value on all platforms. To work
        // this around, this code compares `style.top` values with a new
        // `style.bottom` value.
        // 1. Unset top from previous mutates and set bottom to an extremely
        // large value (to catch cases where sticky-tops are in a long way
        // down inside a scroller).
        for (let i = 0; i < elements.length; i++) {
          setImportantStyles(elements[i].element, {
            top: '',
            bottom: '-9999vh',
            transition: 'none',
          });
        }
        // 2. Capture the `style.top` with this new `style.bottom` value. If
        // this element has a non-auto top, this value will remain constant
        // regardless of bottom.
        for (let i = 0; i < elements.length; i++) {
          autoTops.push(computedStyle(win, elements[i].element).top);
        }
        // 3. Cleanup the `style.bottom`.
        for (let i = 0; i < elements.length; i++) {
          setStyle(elements[i].element, 'bottom', '');
        }

        for (let i = 0; i < elements.length; i++) {
          const fe = elements[i];
          const {element} = fe;
          const style = computedStyle(win, element);

          const {offsetWidth, offsetHeight, offsetTop} = element;
          const {
            position = '',
            display = '',
            bottom,
            zIndex,
          } = style;
          const opacity = parseFloat(style.opacity);
          const transform = style[getVendorJsPropertyName(style, 'transform')];
          let {top} = style;

          // Element is indeed fixed. Visibility is added to the test to
          // avoid moving around invisible elements.
          const isFixed = (
            position == 'fixed' &&
              (fe.forceTransfer || (offsetWidth > 0 && offsetHeight > 0)));
          // Element is indeed sticky.
          const isSticky = endsWith(position, 'sticky');
          const isDisplayed = (display !== 'none');

          if (!isDisplayed || !(isFixed || isSticky)) {
            state[fe.id] = {
              fixed: false,
              sticky: false,
              transferrable: false,
              top: '',
              zIndex: '',
            };
            continue;
          }

          if (top === 'auto' || autoTops[i] !== top) {
            if (isFixed &&
                offsetTop === this.committedPaddingTop_ + this.borderTop_) {
              top = '0px';
            } else {
              top = '';
            }
          }

          // Transferability requires element to be opaque (not 100%
          // transparent) - that's a lot of work for no benefit. Additionally,
          // transparent elements used for "service" needs and thus best kept
          // in the original tree. The visibility, however, is not considered
          // because `visibility` CSS is inherited.
          const isTransferrable = isFixed && (
            fe.forceTransfer || (opacity > 0 && !!(top || bottom)));
          if (isTransferrable) {
            hasTransferables = true;
          }
          state[fe.id] = {
            fixed: isFixed,
            sticky: isSticky,
            transferrable: isTransferrable,
            top,
            zIndex,
            transform,
          };
        }
      },
      mutate: state => {
        if (hasTransferables && this.transfer_) {
          this.getTransferLayer_().update();
        }
        const elements = this.elements_;
        for (let i = 0; i < elements.length; i++) {
          const fe = elements[i];
          const feState = state[fe.id];

          // Fix a bug with Safari. For some reason, you cannot unset
          // transition when it's important. You can, however, set it to a valid
          // non-important value, then unset it.
          setStyle(fe.element, 'transition', 'none');
          // Note: This MUST be done after measurements are taken.
          // Transitions will mess up everything and, depending on when paints
          // happen, mutates of transition and bottom at the same time may be
          // make the transition active.
          setStyle(fe.element, 'transition', '');

          if (feState) {
            this.mutateElement_(fe, i, feState);
          }
        }
      },
    }, {}).catch(error => {
      // Fail silently.
      dev().error(TAG, 'Failed to mutate fixed elements:', error);
    });
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
   * If the given element has a `style` attribute with a top/bottom CSS rule,
   * display a user error. FixedLayer's implementation currently overrides
   * top, bottom and a few other CSS rules.
   * @param {!Element} element
   * @private
   */
  warnAboutInlineStylesIfNecessary_(element) {
    if (element.hasAttribute('style')
        && (element.style.top || element.style.bottom)) {
      user().error(TAG, 'Inline styles with `top`, `bottom` and other ' +
          'CSS rules are not supported yet for fixed or sticky elements ' +
          '(#14186). Unexpected behavior may occur.', element);
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
    // Warn that pub-authored inline styles may be overriden by FixedLayer.
    this.warnAboutInlineStylesIfNecessary_(element);

    let fe = null;
    for (let i = 0; i < this.elements_.length; i++) {
      const el = this.elements_[i];
      if (el.element == element && el.position == position) {
        fe = el;
        break;
      }
    }
    const isFixed = position == 'fixed';
    if (fe) {
      if (!fe.selectors.includes(selector)) {
        // Already seen.
        fe.selectors.push(selector);
      }
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
      const fe = this.elements_[i];
      if (fe.element == element) {
        this.vsync_.mutate(() => {
          setStyle(element, 'top', '');
        });
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
    const {element, fixedNow: oldFixed} = fe;

    fe.fixedNow = state.fixed;
    fe.stickyNow = state.sticky;
    fe.top = (state.fixed || state.sticky) ? state.top : '';
    fe.transform = state.transform;

    // Move back to the BODY layer and reset transfer z-index.
    if (oldFixed && (!state.fixed || !state.transferrable) &&
        this.transferLayer_) {
      this.transferLayer_.returnFrom(fe);
    }

    // Update `top`. This is necessary to adjust position to the viewer's
    // paddingTop.
    if (state.top && (state.fixed || state.sticky)) {
      if (state.fixed || !this.transfer_) {
        // Fixed positions always need top offsetting, as well as stickies on
        // non iOS Safari.
        setStyle(element, 'top', `calc(${state.top} + ${this.paddingTop_}px)`);
      } else {
        // On iOS Safari (this.transfer_ = true), stickies cannot
        // have an offset because they are already offset by the padding-top.
        if (this.committedPaddingTop_ === this.paddingTop_) {
          // So, when the header is shown, just use top.
          setStyle(element, 'top', state.top);
        } else {
          // When the header is not shown, we need to subtract the padding top.
          setStyle(element, 'top',
              `calc(${state.top} - ${this.committedPaddingTop_}px)`);
        }
      }
    }

    // Move element to the fixed layer.
    if (this.transfer_ && state.fixed && state.transferrable) {
      this.getTransferLayer_().transferTo(fe, index, state);
    }
  }

  /**
   * @return {?TransferLayerDef}
   */
  getTransferLayer_() {
    // This mode is only allowed for a single-doc case.
    if (!this.transfer_ || this.transferLayer_) {
      return this.transferLayer_;
    }
    const doc = this.ampdoc.win.document;
    this.transferLayer_ =
        doc.body.shadowRoot ?
          new TransferLayerShadow(doc) :
          new TransferLayerBody(doc);
    return this.transferLayer_;
  }

  /**
   * Find all `position:fixed` and `position:sticky` elements.
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


/**
 * The contract for transfer layer.
 * @interface
 */
class TransferLayerDef {

  /**
   * @return {!Element}
   */
  getRoot() {}

  /**
   * Update most current styles for the transfer layer.
   */
  update() {}

  /**
   * Transfer the element from the body into the transfer layer.
   * @param {!ElementDef} unusedFe
   * @param {number} unusedIndex
   * @param {!ElementStateDef} unusedState
   */
  transferTo(unusedFe, unusedIndex, unusedState) {}

  /**
   * Return the element from the transfer layer back to the body.
   * @param {!ElementDef} unusedFe
   */
  returnFrom(unusedFe) {}
}


/**
 * The parallel `<body>` element is created and fixed elements are moved into
 * this element.
 * @implements {TransferLayerDef}
 */
class TransferLayerBody {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.layer_ = doc.body.cloneNode(/* deep */ false);
    this.layer_.removeAttribute('style');
    setStyles(this.layer_, {
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
    doc.documentElement.appendChild(this.layer_);
  }

  /** @override */
  getRoot() {
    return this.layer_;
  }

  /** @override */
  update() {
    if (this.layer_.className != this.doc_.body.className) {
      this.layer_.className = this.doc_.body.className;
    }
  }

  /** @override */
  transferTo(fe, index, state) {
    const {element} = fe;
    if (element.parentElement == this.layer_) {
      return;
    }

    dev().fine(TAG, 'transfer to fixed:', fe.id, fe.element);
    user().warn(TAG, 'In order to improve scrolling performance in Safari,' +
        ' we now move the element to a fixed positioning layer:', fe.element);

    if (!fe.placeholder) {
      // Never been transfered before: ensure that it's properly configured.
      setStyle(element, 'pointer-events', 'initial');
      const placeholder = fe.placeholder = this.doc_.createElement(
          'i-amphtml-fpa');
      setStyle(placeholder, 'display', 'none');
      placeholder.setAttribute('i-amphtml-fixedid', fe.id);
    }

    // Calculate z-index based on the declared z-index and DOM position.
    setStyle(element, 'zIndex',
        `calc(${10000 + index} + ${state.zIndex || 0})`);

    element.parentElement.replaceChild(fe.placeholder, element);
    this.layer_.appendChild(element);

    // Test if the element still matches one of the `fixed` selectors. If not
    // return it back to BODY.
    const matches = fe.selectors.some(
        selector => this.matches_(element, selector));
    if (!matches) {
      user().warn(TAG,
          'Failed to move the element to the fixed position layer.' +
          ' This is most likely due to the compound CSS selector:',
          fe.element);
      this.returnFrom(fe);
    }
  }

  /** @override */
  returnFrom(fe) {
    if (!fe.placeholder || !this.doc_.contains(fe.placeholder)) {
      return;
    }
    dev().fine(TAG, 'return from fixed:', fe.id, fe.element);
    if (this.doc_.contains(fe.element)) {
      setStyle(fe.element, 'zIndex', '');
      fe.placeholder.parentElement.replaceChild(fe.element, fe.placeholder);
    } else {
      fe.placeholder.parentElement.removeChild(fe.placeholder);
    }
  }

  /**
   * @param {!Element} element
   * @param {string} selector
   * @return {boolean}
   * @private
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
}


const FIXED_LAYER_SLOT = 'i-amphtml-fixed';


/**
 * The fixed layer is created inside the shadow root of the `<body>` element
 * and fixed elements are distributed into this element via slots.
 * @implements {TransferLayerDef}
 */
class TransferLayerShadow {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Element} */
    this.layer_ = doc.createElement('div');
    this.layer_.id = 'i-amphtml-fixed-layer';
    setImportantStyles(this.layer_, {
      position: 'absolute',
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      overflow: 'hidden',
    });

    // The slot where all fixed elements will be distributed.
    const slot = doc.createElement('slot');
    slot.setAttribute('name', FIXED_LAYER_SLOT);
    this.layer_.appendChild(slot);

    doc.body.shadowRoot.appendChild(this.layer_);
  }

  /** @override */
  getRoot() {
    return this.layer_;
  }

  /** @override */
  update() {
    // Nothing to do.
  }

  /** @override */
  transferTo(fe) {
    const {element} = fe;

    dev().fine(TAG, 'transfer to fixed:', fe.id, fe.element);
    user().warn(TAG, 'In order to improve scrolling performance in Safari,' +
        ' we now move the element to a fixed positioning layer:', fe.element);

    // Distribute to the slot.
    element.setAttribute('slot', FIXED_LAYER_SLOT);
  }

  /** @override */
  returnFrom(fe) {
    dev().fine(TAG, 'return from fixed:', fe.id, fe.element);
    fe.element.removeAttribute('slot');
  }
}
