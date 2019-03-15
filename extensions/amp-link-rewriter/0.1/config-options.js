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
import {userAssert} from '../../../src/log';

const errors = {
  REQUIRED_OUTPUT: 'output config property is required',
};

/**
 * @param {!AmpElement} element
 * @return {!{output: string, section:Array, attribute:Object, vars:Object}}
 */
export function getConfigOpts(element) {

  const config = getChildJsonConfig(element);
  enforceConfigOpt(config['output'], errors.REQUIRED_OUTPUT);

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
 * @param {*} condition
 * @param {string} message
 */
function enforceConfigOpt(condition, message) {
  userAssert(
      condition,
      `There is something wrong with your config: ${message}`
  );
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
