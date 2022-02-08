import {iterateCursor} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {dev} from '#utils/log';

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
      this.element.parentElement.getElementsByTagName('amp-story-page'),
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
    const dialogEl = (
      <div subscriptions-dialog subscriptions-display="NOT granted">
        <div class="i-amphtml-story-subscriptions-banner"></div>
        <div class="i-amphtml-story-subscriptions-title"></div>
        <div class="i-amphtml-story-subscriptions-subtitle-first"></div>
        <div class="i-amphtml-story-subscriptions-subtitle-second"></div>
        <div class="i-ampthml-story-subscriptions-button-container">
          <div
            class="i-ampthml-story-subscriptions-button-google"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
            subscriptions-service="subscribe.google.com"
            subscriptions-decorate
          >
            Subscribe
          </div>
          <div
            class="i-amphtml-story-subscriptions-button-publisher"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
          >
            <div class="publisher-button-text"></div>
            <img style="width: 27px; height: 27px;"></img>
          </div>
        </div>
        <div class="i-amphtml-story-subscriptions-signin">
          Already a subscriber?
          <a
            subscriptions-action="login"
            subscriptions-display="NOT granted"
            style="text-decoration: underline; font-weight: bold;"
          >
            Sign in
          </a>
        </div>
      </div>
    );

    const titleEl = dev().assertElement(
      dialogEl.querySelector('.i-amphtml-story-subscriptions-title')
    );
    titleEl.textContent = this.element.getAttribute('title');

    const logoImg = dev().assertElement(dialogEl.querySelector('img'));
    logoImg.setAttribute(
      'src',
      this.element.getAttribute('publisher-logo-url')
    );

    const buttonTextEl = dev().assertElement(
      dialogEl.querySelector('.publisher-button-text')
    );
    buttonTextEl.textContent = this.element.getAttribute(
      'publisher-button-text'
    );

    if (this.element.hasAttribute('banner-text')) {
      const bannerEl = dev().assertElement(
        dialogEl.querySelector('.i-amphtml-story-subscriptions-banner')
      );
      bannerEl.textContent = this.element.getAttribute('banner-text');
    }

    if (this.element.hasAttribute('subtitle-first')) {
      const subtitleFirstEl = dev().assertElement(
        dialogEl.querySelector('.i-amphtml-story-subscriptions-subtitle-first')
      );
      subtitleFirstEl.textContent = this.element.getAttribute('subtitle-first');
    }

    if (this.element.hasAttribute('subtitle-second')) {
      const subtitleSecondEl = dev().assertElement(
        dialogEl.querySelector('.i-amphtml-story-subscriptions-subtitle-second')
      );
      subtitleSecondEl.textContent =
        this.element.getAttribute('subtitle-second');
    }

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
