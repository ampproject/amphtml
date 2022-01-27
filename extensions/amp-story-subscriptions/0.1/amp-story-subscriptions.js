import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';

const TAG = 'amp-story-subscriptions';

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    // Create a paywall dialog element that have required attributes to be able to be
    // rendered by amp-subscriptions.
    // TODO(#37285): complete the rest of paywall dialog UI based on the publisher-provided attributes.
    const dialogEl = (
      <div subscriptions-dialog subscriptions-display="NOT granted"></div>
    );
    this.element.appendChild(dialogEl);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
