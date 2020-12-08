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

  const {experimentId} = options;

  return j(file.source)
    .find(j.ObjectExpression)
    .filter(
      (path) =>
        j(path)
          .find(j.Property, {
            key: {type: 'Identifier', name: 'id'},
            value: {type: 'Literal', value: experimentId},
          })
          .size() !== 0
    )
    .remove()
    .toSource();
}
