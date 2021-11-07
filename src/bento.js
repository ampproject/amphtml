/**
 * @fileoverview
 * Entry point for `bento.js`
 */

import {isEsm} from '#core/mode';

import {install as installCustomElements} from './polyfills/custom-elements';

if (!isEsm()) {
  installCustomElements(self);
}

const BENTO = self.BENTO || [];

BENTO.push = (fn) => {
  fn();
};

// eslint-disable-next-line local/window-property-name
self.BENTO = BENTO;

for (let i = 0; i < BENTO.length; i++) {
  BENTO.push(BENTO[i]);
}
