/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {readJsonSync, writeJsonSync} from 'fs-extra';
import json5 from 'json5';

/**
 * Removes an entry from files like tools/experiments/experiments-config.js,
 * whose id property is specified by --experimentId:
 *
 *    [
 *      {
 *        ...
 *      },
 *   -  {
 *   -    id: 'foo',
 *   -    name: 'Foo.',
 *   -    spec: '...',
 *   -  },
 *      {
 *        ...
 *      }
 *    ]
 *
 * @param {*} file
 * @param {*} api
 * @param {*} options
 * @return {*}
 */
export default function transformer(file, api, options) {
  const j = api.jscodeshift;

  const {experimentId, experimentsRemovedJson} = options;

  return j(file.source)
    .find(j.ObjectExpression, (node) =>
      node.properties.some(
        ({key, value}) => key.name === 'id' && value.value === experimentId
      )
    )
    .forEach((path) => {
      if (experimentsRemovedJson) {
        const entry = json5.parse(
          j(
            j.objectExpression(
              // Only collect literal value properties so we can parse as JSON5
              path.value.properties.filter(
                ({value}) =>
                  value.type === 'Literal' ||
                  value.type === 'BooleanLiteral' ||
                  value.type === 'NumericLiteral' ||
                  value.type === 'StringLiteral'
              )
            )
          ).toSource()
        );
        writeJsonSync(experimentsRemovedJson, [
          ...(readJsonSync(experimentsRemovedJson, {throws: false}) || []),
          entry,
        ]);
      }
      path.prune();
    })
    .toSource();
}
