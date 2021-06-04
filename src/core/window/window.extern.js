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
 * @fileoverview Externs for values expected to be on global self/window.
 * @externs
 */

/**
 * Never exists; used as part of post-compilation checks to verify DCE.
 * @type {undefined}
 */
window.__AMP_ASSERTION_CHECK;

/**
 * Global error reporting handler; only present in AMP pages
 * @type {undefined|function(this:Window,!Error,Element=)}
 */
window.__AMP_REPORT_ERROR;

/**
 * Counter for the DomBaseWeakRef polyfill.
 * @type {undefined|number}
 */
window.__AMP_WEAKREF_ID;
