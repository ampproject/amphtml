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
import {
  getCdnUrlAttr,
  isJsonScript,
  isValidOrigin,
  tryGetUrl,
} from '../utilities/cdn-tag';
import {CDNURLToLocalHostRelativeAbsoluteDist} from '../utilities/cdn';
import {OptionSet} from '../utilities/option-set';
import {parse} from 'path';

function maybeModifyCdnUrl(node: posthtml.Node, options: OptionSet): posthtml.Node {
  // Make sure that isJsonScript is used before `tryGetUrl`. We bail out
  // early if the ScriptNode is of type="application/json" since it wouldn't
  // have any src url to modify.
  if (isJsonScript(node)) {
    return node;
  }
  if (!node.attrs) {
    return node;
  }
  const attr = getCdnUrlAttr(node);
  if (!attr) {
    return node;
  }
  const url = tryGetUrl(node.attrs[attr] || '');
  if (!isValidOrigin(url, options.looseScriptSrcCheck)) {
    return node;
  }
  const {ext} = parse(url.pathname);
  node.attrs[attr] = CDNURLToLocalHostRelativeAbsoluteDist(
    url,
    [null, null],
    ext,
    options.port,
    options.useMaxNames && ext !== '.css'
  );
  return node;
}

/**
 * Replace the resource URLs in tags pointing to the CDN, so that they point to
 * a local URL instead.
 *  - `<script>` tags have their `src` attributes replaced
 *  - `<link>` tags have their `href` attributes replaced
 */
export default function (
  options: OptionSet = {}
): (tree: posthtml.Node) => void {
  return function (tree: posthtml.Node) {
    tree.match([
      {tag: 'script'},
      {tag: 'link', attrs: {rel: 'stylesheet'}},
    ], (node) => {
      return maybeModifyCdnUrl(node, options);
    });
  };
}
