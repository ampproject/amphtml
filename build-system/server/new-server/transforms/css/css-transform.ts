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
import jsify from '../../../../tasks/jsify-css';

const argv = minimist(process.argv.slice(2));
const isTestMode: boolean = argv._.includes('server-tests');

const testDir = 'build-system/server/new-server/transforms/css/test';
const cwd = process.cwd();

const cssPath = isTestMode
  ? `${cwd}/${testDir}/test.css`
  : `${cwd}/build/css/v0.css`;
const versionPath = isTestMode
  ? `${cwd}/${testDir}/version.txt`
  : `${cwd}/dist/version.txt`;

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

interface PostCssProcessor {
  css: string
}

function prependAmpStyles(resolve: (node: PostHTML.Node) => void, head: PostHTML.Node): PostHTML.Node {
  // We're not able to make `prependAmpStyles` an async function as tree.match
  // is able to accept them so we have to make this a promise than we don't
  // return but will eventually call the `resolve` function with the changes
  // to the Node.
  jsify.transformCss(cssPath).then((result: unknown) => {
    const {css} = result as PostCssProcessor;
    const content = head.content || [];
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
    resolve({...head, content});
  });
  return head;
}

/**
 * Replace the src for every stories script tag.
 */
export default function(tree: PostHTML.Node): Promise<PostHTML.Node> {
  return new Promise((resolve) => {
    tree.match({tag: 'head'}, (head: PostHTML.Node) => {
      return prependAmpStyles(resolve, head);
    });
  });
}
