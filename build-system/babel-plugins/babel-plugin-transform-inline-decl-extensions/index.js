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

const rootRelativeResolve = filename => require.resolve(`../../../${filename}`);

const toUpperCase = (_match, character) => character.toUpperCase();
const dashToCamelCase = name => name.replace(/-([a-z])/g, toUpperCase);
const capitalize = name => name.replace(/^([a-z])/g, toUpperCase);

module.exports = function({types: t}) {
  const exporterConfigInlineVisitor = {
    MemberExpression({node, parent, parentPath}, {configPropsByKey}) {
      if (
        !t.isThisExpression(node.object) ||
        !t.isIdentifier(node.property, {name: 'vendorComponentConfig'}) ||
        !t.isMemberExpression(parent)
      ) {
        // TODO(alanorozco): Remove leftover initializer when at left part of
        // assignment ancestor.
        return;
      }

      const key = parent.property.name;

      // Default to `null` to let minifier collapse recursively.
      const value = configPropsByKey[key]
        ? t.cloneNode(configPropsByKey[key])
        : t.nullLiteral();

      parentPath.replaceWith(
        // This depends on minifying inline access to `{key: value}.key` prop
        // slices into `value`. Chained access gets a bloated slice object but
        // its accessor is still correctly minified into its deeply nested value.
        t.memberExpression(
          t.objectExpression([t.objectProperty(t.identifier(key), value)]),
          t.identifier(key)
        )
      );
    },
  };

  const exporterDefaultVisitor = {
    ExportDefaultDeclaration(path, {componentAlias, configPropsByKey}) {
      if (!t.isClassDeclaration(path.node.declaration)) {
        return;
      }

      path
        .get('declaration')
        .traverse(exporterConfigInlineVisitor, {configPropsByKey});

      path.node.declaration.id = t.identifier(componentAlias);
      path.replaceWith(path.node.declaration);
    },
  };

  return {
    name: 'transform-inline-decl-extensions',
    visitor: {
      CallExpression(path, {file, opts}) {
        if (!t.isIdentifier(path.node.callee, {name: opts.ctor})) {
          return;
        }

        const program = path.findParent(p => t.isProgram(p));

        for (const name of Object.keys(program.scope.bindings)) {
          program.scope.rename(name, `__${name}`);
        }

        const componentAlias = capitalize(
          dashToCamelCase(fsPath.basename(file.opts.filename, '.js'))
        );

        const exporterFilename = rootRelativeResolve(
          opts.exportedDefaultClassFrom
        );

        const importPath = fsPath.relative(
          fsPath.dirname(file.opts.filename),
          fsPath.dirname(exporterFilename)
        );

        const exporter = parse(fs.readFileSync(exporterFilename).toString(), {
          sourceFilename: exporterFilename,
          sourceType: 'module',
        });

        for (const node of exporter.program.body) {
          if (t.isImportDeclaration(node)) {
            node.source = t.StringLiteral(
              fsPath.join(importPath, node.source.value)
            );
          }
        }

        for (let i = 0; i < exporter.comments.length; i++) {
          const comment = exporter.comments[i];
          if (comment.type !== 'CommentBlock') {
            continue;
          }
          comment.value = comment.value.replace(
            /\.+\/[\/\.a-z0-9_-]+/gi,
            relative => fsPath.join(importPath, relative)
          );
        }

        // TODO(alanorozco): This breaks sourcemaps.
        program.unshiftContainer('body', exporter.program.body);
        const [configNode] = path.node.arguments;
        const configPropsByKey = {};

        if (t.isObjectExpression(configNode)) {
          for (const {key, value} of configNode.properties) {
            configPropsByKey[key.name] = value;
          }
        }

        program.traverse(exporterDefaultVisitor, {
          componentAlias,
          configPropsByKey,
        });

        path.replaceWith(t.identifier(componentAlias));
      },
    },
  };
};
