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
module.exports = function (file, api, options) {
  const j = api.jscodeshift;

  const {experimentId} = options;

  return j(file.source)
    .find(j.ObjectExpression, (node) =>
      node.properties.some(
        ({key, value}) => key.name === 'id' && value.value === experimentId
      )
    )
    .forEach((path) => {
      const serializable = {};
      path.value.properties.forEach(({key, value}) => {
        // Only keep literal properties.
        if ('name' in key && 'value' in value) {
          serializable[key.name] = value.value;
        }
      });
      api.report(JSON.stringify(serializable));
    })
    .remove()
    .toSource();
};
