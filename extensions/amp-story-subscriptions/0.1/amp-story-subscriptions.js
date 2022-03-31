import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  Action,
  StateProperty,
  SubscriptionsState,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryViewerMessagingHandler} from '../../amp-story/1.0/amp-story-viewer-messaging-handler';
import {getStoryAttributeSrc} from '../../amp-story/1.0/utils';

const TAG = 'amp-story-subscriptions';

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

/**
 * The number of milliseconds to wait before showing the skip button on dialog banner.
 * @const {number}
 */
export const SKIP_BUTTON_DELAY_DURATION = 2000;

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
    this.subscriptionService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?Element} */
    this.dialogEl_ = null;

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();
    this.viewer_ = Services.viewerForDoc(this.element);
    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_)
      : null;

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.subscriptionsServiceForDoc(this.element),
      Services.localizationServiceForOrNull(this.element),
    ]).then(([storeService, subscriptionService, localizationService]) => {
      this.storeService_ = storeService;
      this.subscriptionService_ = subscriptionService;
      this.localizationService_ = localizationService;

      // Get grant status immediately to set up the initial subscriptions state.
      this.getGrantStatusAndUpdateState_();
      // When the user finishes any of the actions, e.g. log in or subscribe, new entitlements would be
      // re-fetched and this callback would be executed. Update states based on new entitlements.
      this.subscriptionService_.addOnEntitlementResolvedCallback(() =>
        this.getGrantStatusAndUpdateState_()
      );

      // Create a paywall dialog element that have required attributes to be able to be
      // rendered by amp-subscriptions.
      this.dialogEl_ = this.renderSubscriptionsDialogTemplate_();
      this.element.appendChild(this.dialogEl_);

      this.initializeListeners_();
    });
  }

  /** @override */
  layoutCallback() {
    const logoSrc = getStoryAttributeSrc(
      this.element,
      'publisher-logo-src',
      /* warn */ true
    );
    const publisherLogoEl = dev().assertElement(
      this.element.querySelector(
        '.i-amphtml-story-subscriptions-publisher-logo'
      )
    );
    publisherLogoEl.setAttribute('src', logoSrc);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * @private
   */
  getGrantStatusAndUpdateState_() {
    this.subscriptionService_.getGrantStatus().then((granted) => {
      this.handleGrantStatusUpdate_(granted);
    });
  }

  /**
   * @param {boolean} granted
   * @private
   */
  handleGrantStatusUpdate_(granted) {
    const state = granted
      ? SubscriptionsState.GRANTED
      : SubscriptionsState.BLOCKED;
    this.storeService_.dispatch(Action.TOGGLE_SUBSCRIPTIONS_STATE, state);
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE,
      (showDialog) => this.onSubscriptionsDialogUiStateChange_(showDialog)
    );

    const ampSubscriptionsEl =
      this.element.parentElement.parentElement.querySelector(
        'amp-subscriptions-dialog'
      );
    ampSubscriptionsEl.addEventListener('click', (event) =>
      this.onSkipButtonClick_(event)
    );
  }

  /**
   * @param {boolean} showDialog
   * @return {?Promise}
   * @private
   */
  onSubscriptionsDialogUiStateChange_(showDialog) {
    this.mutateElement(() =>
      this.element.classList.toggle(
        'i-amphtml-story-subscriptions-visible',
        showDialog
      )
    );

    if (showDialog) {
      // This call would first retrieve entitlements that are already fetched from publisher backend when page loads.
      // If the response is granted, do nothing. If the response is not granted, the paywall would be triggered.
      return this.subscriptionService_
        .maybeRenderDialogForSelectedPlatform()
        .then(() => {
          if (this.viewer_.isEmbedded()) {
            setTimeout(() => {
              const buttonEl = this.win.document.querySelector(
                'amp-subscriptions-dialog .i-amphtml-story-subscriptions-dialog-banner-button'
              );
              buttonEl &&
                this.mutateElement(() =>
                  buttonEl.classList.add(
                    'i-amphtml-story-subscriptions-dialog-banner-button-visible'
                  )
                );
            }, SKIP_BUTTON_DELAY_DURATION);
          }
        });
    }
    this.subscriptionService_.getDialog().close();
  }

  /**
   * @param {!Event} event
   * @private
   */
  onSkipButtonClick_(event) {
    if (
      event.target.classList.contains(
        'i-amphtml-story-subscriptions-dialog-banner-button-visible'
      )
    ) {
      const advancementMode = this.storeService_.get(
        StateProperty.ADVANCEMENT_MODE
      );
      this.viewerMessagingHandler_.send('selectDocument', {
        'next': true,
        'advancementMode': advancementMode,
      });
    }
  }

  /**
   * @return {!Element}
   * @private
   */
  renderSubscriptionsDialogTemplate_() {
    return (
      <div subscriptions-dialog subscriptions-display="NOT granted">
        <div class="i-amphtml-story-subscriptions-dialog-banner">
          <div
            class="i-amphtml-story-subscriptions-dialog-banner-button"
            role="button"
          >
            {this.localizationService_.getLocalizedString(
              LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SKIP
            )}
            <span class="i-amphtml-story-subscriptions-dialog-banner-button-logo"></span>
          </div>
        </div>
        <div class="i-amphtml-story-subscriptions-dialog-content">
          <div class="i-amphtml-story-subscriptions-publisher-text">
            <div class="i-amphtml-story-subscriptions-price">
              {this.element.getAttribute('price')}
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
          </div>
          <div class="i-amphtml-story-subscriptions-button-container">
            <div class="i-amphtml-story-subscriptions-publisher-button-container">
              <div
                class="i-amphtml-story-subscriptions-publisher-button"
                subscriptions-action="subscribe"
                subscriptions-display="NOT granted"
              >
                <img class="i-amphtml-story-subscriptions-publisher-logo"></img>
                <div class="i-amphtml-story-subscriptions-publisher-button-text">
                  {this.localizationService_.getLocalizedString(
                    LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_CTA
                  )}
                  &nbsp;
                  {getStoryAttributeSrc(
                    this.element,
                    'publisher',
                    /* warn */ true
                  )}
                </div>
              </div>
            </div>
            <div class="i-amphtml-story-subscriptions-google-button-container">
              <div
                class="i-amphtml-story-subscriptions-google-button"
                subscriptions-action="subscribe"
                subscriptions-display="NOT granted"
                subscriptions-service="subscribe.google.com"
                subscriptions-decorate="false"
              ></div>
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
      </div>
    );
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
