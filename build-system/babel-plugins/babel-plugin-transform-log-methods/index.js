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

/**
 * @type {!Array<LogMethodMetadataDef>}
 */
const transformableMethods = [
  {name: 'assert', variadic: true, startPos: 1},
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

const SIGIL_START = '%%%START';
const SIGIL_END = 'END%%%';
const messageRegex = new RegExp(`%s|${SIGIL_START}([^]*?)${SIGIL_END}`, 'g');

function isTransformableMethod(t, node, methods) {
  if (!node || !t.isIdentifier(node)) {
    return false;
  }
  return methods.some(names => {
    const name = names.name;
    return t.isIdentifier(node, {name: name});
  });
}

/**
 * @param {string} name
 * @return {!LogMethodMetadataDef}
 */
function getMetadata(name) {
  return transformableMethods.find(cur => cur.name === name);
}

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
         const metadata = getMetadata(property.name);
         const args = path.node.arguments[methodInfo.startPos];
      },
    },
  };
};

function extractMessage(argToEval) {
  let message = '';
  try {
    message = buildMessage(argToEval);
  } catch (e) {
    return;
  }

  let args = [];
  let argI = metadata.startPos + 1;
  message = message.replace(messageRegex, (match, sourceText) => {
    let arg;
    if (match === '%s') {
      arg = source.getText(node.arguments[argI]);
      argI++;
    } else {
      arg = sourceText;
    }
    args.push(arg);
    return '%s';
  });
}

function buildMessage(arg) {
  if (isLiteralString(arg)) {
    return arg.value;
  }

  if (isBinaryConcat(arg)) {
    return buildMessage(arg.left) + buildMessage(arg.right);
  }

  if (arg.type === 'TemplateLiteral') {
    let quasied = '';
    let i = 0;
    for (; i < arg.quasis.length - 1; i++) {
      quasied += arg.quasis[i].value.cooked;
      quasied += buildMessage(arg.expressions[i]);
    }
    quasied += arg.quasis[i].value.cooked;
    return quasied;
  }

  return `${SIGIL_START}${source.getText(arg)}${SIGIL_END}`;
}
