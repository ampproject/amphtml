import posthtml from 'posthtml';
import {URL} from 'url';

import {isJsonScript, isValidScript} from '../utilities/cdn-tag';
import {OptionSet} from '../utilities/option-set';

function sxgTransform(
  node: posthtml.Node,
  options: OptionSet = {}
): posthtml.Node {
  // Make sure that isJsonScript is used before `isValidScript`. We bail out
  // early if the ScriptNode is of type="application/json" since it wouldn't
  // have any src url to modify.
  if (isJsonScript(node)) {
    return node;
  }

  if (!isValidScript(node)) {
    return node;
  }

  if (options.minified) {
    const {src} = node.attrs;
    node.attrs.src = src.replace('.js', '.sxg.js');
  } else {
    const url = new URL(node.attrs.src);
    url.searchParams.append('f', 'sxg');
    node.attrs.src = url.toString();
  }

  return node;
}

/**
 * Returns a function that will transform script node sources into their sxg counterparts.
 * @param options
 */
export default function (
  options: OptionSet = {}
): (tree: posthtml.Node) => void {
  return function (tree: posthtml.Node) {
    tree.match({tag: 'script'}, (script) => {
      return sxgTransform(script, options);
    });
  };
}
