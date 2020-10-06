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

import minimist from 'minimist';
import {PostHTML} from 'posthtml';
import {readFileSync} from 'fs';
import {OptionSet} from '../utilities/option-set';

const argv = minimist(process.argv.slice(2));
const isTestMode: boolean = argv._.includes('server-tests');

const testDir = 'build-system/server/new-server/transforms/css/test';
const cwd = process.cwd();

const cssPath = isTestMode
  ? `${cwd}/${testDir}/css.txt`
  : `${cwd}/build/css/v0.css`;
const versionPath = `${cwd}/${testDir}/version.txt`

const css = readFileSync(cssPath, 'utf8').toString().trim();
const version = readFileSync(versionPath, 'utf8').toString().trim();

interface StyleNode extends PostHTML.Node {
  tag: 'style',
  attrs: {
    [key: string]: string | undefined
    'amp-runtime': string,
    'i-amphtml-version': string,
  },
  content: string[]
}

function isStyleNode(node: PostHTML.Node | string): node is StyleNode {
  return node !== undefined && typeof node !== 'string' &&
    (node as StyleNode).tag === 'style';
}

function prependAmpStyles(head: PostHTML.Node): PostHTML.Node {
  const content = head.content || [];

  debugger;
  const firstStyleNode = content.filter(isStyleNode)[0];

  // If 'amp-runtime' already exists bail out.
  if (firstStyleNode?.attrs && 'amp-runtime' in firstStyleNode.attrs) {
    return head;
  }

  const styleNode: StyleNode = {
    walk: head.walk,
    match: head.match,
    tag: 'style',
    attrs: {
      'amp-runtime': '',
      // Prefix 01 to simulate stable/prod version RTV prefix.
      'i-amphtml-version': `01${version}`,
    },
    content: [css]
  };
  content.unshift(styleNode);
  return {...head, content};
}

/**
 * Replace the src for every stories script tag.
 */
export default function(options: OptionSet = {}): (tree: PostHTML.Node) => void {
  return function(tree: PostHTML.Node) {
    tree.match({tag: 'head'}, prependAmpStyles);
  }
}
