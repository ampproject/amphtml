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
import {isJsonScript, isValidScript, tryGetUrl} from '../utilities/script';
import {CDNURLToLocalDistURL} from '../utilities/cdn';
import {OptionSet} from '../utilities/option-set';
import {parse} from 'path';

/**
 * For any script, with a valid path to AMP Project CDN, replace it with a local value.
 * @param script
 */
function modifySrc(script: PostHTML.Node, options: OptionSet): PostHTML.Node {
  // Make sure that isJsonScript is used before `isValidScript`. We bail out
  // early if the ScriptNode is of type="application/json" since it wouldn't
  // have any src url to modify.
  if (isJsonScript(script)) {
    return script;
  }

  if (!isValidScript(script, options.looseScriptSrcCheck)) {
    return script;
  }

  const url = tryGetUrl(script.attrs.src || '');
  const parsedPath = parse(url.pathname);
  const src = CDNURLToLocalDistURL(url, [null, null], parsedPath.ext, options.port, options.useMaxNames)
      .toString();
  script.attrs.src = src;
  return script;
}

/**
 * Replace the src for every script tag to the local value.
 */
export default function(options: OptionSet = {}): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node) {
    tree.match({tag: 'script'}, (script) => {
      return modifySrc(script, options);
    });
  }
}
