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
const {dirname, relative, join, posix} = require('path');
const {join: posixJoin} = require('path').posix;
const {transformFileSync} = require('@babel/core');

/**
 * @fileoverview
 * Finds `configureComponent(MyConstructor, {foo: 'bar'})` calls and:
 *
 * 1. Inlines imported `MyConstructor` in current scope.
 *
 * 2. Replaces `*.STATIC_CONFIG_.foo` accesses to their value as
 *    defined in config object `{foo: 'bar'}`.
 *
 * 3. Replaces `configureComponent(...)` call with identifier for inlined, static
 *    `MyConstructor`.
 */

const calleeName = 'configureComponent';
const replacedMember = 'STATIC_CONFIG_';

/**
 * Sub-plugin that transforms inlined file that exports wrapped constructor.
 * @param {{types: string}} options
 * @return {!Object}
 */
function transformRedefineInline({types: t}) {
  const propValueNode = (propValues, key, opt_default) =>
    propValues[key] || opt_default || t.identifier('undefined');

  function unjsdoc({leadingComments}) {
    if (!leadingComments) {
      return;
    }
    for (let i = 0; i < leadingComments.length; i++) {
      const comment = leadingComments[i];
      comment.value = comment.value.replace(/^\*/, ' [removed]');
    }
  }

  function unexport(path) {
    if (path.node.declaration) {
      path.replaceWith(path.node.declaration);
      return;
    }
    path.remove();
  }

  return {
    name: 'transform-redefine-inline',
    visitor: {
      ExportDefaultDeclaration: unexport,
      ExportNamedDeclaration: unexport,
      ExportAllDeclaration: unexport,
      ImportDeclaration(path, {opts}) {
        const {source} = path.node;
        if (source.value.startsWith('.')) {
          source.value = posixJoin(opts.from, source.value).replace(
            /^[^.]/,
            './$&'
          );
        }
      },
      MemberExpression(path, {opts}) {
        // Handle x.y.{...}.$replacedMember prop accesses
        if (!t.isIdentifier(path.node.property, {name: replacedMember})) {
          return;
        }

        const assignment = path.find(
          ({parent, parentKey, parentPath}) =>
            parentKey == 'left' &&
            t.isAssignmentExpression(parent) &&
            t.isExpressionStatement(parentPath.parent)
        );

        if (assignment) {
          unjsdoc(assignment.parentPath.parent);
          assignment.parentPath.parentPath.remove();
          return;
        }

        if (
          t.isMemberExpression(path.parent) &&
          t.isIdentifier(path.parent.property)
        ) {
          const {name} = path.parent.property;
          path.parentPath.replaceWith(propValueNode(opts.propValues, name));
          return;
        }

        if (
          t.isVariableDeclarator(path.parent) &&
          t.isObjectPattern(path.parent.id) &&
          t.isVariableDeclaration(path.parentPath.parent)
        ) {
          const assignments = path.parent.id.properties.map(({key, value}) =>
            t.variableDeclarator(
              value.left || value,
              propValueNode(opts.propValues, key.name, value.right)
            )
          );
          path.parentPath.replaceWithMultiple(assignments);
        }
      },
    },
  };
}

/**
 * Transforms using transformRedefineInline sub-plugin.
 * @param {string} sourceFilename
 * @param {!Object} opts
 * @return {!Object}
 */
const redefineInline = (sourceFilename, opts) =>
  transformFileSync(sourceFilename.toString(), {
    configFile: false,
    code: false,
    ast: true,
    sourceType: 'module',
    plugins: [[transformRedefineInline, opts]],
  });

/**
 * Replaces `configureComponent()` wrapping calls.
 * @param {{types: string}} options
 * @return {!Object}
 */
module.exports = function ({types: t}) {
  function getImportPath(nodes, name) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (
        t.isImportDeclaration(node) &&
        node.specifiers.find(({imported}) => t.isIdentifier(imported, {name}))
      ) {
        return node.source.value;
      }
    }
  }

  return {
    name: 'transform-inline-decl-extensions',
    visitor: {
      CallExpression(path, {file}) {
        if (!t.isIdentifier(path.node.callee, {name: calleeName})) {
          return;
        }

        const [importedId, propsObj] = path.node.arguments;
        if (!t.isIdentifier(importedId) || !t.isObjectExpression(propsObj)) {
          return;
        }

        const program = path.findParent((p) => t.isProgram(p));

        const importPath = getImportPath(program.node.body, importedId.name);
        if (!importPath) {
          return;
        }

        for (const name in program.scope.bindings) {
          if (name) {
            path.scope.rename(name, program.scope.generateUid(name));
          }
        }

        const propValues = Object.create(null);

        for (const {key, value} of propsObj.properties) {
          const {name} = key;

          if (t.isMemberExpression(value)) {
            throw path.buildCodeFrameError(
              `${replacedMember} properties must not be assigned to members. ` +
                'Set necessary values to program-level constants.'
            );
          }

          if (t.isIdentifier(value)) {
            const binding = path.scope.getBinding(value.name);
            if (!binding || !t.isProgram(binding.scope.block)) {
              throw path.buildCodeFrameError(
                `ids used in ${replacedMember} must be defined as ` +
                  'program-level constants.'
              );
            }
            propValues[name] = value;
            continue;
          }

          const id = program.scope.generateUidIdentifier(name);
          program.scope.push({id, init: value, kind: 'const'});
          propValues[name] = id;
        }

        const currentDirname = dirname(file.opts.filename);
        const importedModule = join(currentDirname, importPath);

        // TODO(go.amp.dev/issue/26948): sourcemaps
        const importedInline = redefineInline(require.resolve(importedModule), {
          propValues,
          from: relative(currentDirname, dirname(importedModule)),
        });

        program.unshiftContainer('body', importedInline.ast.program.body);

        path.replaceWith(t.identifier(importedId.name));
      },
    },
  };
};
