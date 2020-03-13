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

import {strict as assert} from 'assert';
import posthtml from 'posthtml';
import globby from 'globby';
import {parse, format, resolve, join, sep} from 'path';
import {promises as fsPromises} from 'fs';

/**
 * TODO(KB): Note, this should instead use an async generator 
 * and output to the console on each yield (test pass/fail)
 */
(async function() {
  const globInputs = await globby('./transforms/**/input.html');
  let pass = 0;
  let fail = 0;

  for (const input of globInputs) {
    try {
      const parsed = parse(input);
      const segments = resolve(parsed.dir, '../..').split(sep);
      segments.splice(segments.indexOf('updated-server') + 1, 0, 'output');

      const inputPath = resolve(format(parsed));
      parsed.base = 'output.html';
      const outputPath = resolve(format(parsed));

      const transformPath = join(
        sep,
        ...segments,
        `${segments[segments.length - 1]}-transform.js`
      );
      const transform = (await import(transformPath)).default;

      const inputContent = await fsPromises.readFile(inputPath, 'utf8');
      const expected = await fsPromises.readFile(outputPath, 'utf8');
      const result = await posthtml(transform).process(inputContent);
      assert.strictEqual(result.html, expected);
      pass++;
    } catch (e) {
      fail++;
      console.error(e);
    }
  }
  console.log(`${pass} tests passed, ${fail} tests failed.`);
})();
