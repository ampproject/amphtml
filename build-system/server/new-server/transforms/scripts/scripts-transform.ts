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

/**
 * A list of options to correspond with options.json for testing purposes.
 * To add an option, add the corresponding key-value pair into the 
 * options.json, then add the field to this interface.
 */
interface OptionSet{
}

/**
 * For any script, with a valid path to AMP Project CDN, replace it with a local value.
 * @param script
 */
function modifySrc(script: PostHTML.Node): PostHTML.Node {
  if (!isValidScript(script)) {
    return script;
  }

  const src = CDNURLToLocalDistURL(new URL(script.attrs.src || '')).toString();
  script.attrs.src = src;
  return script;
}

/**
 * Replace the src for every script tag to the local value.
 */
export default function(options: OptionSet): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node){
    tree.match({tag: 'script'}, modifySrc);
  }
}
