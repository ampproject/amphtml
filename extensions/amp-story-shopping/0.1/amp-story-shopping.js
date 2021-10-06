import {Layout} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

import {CSS} from '../../../build/amp-story-shopping-0.1.css';

const TAG = 'amp-story-shopping';

export class AmpStoryShopping extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    this.container_ = htmlFor(this.element)`
    <div>
      <button type="button" role="button" style="background: #fff;">
        Pause
      </button>
    </div>
  `;

    this.element.appendChild(this.container_);
  }

  /** @override */
  layoutCallback() {}

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryShopping, CSS);
});
