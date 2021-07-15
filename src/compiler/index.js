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

import {getBuilders} from './builders';
import * as compiler from 'bento-compiler';

/**
 * @typedef {{
 * runtimeVersion: string,
 * extensionList: Array<{name: string, version:string}>
 * }} VersionData
 */

/**
 * Returns the HTML for an AMP Document with eligible components server-rendered.
 *
 * @param {string} html
 * @param {VersionData} versionData
 * @return {string}
 */
function compileHtml(html, versionData) {
  return compiler.renderHtml(html, getBuilders(versionData));
}

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {*} ast
 * @param {VersionData} versionData
 * @return {*}
 */
function compileAst(ast, versionData) {
  return compiler.renderAst(ast, getBuilders(versionData));
}

globalThis.compileHtml = compileHtml;
globalThis.compileAst = compileAst;
