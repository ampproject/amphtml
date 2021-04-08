/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const zIndexRegExp = /^z-?index$/i;

function getCallExpressionZIndexValue(node) {
  for (let i = 1; i < node.arguments.length; i++) {
    const argument = node.arguments[i];
    const previous = node.arguments[i - 1];
    if (
      argument.type.endsWith('Literal') &&
      argument.value !== '' &&
      zIndexRegExp.test(previous.value)
    ) {
      return argument.value;
    }
  }
}

function source(file, node) {
  const {start, end} = node;
  return file.source.substr(start, end - start);
}

function chainId(file, path) {
  let propertyChain = '';
  let at = path;

  while (at && at.value && at.value.type.endsWith('Property')) {
    const part = source(file, at.value.key);
    if (at.value.key.type === 'Identifier') {
      propertyChain = `.${part}` + propertyChain;
    } else {
      propertyChain = `[${part}]` + propertyChain;
    }
    at = at.parent && at.parent.parent;
  }

  while (
    at &&
    at.parent &&
    at.value.type !== 'CallExpression' &&
    at.value.type !== 'VariableDeclarator' &&
    at.value.type !== 'AssignmentExpression' &&
    at.value.type !== 'JSXAttribute' &&
    at.value.type !== 'Program'
  ) {
    at = at.parent;
  }

  if (at.value.type === 'JSXAttribute') {
    const openingElement = source(file, at.parent.value.name);
    return `<${openingElement} />`;
  }

  if (at.value.type === 'CallExpression') {
    return source(file, at.value.callee);
  }

  if (at.value.type === 'AssignmentExpression') {
    return source(file, at.value.left) + propertyChain;
  }

  if (at.value.type === 'VariableDeclarator') {
    return source(file, at.value.id) + propertyChain;
  }

  return '(unknown)';
}

module.exports = function (file, api) {
  const j = api.jscodeshift;

  const report = [];

  j(file.source)
    .find(
      j.ObjectProperty,
      (node) =>
        node.key &&
        node.value.type.endsWith('Literal') &&
        node.value.value !== '' &&
        zIndexRegExp.test(node.key.value || node.key.name)
    )
    .forEach((path) => {
      report.push([chainId(file, path.parent.parent), path.value.value.value]);
    });

  j(file.source)
    .find(
      j.CallExpression,
      (node) => getCallExpressionZIndexValue(node) != null
    )
    .forEach((path) => {
      report.push([
        chainId(file, path),
        getCallExpressionZIndexValue(path.value),
      ]);
    });

  api.report(JSON.stringify(report));

  return file.source;
};
