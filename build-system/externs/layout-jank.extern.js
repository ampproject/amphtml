/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Definitions for the Layout Jank API.
 *
 * Created from
 * @see https://gist.github.com/skobes/2f296da1b0a88cc785a4bf10a42bca07
 *
 * @todo This should be removed when the definitions are released
 * in closure-compiler.
 *
 * @externs
 */

/**
 * @constructor
 * @extends {PerformanceEntry}
 */
function PerformanceLayoutJank() {}
/** @type {number} */ PerformanceLayoutJank.prototype.fraction;
