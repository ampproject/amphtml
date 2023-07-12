import {readFileSync} from 'fs';
import minimist from 'minimist';
import posthtml from 'posthtml';

import {Lazy} from '../utilities/lazy';

const argv = minimist(process.argv.slice(2));
const isTestMode: boolean = argv._.includes('server-tests');

const testDir = 'build-system/server/new-server/transforms/css/test';
const cwd = process.cwd();

const cssPath = isTestMode
  ? `${cwd}/${testDir}/css.txt`
  : `${cwd}/build/css/v0.css`;
const versionPath = `${cwd}/${testDir}/version.txt`;

const css = new Lazy(() => readFileSync(cssPath, 'utf8').toString().trim());
const version = new Lazy(() =>
  readFileSync(versionPath, 'utf8').toString().trim()
);

interface StyleNode extends posthtml.Node {
  tag: 'style';
  attrs: {
    [key: string]: string | undefined;
    'amp-runtime': string;
    'i-amphtml-version': string;
  };
  content: string[];
}

function isStyleNode(node: posthtml.Node | string): node is StyleNode {
  return (
    node !== undefined &&
    typeof node !== 'string' &&
    (node as StyleNode).tag === 'style'
  );
}

function prependAmpStyles(head: posthtml.Node): posthtml.Node {
  const content = head.content || [];

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
      'i-amphtml-version': `01${version.value()}`,
    },
    content: [css.value()],
  };
  content.unshift(styleNode);
  return {...head, content};
}

/**
 * Replace the src for every stories script tag.
 */
export default function (): (tree: posthtml.Node) => void {
  return function (tree: posthtml.Node) {
    let isAmp = false;
    tree.match({tag: 'html'}, function (html: posthtml.Node): posthtml.Node {
      if (html.attrs && ('amp' in html.attrs || '⚡' in html.attrs)) {
        isAmp = true;
      }
      return html;
    });
    if (isAmp) {
      tree.match({tag: 'head'}, prependAmpStyles);
    }
  };
}
