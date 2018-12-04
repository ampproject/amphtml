/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Closure compiler inserts code  `? window.global : this` in the main runtime bundles,
 * to figure out the global scope. We need to find these and replase `this` with
 * `self` in order to make these script `<script type=module` compatible.
 * In other words we're looking for a ternary condition whose possible return values
 * are either `window.global` or `this`.
 */

module.exports = function({types: t}) {
  return {
      visitor: {
          ConditionalExpression(path) {
            const {node} = path;
            let {consequent, alternate} = node;
            if (consequent.type !== "MemberExpression") return;
            if (alternate.type !== "ThisExpression") return;
            const {object, property} = consequent;
            if (object.name !== "window" && property.name!=="global") return;
            alternate = t.identifier("self");
          }
      }
  };
};