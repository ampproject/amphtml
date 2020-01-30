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
  const sliceProps = (obj, keys) =>
    t.objectExpression(
      keys.map(key =>
        t.objectProperty(
          t.identifier(key),
          // Default to null to let minifier collapse recursively.
          obj[key] ? t.cloneNode(obj[key]) : t.nullLiteral()
        )
      )
    );

  const exporterConfigInlineVisitor = {
    MemberExpression(path, {configProps}) {
      if (
        !t.isThisExpression(path.node.object) ||
        !t.isIdentifier(path.node.property, {name: 'vendorComponentConfig'})
      ) {
        return;
      }

      const {parent} = path;

      // Direct reference (this.vendorComponentConfig.foo)
      if (t.isMemberExpression(parent)) {
        path.parentPath.replaceWith(
          t.memberExpression(
            sliceProps(configProps, [parent.property.name]),
            t.identifier(parent.property.name)
          )
        );
        return;
      }

      // Desctructuring (const {foo} = this.vendorComponentConfig)
      if (t.isVariableDeclarator(parent) && t.isObjectPattern(parent.id)) {
        const props = parent.id.properties.map(({key}) => key.name);
        path.replaceWith(sliceProps(configProps, props));
      }
    },
  };

  const exporterDefaultVisitor = {
    ExportDefaultDeclaration(path, {componentAlias, configProps}) {
      if (!t.isClassDeclaration(path.node.declaration)) {
        return;
      }

      path
        .get('declaration')
        .traverse(exporterConfigInlineVisitor, {configProps});

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
        const configProps = {};

        if (t.isObjectExpression(configNode)) {
          for (const {key, value} of configNode.properties) {
            configProps[key.name] = value;
          }
        }

        program.traverse(exporterDefaultVisitor, {componentAlias, configProps});
        path.replaceWith(t.identifier(componentAlias));
      },
    },
  };
};
