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

import {promises as fsPromises} from 'fs';
import minimist from 'minimist';
import posthtml from 'posthtml';
import transformModules from './modules/modules-transform';
import transformScriptPaths from './scripts/scripts-transform';
import transformCss from './css/css-transform';

const argv = minimist(process.argv.slice(2));
<<<<<<< HEAD
const FOR_TESTING = argv._.includes('integration');
// Use 9876 if running integration tests as this is the KARMA_SERVER_PORT
const PORT = FOR_TESTING ? 9876 : 8000;
=======
const FORTESTING = argv._.includes('integration');
// Use 9876 if running integration tests as this is the KARMA_SERVER_PORT
const PORT = FORTESTING ? 9876 : 8000;
>>>>>>> 08f9ad245 (add more tests and fix bug for extention retention)
const ESM = !!argv.esm;

const defaultTransformConfig = {
  esm: ESM,
  port: PORT,
  fortesting: FOR_TESTING,
  useMaxNames: !argv.compiled,
};

const transforms = [
<<<<<<< HEAD
  transformScriptPaths(defaultTransformConfig),
=======
  transformScriptPaths({
    esm: ESM,
    port: PORT,
    fortesting: FORTESTING,
  }),
>>>>>>> 08f9ad245 (add more tests and fix bug for extention retention)
];

export async function transform(fileLocation: string): Promise<string> {
  if (ESM) {
    transforms.unshift(
      transformCss(),
<<<<<<< HEAD
      transformModules(defaultTransformConfig),
=======
      transformModules({
        esm: ESM,
        port: PORT,
        fortesting: FORTESTING,
      }),
>>>>>>> 08f9ad245 (add more tests and fix bug for extention retention)
    );
  }

  const source = await fsPromises.readFile(fileLocation, 'utf8');
  const result = await posthtml(transforms).process(source);
  return result.html;
}
