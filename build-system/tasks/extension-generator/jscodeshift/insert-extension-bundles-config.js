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

  function getObjectExpressionProperty(properties, keyIdentifierName) {
    return properties.find(({key}) => key.name === keyIdentifierName);
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
      let insertionIndexProperty;
      let insertionIndex = -1;
      let existingIndex = -1;

      // find lexicographic position
      do {
        const {properties} = elements[++insertionIndex] || {};
        insertionIndexProperty =
          properties && getObjectExpressionProperty(properties, 'name');
        if (
          insertionIndexProperty &&
          insertionIndexProperty.value.value === name
        ) {
          existingIndex = insertionIndex;
        }
      } while (
        insertionIndex < elements.length &&
        name.localeCompare(insertionIndexProperty.value.value) >= 0
      );

      const existingPropertyLatestVersion =
        existingIndex > -1 &&
        getObjectExpressionProperty(
          elements[existingIndex].properties,
          'latestVersion'
        );

      const existingPropertyType =
        existingIndex > -1 &&
        getObjectExpressionProperty(elements[existingIndex].properties, 'type');

      const resolvedLatestVersion =
        latestVersion ||
        (existingPropertyLatestVersion &&
          existingPropertyLatestVersion.value.value) ||
        version;

      const inserted = [
        ['name', name],
        ['version', version],
        ['latestVersion', resolvedLatestVersion],
        [
          'type',
          // TYPES.MISC or type of existing extension with given name
          (existingPropertyType && existingPropertyType.value) ||
            j.memberExpression(j.identifier('TYPES'), j.identifier('MISC')),
        ],
      ];
      elements.splice(
        insertionIndex,
        0,
        j.objectExpression(
          inserted.map(([key, value]) =>
            j.objectProperty(
              j.identifier(key),
              typeof value === 'string' ? j.stringLiteral(value) : value
            )
          )
        )
      );
      // sorting may have been manually messed up previously
      elements.sort((a, b) => {
        const aNameProperty = getObjectExpressionProperty(a.properties, 'name');
        const bNameProperty = getObjectExpressionProperty(b.properties, 'name');
        if (!aNameProperty) {
          return 1;
        }
        if (!bNameProperty) {
          return -1;
        }
        return aNameProperty.value.value.localeCompare(
          bNameProperty.value.value
        );
      });
    })
    .toSource();
}
