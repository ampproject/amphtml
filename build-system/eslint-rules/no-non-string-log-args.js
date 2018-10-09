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

function areAllArgumentsLiteral(node) {
  if (node.type === 'Literal') {
    return true;
  }
  
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    if (areAllArgumentsLiteral(node.left) && areAllArgumentsLiteral(node.right)) {
      return true;
    }
  }
  
  return false;
}

function getMetadata(name) {
  for (let i = 0; i < transformableMethods.length; i++) {
    const curTransformableMethod = transformableMethods[i];
    if (curTransformableMethod.name === name) {
      return curTransformableMethod; 
    }
  }
  return null;
}


module.exports = function(context) {
  return {
    'CallExpression[callee.property.name=assert]': function(node) {
      if (!(node.callee.object && node.callee.object.type === 'CallExpression')) {
        return;
      }

      if(!['dev', 'user'].includes(node.callee.object.callee.name)) {
        return;
      }


      const methodInvokedName = node.callee.property.name;
      const metadata = getMetadata(methodInvokedName);

      // If there's no metadata, this is most likely a test file running
      // private methods on log.
      if (!metadata) {
        return;
      }

      const argToEval = node.arguments[metadata.startPos];

      if (!argToEval) {
        context.report({
          node: node,
       	  message: `No argument passed into expected message parameter number ${metadata.startPos}`,
        });
        return;
      }

      if (!areAllArgumentsLiteral(argToEval)) {
        context.report({
          node: argToEval,
       	  message: `Must use a literal string at method invocation on argument position ${metadata.startpos}. No other Node type is allowed besides Raw strings or string concatenation operations`,
        });
      }
    },
  };

};
