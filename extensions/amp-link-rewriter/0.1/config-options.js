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
import {getChildJsonConfig} from '../../../src/json';
import {hasOwn} from '../../../src/utils/object';
import {
  user,
  userAssert,
} from '../../../src/log';

/**
 * @typedef {{output: string, section:Array, attribute:Object, vars:Object}}
 */
let ConfigOptsDef;

/**
 * @param {!AmpElement} element
 * @return {!ConfigOptsDef}
 */
export function getConfigOpts(element) {

  const config = getConfigJson(element);
  userAssert(config['output'],
      'amp-link-rewriter: output config property is required');

  return {
    output: config['output'].toString(),
    section: hasOwn(config, 'section') ? config['section'] : [],

    attribute: hasOwn(config, 'attribute') ?
      parseAttribute(config['attribute']) :
      {},

    vars: hasOwn(config, 'vars') ? config['vars'] : {},
  };
}

/**
 * @param {!AmpElement} element
 * @return {JsonObject}
 */
function getConfigJson(element) {
  const TAG = 'amp-link-rewriter';

  try {
    return getChildJsonConfig(element);
  } catch (e) {
    throw user(element).createError('%s: %s', TAG, e);
  }
}

/**
 * @param {!Object} attribute
 * return {Object}
 */
function parseAttribute(attribute) {
  const newAttr = {};

  Object.keys(attribute).forEach(key => {
    newAttr[key] = '^' + attribute[key] + '$';
  });

  return newAttr;
}
