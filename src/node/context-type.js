
import {devAssert} from '../log';

const KEY_PROP = '__ampKey';

/**
 * @typedef {!Object|string}
 * @template <T>
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
  // QQQQ: remove?
  devAssert(typeof contextType != 'string');
  devAssert(!contextType[KEY_PROP] || contextType[KEY_PROP] == key);
  contextType[KEY_PROP] = key;
  return contextType;
}

/**
 * @param {string} name
 * @param {!ContextTypeDef<T>|!Object|function()} type
 * @param {!ContextTypeDef} opt_custom
 * @return {!ContextTypeDef<T>}
 * @template T
 */
export function contextType(name, type, opt_custom) {
  const theType = /** @type {!ContextTypeDef<T>} */ (type);
  theType.name = name;
  Object.assign(theType, opt_custom);
  return theType;
}
