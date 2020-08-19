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

import {PostHTML} from 'posthtml';
import {URL} from 'url';
import {isValidScript} from '../utilities/script';
import {CDNURLToLocalDistURL} from '../utilities/cdn';

function sidegradeStories(script: PostHTML.Node): PostHTML.Node {
  if (!isValidScript(script)) {
    return script;
  }

  const originalSrc = new URL(script.attrs.src || '');
  const src = CDNURLToLocalDistURL(originalSrc, [
    'amp-story-1.0.js',
    'amp-story-1.0.max.js',
  ]).toString();
  script.attrs.src = src;
  return script;
}

/**
 * Replace the src for every stories script tag.
 */
export default function(options: any): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node){
    tree.match({tag: 'script'}, sidegradeStories);
  }
}
