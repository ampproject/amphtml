"use strict";
/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const path_1 = require("path");
const VALID_CDN_ORIGIN = 'https://cdn.ampproject.org';
/**
 * For any node, with a valid path to AMP Project CDN, replace it with a local value.
 * @param node
 */
function modifySrc(node) {
    const attrs = node.attrs || {};
    if (attrs.src === '') {
        return node;
    }
    const src = new url_1.URL(attrs.src || '');
    console.log('pathname', src.pathname, path_1.extname(src.pathname));
    if (src.origin === VALID_CDN_ORIGIN && path_1.extname(src.pathname) === '.js') {
        // This is a valid AMP Project CDN script, replace values with the local
        // serving environment.
        src.protocol = 'http';
        src.hostname = 'localhost';
        src.port = '8000';
        src.pathname = '/dist' + src.pathname;
        console.log(src);
        attrs.src = src.toString();
    }
    node.attrs = attrs;
    return node;
}
/**
 *
 */
function replaceRuntime(tree) {
    tree.match({ tag: 'script' }, modifySrc);
}
exports.default = replaceRuntime;
//# sourceMappingURL=replace-runtime.js.map