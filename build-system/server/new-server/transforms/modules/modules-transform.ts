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

import posthtml from 'posthtml';
import {isJsonScript, isValidScript, toExtension, ScriptNode, tryGetUrl} from '../utilities/script';
import {OptionSet} from '../utilities/option-set';

/**
 * @param head
 * @param script
 */
function appendModuleScript(head: posthtml.Node, nomoduleScript: ScriptNode, options: OptionSet): void {
  const modulePath = toExtension(tryGetUrl(nomoduleScript.attrs.src), '.mjs').toString();
  const moduleScript : ScriptNode = {
    ...nomoduleScript,
    attrs: {
      ...nomoduleScript.attrs,
      src: modulePath,
      type: 'module',
    },
  };
  delete moduleScript.attrs.nomodule;

  const content = head.content || [];
  const nomoduleIdx = content.indexOf(nomoduleScript);
  // If we are testing and in esm mode, outright replace the nomodule script
  // with the module script. This is so that we testing the module script in
  // isolation without a fallback.
  if (options.fortesting && options.esm) {
    content.splice(nomoduleIdx, 1, moduleScript);
  } else {
    // Add the module script after the nomodule script.
    content.splice(nomoduleIdx + 1, 0, '\n', moduleScript);
  }
}

/**
 * Returns a function that will transform script node sources into module/nomodule pair.
 * @param options
 */
export default function(options: OptionSet = {}): (tree: posthtml.Node) => void {
  return function(tree: posthtml.Node): void {
    let head: posthtml.Node | undefined = undefined;
    const scripts: Array<ScriptNode> = [];
    tree.walk(node => {
      if (node.tag === 'head') {
        head = node;
      }

      // Make sure that isJsonScript is used before `isValidScript`. We bail out
      // early if the ScriptNofe is of type="application/json" since it wouldn't
      // have any src url to modify.
      if (isJsonScript(node)) {
        return node;
      }

      if (!isValidScript(node, options.looseScriptSrcCheck)) {
        return node;
      }

      // Mark the existing valid scripts with `nomodule` attributes.
      node.attrs.nomodule = '';
      scripts.push(node);
      return node;
    });

    if (head === undefined) {
      console.log('Could not find a head element in the document');
      return;
    }

    for (const script of scripts) {
      appendModuleScript(head, script, options);
    }
  }
}
