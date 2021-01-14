/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const arrayAssignmentIdName = 'extensionBundles';

/**
 * @param {*} file
 * @param {*} api
 * @param {*} options
 * @return {*}
 */
export default function transform(file, api, options) {
  const j = api.jscodeshift;

  const {insertExtensionBundle} = options;

  if (!insertExtensionBundle) {
    throw new Error('No insertExtensionBundle option');
  }

  const {name, version, latestVersion} = insertExtensionBundle;

  function getObjectExpressionProperty(nodeOrNull, keyIdentifierName) {
    return (
      nodeOrNull &&
      nodeOrNull.properties &&
      nodeOrNull.properties.find(({key}) => key.name === keyIdentifierName)
        .value
    );
  }

  return j(file.source)
    .find(
      j.ArrayExpression,
      (node) =>
        !node.elements.length ||
        node.elements.every(({type}) => type == j.ObjectExpression)
    )
    .filter(
      ({parentPath}) =>
        parentPath.value.type == j.VariableDeclarator &&
        parentPath.value.id.name === arrayAssignmentIdName
    )
    .forEach((path) => {
      const {elements} = path.value;

      const existingOrNull = elements.find(
        (node) =>
          getObjectExpressionProperty(node, 'name').value ===
          insertExtensionBundle.name
      );

      const inserted = {
        name,
        version,
        latestVersion:
          getObjectExpressionProperty(existingOrNull, 'latestVersion') ||
          latestVersion ||
          version,
        type:
          getObjectExpressionProperty(existingOrNull, 'type') ||
          j.memberExpression(j.identifier('TYPES'), j.identifier('MISC')),
      };

      elements.push(
        j.objectExpression(
          Object.keys(inserted).map((key) => {
            const value = inserted[key];
            return j.objectProperty(
              j.identifier(key),
              typeof value === 'string' ? j.stringLiteral(value) : value
            );
          })
        )
      );

      path.value.elements = elements.sort((a, b) => {
        const aNameProperty = getObjectExpressionProperty(a, 'name');
        const bNameProperty = getObjectExpressionProperty(b, 'name');
        if (!aNameProperty) {
          return 1;
        }
        if (!bNameProperty) {
          return -1;
        }
        return aNameProperty.value.localeCompare(bNameProperty.value);
      });
    })
    .toSource();
}
