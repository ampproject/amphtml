/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  isNotSingleReturnStatment: (t, path) => {
    if (!path.get('body').isBlockStatement()) {
      return false;
    }
    const body = path.get('body.body.0');
    return !body || !body.isReturnStatement();
  },

  // Since we don't know if exported members are 'new'd, bail out on modification.
  isExported: (t, path) =>
    path.findParent(
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
          path.stop();
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
        path.stop();
      },
    });
    return containsThis;
  },

  // If the FunctionDeclaration identifier is newed in the scope of this program, bail out on modification.
  isNewedInProgramScope: (t, path) => {
    const {name} = path.get('id').node;
    let isNewed = false;
    path
      .findParent(path => path.isProgram())
      .traverse({
        NewExpression(path) {
          if (t.isIdentifier(path.node.callee, {name})) {
            isNewed = true;
            path.stop();
          }
        },
      });
    return isNewed;
  },
};

function createVariableDeclaration(t, path) {
  const {params, body, async, id} = t.cloneNode(path.node);
  const arrowFunction = t.arrowFunctionExpression(
    params,
    body.body[0].argument,
    async
  );
  const declarations = t.variableDeclarator(
    t.identifier(id.name),
    arrowFunction
  );

  // Making an existing FunctionDeclaration a let VariableDeclaration is safe.
  // The name was already reserved for the FunctionDeclaration.
  return t.variableDeclaration('let', [declarations]);
}

// Attempt to convert simple single ReturnStatement FunctionDeclarations to ArrowFunctionExpressions.
// See BAIL_OUT_CONDITIONS for reasons why FunctionDeclarations would not be modified.
module.exports = function({types: t}) {
  const DEBUG = false;
  const REPORT = false;

  return {
    name: 'safe-arrows',
    pre() {
      this.bailoutCount = {...BAIL_OUT_CONDITIONS};
      Object.keys(this.bailoutCount).forEach(
        key => (this.bailoutCount[key] = [])
      );
      this.successCount = [];
    },
    visitor: {
      FunctionDeclaration(path) {
        const name = (path.get('id') && path.get('id').node.name) || '';
        for (const [id, method] of Object.entries(BAIL_OUT_CONDITIONS)) {
          if (method(t, path)) {
            this.bailoutCount[id].push(name);
            if (DEBUG) {
              console /*OK*/
                .log(
                  `Bail on ${
                    name !== '' ? `function ${name}:` : 'item:'
                  } Reason ${id}.`
                );
            }
            return;
          }
        }
        this.successCount.push(name);
        if (DEBUG) {
          console /*OK*/
            .log(`Success for function ${path.get('id').node.name}.`);
        }
        path.replaceWith(createVariableDeclaration(t, path));
      },
    },
    post() {
      if (REPORT) {
        console /*OK*/
          .log(`Success Count: ${this.successCount.length}`);
        console /*OK*/
          .log('Bail Out Reason Counts');
        Object.keys(this.bailoutCount).forEach(name =>
          console /*OK*/
            .log(`${name}: ${this.bailoutCount[name].length}`)
        );
        console /*OK*/
          .log('\n');
      }
    },
  };
};
