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
// import {resolve} from 'path';
import posthtml from 'posthtml';
import transformModules from './transforms/modules/modules-transform';
import transformScriptPaths from './transforms/scripts/scripts-transform';
import transformStories from './transforms/stories/stories-transform';

// const html = fs.readFileSync(resolve(process.cwd(), '../../examples/travel.amp.html'), 'utf8');

const transforms = [transformModules, transformStories, transformScriptPaths];

// console.log('before', html);
// posthtml(transforms)
//   .process(html /*, options */)
//   .then(result => console.log('after', result.html));

export async function transform(fileLocation: string): Promise<string> {
  const source = await fsPromises.readFile(fileLocation, 'utf8');
  const result = await posthtml(transforms).process(source);
  return result.html;
}
