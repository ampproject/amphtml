/**
 * @fileoverview
 * Entry point for `bento.js`
 */

import {isEsm} from '#core/mode';

import {install as installCustomElements} from './polyfills/custom-elements';

if (!isEsm()) {
  installCustomElements(self, class {});
}

const waiting = self.BENTO || [];
const push = (fn) => fn();

// eslint-disable-next-line local/window-property-name
self.BENTO = {push};

for (let i = 0; i < waiting.length; i++) {
  push(waiting[i]);
}
