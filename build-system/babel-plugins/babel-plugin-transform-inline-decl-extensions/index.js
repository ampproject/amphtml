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
const {basename} = require('path');
const {parse} = require('@babel/parser');

const toUpperCase = (_, c) => c.toUpperCase();
const dashToCamelCase = name => name.replace(/-([a-z])/g, toUpperCase);
const capitalize = name => name.replace(/^([a-z])/g, toUpperCase);

const classAliasFromFilename = filename =>
  capitalize(dashToCamelCase(basename(filename).replace(/\.js$/, '')));

const rootRelative = name => require.resolve(`../../../${name}`);

module.exports = function({types: t}) {
  function cloneDefaultClass(file, alias) {
    const code = fs.readFileSync(file).toString();
    const {program} = parse(code, {sourceType: 'module'});

    let baseClass;
    let insideExportDefault = false;

    t.traverseFast(program, node => {
      if (baseClass) {
        return;
      }
      if (insideExportDefault && t.isClassDeclaration(node)) {
        baseClass = node;
      }
      if (t.isExportDefaultDeclaration(node)) {
        insideExportDefault = true;
      }
    });

    if (!baseClass) {
      throw new Error(`No default class exported from ${file}`);
    }

    const {name = `VendorComponent`} = baseClass.id || {};

    return t.classExpression(
      t.identifier(`${name}_${alias}`),
      t.cloneNode(baseClass.superClass),
      t.cloneNode(baseClass.body)
    );
  }

  return {
    name: 'transform-inline-decl-extensions',
    visitor: {
      CallExpression(path, {file, opts}) {
        if (
          !t.isIdentifier(path.node.callee, {name: opts.componentClassCtor})
        ) {
          return;
        }

        const componentClass = cloneDefaultClass(
          rootRelative(opts.baseClassFile),
          classAliasFromFilename(file.opts.filename)
        );

        const extensionCall = path.findParent(p => t.isProgram(p.parent));
        extensionCall.insertBefore(componentClass);

        const [componentConfig] = path.node.arguments;
        const componentConfigByKey = {};
        if (t.isObjectExpression(componentConfig)) {
          for (const {key, value} of componentConfig.properties) {
            componentConfigByKey[key.name] = value;
          }
        }

        // Inline static config into config property refs.
        extensionCall.parentPath.traverse({
          MemberExpression({node, parent, parentPath}) {
            if (
              !t.isIdentifier(node.property, {name: 'vendorComponentConfig'}) ||
              !t.isThisExpression(node.object) ||
              !t.isMemberExpression(parent)
            ) {
              return;
            }
            if (t.isAssignmentExpression(parentPath.parent, {left: parent})) {
              parentPath.parentPath.remove();
              return;
            }
            const knownValue = componentConfigByKey[parent.property.name];
            const usableValue = knownValue
              ? t.cloneNode(knownValue)
              : t.nullLiteral();
            parentPath.replaceWith(usableValue);
          },
        });

        path.replaceWith(t.identifier(componentClass.id.name));
      },
    },
  };
};
