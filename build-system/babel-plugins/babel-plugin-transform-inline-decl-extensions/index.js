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
const fs = require('fs-extra');
const fsPath = require('path');
const {parse} = require('@babel/parser');

const toUpperCase = (_, c) => c.toUpperCase();
const dashToCamelCase = name => name.replace(/-([a-z])/g, toUpperCase);
const capitalize = name => name.replace(/^([a-z])/g, toUpperCase);

const thisKeywordPropName = 'vendorComponentConfig';

module.exports = function({types: t}) {
  function aliasDefaultClass(file, name) {
    const {program} = parse(
      fs.readFileSync(require.resolve(file)).toString('utf-8'),
      {sourceType: 'module'}
    );

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

    const baseClassName = baseClass.id ? baseClass.id.name : null;

    return t.classExpression(
      t.identifier(baseClassName ? `${baseClassName}_${name}` : name),
      t.cloneNode(baseClass.superClass),
      t.cloneNode(baseClass.body)
    );
  }

  return {
    name: 'transform-inline-decl-extensions',
    visitor: {
      CallExpression(path, state) {
        if (
          !t.isIdentifier(path.node.callee, {
            name: state.opts.componentClassCtor,
          })
        ) {
          return;
        }

        const [componentConfigNode] = path.node.arguments;
        const tag = fsPath
          .basename(state.file.opts.filename)
          .replace(/\.js$/, '');

        const extensionBlock = path.findParent(p => t.isProgram(p.parent));

        const componentClass = aliasDefaultClass(
          // Relative to this file's root.
          `../../../${state.opts.baseClassFile}`,
          capitalize(dashToCamelCase(tag))
        );

        extensionBlock.insertBefore(componentClass);

        // Flatten `config` props into a key-value map.
        const componentConfig = {};
        if (t.isObjectExpression(componentConfigNode)) {
          for (const prop of componentConfigNode.properties) {
            componentConfig[prop.key.name] = t.cloneNode(prop.value);
          }
        }

        // Replace references to `this.vendorComponentConfig` props with their
        // static values from `config`.
        extensionBlock.parentPath.traverse({
          MemberExpression(path) {
            if (
              !t.isIdentifier(path.node.property, {name: thisKeywordPropName})
            ) {
              return;
            }
            if (!t.isThisExpression(path.node.object)) {
              return;
            }
            if (!t.isMemberExpression(path.parent)) {
              return;
            }
            // Remove assignment expressions where the property is the
            // asignee's identifier.
            if (
              t.isAssignmentExpression(path.parentPath.parent) &&
              path.parentPath.parent.left == path.parent
            ) {
              path.parentPath.parentPath.remove();
              return;
            }
            const {name} = path.parent.property;
            path.parentPath.replaceWith(
              componentConfig[name] !== undefined
                ? componentConfig[name]
                : t.nullLiteral()
            );
          },
        });

        path.replaceWith(t.identifier(componentClass.id.name));
      },
    },
  };
};
