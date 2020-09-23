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
import {URL} from 'url';
import {extname} from 'path';
import {VALID_CDN_ORIGIN} from './cdn';
import {parse, format} from 'path';

export interface ScriptNode extends posthtml.Node {
  tag: 'script';
  attrs: {
    [key: string]: string | undefined;
    src: string;
  };
}

const VALID_SCRIPT_EXTENSIONS = ['.js', '.mjs'];

function isValidScriptExtension(url: URL): boolean {
  return VALID_SCRIPT_EXTENSIONS.includes(extname(url.pathname));
}

/**
 * Determines if a Node is really a ScriptNode.
 * @param node
 */
export function isValidScript(node: posthtml.Node, looseScriptSrcCheck?: boolean): node is ScriptNode {
  if (node.tag !== 'script') {
    return false;
  }

  const attrs = node.attrs || {};
<<<<<<< HEAD
  const url = tryGetUrl(attrs.src || '');
=======
  const url = tryGetURL(attrs.src || '');
>>>>>>> 277be82a3 (lint html)
  if (looseScriptSrcCheck) {
    return isValidScriptExtension(url);
  }
  return url.origin === VALID_CDN_ORIGIN && isValidScriptExtension(url);
}

export function isJsonScript(node: posthtml.Node): boolean {
  if (node.tag !== 'script') {
    return false;
  }
  const attrs = node.attrs || {};
  const type = attrs.type || '';
  return type.toLowerCase() === 'application/json';
}

/**
 * Transforms a url's extension type to the desired type.
 * ex. v0.js -> v0.mjs
 */
export function toExtension(url: URL, extension: string): URL {
  const parsedPath = parse(url.pathname);
  parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
  parsedPath.ext = extension;
  url.pathname = format(parsedPath);
  return url;
}

/**
 * This is a temporary measure to allow for a relaxed parsing of our
 * fixture files' src urls before they are all fixed accordingly.
 */
export function tryGetUrl(src: string, port: number = 8000): URL {
  let url;
  try {
    url = new URL(src);
  } catch (e) {
    url = new URL(src, `http://localhost:${port}`);
  } finally {
    return url as URL;
  }
}
