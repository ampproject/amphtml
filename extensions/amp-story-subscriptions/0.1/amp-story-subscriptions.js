import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  StateProperty,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-subscriptions';

/**
 * The attribute name from <amp-subscriptions> to mark an AmpStoryPage is paywall protected or not.
 * @const {string}
 */
export const SUBSCRIPTIONS_SECTION_ATTRIBUTE_NAME = 'subscriptions-section';

/**
 * These strings are used by <amp-subscriptions> to determine the content is locked behind the paywall or not.
 * @const @enum {string}
 */
export const SubscriptionsSection = {
  CONTENT: 'content', // For pages that are entirely locked behind the paywall.
  LIMITED_CONTENT: 'limited-content', // For the only page where the paywall would be triggered and the content is hidden quickly.
};

/**
 * The index of the limited-content page, which is the page where the paywall would be triggered.
 * @const {number}
 */
export const FIRST_PAYWALL_STORY_PAGE_INDEX = 2;

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    // Mark pages with required attributes to be treated as paywall protected pages.
    Array.prototype.map.call(
      this.element.querySelectorAll('amp-story-page'),
      (pageEl, index) => {
        if (index == FIRST_PAYWALL_STORY_PAGE_INDEX) {
          pageEl
            .getImpl()
            .then((page) =>
              page.setSubscriptionsSection(SubscriptionsSection.LIMITED_CONTENT)
            );
        } else if (index > FIRST_PAYWALL_STORY_PAGE_INDEX) {
          pageEl
            .getImpl()
            .then((page) =>
              page.setSubscriptionsSection(SubscriptionsSection.CONTENT)
            );
        }
      }
    );

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
