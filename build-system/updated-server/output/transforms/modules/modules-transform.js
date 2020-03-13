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
/**
 * Append a Module Script for a ScriptNode.
 * @param head
 * @param script
 */
function appendModuleScript(head, script) {
    const modulePath = cdn_1.CDNURLToLocalDistURL(new url_1.URL(script.attrs.src || ''), undefined, '.mjs').toString();
    const insert = {
        ...script,
        attrs: {
            ...script.attrs,
            src: modulePath,
            type: 'module',
        },
    };
    delete insert.attrs.nomodule;
    (head.content || []).push(insert);
}
/**
 *
 */
function default_1(tree) {
    let head = undefined;
    const scripts = [];
    tree.walk(node => {
        if (node.tag === 'head') {
            head = node;
        }
        if (!script_1.isValidScript(node)) {
            return node;
        }
        // Mark the existing valid scripts with `nomodule` attributes.
        node.attrs.nomodule = '';
        scripts.push(node);
        return node;
    });
    if (head === undefined) {
        console.log('Could not find a head element in the document');
        return;
    }
    for (const script of scripts) {
        appendModuleScript(head, script);
    }
}
exports.default = default_1;
//# sourceMappingURL=modules-transform.js.map