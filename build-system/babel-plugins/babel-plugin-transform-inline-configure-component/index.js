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
const fs = require('fs');
const fsPath = require('path');
const {transformSync} = require('@babel/core');

function transformRedefineInline({types: t}) {
  const resetRelativePath = (relative, path) =>
    fsPath.join(relative, path).replace(/^[^.]/, './$&');

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
          source.value = resetRelativePath(opts.relImportPath, source.value);
        }
      },
      MemberExpression(path, {opts}) {
        if (
          !t.isThisExpression(path.node.object) ||
          !t.isIdentifier(path.node.property, {name: opts.replacedMember})
        ) {
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

const redefineInline = (sourceFilename, opts) =>
  transformSync(fs.readFileSync(sourceFilename).toString(), {
    configFile: false,
    code: false,
    ast: true,
    sourceMaps: true,
    sourceType: 'module',
    plugins: [[transformRedefineInline, opts]],
  });

module.exports = function({types: t}) {
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
        if (!t.isIdentifier(path.node.callee, {name: 'configureComponent'})) {
          return;
        }

        const [importedId, propsObj] = path.get('arguments');

        if (!t.isIdentifier(importedId)) {
          return;
        }

        const importedIdName = importedId.node.name;

        const program = path.findParent(p => t.isProgram(p));
        const importPath = getImportPath(program.node.body, importedIdName);

        for (const name in program.scope.bindings) {
          if (name) {
            path.scope.rename(name, program.scope.generateUid(name));
          }
        }

        if (!importPath) {
          return;
        }

        const currentDirname = fsPath.dirname(file.opts.filename);
        const importedFilename = require.resolve(
          fsPath.join(currentDirname, importPath)
        );
        const importedDirname = fsPath.dirname(importedFilename);
        const relImportPath = fsPath.relative(currentDirname, importedDirname);

        const replacedMember = 'staticComponentConfig_';

        const properties = propsObj.get('properties');

        const propValues = {};
        const hoistedDecls = [];

        for (let i = 0; i < properties.length; i++) {
          const path = properties[i];
          const {key, value} = path.node;
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

          const id = program.scope.generateUidIdentifier(
            `${replacedMember}_${name}`
          );

          propValues[name] = id;

          hoistedDecls.push(t.variableDeclarator(id, value));
        }

        if (hoistedDecls.length) {
          program.unshiftContainer(
            'body',
            t.variableDeclaration('const', hoistedDecls)
          );
        }

        // TODO(alanorozco): sourcemaps
        const importedInline = redefineInline(importedFilename, {
          relImportPath,
          replacedMember,
          propValues,
        });

        program.unshiftContainer('body', importedInline.ast.program.body);

        path.replaceWith(t.identifier(importedIdName));
      },
    },
  };
};
