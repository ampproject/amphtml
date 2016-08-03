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

import {documentContains} from '../dom';
import {dev, user} from '../log';
import {platformFor} from '../platform';
import {setStyle, setStyles} from '../style';

const TAG = 'FixedLayer';

const DECLARED_FIXED_PROP = '__AMP_DECLFIXED';


/**
 * The fixed layer is a *sibling* of the body element. I.e. it's a direct
 * child of documentElement. It's used to manage the `postition:fixed`
 * elements in iOS-iframe case due to the
 * https://bugs.webkit.org/show_bug.cgi?id=154399 bug, which is itself
 * a result of workaround for the issue where scrolling is not supported
 * in iframes (https://bugs.webkit.org/show_bug.cgi?id=149264).
 * This implementation finds all elements that could be `fixed` and checks
 * on major relayouts if they are indeed `fixed`. All `fixed` elements are
 * moved into the fixed layer.
 */
export class FixedLayer {
  /**
   * @param {!Document} doc
   * @param {!./vsync-impl.Vsync} vsync
   * @param {number} paddingTop
   * @param {boolean} transfer
   */
  constructor(doc, vsync, paddingTop, transfer) {
    /** @const {!Document} */
    this.doc = doc;

    /** @private @const */
    this.vsync_ = vsync;

    /** @private {number} */
    this.paddingTop_ = paddingTop;

    /** @private @const {boolean} */
    this.transfer_ = transfer;

    /** @private {?Element} */
    this.fixedLayer_ = null;

    /** @private {number} */
    this.counter_ = 0;

    /** @const @private {!Array<!FixedElementDef>} */
    this.fixedElements_ = [];
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    if (this.fixedLayer_) {
      this.vsync_.mutate(() => {
        setStyle(this.fixedLayer_, 'visibility',
            visible ? 'visible' : 'hidden');
      });
    }
  }

  /**
   * Must be always called after DOMReady.
   */
  setup() {
    const stylesheets = this.doc.styleSheets;
    if (!stylesheets) {
      return;
    }

    // Find all `position:fixed` elements.
    const fixedSelectors = [];
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
      this.discoverFixedSelectors_(stylesheet.cssRules, fixedSelectors);
    }

    this.trySetupFixedSelectorsNoInline(fixedSelectors);

    // Sort in document order.
    this.sortInDomOrder_();

    const platform = platformFor(this.doc.defaultView);
    if (this.fixedElements_.length > 0 && !this.transfer_ &&
            platform.isIos()) {
      user().warn(TAG, 'Please test this page inside of an AMP Viewer such' +
          ' as Google\'s because the fixed positioning might have slightly' +
          ' different layout.');
    }

    this.update();
  }

  /**
   * Updates the viewer's padding-top position and recalculates offsets of
   * all elements.
   * @param {number} paddingTop
   */
  updatePaddingTop(paddingTop) {
    this.paddingTop_ = paddingTop;
    this.update();
  }

  /**
   * Adds the element directly into the fixed layer, bypassing discovery.
   * @param {!Element} element
   */
  addElement(element) {
    this.setupFixedElement_(element, /* selector */ '*');
    this.sortInDomOrder_();
    this.update();
  }

  /**
   * Removes the element from the fixed layer.
   * @param {!Element} element
   */
  removeElement(element) {
    this.removeFixedElement_(element);
    if (this.fixedLayer_) {
      this.vsync_.mutate(() => {
        this.returnFromFixedLayer_(element);
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
   * Performs fixed actions.
   * 1. Updates `top` styling if necessary.
   * 2. On iOS/Iframe moves elements between fixed layer and BODY depending on
   * whether they are currently visible and fixed.
   * @return {!Promise}
   */
  update() {
    if (this.fixedElements_.length == 0) {
      return Promise.resolve();
    }

    // Some of the elements may no longer be in DOM.
    /** @type {!Array<!FixedElementDef>} */
    const toRemove = this.fixedElements_.filter(
        fe => !documentContains(this.doc, fe.element));
    toRemove.forEach(fe => this.removeFixedElement_(fe.element));

    // Next, the positioning-related properties will be measured. If a
    // potentially fixed element turns out to be actually fixed, it will
    // be decorated and possibly move to a separate layer.
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
        this.fixedElements_.forEach(fe => {
          fe.element.style.top = 'auto';
        });
        this.fixedElements_.forEach(fe => {
          autoTopMap[fe.id] = fe.element./*OK*/offsetTop;
        });

        // 2. Reset style top.
        this.fixedElements_.forEach(fe => {
          fe.element.style.top = '';
        });

        // 3. Calculated fixed info.
        this.fixedElements_.forEach(fe => {
          const element = fe.element;
          const styles = this.doc.defaultView./*OK*/getComputedStyle(
              element, null);
          if (!styles) {
            // Notice that `styles` can be `null`, courtesy of long-standing
            // Gecko bug: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
            // See #3096 for more details.
            state[fe.id] = {
              fixed: false,
              transferrable: false,
              top: '',
              zIndex: '',
            };
            return;
          }

          const position = styles.getPropertyValue('position');
          // Element is indeed fixed. Visibility is added to the test to
          // avoid moving around invisible elements.
          const isFixed = (
              position == 'fixed' &&
              element./*OK*/offsetWidth > 0 &&
              element./*OK*/offsetHeight > 0);
          if (!isFixed) {
            state[fe.id] = {
              fixed: false,
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
          let top = styles.getPropertyValue('top');
          const currentOffsetTop = element./*OK*/offsetTop;
          const isImplicitAuto = currentOffsetTop == autoTopMap[fe.id];
          if ((top == 'auto' || isImplicitAuto) &&
                  top != '0px' &&
                  currentOffsetTop != 0) {
            top = '';
          }

          const bottom = styles.getPropertyValue('bottom');
          const opacity = parseFloat(styles.getPropertyValue('opacity'));
          // Transferability requires element to be fixed and top or bottom to
          // be styled with `0`. Also, do not transfer transparent
          // elements - that's a lot of work for no benefit.  Additionally,
          // transparent elements used for "service" needs and thus
          // best kept in the original tree. The visibility, however, is not
          // considered because `visibility` CSS is inherited. Also, the
          // `height` is constrained to at most 300px. This is to avoid
          // transfering of more substantial sections for now. Likely to be
          // relaxed in the future.
          const isTransferrable = (
              isFixed &&
              opacity > 0 &&
              element./*OK*/offsetHeight < 300 &&
              (this.isAllowedCoord_(top) || this.isAllowedCoord_(bottom)));
          if (isTransferrable) {
            hasTransferables = true;
          }
          state[fe.id] = {
            fixed: isFixed,
            transferrable: isTransferrable,
            top,
            zIndex: styles.getPropertyValue('z-index'),
          };
        });
      },
      mutate: state => {
        if (hasTransferables && this.transfer_) {
          const fixedLayer = this.getFixedLayer_();
          if (fixedLayer.className != this.doc.body.className) {
            fixedLayer.className = this.doc.body.className;
          }
        }
        this.fixedElements_.forEach((fe, i) => {
          const feState = state[fe.id];
          if (feState) {
            this.mutateFixedElement_(fe, i, feState);
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
   * Calls `setupFixedSelectors` in a try-catch.
   * Fails quietly with a dev error if call fails.
   * This method should not be inlined to prevent TryCatch deoptimization.
   * NoInline keyword at the end of function name also prevents Closure compiler
   * from inlining the function.
   * @param {!Array<string>} fixedSelectors
   * @private
   */
  trySetupFixedSelectorsNoInline(fixedSelectors) {
    try {
      this.setupFixedSelectors(fixedSelectors);
    } catch (e) {
      // Fail quietly.
      dev().error(TAG, 'Failed to setup fixed elements:', e);
    }
  }

  /**
   * Calls `setupFixedElement_` for up to 10 elements matching each selector
   * in `fixedSelectors`.
   * @param {!Array<string>} fixedSelectors
   * @private
   */
  setupFixedSelectors(fixedSelectors) {
    for (let i = 0; i < fixedSelectors.length; i++) {
      const fixedSelector = fixedSelectors[i];
      const elements = this.doc.querySelectorAll(fixedSelector);
      for (let j = 0; j < elements.length; j++) {
        if (j > 10) {
          // We shouldn't have too many of `fixed` elements.
          break;
        }
        this.setupFixedElement_(elements[j], fixedSelector);
      }
    }
  }

  /**
   * This method records the potentially fixed element. One of a more critical
   * function - it records all selectors that may apply "fixed" to this element
   * to check them later.
   *
   * @param {!Element} element
   * @param {string} selector
   * @private
   */
  setupFixedElement_(element, selector) {
    let fe = null;
    for (let i = 0; i < this.fixedElements_.length; i++) {
      if (this.fixedElements_[i].element == element) {
        fe = this.fixedElements_[i];
        break;
      }
    }
    if (fe) {
      // Already seen.
      fe.selectors.push(selector);
    } else {
      // A new entry.
      const fixedId = 'F' + (this.counter_++);
      element.setAttribute('i-amp-fixedid', fixedId);
      element[DECLARED_FIXED_PROP] = true;
      fe = {
        id: fixedId,
        element,
        selectors: [selector],
      };
      this.fixedElements_.push(fe);
    }
  }

  /**
   * Removes element from the fixed layer.
   *
   * @param {!Element} element
   * @private
   */
  removeFixedElement_(element) {
    for (let i = 0; i < this.fixedElements_.length; i++) {
      if (this.fixedElements_[i].element == element) {
        this.vsync_.mutate(() => {
          element.style.top = '';
        });
        this.fixedElements_.splice(i, 1);
        break;
      }
    }
  }

  /** @private */
  sortInDomOrder_() {
    this.fixedElements_.sort(function(fe1, fe2) {
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
   * Mutates the fixed element. At this point it's determined that the element
   * is indeed fixed. There are two main functions here:
   *  1. `top` has to be updated to reflect viewer's paddingTop.
   *  2. The element may need to be transfered to the separate fixed layer.
   *
   * @param {!FixedElementDef} fe
   * @param {number} index
   * @param {!FixedElementStateDef} state
   * @private
   */
  mutateFixedElement_(fe, index, state) {
    const element = fe.element;
    const oldFixed = fe.fixedNow;

    fe.fixedNow = state.fixed;
    if (state.fixed) {
      // Update `top`. This is necessary to adjust position to the viewer's
      // paddingTop.
      element.style.top = state.top ?
          `calc(${state.top} + ${this.paddingTop_}px)` :
          '';

      // Move element to the fixed layer.
      if (!oldFixed && this.transfer_) {
        if (state.transferrable) {
          this.transferToFixedLayer_(fe, index, state);
        } else {
          this.returnFromFixedLayer_(fe);
        }
      }
    } else if (oldFixed) {
      // Reset `top` which was assigned above.
      if (element.style.top) {
        element.style.top = '';
      }

      // Move back to the BODY layer and reset transfer z-index.
      this.returnFromFixedLayer_(fe);
    }
  }

  /**
   * @param {!FixedElementDef} fe
   * @param {number} index
   * @param {!FixedElementStateDef} state
   * @private
   */
  transferToFixedLayer_(fe, index, state) {
    const element = fe.element;
    if (element.parentElement == this.fixedLayer_) {
      return;
    }

    dev().fine(TAG, 'transfer to fixed:', fe.id, fe.element);
    user().warn(TAG, 'In order to improve scrolling performance in Safari,' +
        ' we now move the element to a fixed positioning layer:', fe.element);

    if (!fe.placeholder) {
      // Never been transfered before: ensure that it's properly configured.
      setStyle(element, 'pointer-events', 'initial');
      fe.placeholder = this.doc.createElement('i-amp-fp');
      fe.placeholder.setAttribute('i-amp-fixedid', fe.id);
      setStyle(fe.placeholder, 'display', 'none');
    }

    // Calculate z-index based on the declared z-index and DOM position.
    element.style.zIndex = `calc(${10000 + index} + ${state.zIndex || 0})`;

    element.parentElement.replaceChild(fe.placeholder, element);
    this.getFixedLayer_().appendChild(element);

    // Test if the element still matches one of the `fixed ` selectors. If not
    // return it back to BODY.
    const matches = fe.selectors.some(
        selector => this.matches_(element, selector));
    if (!matches) {
      user().warn(TAG,
          'Failed to move the element to the fixed position layer.' +
          ' This is most likely due to the compound CSS selector:',
          fe.element);
      this.returnFromFixedLayer_(fe);
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
   * @param {!FixedElementDef} fe
   * @private
   */
  returnFromFixedLayer_(fe) {
    if (!fe.placeholder || !documentContains(this.doc, fe.placeholder)) {
      return;
    }
    dev().fine(TAG, 'return from fixed:', fe.id, fe.element);
    if (documentContains(this.doc, fe.element)) {
      if (fe.element.style.zIndex) {
        fe.element.style.zIndex = '';
      }
      fe.placeholder.parentElement.replaceChild(fe.element, fe.placeholder);
    } else {
      fe.placeholder.parentElement.removeChild(fe.placeholder);
    }
  }

  /**
   * @return {?Element}
   */
  getFixedLayer_() {
    if (!this.transfer_ || this.fixedLayer_) {
      return this.fixedLayer_;
    }
    this.fixedLayer_ = this.doc.createElement('body');
    this.fixedLayer_.id = '-amp-fixedlayer';
    setStyles(this.fixedLayer_, {
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
    this.doc.documentElement.appendChild(this.fixedLayer_);
    // TODO(erwinm, #4097): Remove this when safari technology preview has merged
    // the fix for https://github.com/ampproject/amphtml/issues/4047
    // https://bugs.webkit.org/show_bug.cgi?id=159791 which is in r202950.
    if (this.fixedLayer_.style['webkitAnimation'] !== undefined) {
      this.fixedLayer_.style['webkitAnimation'] = 'none';
    } else if (this.fixedLayer_.style['WebkitAnimation'] !== undefined) {
      this.fixedLayer_.style['WebkitAnimation'] = 'none';
    }
    return this.fixedLayer_;
  }

  /**
   * @param {!Array<CSSRule>} rules
   * @param {!Array<string>} foundSelectors
   * @private
   */
  discoverFixedSelectors_(rules, foundSelectors) {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.type == /* CSSStyleRule */ 1) {
        if (rule.selectorText != '*' && rule.style.position == 'fixed') {
          foundSelectors.push(rule.selectorText);
        }
      } else if (rule.type == /* CSSMediaRule */ 4) {
        this.discoverFixedSelectors_(rule.cssRules, foundSelectors);
      } else if (rule.type == /* CSSSupportsRule */ 12) {
        this.discoverFixedSelectors_(rule.cssRules, foundSelectors);
      }
    }
  }
}


/**
 * @typedef {{
 *   id: string,
 *   selectors: !Array,
 *   element: !Element,
 *   placeholder: ?Element,
 *   fixedNow: boolean,
 * }}
 */
let FixedElementDef;

/**
 * @typedef {{
 *   fixed: boolean,
 *   transferrable: boolean,
 *   top: string,
 *   zIndex: string,
 * }}
 */
let FixedElementStateDef;
