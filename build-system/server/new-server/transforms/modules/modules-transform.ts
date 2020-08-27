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
function appendModuleScript(head: PostHTML.Node, script: ScriptNode, compiled: boolean): void {
  let modulePath;
  if (argv.compiled || compiled) {
    modulePath = CDNURLToLocalDistURL(
      new URL(script.attrs.src || ''),
      undefined,
      '.mjs'
    ).toString();
    script.attrs.src = CDNURLToLocalDistURL(
      new URL(script.attrs.src || ''),
      undefined,
      '.js'
    ).toString();
  }
  else {
    const urlName = script.attrs.src.toString();
    modulePath = urlName.replace('.js', '.mjs');
  }

  const insert: ScriptNode = {
    ...script,
    attrs: {
      ...script.attrs,
      src: modulePath,
      type: 'module',
    },
  };
  delete insert.attrs.nomodule;

  (head.content || []).push(insert);
}

/**
 * Returns a function that will transform script node sources into module/nomodule pair.
 * @param options
 */
export default function(options: OptionSet): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node): void {
    let head: PostHTML.Node | undefined = undefined;
    let compiled: boolean = options.compiled || false;
    const scripts: Array<ScriptNode> = [];
    tree.walk(node => {
      if (node.tag === 'head') {
        head = node;
      }
      if (!isValidScript(node)) {
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
      appendModuleScript(head, script, compiled);
    }
  }
}
