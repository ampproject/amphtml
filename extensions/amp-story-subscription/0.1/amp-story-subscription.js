import {CSS} from '../../../build/amp-story-subscription-0.1.css';
import {Layout_Enum} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

const TAG = 'amp-story-subscription';

// Create a paywall dialog element that have required attributes to be able to be
// rendered by amp-subscriptions.
// TODO: complete the rest of paywall dialog UI based on the publisher-provided attributes.
const getPaywallDialogTemplate = (element) => {
  return htmlFor(element)`
  <div subscriptions-dialog subscriptions-display="NOT granted"></div>`;
};

export class AmpStorySubscription extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    const dialogEl = getPaywallDialogTemplate(this.element);
    this.element.appendChild(dialogEl);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscription, CSS);
});
