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
import {isValidScript, ScriptNode} from '../utilities/script';
import {CDNURLToLocalDistURL} from '../utilities/cdn';
import {OptionSet} from '../utilities/option-set';
import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));

/**
 * @param head
 * @param script
 * @param compiled 
 */
function appendSxg(script: ScriptNode, compiled: boolean): PostHTML.Node {
  /*
  if (argv.compiled || compiled) {
    let sxgPath = CDNURLToLocalDistURL(
      new URL(script.attrs.src || ''),
      undefined
    ).toString();
    script.attrs.src = sxgPath.replace('.js', '.sxg.js');
  }
  else {
    const urlName = script.attrs.src.toString();
    if (urlName.includes('js?')){
        script.attrs.src = urlName + '&f=sxg';
    }
    else{
        script.attrs.src = urlName + '?f=sxg';
    }
  }

  script.attrs.type = 'sxg';
  */
 if(argv.compiled || compiled){
   script.attrs
 }
  return script;
}

/**
 * Returns a function that will transform script node sources into module/nomodule pair.
 * @param options
 */
export default function(options: OptionSet = {}): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node) {
    tree.match({tag: 'script'}, (script) => {
      script = 'l';
    });
  }
}
