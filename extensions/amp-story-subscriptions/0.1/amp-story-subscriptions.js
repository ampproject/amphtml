import {iterateCursor} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-subscriptions';

/**
 * The attribute name used in amp-subscriptions to indicate the content is locked or not.
 * @const {string}
 */
const SUBSCRIPTIONS_SECTION = 'subscriptions-section';

/**
 * The index of the limited-content page, which is the page where the paywall would be triggered.
 * @const {number}
 */
const FIRST_PAYWALL_STORY_PAGE_INDEX = 2;

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    // Mark pages with required attributes to be treated as paywall protected pages.
    // 'limited-content' is for the paywall dialog page, where a paywall would trigger based on both time advance or click events.
    // 'content' is for all the remaining locked pages.
    iterateCursor(
      document.querySelectorAll('amp-story-page'),
      (pageEl, index) => {
        if (index == FIRST_PAYWALL_STORY_PAGE_INDEX) {
          pageEl.setAttribute(SUBSCRIPTIONS_SECTION, 'limited-content');
        } else if (index > FIRST_PAYWALL_STORY_PAGE_INDEX) {
          pageEl.setAttribute(SUBSCRIPTIONS_SECTION, 'content');
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

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;
        this.initializeListeners_();
      }
    );
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
      StateProperty.SUBSCRIPTIONS_DIALOG_STATE,
      (isDialogVisible) => this.onSubscriptionStateChange_(isDialogVisible)
    );
  }

  /**
   * @param {boolean} isDialogVisible
   * @private
   */
  onSubscriptionStateChange_(isDialogVisible) {
    this.mutateElement(() =>
      this.element.classList.toggle(
        'i-amphtml-story-subscriptions-visible',
        isDialogVisible
      )
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
