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
import {getStoryAttributeSrc} from '../../amp-story/1.0/utils';

const TAG = 'amp-story-subscriptions';

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
  }

  /** @override */
  buildCallback() {
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
      this.element.appendChild(this.renderSubscriptionsDialogTemplate_());

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
      return this.subscriptionService_.maybeRenderDialogForSelectedPlatform();
    }
    this.subscriptionService_.getDialog().close();
  }

  /**
   * @return {!Element}
   * @private
   * TODO(#37285): add "next story" button to the banner
   */
  renderSubscriptionsDialogTemplate_() {
    return (
      <div subscriptions-dialog subscriptions-display="NOT granted">
        <div class="i-amphtml-story-subscriptions-dialog-banner"></div>
        <div class="i-amphtml-story-subscriptions-dialog-content">
          <span class="i-amphtml-story-subscriptions-price">
            {this.element.getAttribute('price')}
          </span>
          {this.element.getAttribute('title') && (
            <span class="i-amphtml-story-subscriptions-title">
              {this.element.getAttribute('title')}
            </span>
          )}
          <span class="i-amphtml-story-subscriptions-subtitle-first">
            {this.element.getAttribute('subtitle-first')}
          </span>
          {this.element.getAttribute('subtitle-second') && (
            <span class="i-amphtml-story-subscriptions-subtitle-second">
              {this.element.getAttribute('subtitle-second')}
            </span>
          )}
          <div
            class="i-amphtml-story-subscriptions-publisher-button"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
            role="button"
          >
            <img class="i-amphtml-story-subscriptions-publisher-logo"></img>
            <span class="i-amphtml-story-subscriptions-publisher-button-text">
              {this.localizationService_.getLocalizedString(
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_CTA
              )}
              &nbsp;
              {getStoryAttributeSrc(this.element, 'publisher', /* warn */ true)}
            </span>
          </div>
          <div
            class="i-amphtml-story-subscriptions-google-button"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
            subscriptions-service="subscribe.google.com"
            subscriptions-decorate="false"
            role="button"
          >
            <span class="i-amphtml-story-subscriptions-google-logo"></span>
            <span class="i-amphtml-story-subscriptions-google-button-text">
              {this.localizationService_.getLocalizedString(
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SWG
              )}
            </span>
          </div>
          <span class="i-amphtml-story-subscriptions-signin">
            {this.localizationService_.getLocalizedString(
              LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SUBSCRIBER_QUESTION
            )}
            &nbsp;
            <a subscriptions-action="login" subscriptions-display="NOT granted">
              {this.localizationService_.getLocalizedString(
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SIGN_IN
              )}
            </a>
          </span>
        </div>
      </div>
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
