import {getChildJsonConfig} from '#core/dom';
import {hasOwn} from '#core/types/object';

import {user, userAssert} from '#utils/log';

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
  userAssert(
    config['output'],
    'amp-link-rewriter: output config property is required'
  );

  return {
    output: config['output'].toString(),
    section: hasOwn(config, 'section') ? config['section'] : [],

    attribute: hasOwn(config, 'attribute')
      ? parseAttribute(config['attribute'])
      : {},

    vars: hasOwn(config, 'vars') ? config['vars'] : {},
    scopeDocument: config['scopeDocument'] ?? true,
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
 * @return {object}
 */
function parseAttribute(attribute) {
  const newAttr = {};

  Object.keys(attribute).forEach((key) => {
    newAttr[key] = '^' + attribute[key] + '$';
  });

  return newAttr;
}
