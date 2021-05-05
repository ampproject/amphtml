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

// This is needed only by custom elements, so it doesn't need to be in the core
// window externs file.
/** @type {!typeof HTMLElement} */
window.HTMLElementOrig;

// These callbacks are used for custom elements, but don't appear to belong to
// any available type definitions. There's a TODO(jridgewell) from ~2 years ago
// to call them differently; if that can be figured out, these may be dropped.
// If not, these may belong to a separate node.extern.js externs file.
/** @function @this {Node} */
Node.prototype.connectedCallback;
/** @function @this {Node} */
Node.prototype.disconnectedCallback;
