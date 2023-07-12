import {parse} from 'path';
import posthtml from 'posthtml';

import {CDNURLToLocalHostRelativeAbsoluteDist} from '../utilities/cdn';
import {
  getCdnUrlAttr,
  isJsonScript,
  isValidOrigin,
  tryGetUrl,
} from '../utilities/cdn-tag';
import {OptionSet} from '../utilities/option-set';

function maybeModifyCdnUrl(
  node: posthtml.Node,
  options: OptionSet
): posthtml.Node {
  // Make sure to call `isJsonScript` before `tryGetUrl`. We bail out early if
  // the node is of type="application/json" since it wouldn't have a URL.
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
  if (!isValidOrigin(url, options.looseOriginUrlCheck)) {
    return node;
  }
  const {ext} = parse(url.pathname);
  node.attrs[attr] = CDNURLToLocalHostRelativeAbsoluteDist(
    url,
    [null, null],
    ext,
    options.port,
    // CSS files are never output as .max.css
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
    tree.match(
      [{tag: 'script'}, {tag: 'link', attrs: {rel: 'stylesheet'}}],
      (node) => maybeModifyCdnUrl(node, options)
    );
  };
}
