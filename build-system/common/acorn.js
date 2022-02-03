/**
 * @fileoverview Helpers to parse Javascript source using acorn, which is way
 * faster for analysis than Babel or JsCodeshift.
 */
const acorn = require('acorn');
const acornJsx = require('acorn-jsx');

let jsxParser;

/**
 * @param {string} source
 * @return {import('estree-jsx').Node}
 */
function parse(source) {
  if (!jsxParser) {
    jsxParser = acorn.Parser.extend(acornJsx());
  }
  // i don't know how to configure acorn to understand type assertions :)
  source = source.replace(
    /\s+assert\s+\{type: ['"]json['"]\}/g,
    // preserve node indices
    ({length}) =>
      Array(length + 1)
        .fill('')
        .join(' ')
  );
  return jsxParser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });
}

/**
 * @param {import('estree-jsx').Node} node
 * @param {(node: import('estree-jsx').Node, path: import('estree-jsx').Node[]) => void} process
 */
function traverse(node, process) {
  traverseInternal(node, process, []);
}

/**
 * @param {?import('estree-jsx').Node} node
 * @param {(node: import('estree-jsx').Node, path: import('estree-jsx').Node[]) => void} process
 * @param {import('estree-jsx').Node[]} path
 */
function traverseInternal(node, process, path) {
  if (!node) {
    return;
  }
  path = [...path, node];
  process(node, path);
  for (const prop in node) {
    if (Array.isArray(node[prop])) {
      node[prop].forEach((node) => traverseInternal(node, process, path));
    } else if (typeof node[prop] === 'object') {
      traverseInternal(node[prop], process, path);
    }
  }
}

module.exports = {parse, traverse};
