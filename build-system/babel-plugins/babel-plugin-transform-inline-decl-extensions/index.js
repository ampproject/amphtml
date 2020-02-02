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
const {parse} = require('@babel/parser');

module.exports = function({types: t}) {
  function cloneExporter(sourceFilename, relImportPath) {
    const exporter = parse(fs.readFileSync(sourceFilename).toString(), {
      sourceFilename,
      sourceType: 'module',
    });
    replaceImportPaths(exporter.program, relImportPath);
    naiveReplaceJsdocTypePaths(exporter.comments, relImportPath);
    return exporter;
  }

  function replaceImportPaths(program, relImportPath) {
    for (const node of program.body) {
      if (t.isImportDeclaration(node) && node.source.value.startsWith('.')) {
        node.source.value = resetRelativePath(relImportPath, node.source.value);
      }
    }
  }

  const relativePathInCommentRe = /\.+\/[\/\.a-z0-9_-]+/gi;
  function naiveReplaceJsdocTypePaths(comments, relImportPath) {
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (comment.type == 'CommentBlock') {
        comment.value = comment.value.replace(
          relativePathInCommentRe,
          path => resetRelativePath(relImportPath, path)
        );
      }
    }
  }

  const resetRelativePath = (relative, path) =>
    fsPath.join(relative, path).replace(/^[^.]/, './$&');

  const propValueNode = (propValues, key) =>
    propValues[key] || t.identifier('undefined');

  const propValueNodeOr = (obj, key, defaultValue) =>
    t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.identifier('undefined'),
        propValueNode(obj, key)
      ),
      defaultValue,
      propValueNode(obj, key)
    );

  function unjsdoc({leadingComments}) {
    if (!leadingComments) {
      return;
    }
    for (let i = 0; i < leadingComments.length; i++) {
      const comment = leadingComments[i];
      comment.value = comment.value.replace(/^\*/, ' [removed]');
    }
  }

  const exporterConfigInlineVisitor = {
    MemberExpression(path, {propValues, replacedMember}) {
      if (
        !t.isThisExpression(path.node.object) ||
        !t.isIdentifier(path.node.property, {name: replacedMember})
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

      if (t.isMemberExpression(path.parent)) {
        const key = path.parent.property.name;
        path.parentPath.replaceWith(propValueNode(propValues, key));
        return;
      }

      if (
        t.isVariableDeclarator(path.parent) &&
        t.isObjectPattern(path.parent.id) &&
        t.isVariableDeclaration(path.parentPath.parent)
      ) {
        const properties = path.parentPath.get('id').get('properties');
        path.parentPath.replaceWithMultiple(
          properties.map(path => {
            const {key, value} = path.node;
            return t.isAssignmentPattern(value)
              ? t.variableDeclarator(
                  value.left,
                  propValueNodeOr(propValues, key.name, value.right)
                )
              : t.variableDeclarator(
                  value,
                  propValueNode(propValues, key.name)
                );
          })
        );
      }
    },
  };

  const inlinedClassVisitor = {
    ClassDeclaration(path, opts) {
      if (path.node.id.name == opts.className) {
        path.traverse(exporterConfigInlineVisitor, opts);
      }
    },
  };

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
        if (
          !t.isIdentifier(path.node.callee, {name: 'useVendorComponentConfig'})
        ) {
          return;
        }

        const [classId, propsObj] = path.get('arguments');

        if (!t.isIdentifier(classId)) {
          return;
        }

        const className = classId.node.name;

        const program = path.findParent(p => t.isProgram(p));
        const importPath = getImportPath(program.node.body, className);

        if (!importPath) {
          return;
        }

        const currentDirname = fsPath.dirname(file.opts.filename);
        const exporterFilename = require.resolve(
          fsPath.join(currentDirname, importPath)
        );
        const exporterDirname = fsPath.dirname(exporterFilename);

        const relImportPath = fsPath.relative(currentDirname, exporterDirname);

        const exporter = cloneExporter(exporterFilename, relImportPath);

        for (const name in program.scope.bindings) {
          program.scope.rename(name, program.scope.generateUid(name));
        }

        const replacedMember = 'vendorComponentConfig_';

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

        // TODO(alanorozco): sourcemaps
        program.unshiftContainer('body', exporter.program.body);

        if (hoistedDecls.length > 0) {
          program.unshiftContainer(
            'body',
            t.variableDeclaration('const', hoistedDecls)
          );
        }

        program.traverse(inlinedClassVisitor, {
          className,
          replacedMember,
          propValues,
        });

        path.replaceWith(t.identifier(className));
      },
    },
  };
};
