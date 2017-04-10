/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from '../observable';
import {isExperimentOn} from '../experiments';
import {registerServiceBuilderForDoc} from '../service';
import {setStyles} from '../style';
import {toArray} from '../types';
import {user} from '../log';
import {viewportForDoc, vsyncFor} from '../services';

const ATTR = 'amp-fx-parallax';
const EXPERIMENT = ATTR;

/**
 * Installs parallax handlers, tracks the previous scroll position and
 * implements post-parallax-update scroll hooks.
 */
export class ParallaxService {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!Observable} */
    this.parallaxObservable_ = new Observable();

    /** @private {number} */
    this.previousScroll_ = 0;

    this.installParallaxHandlers_(ampdoc.win);
  }


  /**
   * Constructs and installs scroll handlers on all [amp-fx-parallax] elements
   * in the document.
   * @param {!Window} global
   * @private
   */
  installParallaxHandlers_(global) {
    const doc = global.document;
    const viewport = viewportForDoc(doc);
    const vsync = vsyncFor(global);

    const elements = toArray(doc.querySelectorAll(`[${ATTR}]`));
    const parallaxElements = elements.map(
        e => new ParallaxElement(e, this.transform_));
    const mutate =
        this.parallaxMutate_.bind(this, parallaxElements, viewport);

    viewport.onScroll(() => vsync.mutate(mutate));
    mutate(); // initialize the elements with the current scroll position
  }

  /**
   * Update each [amp-fx-parallax] element with the new scroll position.
   * Notify any listeners.
   * @param {!Array<!ParallaxElement>} elements
   * @param {!./viewport-impl.Viewport} viewport
   * @private
   */
  parallaxMutate_(elements, viewport) {
    const newScrollTop = viewport.getScrollTop();
    const previousScrollTop = this.getPreviousScroll_();
    const delta = previousScrollTop - newScrollTop;

    elements.forEach(element => {
      if (!element.shouldUpdate(viewport)) {
        return;
      }
      element.update(delta);
      this.setPreviousScroll_(newScrollTop);
    });

    this.fire_(newScrollTop);
  }

  /**
   * Create a value for the CSS transform property given a position.
   * @param {number} position
   * @return {string}
   */
  transform_(position) {
    return `translate3d(0,${position.toFixed(2)}px,0)`;
  }

  /**
   * Get the previous scroll value.
   * @return {number}
   * @private
   */
  getPreviousScroll_() {
    return this.previousScroll_;
  }

  /**
   * Set the previous scroll value.
   * @param {number} scroll
   * @private
   */
  setPreviousScroll_(scroll) {
    this.previousScroll_ = scroll;
  }

  /**
   * Add listeners to parallax scroll events.
   * @param {!function()} cb
   * @private
   * @visibleForTesting
   */
  addScrollListener_(cb) {
    this.parallaxObservable_.add(cb);
  }

  /**
   * Remove listeners from parallax scroll events.
   * @param {!function()} cb
   * @private
   * @visibleForTesting
   */
  removeScrollListener_(cb) {
    this.parallaxObservable_.remove(cb);
  }

  /**
   * Alert listeners that a scroll has occurred.
   * @param {number} scrollTop
   * @private
   */
  fire_(scrollTop) {
    this.parallaxObservable_.fire(scrollTop);
  }
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
export class ParallaxElement {
  /**
   * @param {!Element} element The element to give a parallax effect.
   * @param {!function(number):string} transform Computes the transform from the position.
   */
  constructor(element, transform) {
    const factor = element.getAttribute(ATTR);

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!function(number):string} */
    this.transform_ = transform;

    /** @private @const {number} */
    this.factor_ = (factor ? parseFloat(factor) : 0.5) - 1;

    /** @private {number} */
    this.offset_ = 0;
  }

  /**
   * Apply the parallax effect to the offset given how much the page
   * has moved since the last frame.
   * @param {number} delta The movement of the base layer e.g. the page.
   */
  update(delta) {
    this.offset_ += delta * this.factor_;
    setStyles(this.element_, {transform: this.transform_(this.offset_)});
  }

  /**
   * True if the element is in the viewport.
   * @param {!./viewport-impl.Viewport} viewport
   * @return {boolean}
   */
  shouldUpdate(viewport) {
    const viewportRect = viewport.getRect();
    const elementRect = viewport.getLayoutRect(this.element_);
    elementRect.top -= viewportRect.top;
    elementRect.bottom = elementRect.top + elementRect.height;
    return this.isRectInView_(elementRect, viewportRect.height);
  }

  /**
   * Check if a rectange is within the viewport.
   * @param {!../layout-rect.LayoutRectDef} rect
   * @param {number} viewportHeight
   * @private
   */
  isRectInView_(rect, viewportHeight) {
    return rect.bottom >= 0 && rect.top <= viewportHeight;
  }
}

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installParallaxForDoc(nodeOrDoc) {
  const enabled = isExperimentOn(AMP.win, EXPERIMENT);
  user().assert(enabled, `Experiment "${EXPERIMENT}" is disabled.`);
  registerServiceBuilderForDoc(
      nodeOrDoc,
      'amp-fx-parallax',
      ParallaxService,
      /* opt_factory */ undefined,
      /* opt instantiate */ true);
};
