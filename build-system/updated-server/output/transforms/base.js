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
function isValidScript(node) {
    if (node.tag !== 'script') {
        return false;
    }
    const attrs = node.attrs || {};
    const src = new url_1.URL(attrs.src || '');
    return src.origin === VALID_CDN_ORIGIN && path_1.extname(src.pathname) === '.js';
}
exports.isValidScript = isValidScript;
//# sourceMappingURL=base.js.map