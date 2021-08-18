

import {devAssert} from '#core/assert';

import {ContextPropDef} from './prop.type';

const EMPTY_DEPS = [];

/**
 * Creates the `ContextPropDef` type.
 *
 * @param {string} key
 * @param {{
 *   type: (!Object|undefined),
 *   deps: (!Array<!ContextPropDef<DEP>>|undefined),
 *   recursive: (boolean|(function(!Array<T>):boolean)|undefined),
 *   compute: (function(!Node, !Array<T>, ...DEP):(T|undefined)),
 *   defaultValue: (T|undefined),
 * }=} opt_spec
 * @return {!ContextPropDef<T, DEP>}
 * @template T
 * @template DEP
 */
export function contextProp(key, opt_spec) {
  const prop = /** @type {!ContextPropDef<T, DEP>} */ ({
    key,
    // Default values.
    type: null,
    deps: EMPTY_DEPS,
    recursive: false,
    compute: null,
    defaultValue: undefined,
    // Overrides.
    ...opt_spec,
  });
  devAssert(prop.deps.length == 0 || prop.compute);
  return prop;
}
