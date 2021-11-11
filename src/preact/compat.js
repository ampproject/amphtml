/**
 * todo(kvchari): replace with official solution from preact
 * copying forwardRef implementation from https://gist.github.com/developit/974b5e4e582df8e954c5a7981603cd37
 * preact contains a bug where importing forwardRef imports a lot of extraneous code due to side-effects.
 * see issue for more information https://github.com/preactjs/preact/issues/3295
 */
import {options} from /*OK*/ 'preact';

options.__b = function (o, v) {
  if (v.type && v.type._f && (v.props.ref = v.ref)) {
    v.ref = null;
  }
  o && o(v);
}.bind(0, options.__b);
/**
 * @param {function(T, {current: (R|null)}):PreactDef.Renderable} fn
 * @return {function(T):PreactDef.Renderable}
 * @template T, R
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
