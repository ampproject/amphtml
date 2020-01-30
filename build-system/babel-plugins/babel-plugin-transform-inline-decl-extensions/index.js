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
        node.source.value = fsPath.join(relImportPath, node.source.value);
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
          relative => fsPath.join(relImportPath, relative)
        );
      }
    }
  }

  const propValueOrNullLiteral = (obj, key) =>
    obj[key] ? t.cloneNode(obj[key]) : t.nullLiteral();

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
          propValueOrNullLiteral(configProps, parent.property.name)
        );
        return;
      }

      // Desctructuring (const {foo} = this.vendorComponentConfig)
      if (t.isVariableDeclarator(parent) && t.isObjectPattern(parent.id)) {
        const sliceProps = parent.id.properties.map(({key}) =>
          t.objectProperty(
            t.identifier(key.name),
            propValueOrNullLiteral(configProps, key.name)
          )
        );
        path.replaceWith(t.objectExpression(sliceProps));
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

      // Un-export
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

        // TODO(alanorozco): Infer from import rather than using options
        const exporterFilename = rootRelativeResolve(
          opts.exportedDefaultClassFrom
        );

        const relImportPath = fsPath.relative(
          fsPath.dirname(file.opts.filename),
          fsPath.dirname(exporterFilename)
        );

        const exporter = cloneExporter(exporterFilename, relImportPath);

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
