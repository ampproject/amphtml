/**
 * todo(kvchari): replace with official solution from preact
 * copying forwardRef implementation from https://gist.github.com/developit/974b5e4e582df8e954c5a7981603cd37
 * preact contains a bug where importing forwardRef imports a lot of extraneous code due to side-effects.
 * see issue for more information https://github.com/preactjs/preact/issues/3295
 */
import {options} from /*OK*/ 'preact';

/* eslint-disable */
function e(n,t){for(var e in t)n[e]=t[e];return n}
var i=options.__b;
options.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),i&&i(n)};
export const REACT_FORWARD_SYMBOL="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.forward_ref")||3911;
export function forwardRef(n){function t(t,r){var o=e({},t);return delete o.ref,n(o,(r=t.ref||r)&&("object"!=typeof r||"current"in r)?r:null)}return t.$$typeof=REACT_FORWARD_SYMBOL,t.render=t,t.prototype.isReactComponent=t.__f=!0,t.displayName="ForwardRef("+(n.displayName||n.name)+")",t}
/* eslint-enable */
