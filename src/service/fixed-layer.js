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

import {Pass} from '../pass';
import {Services} from '../services';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  getStyle,
  getVendorJsPropertyName,
  setImportantStyles,
  setInitialDisplay,
  setStyle,
  setStyles,
  toggle,
} from '../style';
import {
  closest,
  domOrderComparator,
  matches,
} from '../dom';
import {cssRuleMatches} from '../css';
import {dev, user} from '../log';
import {endsWith} from '../string';
import {isExperimentOn} from '../experiments';
import {remove} from '../utils/array';
import {toWin} from '../types';

const TAG = 'FixedLayer';

const DECLARED_FIXED_PROP = '__AMP_DECLFIXED';
const DECLARED_STICKY_PROP = '__AMP_DECLSTICKY';

const LIGHTBOX_MODE_ATTR = 'i-amphtml-lightbox';
const LIGHTBOX_ELEMENT_CLASS = 'i-amphtml-lightbox-element';

/**
 * @param {!Element} el
 */
function isLightbox(el) {
  return el.tagName.indexOf('LIGHTBOX') !== -1;
}

const USELESS_TOP_VALUES = ['auto', 'inherit', 'initial', 'revert', 'unset'];

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

    /** @private @const {boolean} */
    this.transfer_ = transfer && ampdoc.isSingleDoc();

    /** @private {?TransferLayerDef} */
    this.transferLayer_ = null;

    /** @private {number} */
    this.counter_ = 0;

    /** @const @private {!Array<!ElementDef>} */
    this.elements_ = [];

    /** @const @private {!Pass} */
    this.updatePass_ = new Pass(ampdoc.win, () => {
      this.update();
    });

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private @const {!Array<string>} */
    this.fixedSelectors_ = [];

    /** @private @const {!Array<string>} */
    this.stickySelectors_ = [];

    /**
     * We collect the top rules so that we may override their top values.
     */
    this.topRules_ = [];

    /**
     * We collect the styles that define bottom-rules. If an element is fixed
     * or sticky, and does not match a bottom rule, we assume it must be a top
     * defined element.
     * @private @const {!Array<CSSRule>}
     */
    this.bottomRules_ = [];

    this.updatePaddingTop_(paddingTop);
  }

  /**
   * Informs FixedLayer that a lightbox was opened.
   *
   * - FixedLayer hides any transfer layer elements that may be overlayed on
   *   top of the lightbox, which is confusing UX.
   * - When `onComplete` resolves, FixedLayer scans and transfers any fixed
   *   descendants of `lightbox`. This enables unjanky fixed elements in
   *   lightboxes on iOS.
   *
   * @param {!Element=} opt_lightbox
   * @param {!Promise=} opt_onComplete Promise that resolves when lightbox
   *   UX completes e.g. open transition animation.
   */
  enterLightbox(opt_lightbox, opt_onComplete) {
    const transferLayer = this.getTransferLayer_();
    if (transferLayer) {
      transferLayer.setLightboxMode(true);
    }

    if (isExperimentOn(this.ampdoc.win, 'fixed-elements-in-lightbox')
        && opt_lightbox && opt_onComplete) {
      opt_onComplete.then(() => {
        this.scanNode_(dev().assertElement(opt_lightbox),
            /* lightboxMode */ true);
      });
    }
  }

  /**
   * Reverses the actions performed by `enterLightbox()`.
   */
  leaveLightbox() {
    const transferLayer = this.getTransferLayer_();
    if (transferLayer) {
      transferLayer.setLightboxMode(false);
    }

    if (isExperimentOn(this.ampdoc.win, 'fixed-elements-in-lightbox')) {
      const fes = remove(this.elements_, fe => !!fe.lightboxed);
      this.returnFixedElements_(fes);
      if (!this.elements_.length) {
        this.unobserveHiddenMutations_();
      }
    }
  }

  /**
   * Must be always called after DOMReady.
   */
  setup() {
    const root = this.ampdoc.getRootNode();
    const stylesheets = root.styleSheets;
    if (!stylesheets) {
      return;
    }

    this.fixedSelectors_.length = 0;
    this.stickySelectors_.length = 0;

    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i];
      // Rare but may happen if the document is being concurrently disposed.
      if (!stylesheet) {
        dev().error(TAG, 'Aborting setup due to null stylesheet.');
        return;
      }
      const {disabled, ownerNode} = stylesheet;
      if (disabled ||
          !ownerNode ||
          ownerNode.tagName != 'STYLE' ||
          ownerNode.hasAttribute('amp-boilerplate') ||
          ownerNode.hasAttribute('amp-runtime') ||
          ownerNode.hasAttribute('amp-extension')) {
        continue;
      }
      // Don't dereference cssRules early to avoid "Cannot access rules"
      // DOMException due to reading a CORS stylesheet e.g. font.
      this.scanRules_(stylesheet.cssRules);
    }

    this.setupTopRules_();
    this.scanNode_(root);

    if (this.elements_.length > 0) {
      this.observeHiddenMutations();
    }

    const platform = Services.platformFor(this.ampdoc.win);
    if (this.elements_.length > 0 && !this.transfer_ && platform.isIos()) {
      user().warn(TAG, 'Please test this page inside of an AMP Viewer such' +
          ' as Google\'s because the fixed or sticky positioning might have' +
          ' slightly different layout.');
    }
  }

  /**
   * @param {!Node} node
   * @param {boolean=} opt_lightboxMode
   * @private
   */
  scanNode_(node, opt_lightboxMode) {
    this.trySetupSelectorsNoInline(node, opt_lightboxMode);

    // Sort tracked elements in document order.
    this.sortInDomOrder_();

    this.update();
  }

  /**
   * Begin observing changes to the hidden attribute.
   * @visibleForTesting
   */
  observeHiddenMutations() {
    if (!isExperimentOn(this.ampdoc.win, 'hidden-mutation-observer')) {
      return;
    }
    const mo = this.initMutationObserver_();
    mo.observe(this.ampdoc.getRootNode(), {
      attributes: true,
      subtree: true,
    });
  }

  /**
   * Stop observing changes to the hidden attribute. Does not destroy the
   * mutation observer.
   */
  unobserveHiddenMutations_() {
    this.clearMutationObserver_();
    const mo = this.mutationObserver_;
    if (mo) {
      mo.disconnect();
    }
  }

  /**
   * Clears the mutation observer and its pass queue.
   */
  clearMutationObserver_() {
    this.updatePass_.cancel();
    const mo = this.mutationObserver_;
    if (mo) {
      mo.takeRecords();
    }
  }

  /**
   * @return {!MutationObserver}
   */
  initMutationObserver_() {
    if (this.mutationObserver_) {
      return this.mutationObserver_;
    }

    const mo = new this.ampdoc.win.MutationObserver(mutations => {
      if (this.updatePass_.isPending()) {
        return;
      }

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.attributeName === 'hidden') {
          // Wait one animation frame so that other mutations may arrive.
          this.updatePass_.schedule(16);
          return;
        }
      }
    });

    return this.mutationObserver_ = mo;
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
    this.vsync_.mutate(() => {
      this.updatePaddingTop_(paddingTop, !!opt_transient);
    });
  }

  /**
   * @param {number} paddingTop
   * @param {boolean} transient
   */
  updatePaddingTop_(paddingTop, transient) {
    const {style} = this.ampdoc.getRootNode().documentElement;
    style.setProperty('--i-amphtml-fixed-top', `${paddingTop}px`);
    if (!transient) {
      style.setProperty('--i-amphtml-sticky-top', `${paddingTop}px`);
    }
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
        if (e.fixedNow && e.isTopPositioned) {
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
        if (e.fixedNow && e.isTopPositioned) {
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
   * @param {boolean=} opt_forceTransfer If set to true, then the element needs
   *    to be forcefully transferred to the transfer layer. If false, then it
   *    will only receive top-padding compensation for the header and never be
   *    transferred.
   * @return {!Promise}
   */
  addElement(element, opt_forceTransfer) {
    this.setupElement_(
        element,
        /* selector */ '*',
        /* position */ 'fixed',
        opt_forceTransfer);
    this.sortInDomOrder_();

    // If this is the first element, we need to start the mutation observer.
    // This'll only be created once.
    this.observeHiddenMutations();

    return this.update();
  }

  /**
   * Removes the element from the fixed/sticky layer.
   * @param {!Element} element
   */
  removeElement(element) {
    const fes = this.tearDownElement_(element);
    this.returnFixedElements_(fes);
  }

  /**
   * Returns fixed elements from the transfer layer.
   * @param {!Array<ElementDef>} fes
   * @private
   */
  returnFixedElements_(fes) {
    if (fes.length > 0 && this.transferLayer_) {
      this.vsync_.mutate(() => {
        for (let i = 0; i < fes.length; i++) {
          const fe = fes[i];
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
    toRemove.forEach(fe => this.tearDownElement_(fe.element));

    if (this.elements_.length == 0) {
      return Promise.resolve();
    }

    // Clear out the mutation observer's queue since we're doing the work now.
    this.clearMutationObserver_();

    // Next, the positioning-related properties will be measured. If a
    // potentially fixed/sticky element turns out to be actually fixed/sticky,
    // it will be decorated and possibly moved to a separate layer.
    let hasTransferables = false;
    return this.vsync_.runPromise({
      measure: state => {
        const elements = this.elements_;
        const {win} = this.ampdoc;

        for (let i = 0; i < elements.length; i++) {
          const fe = elements[i];
          const {element, forceTransfer} = fe;
          const style = computedStyle(win, element);

          const {offsetWidth, offsetHeight} = element;
          const {
            position = '',
            display = '',
            zIndex,
            bottom,
          } = style;
          const opacity = parseFloat(style.opacity);
          const transform = style[getVendorJsPropertyName(style, 'transform')];

          const isFixed = position === 'fixed' &&
            (forceTransfer || (offsetWidth > 0 && offsetHeight > 0));
          const isSticky = endsWith(position, 'sticky');
          const isDisplayed = (display !== 'none');

          if (!isDisplayed || !(isFixed || isSticky)) {
            state[fe.id] = {
              fixed: false,
              sticky: false,
              isTopPositioned: false,
              transferrable: false,
              zIndex: '',
            };
            continue;
          }

          const isTopPositioned = this.isTopPositioned_(element);

          // Transferability requires an element to be:
          // 1. Greater than 0% opacity. That's a lot of work for no benefit.
          //    Additionally, transparent elements used for "service" needs and
          //    thus best kept in the original tree. The visibility, however,
          //    is not considered because `visibility` CSS is inherited.
          // 2. Height < 300. This avoids transferring large sections of UI,
          //    e.g. publisher-customized amp-consent UI (#17995).
          // 3. Has `top` or `bottom` CSS set. This ensures we only transfer
          //    fixed elements that are _not_ auto-positioned to avoid jumping
          //    position after transferring to the fixed layer (due to loss of
          //    parent positioning context). We could calculate this offset, but
          //    we don't (yet).
          let isTransferrable = false;
          if (isFixed) {
            if (forceTransfer === true) {
              isTransferrable = true;
            } else if (forceTransfer === false) {
              isTransferrable = false;
            } else {
              isTransferrable = (
                opacity > 0 &&
                offsetHeight < 300 &&
                !!(isTopPositioned || bottom));
            }
          }
          if (isTransferrable) {
            hasTransferables = true;
          }
          // getComputed style will return a result (0px)
          // factor in padding
          // getBoundingClientRect will be actual client rect
          state[fe.id] = {
            fixed: isFixed,
            sticky: isSticky,
            isTopPositioned,
            transferrable: isTransferrable,
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

          if (feState) {
            this.mutateElement_(fe, i, feState);
          } else {
            fe.element.removeAttribute('i-amphtml-is-fixed');
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
   * @param {!Node} root
   * @param {boolean=} opt_lightboxMode
   * @private
   */
  trySetupSelectorsNoInline(root, opt_lightboxMode
  ) {
    try {
      this.setupSelectors_(root, opt_lightboxMode);
    } catch (e) {
      // Fail quietly.
      dev().error(TAG, 'Failed to setup fixed elements:', e);
    }
  }

  /**
   * Calls `setupElement_` for up to 10 elements matching each selector
   * in `fixedSelectors` and for all selectors in `stickySelectors`.
   * @param {!Node} root
   * @param {boolean=} opt_lightboxMode
   * @private
   */
  setupSelectors_(root, opt_lightboxMode) {
    for (let i = 0; i < this.fixedSelectors_.length; i++) {
      const fixedSelector = this.fixedSelectors_[i];
      const elements = root.querySelectorAll(fixedSelector);
      for (let j = 0; j < elements.length; j++) {
        if (this.elements_.length > 10) {
          // We shouldn't have too many of `fixed` elements.
          break;
        }
        this.setupElement_(elements[j], fixedSelector, 'fixed',
            /* opt_forceTransfer */ undefined, opt_lightboxMode);
      }
    }
    for (let i = 0; i < this.stickySelectors_.length; i++) {
      const stickySelector = this.stickySelectors_[i];
      const elements = root.querySelectorAll(stickySelector);
      for (let j = 0; j < elements.length; j++) {
        this.setupElement_(elements[j], stickySelector, 'sticky',
            /* opt_forceTransfer */ undefined, opt_lightboxMode);
      }
    }
  }

  /**
   * Overrides all CSSStyleRule's with `top` styling to account for our Viewer
   * Header.
   */
  setupTopRules_() {
    const rules = this.topRules_;
    for (let i = 0; i < rules.length; i++) {
      const {style} = rules[i];
      const {top} = style;
      // If the browser can't parse this, it'll keep the old top. That's ok.
      style.top = `calc(
        ${top}
          + (var(--i-amphtml-fixed-top, 0px) * var(--i-amphtml-is-fixed, 0))
          - (var(--i-amphtml-sticky-top, 0px) * var(--i-amphtml-is-sticky, 0))
      )`;
    }
  }

  /**
   * Returns whether this element is a top-positioned element, or assumed to be.
   *
   * We could avoid this entirely if we injected the --i-amphtml-is-fixed CSS
   * variable alongside any rules that define `position: fixed` (and for
   * sticky).
   *
   * @param {!Element} element
   * @return {boolean}
   */
  isTopPositioned_(element) {
    const {
      topRules_: tops,
      bottomRules_: bottoms,
    } = this;
    for (let i = 0; i < tops.length; i++) {
      if (cssRuleMatches(tops[i], element)) {
        // If any top rule matches, we assume it's top-positioned. That's not a
        // guarantee, though, since it could actually be overridden by a more
        // specific rule.
        return true;
      }
    }
    for (let i = 0; i < bottoms.length; i++) {
      if (cssRuleMatches(bottoms[i], element)) {
        // If any bottom rule matches, we assume it's only bottom-positioned.
        return false;
      }
    }
    // If neither top rules nor bottom rules match the element, we assume it's
    // implicitly top-positioned.
    return true;
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
        && (getStyle(element, 'top') || getStyle(element, 'bottom'))) {
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
   * @param {boolean=} opt_forceTransfer If true, then the element will
   *    be forcibly transferred to the transfer layer.
   * @param {boolean=} opt_lightboxMode If true, then descendants of lightboxes
   *    are allowed to be set up. Default is false.
   * @private
   */
  setupElement_(
    element, selector, position, opt_forceTransfer, opt_lightboxMode
  ) {
    // Warn that pub-authored inline styles may be overriden by FixedLayer.
    this.warnAboutInlineStylesIfNecessary_(element);

    // Ignore lightboxes because FixedLayer can interfere with their
    // opening/closing animations (#19149).
    if (isLightbox(element)) {
      return;
    }
    const isLightboxDescendant = closest(element, isLightbox);
    if (!opt_lightboxMode && isLightboxDescendant) {
      return;
    }

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
        isTopPositioned: false,
        lightboxed: !!isLightboxDescendant,
      };
      this.elements_.push(fe);
    }

    fe.forceTransfer = isFixed ? opt_forceTransfer : false;
  }

  /**
   * Undoes set up by removing element record and and resets `top` style.
   * Does _not_ return the element from the transfer layer.
   *
   * @param {!Element} element
   * @return {!Array<!ElementDef>}
   * @private
   */
  tearDownElement_(element) {
    const removed = [];
    for (let i = 0; i < this.elements_.length; i++) {
      const fe = this.elements_[i];
      if (fe.element === element) {
        if (!fe.lightboxed) {
          this.vsync_.mutate(() => {
            setStyle(element, 'top', '');
          });
        }
        this.elements_.splice(i, 1);
        removed.push(fe);
      }
    }
    if (!this.elements_.length) {
      this.unobserveHiddenMutations_();
    }
    return removed;
  }

  /**
   * @private
   */
  sortInDomOrder_() {
    this.elements_.sort((fe1, fe2) => {
      return domOrderComparator(fe1.element, fe2.element);
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
    fe.transform = state.transform;
    fe.isTopPositioned = state.isTopPositioned;

    // However, ignore lightboxed elements since lightboxes ignore the viewer
    // header.
    if (state.isTopPositioned && !fe.lightboxed) {
      // In iOS, sticky elements are already offset by the padding top, so we
      // must negate that. If the header is showing, we don't actually need to
      // offset at all. If the header is not showing, we need to apply a
      // negation.  Thankfully, we can account for this with a single value,
      // since --i-amphtml-fixed-top will reflect the header's showing height,
      // and --i-amphtml-sticky-top will reflect the padding.
      const value = this.transfer_ && state.sticky ? 'sticky' : 'fixed';
      element.setAttribute('i-amphtml-is-fixed', value);
    } else {
      element.removeAttribute('i-amphtml-is-fixed');
    }

    // Move back to the BODY layer and reset transfer z-index.
    if (oldFixed && (!state.fixed || !state.transferrable) &&
        this.transferLayer_) {
      this.transferLayer_.returnFrom(fe);
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
          new TransferLayerShadow(doc, this.vsync_) :
          new TransferLayerBody(doc, this.vsync_);
    return this.transferLayer_;
  }

  /**
   * Find all `position:fixed` and `position:sticky` elements.
   * @param {!Array<CSSRule>} rules
   * @private
   */
  scanRules_(rules) {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const {type} = rule;
      if (type === /* CSSMediaRule */ 4 ||
          type === /* CSSSupportsRule */ 12) {
        this.scanRules_(rule.cssRules);
        continue;
      }

      if (type !== /* CSSStyleRule */ 1) {
        continue;
      }

      const {selectorText, style} = rule;
      if (selectorText === '*') {
        continue;
      }
      const {
        position = '',
        top = '',
        bottom = '',
      } = style;
      if (top !== '' && !USELESS_TOP_VALUES.includes(top)) {
        this.topRules_.push(rule);
      }
      if (bottom !== '' && !USELESS_TOP_VALUES.includes(bottom)) {
        this.bottomRules_.push(rule);
      }
      if (position === 'fixed') {
        this.fixedSelectors_.push(selectorText);
      } else if (endsWith(position, 'sticky')) {
        this.stickySelectors_.push(selectorText);
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
 *   isTopPositioned: boolean,
 *   transform: (string|undefined),
 *   forceTransfer: (boolean|undefined),
 *   lightboxed: (boolean|undefined),
 * }}
 */
let ElementDef;


/**
 * @typedef {{
 *   fixed: boolean,
 *   sticky: boolean,
 *   isTopPositioned: boolean,
 *   transferrable: boolean,
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
   * Toggles internal state after entering or leaving lightbox mode.
   * @param {boolean} unusedOn
   */
  setLightboxMode(unusedOn) {}

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
   * @param {!./vsync-impl.Vsync} vsync
   */
  constructor(doc, vsync) {
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {boolean} */
    this.isLightboxExperimentOn_ =
        isExperimentOn(toWin(doc.defaultView), 'fixed-elements-in-lightbox');

    /** @private @const {!Element} */
    this.layer_ = doc.body.cloneNode(/* deep */ false);
    this.layer_.removeAttribute('style');
    const styles = {
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
      float: 'none',
      margin: 0,
      opacity: 1,
      outline: 'none',
      padding: 'none',
      transform: 'none',
      transition: 'none',
      visibility: 'visible',
    };
    // This experiment uses a CSS rule for toggling transfer layer visibility,
    // which has lower specificity than an inline style.
    if (this.isLightboxExperimentOn_) {
      delete styles.visibility;
    }
    setStyles(this.layer_, assertDoesNotContainDisplay(styles));
    setInitialDisplay(this.layer_, 'block');
    doc.documentElement.appendChild(this.layer_);
  }

  /** @override */
  getRoot() {
    return this.layer_;
  }

  /** @override */
  setLightboxMode(on) {
    this.vsync_.mutate(() => {
      const root = this.getRoot();
      if (this.isLightboxExperimentOn_) {
        if (on) {
          root.setAttribute(LIGHTBOX_MODE_ATTR, '');
        } else {
          root.removeAttribute(LIGHTBOX_MODE_ATTR);
        }
      } else {
        // Legacy behavior is to hide transfer layer when entering lightbox
        // and unhide when exiting.
        setStyle(root, 'visibility', on ? 'hidden' : 'visible');
      }
    });
  }

  /**
   * Synchronizes any attribute mutations done on the real body to the layer.
   * This is to better simulate the body in CSS selectors.
   * @override
   */
  update() {
    const {body} = this.doc_;
    const layer = this.layer_;
    const bodyAttrs = body.attributes;
    const layerAttrs = layer.attributes;
    for (let i = 0; i < bodyAttrs.length; i++) {
      const attr = bodyAttrs[i];
      // Style is not copied because the fixed-layer must have very precise
      // styles to enable smooth scrolling.
      if (attr.name === 'style') {
        continue;
      }
      // Use cloneNode to get around invalid attribute names. Ahem, amp-bind.
      layerAttrs.setNamedItem(attr.cloneNode(false));
    }
    for (let i = 0; i < layerAttrs.length; i++) {
      const {name} = layerAttrs[i];
      if (name === 'style' || name === LIGHTBOX_MODE_ATTR
          || body.hasAttribute(name)) {
        continue;
      }
      layer.removeAttribute(name);
      i--;
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
      toggle(placeholder, false);
      placeholder.setAttribute('i-amphtml-fixedid', fe.id);
    }

    // Calculate z-index based on the declared z-index and DOM position.
    setStyle(element, 'zIndex',
        `calc(${10000 + index} + ${state.zIndex || 0})`);

    // Identify lightboxed elements so they can be visible when the transfer
    // layer is "hidden", and hidden with the transfer layer is "visible".
    if (fe.lightboxed) {
      element.classList.add(LIGHTBOX_ELEMENT_CLASS);
    }

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
    const {element, placeholder} = fe;
    dev().fine(TAG, 'return from fixed:', fe.id, element);

    if (fe.lightboxed) {
      element.classList.remove(LIGHTBOX_ELEMENT_CLASS);
    }

    if (this.doc_.contains(element)) {
      setStyle(fe.element, 'zIndex', '');
      placeholder.parentElement.replaceChild(element, placeholder);
    } else {
      placeholder.parentElement.removeChild(placeholder);
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
      return matches(element, selector);
    } catch (e) {
      // Fail silently.
      dev().error(TAG, 'Failed to test query match:', e);
      return false;
    }
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
   * @param {!./vsync-impl.Vsync} vsync
   */
  constructor(doc, vsync) {
    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = vsync;

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
  setLightboxMode(on) {
    this.vsync_.mutate(() => {
      setStyle(this.getRoot(), 'visibility', on ? 'hidden' : 'visible');
    });
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
