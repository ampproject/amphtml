// Taken from handwritten artisinal shim: https://gist.github.com/developit/974b5e4e582df8e954c5a7981603cd37

import {options} from /*OK*/ 'preact';

options.__b = function (o, v) {
  if (v.type && v.type._f && (v.props.ref = v.ref)) {
    v.ref = null;
  }
  o && o(v);
}.bind(0, options.__b);

/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {*} fn
 * @return {*}
 */
export function forwardRef(fn) {
  /**
   * @param {*} p
   * @return {*}
   */
  function F(p) {
    const {ref} = p;
    delete p.ref;
    return fn(p, ref);
  }
  return (F._f = F);
}
