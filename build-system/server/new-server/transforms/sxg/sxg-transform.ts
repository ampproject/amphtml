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
import {isJsonScript, isValidScript} from '../utilities/script';
import {OptionSet} from '../utilities/option-set';

/**
 * Returns a function that will transform script node sources into their sxg counterparts.
 * @param options
 */
export default function(options: OptionSet = {}): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node) {
    tree.match({tag: 'script'}, (script) => {
      if (isJsonScript(script)) {
        return script;
      }
      if (!isValidScript(script)) {
        return script;
      }

      if (options.compiled) {
        const url = script.attrs.src.toString();
        script.attrs.src = url.replace('.js', '.sxg.js');
      }
      else {
        const url = new URL(script.attrs.src);
        url.searchParams.append('f', 'sxg');
        script.attrs.src = url.toString();
      }
      return script;
    });
  }
}
