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
const script_1 = require("./utilities/script");
const cdn_1 = require("./utilities/cdn");
/**
 * For any script, with a valid path to AMP Project CDN, replace it with a local value.
 * @param script
 */
function modifySrc(script) {
    if (!script_1.isValidScript(script)) {
        return script;
    }
    const src = cdn_1.CDNURLToLocalDistURL(new url_1.URL(script.attrs.src || '')).toString();
    script.attrs.src = src;
    return script;
}
/**
 * Replace the src for every script tag to the local value.
 */
function default_1(tree) {
    tree.match({ tag: 'script' }, modifySrc);
}
exports.default = default_1;
//# sourceMappingURL=scripts.js.map