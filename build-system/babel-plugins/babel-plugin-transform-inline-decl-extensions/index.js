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

const parsed = {};

module.exports = function({types: t}) {
  function cachedParse(sourceFilename) {
    if (parsed[sourceFilename]) {
      return parsed[sourceFilename];
    }

    const ast = parse(fs.readFileSync(sourceFilename).toString(), {
      sourceFilename,
      sourceType: 'module',
    });

    return (parsed[sourceFilename] = ast);
  }

  const exporterConfigInlineVisitor = {
    MemberExpression({node, parent, parentPath}, {configPropsByKey}) {
      if (
        !t.isThisExpression(node.object) ||
        !t.isIdentifier(node.property, {name: 'vendorComponentConfig'})
      ) {
        return;
      }

      if (t.isAssignmentExpression(parent, {left: node})) {
        // TODO(alanorozco): Lint to restrict recursive property assignment.
        parentPath.remove();
        return;
      }

      if (!t.isMemberExpression(parent)) {
        return;
      }

      const key = parent.property.name;

      // Default unset members to `null` to let minifier collapse recursively.
      const value = configPropsByKey[key]
        ? t.cloneNode(configPropsByKey[key])
        : t.nullLiteral();

      // Access of recursive members (`this.prop.foo`) inlined one level
      // deep, this depends on minifier to inline from `{foo: 'bar'}.foo` into
      // 'bar'.
      parentPath.replaceWith(
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

        const relativeImportPath = fsPath.relative(
          fsPath.dirname(file.opts.filename),
          fsPath.dirname(exporterFilename)
        );

        const exporter = t.cloneNode(cachedParse(exporterFilename));

        for (const node of exporter.program.body) {
          if (t.isImportDeclaration(node)) {
            node.source = t.StringLiteral(
              fsPath.join(relativeImportPath, node.source.value)
            );
          }
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
