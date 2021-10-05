import {CSS} from '../../../build/amp-story-shopping-0.1.css';

const TAG = 'amp-story-shopping';

export class AmpStoryShopping extends AMP.BaseElement {
  /** @override */
  constructor() {}

  /** @override */
  buildCallback() {}
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryShopping, CSS);
});
