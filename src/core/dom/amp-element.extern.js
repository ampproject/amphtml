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
 * @fileoverview Provides AmpElement interface for typechecking. Includes
 * smaller interfaces that modules can type-check against to keep expected
 * API surfaces narrow, so it's clear what properties and methods are
 * expected/required.
 *
 * @externs
 */

/**
 * An interface for elements with pause functionality.
 * @interface
 */
class PausableInterface {
  /** @function */
  pause() {}
}

/**
 * Just an element, but used with AMP custom elements..
 * @constructor
 * @extends {HTMLElement}
 * @implements {PausableInterface}
 */
let AmpElement = function () {};
