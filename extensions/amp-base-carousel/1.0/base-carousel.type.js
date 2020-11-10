/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/** @externs */

/** @const */
var BaseCarouselDef = {};

/**
 * @typedef {{
 *   advanceCount: (number|undefined),
 *   arrowNext: (?PreactDef.VNode|undefined),
 *   arrowPrev: (?PreactDef.VNode|undefined),
 *   children: (!PreactDef.Renderable),
 *   controls: (string|undefined),
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   onSlideChange: (function(number):undefined|undefined),
 *   snap: (boolean|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.Props;

/**
 * @typedef {{
 *   advanceCount: (number|undefined),
 *   children: !Array<PreactDef.Renderable>,
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   restingIndex: number,
 *   setRestingIndex: (function(number):undefined),
 *   snap: (boolean|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.ScrollerProps;

/**
 * @typedef {{
 *   alt: (string|undefined),
 *   children: !Array<PreactDef.Renderable>,
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   offsetRef: {current: (null|number)},
 *   pivotIndex: number,
 *   restingIndex: number,
 *   snap: (boolean|undefined),
 *   src: (string|undefined),
 *   thumbnailSrc: (string|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.SlideProps;

/**
 * @typedef {{
 *   advance: (function():undefined|undefined),
 *   customArrow: (PreactDef.VNode|undefined),
 *   by: number,
 *   disabled: (boolean|undefined),
 *   outsetArrows: (boolean|undefined),
 * }}
 */
BaseCarouselDef.ArrowProps;

/**
 * @typedef {{
 *   currentSlide: (number|undefined),
 *   setCurrentSlide: (function(number):undefined),
 *   slides: !Array<BaseCarouselDef.SlideProps>,
 *   setSlides: (function(Array):undefined),
 * }}
 */
BaseCarouselDef.ContextProps;

/** @interface */
BaseCarouselDef.CarouselApi = class {
  /**
   * @param {number} index
   */
  goToSlide(index) {}

  /** Advance slides forward by `advanceCount` */
  next() {}

  /** Advance slides backward by `advanceCount` */
  prev() {}
};
