/**
 * @fileoverview
 * Entry point for `bento.js`
 */

import {install as installCustomElements} from './polyfills/custom-elements';

installCustomElements(self);

const BENTO = self.BENTO || [];

BENTO.push = (fn) => {
  fn();
};

// eslint-disable-next-line local/window-property-name
self.BENTO = BENTO;

for (let i = 0; i < BENTO.length; i++) {
  BENTO.push(BENTO[i]);
}
