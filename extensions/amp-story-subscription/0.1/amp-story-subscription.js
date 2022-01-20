import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {dev} from '#utils/log';

import {createShadowRootWithStyle} from 'extensions/amp-story/1.0/utils';

import {CSS} from '../../../build/amp-story-subscription-0.1.css';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  AdvancementConfig,
  TapNavigationDirection,
} from '../../amp-story/1.0/page-advancement';
import {AdvancementMode} from '../../amp-story/1.0/story-analytics';

/** @const {string} */
const TAG = 'amp-story-subscription';

/**
 * Story subscription notification type template.
 * @param {!Element} element
 * @return {!Element}
 */
const getPaywallDialogTemplate = (element) => {
  return htmlFor(element)`
  <div subscriptions-dialog subscriptions-display="NOT granted">
    <div class="i-amphtml-story-subscription-banner"></div>
    <div class="i-amphtml-story-subscription-title"></div>
    <div class="i-amphtml-story-subscription-subtitle-first"></div>
    <div class="i-amphtml-story-subscription-subtitle-second"></div> 
    <div class="i-ampthml-story-subscription-button-container"> 
      <div class="i-ampthml-story-subscription-button-google" subscriptions-action="subscribe"
        subscriptions-display="NOT granted"
        subscriptions-service="subscribe.google.com"
        subscriptions-decorate>
          Subscribe
      </div>
      <div class="i-amphtml-story-subscription-button-publisher" subscriptions-action="subscribe" subscriptions-display="NOT granted" class="i-amphtml-subs-display">
            <div class="publisher-button-text"></div>
          <img style="width: 27px; height: 27px;">
      </div>
    </div>
    <div class="i-amphtml-story-subscription-signin">Already a subscriber? <a subscriptions-action="login" subscriptions-display="NOT granted" style='text-decoration: underline; font-weight: bold;'>Sign in</a></div>
  </div>`;
};

/**
 * @return {!Element}
 */
const getPaywallHintTemplate = () => (
  <aside class="i-amphtml-story-paywall-hint-container i-amphtml-hidden">
    <div class="i-amphtml-story-paywall-help-overlay">
      <div class="i-amphtml-story-paywall-subscribe-section">
        <div>Subscribe to access</div>
        <svg
          class="left-button"
          xmlns="http://www.w3.org/2000/svg"
          height="19"
          viewBox="0 0 20 19"
          fill="none"
        >
          <path
            d="M19.2436 11.2042C19.6559 11.9204 19.4108 12.8352 18.6956 13.2493L10.9265 17.7472C10.2089 18.1627 9.29022 17.9166 8.87645 17.1979C8.46409 16.4817 8.70922 15.5668 9.42445 15.1528L17.1935 10.6548C17.9111 10.2394 18.8298 10.4855 19.2436 11.2042Z"
            fill="white"
          />
          <path
            d="M11.2657 17.1978C10.8519 17.9165 9.9333 18.1626 9.21564 17.7472L1.4466 13.2492C0.731371 12.8352 0.486237 11.9203 0.8986 11.2041C1.31237 10.4854 2.23101 10.2393 2.94867 10.6548L10.7177 15.1527C11.4329 15.5668 11.6781 16.4816 11.2657 17.1978Z"
            fill="white"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18.9971 2.79644C19.7124 2.38236 19.9575 1.46751 19.5451 0.751289C19.1314 0.0326332 18.2127 -0.213516 17.4951 0.201976L10.3726 4.32554L3.25025 0.202022C2.53259 -0.21347 1.61394 0.0326793 1.20017 0.751335C0.78781 1.46755 1.03294 2.38241 1.74817 2.79649L9.51721 7.29441C9.78659 7.45037 10.0843 7.5131 10.373 7.49262C10.6615 7.51296 10.9589 7.4502 11.2281 7.29436L18.9971 2.79644Z"
            fill="white"
            fill-opacity="0.7"
          />
        </svg>
      </div>
      <div>or</div>
      <div class="i-amphtml-story-paywall-swipe-section">
        <div>Swipe to next story</div>
        <svg
          class="i-amphtml-story-paywall-swipe-icon"
          xmlns="http://www.w3.org/2000/svg"
          height="40"
          viewBox="0 0 160 40"
          fill="none"
        >
          <path
            d="M159.5 20C159.5 31.0457 150.546 40 139.5 40L0 40V0L139.5 0L139.844 0.002907C150.731 0.186775 159.5 9.06936 159.5 20Z"
            fill="url(#paint0_linear_21_6230)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_21_6230"
              x1="158.116"
              y1="0"
              x2="71.8835"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="white" />
              <stop offset="1" stop-color="white" stop-opacity="0.01" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  </aside>
);

/**
 * The <amp-story-subscription> custom element.
 */
export class AmpStorySubscription extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private @const {} */
    this.subscriptionService_ = null;

    /** @private @const {AdvancementConfig} */
    this.advancement_ = AdvancementConfig.forElement(this.win, this.element);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);
  }

  /** @override */
  buildCallback() {
    this.advancement_.addOnTapNavigationListener((direction) => {
      this.performTapNavigation_(direction);
    });

    const dialogEl = getPaywallDialogTemplate(this.element);

    const titleEl = dev().assertElement(
      dialogEl.querySelector('.i-amphtml-story-subscription-title')
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
        dialogEl.querySelector('.i-amphtml-story-subscription-banner')
      );
      bannerEl.textContent = this.element.getAttribute('banner-text');
    }

    if (this.element.hasAttribute('subtitle-first')) {
      const subtitleFirstEl = dev().assertElement(
        dialogEl.querySelector('.i-amphtml-story-subscription-subtitle-first')
      );
      subtitleFirstEl.textContent = this.element.getAttribute('subtitle-first');
    }

    if (this.element.hasAttribute('subtitle-second')) {
      const subtitleSecondEl = dev().assertElement(
        dialogEl.querySelector('.i-amphtml-story-subscription-subtitle-second')
      );
      subtitleSecondEl.textContent =
        this.element.getAttribute('subtitle-second');
    }

    this.element.appendChild(dialogEl);

    Services.subscriptionsServiceForDoc(this.element).then(
      (subscriptionService) => {
        this.subscriptionService_ = subscriptionService;
      }
    );

    this.initializeListeners_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * @param {number} direction The direction to navigate.
   * @private
   */
  performTapNavigation_(direction) {
    console.log('perform tap navigation in amp-story-subscription');
    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    if (direction === TapNavigationDirection.PREVIOUS) {
      this.storeService_.dispatch(Action.TOGGLE_SUBSCRIPTION, false);
      this.subscriptionService_.getDialog().close();
    }
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTION_STATE,
      (paywallEnabled) => {
        console.log(
          'receive signal that subscription state changed to: ' + paywallEnabled
        );
        this.onSubscriptionStateChange_(paywallEnabled);
      }
    );

    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTION_HINT_STATE,
      (paywallHintEnabled) => {
        console.log(
          'receive signal that subscription hint state changed to: ' +
            paywallHintEnabled
        );
        this.onSubscriptionHintStateChange_(paywallHintEnabled);
      }
    );
  }

  /**
   * Reacts to subscription state updates, and shows/hides the paywall UI accordingly.
   * @param {boolean} paywallEnabled
   * @private
   */
  onSubscriptionStateChange_(paywallEnabled) {
    this.toggle_(paywallEnabled);
  }

  /**
   * Reacts to subscription hint state updates, and shows/hides the paywall hint UI accordingly.
   * @param {boolean} paywallHintEnabled
   * @private
   */
  onSubscriptionHintStateChange_(paywallHintEnabled) {
    if (paywallHintEnabled) {
      this.showHint_();
    } else {
      this.hideHint_();
    }
  }

  /**
   * Show the hint layer for paywall.
   * @private
   */
  showHint_() {
    if (this.storeService_.get(StateProperty.UI_STATE) !== UIType.MOBILE) {
      return;
    }

    if (this.hintContainer_) {
      this.vsync_.mutate(() => {
        console.log('enabling paywall hint');
        this.hintContainer_.classList.remove('i-amphtml-hidden');
      });
      return;
    }

    this.hintContainer_ = getPaywallHintTemplate();
    const root = createShadowRootWithStyle(<div />, this.hintContainer_, CSS);
    this.vsync_.mutate(() => {
      console.log('enabling paywall hint');
      this.element.appendChild(root);
      this.hintContainer_.classList.remove('i-amphtml-hidden');
    });
  }

  /**
   * Hide the paywall hint layer.
   * @private
   */
  hideHint_() {
    if (!this.hintContainer_) {
      return;
    }

    console.log('disabling paywall hint');
    this.vsync_.mutate(() => {
      this.hintContainer_.classList.add('i-amphtml-hidden');
    });
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.mutateElement(() => {
      this.element.classList.toggle(
        'i-amphtml-story-subscription-visible',
        show
      );

      if (!show) {
        this.subscriptionService_.getDialog().close();
      }
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscription, CSS);
});
