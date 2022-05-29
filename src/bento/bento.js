/**
 * @fileoverview
 * Entry point for `bento.js`
 */

import {isEsm} from '#core/mode';

import {install as installCustomElements} from '#polyfills/custom-elements';

if (!isEsm()) {
  installCustomElements(self, class {});
}

export * from '#core/context';
export * from '#preact';
export * from '#preact/base-element';
export * from '#preact/bento-ce';
export * from '#preact/compat';
export * from '#preact/component';
export * from '#preact/context';
export * from '#preact/slot';
