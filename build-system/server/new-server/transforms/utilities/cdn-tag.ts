import {extname, format, parse} from 'path';
import posthtml from 'posthtml';
import {URL} from 'url';

import {VALID_CDN_ORIGIN} from './cdn';

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

export function isValidOrigin(
  url: URL,
  looseOriginUrlCheck?: boolean
): boolean {
  return looseOriginUrlCheck || url.origin === VALID_CDN_ORIGIN;
}

export function getCdnUrlAttr(node: posthtml.Node): string | null {
  if (node.tag === 'script') {
    return 'src';
  }
  if (node.tag === 'link') {
    return 'href';
  }
  return null;
}

/**
 * Determines if a Node is really a ScriptNode.
 * @param node
 */
export function isValidScript(
  node: posthtml.Node,
  looseOriginUrlCheck?: boolean
): node is ScriptNode {
  if (node.tag !== 'script') {
    return false;
  }

  const {src = ''} = node.attrs || {};
  const url = tryGetUrl(src);
  return isValidOrigin(url, looseOriginUrlCheck) && isValidScriptExtension(url);
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
export function tryGetUrl(
  src: string,
  host: string = '0.0.0.0',
  port: number = 8000
): URL {
  return new URL(src, `http://${host}:${port}`);
}
