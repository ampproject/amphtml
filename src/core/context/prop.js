import {devAssert} from '#core/assert';

/**
 * @template T, DEP
 * @typedef {import('./types.d').IContextProp<T, DEP>} IContextProp
 */

/** @type {IContextProp<*, *>[]} */
const EMPTY_DEPS = [];

/**
 * Creates the `IContextProp` type.
 *
 * @param {string} key
 * @param {{
 *   type?: Object,
 *   deps?: IContextProp<DEP, *>[],
 *   recursive?: boolean | (function(T[]):boolean),
 *   compute?: function(Node, T[], ...T):(T | undefined),
 *   defaultValue?: T,
 * }} opt_spec
 * @return {IContextProp<T, DEP>}
 * @template T, DEP
 */
export function contextProp(key, opt_spec) {
  const prop = /** @type {IContextProp<T, DEP>} */ ({
    key,
    // Default values.
    deps: EMPTY_DEPS,
    recursive: false,
    // Overrides.
    ...opt_spec,
  });
  devAssert(prop.deps.length == 0 || prop.compute);
  return prop;
}
