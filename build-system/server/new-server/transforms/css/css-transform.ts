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
import {readFileSync} from 'fs';

const v0Css = readFileSync(`${process.cwd()}/build/css/v0.css`).toString();

interface StyleNode extends PostHTML.Node {
  tag: 'style',
  attrs: {
    [key: string]: string | undefined
    'amp-runtime': undefined,
    textContent: string
  },
}

function insertCss(head: PostHTML.Node): PostHTML.Node {
  const styleNode: StyleNode = {
    ...head,
    tag: 'style',
    attrs: {
      'amp-runtime': undefined,
      'i-amphtml-runtime': '1',
      textContent: v0Css,
    }
  };
  (head.content || []).push(styleNode);
  return head;
}

/**
 * Replace the src for every stories script tag.
 */
export default function(tree: PostHTML.Node): void {
  tree.match({tag: 'head'}, insertCss);
}
