import {iterateCursor} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {scopedQuerySelector} from '#core/dom/query';

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

    /** @private {?Element} */
    this.dialogEl_ = null;
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
    this.dialogEl_ = (
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
            <img class="publisher-logo"></img>
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

    this.applyAttributeAsText_('title', '.i-amphtml-story-subscriptions-title');
    this.applyAttributeAsText_(
      'publisher-button-text',
      '.i-amphtml-story-subscriptions-button-publisher .publisher-button-text'
    );
    this.applyAttributeAsText_(
      'banner-text',
      '.i-amphtml-story-subscriptions-banner'
    );
    this.applyAttributeAsText_(
      'subtitle-first',
      '.i-amphtml-story-subscriptions-subtitle-first'
    );
    this.applyAttributeAsText_(
      'subtitle-second',
      '.i-amphtml-story-subscriptions-subtitle-second'
    );
    const logoImg = dev().assertElement(this.dialogEl_.querySelector('img'));
    logoImg.setAttribute(
      'src',
      this.element.getAttribute('publisher-logo-url')
    );

    this.element.appendChild(this.dialogEl_);

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
   * @param {string} attr
   * @param {string} selector
   * @private
   */
  applyAttributeAsText_(attr, selector) {
    const attrValue = this.element.getAttribute(attr);
    if (!attrValue) {
      return;
    }

    const el = dev().assertElement(
      scopedQuerySelector(this.dialogEl_, selector)
    );
    el.textContent = attrValue;
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
