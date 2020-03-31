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

const DEBUG = false;

// Attempt to convert simple single ReturnStatement FunctionDeclarations to ArrowFunctionExpressions.
// See BAIL_OUT_CONDITIONS for reasons why FunctionDeclarations would not be modified.
module.exports = function ({types: t}) {
  const BAIL_OUT_CONDITIONS = {
    // If this isn't a FunctionDeclaration, bail out on modification.
    isNotFunction(path) {
      return !t.isFunctionDeclaration(path.node);
    },

    // If this FunctionDeclaration is a Generator, bail out on modification.
    isGenerator(path) {
      return path.node.generator;
    },

    // If this FunctionDeclaration doesn't have a single return statement, bail out on modification
    isNotSingleReturnStatment(path) {
      if (!path.get('body').isBlockStatement()) {
        return false;
      }
      const body = path.get('body.body.0');
      return !body || !body.isReturnStatement();
    },

    // If the function contains usage of `arguments`, bail out on modification.
    containsArgumentsUsage(path) {
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
    containsThisExpression(path) {
      let containsThis = false;
      path.traverse({
        ThisExpression() {
          containsThis = true;
          path.stop();
        },
      });
      return containsThis;
    },

    // If the FunctionDeclaration identifier is used a manner besides a CallExpression, bail.
    referencesAreOnlyCallExpressions(path) {
      const {name} = path.get('id').node;
      const binding = path.scope.getBinding(name);
      return !binding.referencePaths.every((p) =>
        p.parentPath.isCallExpression({callee: p.node})
      );
    },
  };

  // Making an existing FunctionDeclaration a let VariableDeclaration is safe.
  // The name was already reserved for the FunctionDeclaration.
  function createVariableDeclaration(path) {
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
    const declaration = t.variableDeclaration('let', [declarations]);

    t.inherits(declaration, path.node);
    return declaration;
  }

  return {
    name: 'safe-arrows',
    visitor: {
      FunctionDeclaration(path) {
        for (const [id, method] of Object.entries(BAIL_OUT_CONDITIONS)) {
          if (method(path)) {
            if (DEBUG) {
              const pathId = path.get('id');
              const message = pathId
                ? `Bail on function ${pathId.node.name}: Reason ${id}.`
                : `Bail on item: Reason ${id}`;
              console /*OK*/
                .log(message);
            }
            return;
          }
        }

        if (DEBUG) {
          const {name} = path.node.id;
          console /*OK*/
            .log(`Success for function ${name}.`);
        }

        const usableBlock = path.findParent(
          (path) => path.isBlockStatement() || path.isProgram()
        );
        if (usableBlock) {
          usableBlock.unshiftContainer('body', createVariableDeclaration(path));
          path.remove();
        }
      },
    },
  };
};
