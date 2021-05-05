/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview The junk-drawer of externs that haven't yet been sorted well.
 * Shame! Shame! Shame! Avoid adding to this.
 *
 * It's okay for some things to start off here, since moving them doesn't
 * require any other file changes (unlike real code, which requires updating)
 * imports throughout the repo).
 *
 * @externs
 */

// This definition is exported by the fetch polyfill implementation, but
// currently has dependencies on non-core modules that aren't yet type-checked.
//
// Planned destination: this should be removed when fetch is re-included in the
// polyfills type-check target.
/** @type {function(!Window)} */
let install$$module$src$polyfills$fetch;

// These definitions live in non-core files but are consumed by
// get-bounding-client-rect. They should be removed as dom.js and layout-rect.js
// are moved to core.
/**
 * The structure that combines position and size for an element. The exact
 * interpretation of position and size depends on the use case. Replicated from
 * layout-rect.js
 *
 * @typedef {{
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number,
 *   x: number,
 *   y: number
 * }}
 */
let LayoutRectDef$$module$src$layout_rect;
/** @type {function(number, number, number, number):LayoutRectDef$$module$src$layout_rect} */
let layoutRectLtwh$$module$src$layout_rect;
/** @type {function(!Element):boolean} */
let isConnectedNode$$module$src$dom;
