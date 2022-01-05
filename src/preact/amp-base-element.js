import {PreactBaseElement} from './base-element';

export class AmpPreactBaseElement extends PreactBaseElement {}

/**
 *
 * @param {*} X
 * @param {*} Y
 * @return {*}
 */
export function setSuperClass(X, Y) {
  Object.setPrototypeOf(X, Y);
  Object.setPrototypeOf(X.prototype, Y.prototype);
  return X;
}
