const types = require('@babel/types');
const {parse} = require('@babel/parser');
const {readFile} = require('fs-extra');

const zIndexRegExp = /^z-?index$/i;

/**
 * @param {types.CallExpression} node
 * @return {string|number|undefined}
 */
function getCallExpressionZIndexValue(node) {
  for (let i = 1; i < node.arguments.length; i++) {
    const argument = node.arguments[i];
    const previous = node.arguments[i - 1];
    if (
      (types.isStringLiteral(argument) || types.isNumericLiteral(argument)) &&
      argument.value !== '' &&
      types.isStringLiteral(previous) &&
      zIndexRegExp.test(previous.value)
    ) {
      return argument.value;
    }
  }
}

/**
 * @param {string} source
 * @param {types.Node} node
 * @return {string}
 */
function getNodeSource(source, node) {
  const {end, start} = node;
  if (end == null || start == null) {
    return '';
  }
  return source.substr(start, end - start);
}

/**
 * @param {string} source
 * @param {types.TraversalAncestors} ancestors
 * @return {string}
 */
function getPropertyChain(source, ancestors) {
  let propertyChain = '';

  const path = ancestors.map(({node}) => node);
  let at = path.pop();

  while (at && types.isObjectProperty(at)) {
    const part = getNodeSource(source, at.key);
    if (types.isIdentifier(at.key)) {
      propertyChain = `.${part}` + propertyChain;
    } else {
      propertyChain = `[${part}]` + propertyChain;
    }
    at = path.pop();
  }

  while (
    at &&
    !types.isCallExpression(at) &&
    !types.isVariableDeclarator(at) &&
    !types.isAssignmentExpression(at) &&
    !types.isJSXAttribute(at) &&
    !types.isProgram(at)
  ) {
    at = path.pop();
  }

  if (types.isCallExpression(at)) {
    return getNodeSource(source, at.callee);
  }

  if (types.isJSXAttribute(at)) {
    const parent = path.pop();
    if (types.isJSXOpeningElement(parent)) {
      const name = getNodeSource(source, parent.name);
      return `<${name} />`;
    }
  }

  if (types.isAssignmentExpression(at)) {
    return getNodeSource(source, at.left) + propertyChain;
  }

  if (types.isVariableDeclarator(at)) {
    return getNodeSource(source, at.id) + propertyChain;
  }

  return '(unknown)';
}

/**
 * @param {string} filename
 * @return {Promise<[string, string][]>}
 */
async function getZindexJs(filename) {
  const report = [];
  const source = await readFile(filename, 'utf8');

  // Prevent parsing if there's no chance of encountering string
  if (!/z-*index/i.test(source)) {
    return report;
  }

  const tree = parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  types.traverse(tree, (node, ancestors) => {
    if (types.isObjectProperty(node)) {
      const {value} = node;
      if (!types.isStringLiteral(value) && !types.isNumericLiteral(value)) {
        return;
      }

      const {key} = node;
      const name = types.isStringLiteral(key)
        ? key.value
        : types.isIdentifier(key)
          ? key.name
          : null;
      if (!name) {
        return;
      }

      if (zIndexRegExp.test(name) && value.value !== '') {
        ancestors.pop();
        if (ancestors.length) {
          report.push([getPropertyChain(source, ancestors), value.value]);
        }
      }
    } else if (types.isCallExpression(node)) {
      const value = getCallExpressionZIndexValue(node);
      if (value != null) {
        report.push([getNodeSource(source, node.callee), value]);
      }
    }
  });

  return report.sort(([a], [b]) => a.localeCompare(b));
}

module.exports = {getZindexJs};
