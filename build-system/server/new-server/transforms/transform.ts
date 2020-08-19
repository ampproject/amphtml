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
import transformStories from './stories/stories-transform';
import transformCss from './css/css-transform';

const argv = minimist(process.argv.slice(2));

export async function transform(fileLocation: string): Promise<string> {
  const transforms = [transformStories, transformScriptPaths, transformCss];
  if (argv.esm) {
    transforms.unshift(transformModules);
  }

  const source = await fsPromises.readFile(fileLocation, 'utf8');
  const result = await posthtml(transforms).process(source);
  return result.html;
}
