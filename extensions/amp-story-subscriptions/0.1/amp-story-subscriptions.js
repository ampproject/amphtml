import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {setImportantStyles} from '#core/dom/style';
import {clamp} from '#core/math';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev, devAssert} from '#utils/log';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  Action,
  StateProperty,
  SubscriptionsState,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryViewerMessagingHandler} from '../../amp-story/1.0/amp-story-viewer-messaging-handler';
import {AdvancementMode} from '../../amp-story/1.0/story-analytics';
import {getStoryAttributeSrc} from '../../amp-story/1.0/utils';

const TAG = 'amp-story-subscriptions';

/**
 * The index of the page where the paywall would be triggered.
 * @const {number}
 */
export const DEFAULT_SUBSCRIPTIONS_PAGE_INDEX = 2;

/**
 * The number of milliseconds to wait before showing the skip button on dialog banner.
 * @const {number}
 */
const SKIP_BUTTON_DELAY_DURATION = 2000;

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
    this.subscriptionService_ = null;

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;
  }

  /** @override */
  buildCallback() {
    this.viewer_ = Services.viewerForDoc(this.element);
    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_)
      : null;

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.subscriptionsServiceForDoc(this.element),
      Services.localizationServiceForOrNull(this.element),
    ]).then(
      ([storeService, subscriptionService, unusedLocalizationService]) => {
        this.storeService_ = storeService;
        this.subscriptionService_ = subscriptionService;

        const pages = this.win.document.querySelectorAll(
          'amp-story-page:not([ad])'
        );
        devAssert(
          pages.length >= 4,
          'The number of pages should be at least 4 to enable subscriptions feature, got %s',
          pages.length
        );

        let subscriptionsPageIndex = parseInt(
          this.element.getAttribute('subscriptions-page-index'),
          10
        );
        subscriptionsPageIndex = isNaN(subscriptionsPageIndex)
          ? DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
          : subscriptionsPageIndex;
        this.storeService_.dispatch(
          Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
          clamp(
            subscriptionsPageIndex,
            DEFAULT_SUBSCRIPTIONS_PAGE_INDEX,
            pages.length - 1
          )
        );

        // Get grant status immediately to set up the initial subscriptions state.
        this.getGrantStatusAndUpdateState_();
        // When the user finishes any of the actions, e.g. log in or subscribe, new entitlements would be
        // re-fetched and this callback would be executed. Update states based on new entitlements.
        this.subscriptionService_.addOnEntitlementResolvedCallback(() =>
          this.getGrantStatusAndUpdateState_()
        );

        // Create a paywall dialog element that have required attributes to be able to be
        // rendered by amp-subscriptions.
        const template = this.renderSubscriptionsDialogTemplate_();
        return localizeTemplate(template, this.element).then(() => {
          this.element.appendChild(template);
          this.initializeListeners_();
        });
      }
    );
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

    const ampSubscriptionsEl = this.win.document.querySelector(
      'amp-subscriptions-dialog'
    );
    ampSubscriptionsEl.addEventListener('click', (event) =>
      this.onSubscriptionsDialogClick_(event)
    );

    // Make sure SWG dialog background always intercept clicks to prevent users
    // from interacting with anything underneath.
    new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        mutation.addedNodes.forEach((addedNode) => {
          if (addedNode.tagName === 'SWG-POPUP-BACKGROUND') {
            setImportantStyles(addedNode, {'pointer-events': 'all'});
          }
        });
      });
    }).observe(this.win.document.body, {
      subtree: false,
      childList: true,
    });
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
  onSubscriptionsDialogClick_(event) {
    if (
      event.target.classList.contains(
        'i-amphtml-story-subscriptions-dialog-banner-button-visible'
      )
    ) {
      this.viewerMessagingHandler_.send('selectDocument', {
        'next': true,
        'advancementMode': AdvancementMode.MANUAL_ADVANCE,
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
          <button
            class="i-amphtml-story-subscriptions-dialog-banner-button"
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SKIP
            }
          ></button>
        </div>
        <div class="i-amphtml-story-subscriptions-dialog-content">
          <span class="i-amphtml-story-subscriptions-price">
            {this.element.getAttribute('price')}
          </span>
          {this.element.getAttribute('headline') && (
            <span class="i-amphtml-story-subscriptions-headline">
              {this.element.getAttribute('headline')}
            </span>
          )}
          <span class="i-amphtml-story-subscriptions-description">
            {this.element.getAttribute('description')}
          </span>
          {this.element.getAttribute('additional-description') && (
            <span class="i-amphtml-story-subscriptions-additional-description">
              {this.element.getAttribute('additional-description')}
            </span>
          )}
          <button
            class="i-amphtml-story-subscriptions-publisher-button"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
          >
            <img class="i-amphtml-story-subscriptions-publisher-logo"></img>
            <span class="i-amphtml-story-subscriptions-publisher-button-text">
              <span
                i-amphtml-i18n-text-content={
                  LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_CTA
                }
              ></span>
              &nbsp;
              {getStoryAttributeSrc(this.element, 'publisher', /* warn */ true)}
            </span>
          </button>
          <button
            class="i-amphtml-story-subscriptions-google-button"
            subscriptions-action="subscribe"
            subscriptions-display="NOT granted"
            subscriptions-service="subscribe.google.com"
            subscriptions-decorate="false"
          >
            <span class="i-amphtml-story-subscriptions-google-logo"></span>
            <span
              class="i-amphtml-story-subscriptions-google-button-text"
              i-amphtml-i18n-text-content={
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SWG
              }
            ></span>
          </button>
          <span class="i-amphtml-story-subscriptions-signin">
            <span
              i-amphtml-i18n-text-content={
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SUBSCRIBER_QUESTION
              }
            ></span>
            &nbsp;
            <button
              subscriptions-action="login"
              subscriptions-display="NOT granted"
              i-amphtml-i18n-text-content={
                LocalizedStringId_Enum.AMP_STORY_SUBSCRIPTIONS_SIGN_IN
              }
            ></button>
          </span>
        </div>
      </div>
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
