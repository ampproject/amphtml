

import {isElement} from '#core/types';

export function dev() {
  return {
    assertElement: element => {
      console.assert(isElement(element), 'Element expected');
      return element;
    },
  };
}

export function user() {
  return {
    error: (unusedTag, var_args) => {
      console.error.apply(null, Array.prototype.slice.call(arguments, 1));
    },
  };
}

export function devAssert() {}

export function userAssert() {}

export const urls = {};
