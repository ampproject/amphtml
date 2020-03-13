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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const posthtml_1 = __importDefault(require("posthtml"));
const globby_1 = __importDefault(require("globby"));
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * TODO(KB): Note, this should instead use an async generator
 * and output to the console on each yield (test pass/fail)
 */
(async function () {
    const globInputs = await globby_1.default('./transforms/**/input.html');
    let pass = 0;
    let fail = 0;
    for (const input of globInputs) {
        try {
            const parsed = path_1.parse(input);
            const segments = path_1.resolve(parsed.dir, '../..').split(path_1.sep);
            segments.splice(segments.indexOf('updated-server') + 1, 0, 'output');
            const inputPath = path_1.resolve(path_1.format(parsed));
            parsed.base = 'output.html';
            const outputPath = path_1.resolve(path_1.format(parsed));
            const transformPath = path_1.join(path_1.sep, ...segments, `${segments[segments.length - 1]}-transform.js`);
            const transform = (await Promise.resolve().then(() => __importStar(require(transformPath)))).default;
            const inputContent = await fs_1.promises.readFile(inputPath, 'utf8');
            const expected = await fs_1.promises.readFile(outputPath, 'utf8');
            const result = await posthtml_1.default(transform).process(inputContent);
            assert_1.strict.strictEqual(result.html, expected);
            pass++;
        }
        catch (e) {
            fail++;
            console.error(e);
        }
    }
    console.log(`${pass} tests passed, ${fail} tests failed.`);
})();
//# sourceMappingURL=test.js.map