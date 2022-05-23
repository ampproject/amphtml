/*
 * This file was copied from Preact's source code,
 * so we're going to disable TS/lint/codecov:
 */
/* istanbul ignore file */
/* eslint-disable */
// @ts-nocheck
import {createElement} from '#preact';

// Copied from preact/compat/src/utils.js:
/**
 * Check if two objects have a different shape
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
export function shallowDiffers(a, b) {
  for (const i in a) {
    if (i !== '__source' && !(i in b)) {
      return true;
    }
  }
  for (const i in b) {
    if (i !== '__source' && a[i] !== b[i]) {
      return true;
    }
  }
  return false;
}

// Copied from preact/compat/src/memo.js:
/**
 * Memoize a component, so that it only updates when the props actually have
 * changed. This was previously known as `React.pure`.
 * @param {import('../types').FC} c functional component
 * @param {(prev: object, next: object) => boolean} [comparer] Custom equality function
 * @return {import('../types').FC}
 */
export function memo(c, comparer) {
  function shouldUpdate(nextProps) {
    const {ref} = this.props;
    const updateRef = ref == nextProps.ref;
    if (!updateRef && ref) {
      ref.call ? ref(null) : (ref.current = null);
    }

    if (!comparer) {
      return shallowDiffers(this.props, nextProps);
    }

    return !comparer(this.props, nextProps) || !updateRef;
  }

  function Memoed(props) {
    this.shouldComponentUpdate = shouldUpdate;
    return createElement(c, props);
  }
  Memoed.displayName = 'Memo(' + (c.displayName || c.name) + ')';
  Memoed.prototype.isReactComponent = true;
  Memoed._forwarded = true;
  // @ts-ignore
  return Memoed;
}
