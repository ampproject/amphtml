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
  isJsonScript,
  isValidCssLink,
  isValidScript,
  tryGetUrl,
} from '../utilities/cdn-tag';
import {CDNURLToLocalHostRelativeAbsoluteDist} from '../utilities/cdn';
import {OptionSet} from '../utilities/option-set';
import {parse} from 'path';

/**
 * Replace the `src` of <script> tags pointing to the CDN.
 */
function modifySrc(script: posthtml.Node, options: OptionSet): posthtml.Node {
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
  const src = CDNURLToLocalHostRelativeAbsoluteDist(
    url,
    [null, null],
    parsedPath.ext,
    options.port,
    options.useMaxNames
  ).toString();
  script.attrs.src = src;
  return script;
}

/**
 * Replace the `href` of <link> tags pointing to the CDN.
 */
function modifyCssLinkHref(
  node: posthtml.Node,
  options: OptionSet
): posthtml.Node {
  if (!isValidCssLink(node)) {
    return node;
  }

  const url = tryGetUrl(node.attrs.href || '');

  const href = CDNURLToLocalHostRelativeAbsoluteDist(
    url,
    [null, null],
    '.css',
    options.port,
    /* useMaxNames */ false
  ).toString();

  node.attrs.href = href;

  return node;
}

/**
 * Replace the src/href for every <script> and <link> tag pointing to a CDN
 * URL, so that they point to a local URL.
 */
export default function (
  options: OptionSet = {}
): (tree: posthtml.Node) => void {
  return function (tree: posthtml.Node) {
    tree.match({tag: 'script'}, (node) => {
      return modifySrc(node, options);
    });
    tree.match({tag: 'link'}, (node) => {
      return modifyCssLinkHref(node, options);
    });
  };
}
