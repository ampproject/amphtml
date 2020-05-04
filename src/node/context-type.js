
import {devAssert} from '../log';

const KEY_PROP = '__ampKey';

/**
 * @typedef {!Object|string}
 */
export let ContextTypeDef;

/**
 * @param {!ContextTypeDef} contextType
 * @return {string}
 */
export function toKey(contextType) {
  return devAssert(typeof contextType == 'string' ? contextType : contextType[KEY_PROP]);
}

/**
 * @param {!ContextTypeDef} contextType
 * @param {string} key
 * @return {!ContextTypeDef}
 */
export function setKey(contextType, key) {
  devAssert(typeof contextType != 'string');
  devAssert(!contextType[KEY_PROP] || contextType[KEY_PROP] == key);
  contextType[KEY_PROP] = key;
  return contextType;
}
