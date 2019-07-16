/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const BAIL_OUT_CONDITIONS = {
  // If this isn't a FunctionDeclaration, bail out on modification.
  isNotFunction: (t, path) => !t.isFunctionDeclaration(path.node),

  // If this FunctionDeclaration is a Generator, bail out on modification.
  isGenerator: (t, path) => path.node.generator,

  // If this FunctionDeclaration doesn't have a single return statement, bail out on modification
  isNotSingleReturnStatment: (t, path) =>
    !t.isBlockStatement(path.get('body')) ||
    !t.isReturnStatement(path.get('body.body.0')),

  // Since we don't know if exported members are 'new'd, bail out on modification.
  isExported: (t, path) =>
    path.find(
      path =>
        path.isExportNamedDeclaration() || path.isExportDefaultDeclaration()
    ),

  // If the function contains usage of `arguments`, bail out on modification.
  containsArgumentsUsage: (t, path) => {
    let containsArgumentsUsage = false;
    path.traverse({
      Identifier(path) {
        if (t.isIdentifier(path.node, {name: 'arguments'})) {
          containsArgumentsUsage = true;
        }
      },
    });
    return containsArgumentsUsage;
  },

  // If the function contains a ThisExpression, converting from a FunctionDeclaration to a
  // VariableDeclaration => VariableDeclarator => ArrowFunctionExpression isn't necessarily valid.
  // Bail out on modification.
  containsThisExpression: (t, path) => {
    let containsThis = false;
    path.traverse({
      ThisExpression() {
        containsThis = true;
      },
    });
    return containsThis;
  },

  // If the FunctionDeclaration identifier is newed in the scope of this program, bail out on modification.
  isNewedInProgramScope: (t, path) => {
    const methodName = path.get('id').node.name;
    let isNewed = false;
    path
      .findParent(path => path.isProgram())
      .traverse({
        NewExpression(path) {
          if (t.isIdentifier(path.node.callee, {name: methodName})) {
            isNewed = true;
          }
        },
      });
    return isNewed;
  },
};

function createVariableDeclaration(t, path) {
  const params = path.node.params.map(param => t.identifier(param.name));
  const isAsync = path.node.async;
  const arrowFunction = t.arrowFunctionExpression(
    params,
    t.cloneNode(path.get('body.body.0').node.argument),
    isAsync
  );
  const declarations = t.variableDeclarator(
    t.identifier(path.get('id').node.name),
    arrowFunction
  );

  // Making an existing FunctionDeclaration a const VariableDeclaration is safe.
  // The name was already reserved for the FunctionDeclaration.
  return t.variableDeclaration('const', [declarations]);
}

// Attempt to convert simple single ReturnStatement FunctionDeclarations to ArrowFunctionExpressions.
// See BAIL_OUT_CONDITIONS for reasons why FunctionDeclarations would not be modified.
export default function({types: t}) {
  const DEBUG = true;

  return {
    name: 'safe-arrows',
    visitor: {
      FunctionDeclaration(path) {
        for (const [id, method] of Object.entries(BAIL_OUT_CONDITIONS)) {
          if (method(t, path)) {
            if (DEBUG) {
              console /*OK*/
                .log(
                  `Bail on ${
                    path.get('id') && path.get('id').node.name
                      ? `function ${path.node.id.name}:`
                      : 'item:'
                  } Reason ${id}.`
                );
            }
            return;
          }
        }
        if (DEBUG) {
          console /*OK*/
            .log(`Success for function ${path.get('id').node.name}.`);
        }
        path.replaceWith(createVariableDeclaration(t, path));
      },
    },
  };
}
