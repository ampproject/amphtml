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
 * Returns the HTML for an AMP Document with eligible components server-rendered.
 *
 * @param {string} html
 * @return {string}
 */
function compileHtml(html) {
  return html;
}

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {*} ast
 * @return {*}
 */
function compileAst(ast) {
  return ast;
}

globalThis.compileHtml = compileHtml;
globalThis.compileAst = compileAst;
