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
 *   arrowNext: (?PreactDef.VNode|undefined),
 *   arrowPrev: (?PreactDef.VNode|undefined),
 *   children: (!PreactDef.Renderable),
 *   loop: (boolean|undefined),
 *   onSlideChange: (function(number):undefined|undefined),
 *   setAdvance: (function(function(number):undefined):undefined|undefined),
 * }}
 */
BaseCarouselDef.Props;

/**
 * @typedef {{
 *   children: !Array<PreactDef.Renderable>,
 *   loop: (boolean|undefined),
 *   restingIndex: number,
 *   setRestingIndex: (function(number):undefined),
 * }}
 */
BaseCarouselDef.ScrollerProps;

/**
 * @typedef {{
 *   children: !Array<PreactDef.Renderable>
 * }}
 */
BaseCarouselDef.SlideProps;

/**
 * @typedef {{
 *   advance: (function():undefined|undefined),
 *   customArrow: (PreactDef.VNode|undefined),
 *   dir: number,
 *   disabled: (boolean|undefined)
 * }}
 */
BaseCarouselDef.ArrowProps;
