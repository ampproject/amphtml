import posthtml from 'posthtml';

import {
  ScriptNode,
  isJsonScript,
  isValidScript,
  toExtension,
  tryGetUrl,
} from '../utilities/cdn-tag';
import {OptionSet} from '../utilities/option-set';

function appendModuleScript(
  head: posthtml.Node,
  nomoduleScript: ScriptNode,
  options: OptionSet
): void {
  const modulePath = toExtension(
    tryGetUrl(nomoduleScript.attrs.src),
    '.mjs'
  ).toString();
  const moduleScript: ScriptNode = {
    ...nomoduleScript,
    attrs: {
      ...nomoduleScript.attrs,
      src: modulePath,
      type: 'module',
    },
  };
  delete moduleScript.attrs.nomodule;

  const content = head.content || [];
  const nomoduleIdx = content.indexOf(nomoduleScript);
  // If we are testing and in esm mode, outright replace the nomodule script
  // with the module script. This is so that we testing the module script in
  // isolation without a fallback.
  if (options.fortesting && options.esm) {
    content.splice(nomoduleIdx, 1, moduleScript);
  } else {
    // Add the module script after the nomodule script.
    content.splice(nomoduleIdx + 1, 0, '\n', moduleScript);
  }
}

/**
 * Returns a function that will transform script node sources into module/nomodule pair.
 * @param options
 */
export default function (
  options: OptionSet = {}
): (tree: posthtml.Node) => void {
  return function (tree: posthtml.Node): void {
    let head: posthtml.Node | undefined = undefined;
    const scripts: Array<ScriptNode> = [];
    tree.walk((node) => {
      if (node.tag === 'head') {
        head = node;
      }

      // Make sure that isJsonScript is used before `isValidScript`. We bail out
      // early if the ScriptNofe is of type="application/json" since it wouldn't
      // have any src url to modify.
      if (isJsonScript(node)) {
        return node;
      }

      if (!isValidScript(node, options.looseOriginUrlCheck)) {
        return node;
      }

      // Mark the existing valid scripts with `nomodule` attributes.
      node.attrs.nomodule = '';
      scripts.push(node);
      return node;
    });

    if (head === undefined) {
      // eslint-disable-next-line local/no-forbidden-terms
      console.log('Could not find a head element in the document');
      return;
    }

    for (const script of scripts) {
      appendModuleScript(head, script, options);
    }
  };
}
