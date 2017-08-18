/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {parser} from './access-expr-impl';


/**
 * Evaluates access expression.
 *
 * The grammar is defined in the `access-expr-impl.jison` and compiled using
 * (Jison)[https://zaach.github.io/jison/] parser. The compilation steps are
 * described in the [access-expr-impl.md].
 *
 * Grammar highlights:
 * - Shorthand truthy expressions are allowed, such as `field`. Truthy value
 *   is defined as `X !== null && X !== '' && X !== 0 && X !== false`.
 * - Basic equality expressions: `X = 1`, `X = true`, `X = "A"`. And also,
 *   non-equality: `X != 1` and so on.
 * - Basic comparison expressions only defined for numbers: `X < 1`,
 *   `X >= 10`.
 * - Boolean logic: `X = 1 OR Y = 1`, `X = 1 AND Y = 2`, `NOT X`, `NOT (X = 1)`.
 *
 * @param {string} expr
 * @param {!JsonObject} data
 * @return {boolean}
 */
export function evaluateAccessExpr(expr, data) {
  try {
    parser.yy = data;
    return !!parser.parse(expr);
  } finally {
    parser.yy = null;
  }
}
