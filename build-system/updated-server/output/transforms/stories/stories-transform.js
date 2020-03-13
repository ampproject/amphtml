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
const script_1 = require("../utilities/script");
const cdn_1 = require("../utilities/cdn");
function sidegradeStories(script) {
    if (!script_1.isValidScript(script)) {
        return script;
    }
    const originalSrc = new url_1.URL(script.attrs.src || '');
    const src = cdn_1.CDNURLToLocalDistURL(originalSrc, [
        'amp-story-1.0.js',
        'amp-story-1.0.max.js',
    ]).toString();
    script.attrs.src = src;
    return script;
}
/**
 * Replace the src for every stories script tag.
 */
function default_1(tree) {
    tree.match({ tag: 'script' }, sidegradeStories);
}
exports.default = default_1;
//# sourceMappingURL=stories-transform.js.map