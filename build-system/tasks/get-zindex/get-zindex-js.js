const {parse, traverse} = require('../../common/acorn');
const {readFile} = require('fs-extra');

const zIndexRegExp = /^z-?index$/i;

/**
 * @param {import('estree-jsx').CallExpression} node
 * @return {string|undefined}
 */
function getCallExpressionZIndexValue(node) {
  for (let i = 1; i < node.arguments.length; i++) {
    const argument = node.arguments[i];
    const previous = node.arguments[i - 1];
    if (
      argument.type === 'Literal' &&
      argument.value !== '' &&
      previous.type === 'Literal' &&
      typeof previous.value === 'string' &&
      zIndexRegExp.test(previous.value)
    ) {
      return String(argument.value);
    }
  }
}

/**
 * @param {string} fileSource
 * @param {import('estree-jsx').Node} node
 * @return {string}
 */
function source(fileSource, node) {
  // @ts-ignore
  const {end, start} = node;
  return fileSource.substr(start, end - start);
}

/**
 * @param {string} fileSource
 * @param {import('estree-jsx').Node[]} path
 * @return {string}
 */
function chainId(fileSource, path) {
  let propertyChain = '';
  let at = path.pop();

  while (at?.type === 'Property') {
    const part = source(fileSource, at.key);
    if (at.key.type === 'Identifier') {
      propertyChain = `.${part}` + propertyChain;
    } else {
      propertyChain = `[${part}]` + propertyChain;
    }
    path.pop();
    at = path.pop();
  }

  while (
    path.length &&
    at &&
    at?.type !== 'CallExpression' &&
    at?.type !== 'VariableDeclarator' &&
    at?.type !== 'AssignmentExpression' &&
    at?.type !== 'JSXAttribute' &&
    at?.type !== 'Program'
  ) {
    at = path.pop();
  }

  if (at?.type === 'JSXAttribute') {
    const parent = /** @type {import('estree-jsx').JSXOpeningElement} */ (
      path.pop()
    );
    const openingElement = source(fileSource, parent.name);
    return `<${openingElement} />`;
  }

  if (at?.type === 'CallExpression') {
    return source(fileSource, at?.callee);
  }

  if (at?.type === 'AssignmentExpression') {
    return source(fileSource, at?.left) + propertyChain;
  }

  if (at?.type === 'VariableDeclarator') {
    return source(fileSource, at?.id) + propertyChain;
  }

  return '(unknown)';
}

module.exports = async function (filename) {
  const report = [];
  const source = await readFile(filename, 'utf8');

  // Prevent parsing if there's no chance of encountering string
  if (!/z-*index/i.test(source)) {
    return report;
  }

  const tree = parse(source);

  traverse(tree, (node, path) => {
    if (node.type === 'Property') {
      // @ts-ignore
      const key = node.key?.name || node.key?.value;
      if (
        key &&
        node.value.type === 'Literal' &&
        node.value.value !== '' &&
        zIndexRegExp.test(key)
      ) {
        path.pop();
        path.pop();
        report.push([chainId(source, path), node.value.value]);
      }
    } else if (node.type === 'CallExpression') {
      const value = getCallExpressionZIndexValue(node);
      if (value) {
        report.push([chainId(source, path), value]);
      }
    }
  });

  return report;
};
