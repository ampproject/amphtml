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

/**
 * This type signifies a callback that can be called to remove a listener.
 *
 * Planned destination: There are some function helpers (like `once` in
 * `src/utils/function`). When they are migrated to core, they'll likely end up
 * under `src/core/types/function`;this can live in an adjacent externs file.
 *
 * @typedef {function()}
 */
let UnlistenDef;

/**
 * Build Constants -- see build-system/build-constants.js for definition.
 */
/** @define {boolean} */
var IS_FORTESTING = false;

/** @define {boolean} */
var IS_MINIFIED = false;

/** @define {string} */
var VERSION = '';

/** @define {boolean} */
var AMP_MODE = false;

/** @define {boolean} */
var IS_ESM = false;

/** @define {boolean} */
var IS_SXG = false;
