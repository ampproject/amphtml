import {iterateCursor} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

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

/** @const {!Array<!Object>} fontFaces */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '500',
    src: "url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '600',
    src: "url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?Element} */
    this.dialogEl_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?../../../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
    this.subscriptionsService_ = null;
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

    this.loadFonts_();

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.localizationServiceForOrNull(this.element),
      Services.subscriptionsServiceForDoc(this.element),
    ]).then(([storeService, localizationService, subscriptionService]) => {
      this.storeService_ = storeService;
      this.localizationService_ = localizationService;

      this.subscriptionsService_ = subscriptionService;
      this.subscriptionsService_
        .getGrantStatus()
        .then((granted) =>
          this.storeService_.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_GRANTED,
            granted
          )
        );

      // Create a paywall dialog element that have required attributes to be able to be
      // rendered by amp-subscriptions.
      this.dialogEl_ = this.renderSubscriptionsDialogTemplate_();
      this.element.appendChild(this.dialogEl_);

      this.initializeListeners_();
    });
  }

  /**
   * @return {!Element}
   * @private
   */
  renderSubscriptionsDialogTemplate_() {
    return (
      <div subscriptions-dialog subscriptions-display="NOT granted">
        <div class="i-amphtml-story-subscriptions-banner">
          {this.element.getAttribute('banner-text')}
        </div>
        <div class="i-amphtml-story-subscriptions-title">
          {this.element.getAttribute('title')}
        </div>
        <div class="i-amphtml-story-subscriptions-subtitle-first">
          {this.element.getAttribute('subtitle-first')}
        </div>
        <div class="i-amphtml-story-subscriptions-subtitle-second">
          {this.element.getAttribute('subtitle-second')}
        </div>
        <div class="i-ampthml-story-subscriptions-button-container">
          <div
            class="i-ampthml-story-subscriptions-button-google"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
            subscriptions-service="subscribe.google.com"
            subscriptions-decorate
          ></div>
          <div
            class="i-amphtml-story-subscriptions-button-publisher"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
          >
            <div class="i-amphtml-story-subscriptions-publisher-button-text">
              {this.element.getAttribute('publisher-button-text')}
            </div>
            <img
              class="i-amphtml-story-subscriptions-publisher-logo"
              data-src={this.element.getAttribute('publisher-logo-url')}
            ></img>
          </div>
        </div>
        <div class="i-amphtml-story-subscriptions-signin">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SUBSCRIBER_QUESTION
          )}
          &nbsp;
          <a subscriptions-action="login" subscriptions-display="NOT granted">
            {this.localizationService_.getLocalizedString(
              LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SIGN_IN
            )}
          </a>
        </div>
      </div>
    );
  }

  /** @override */
  layoutCallback() {
    const publisherLogoEl = dev().assertElement(
      this.element.querySelector(
        '.i-amphtml-story-subscriptions-publisher-logo'
      )
    );
    publisherLogoEl.setAttribute(
      'src',
      publisherLogoEl.getAttribute('data-src')
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
      (isDialogVisible) => this.onSubscriptionsStateChange_(isDialogVisible)
    );
  }

  /**
   * @param {boolean} isDialogVisible
   * @private
   */
  onSubscriptionsStateChange_(isDialogVisible) {
    this.mutateElement(() =>
      this.element.classList.toggle(
        'i-amphtml-story-subscriptions-visible',
        isDialogVisible
      )
    );

    if (isDialogVisible) {
      this.subscriptionsService_.selectAndActivatePlatform();
      this.subscriptionsService_.addOnEntitlementResolvedCallback((e) => {
        const {entitlement} = e;
        if (
          this.storeService_.get(StateProperty.SUBSCRIPTIONS_DIALOG_STATE) &&
          entitlement.granted
        ) {
          this.storeService_.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_GRANTED,
            true
          );
          this.storeService_.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_DIALOG,
            false
          );
        }
      });
    }
  }

  /** @private */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      fontsToLoad.forEach(({family, src, style = 'normal', weight}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
    }
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
