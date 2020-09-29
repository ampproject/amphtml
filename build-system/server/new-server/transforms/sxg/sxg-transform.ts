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

function sxgTransform(node: PostHTML.Node, options: OptionSet = {}): PostHTML.Node {
  // Make sure that isJsonScript is used before `isValidScript`. We bail out
  // early if the ScriptNode is of type="application/json" since it wouldn't
  // have any src url to modify.
  if (isJsonScript(node)) {
    return node;
  }

  if (!isValidScript(node)) {
    return node;
  }

  if (options.compiled) {
    const src = node.attrs.src;
    node.attrs.src = src.replace('.js', '.sxg.js');
  } else {
    const url = new URL(node.attrs.src);
    url.searchParams.append('f', 'sxg');
    node.attrs.src = url.toString();
  }

  return node;
}

/**
 * Returns a function that will transform script node sources into their sxg counterparts.
 * @param options
 */
export default function(options: OptionSet = {}): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node) {
    tree.match({tag: 'script'}, (script) => {
      return sxgTransform(script, options);
    });
  }
}
