/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs-extra');

fs.removeSync('messages.txt');

function isTransformableMethod(t, node, methods) {
  if (!node || !t.isIdentifier(node)) {
    return false;
  }
  return methods.some(names => {
    const name = names.name;
    return t.isIdentifier(node, {name: name});
  });
}

function findMethodInfo(name) {
  for (var i = 0; i < transformableMethods.length; i++) {
    if (transformableMethods[i].name === name) {
      return transformableMethods[i];
    }
  }
  return null;
}

const transformableMethods = [
  {name: 'assert', variadic: false, startPos: 1},
  {name: 'assertString', variadic: false, startPos: 1},
  {name: 'assertNumber', variadic: false, startPos: 1},
  {name: 'assertBoolean', variadic: false, startPos: 1},
  {name: 'assertEnumValue', variadic: false, startPos: 2},
  {name: 'assertElement', variadic: false, startPos: 1},
  {name: 'createExpectedError', variadic: true, startPos: 0},
  {name: 'fine', variadic: true, startPos: 1}, 
  {name: 'info', variadic: true, startPos: 1},
  {name: 'warn', variadic: true, startPos: 1},
  {name: 'error', variadic: true, startPos: 1},
  {name: 'expectedError', variadic: true, startPos: 1},
  {name: 'createError', variadic: true, startPos: 0},
];

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      CallExpression(path) {
        console.log('file', path.scope.hub.file.log.filename);
        const {node} = path;
        const {callee} = node;
        const {parenthesized} = node.extra || {};
        const isMemberAndCallExpression = t.isMemberExpression(callee)
            && t.isCallExpression(callee.object);

        if (!isMemberAndCallExpression) {
          return;
        }

        const logCallee = callee.object.callee;
        const {property} = callee;
        const isTransformableDevCall = t.isIdentifier(logCallee, {name: 'dev'}) &&
            isTransformableMethod(t, property, transformableMethods);

        const isTransformableUserCall = t.isIdentifier(logCallee, {name: 'user'}) &&
            isTransformableMethod(t, property, transformableMethods);

        if (!(isTransformableDevCall || isTransformableUserCall)) {
          return;
        }

        const methodInfo = findMethodInfo(property.name);

        const args = path.node.arguments[methodInfo.startPos];
        if (args && args.type === 'StringLiteral') {
          fs.appendFileSync('messages.txt', args.extra.rawValue);
        }
      },
    },
  };
};
