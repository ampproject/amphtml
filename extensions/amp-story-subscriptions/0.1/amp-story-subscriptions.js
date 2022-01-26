import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  StateProperty,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-subscriptions';

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
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

    this.initializeListeners_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTION_DIALOG_IS_VISIBLE_STATE,
      (isDialogVisible) => {
        this.onSubscriptionStateChange_(isDialogVisible);
      }
    );
  }

  /**
   * @param {boolean} isDialogVisible
   * @private
   */
  onSubscriptionStateChange_(isDialogVisible) {
    this.mutateElement(() => {
      this.element.classList.toggle(
        'i-amphtml-story-subscriptions-visible',
        isDialogVisible
      );
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
