import {copyChildren, removeChildren} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {closest} from '#core/dom/query';

// import {getStoryAttributeSrc} from './utils';
import {htmlFor} from '#core/dom/static-template';

// import {setImportantStyles} from '#core/dom/style';
import {Services} from '#service';

import {dev, user} from '#utils/log';

import {CSS} from '../../../build/amp-story-subscription-0.1.css';
import {
  Action,
  StateProperty,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';

// import {Entitlement} from '#third_party/subscriptions-project/swg';
import {
  Entitlement,
  GrantReason,
} from '../../amp-subscriptions/0.1/entitlement';

/** @const {string} */
const TAG = 'amp-story-subscription';

/**
 * @enum {string}
 */
export const Type = {
  BLOCKING: 'blocking',
  NOTIFICATION: 'notification',
};

/**
 * Story subscription blocking type template.
 * @param {!Element} element
 * @return {!Element}
 */
const getBlockingTemplate = (element) => {
  return htmlFor(element)`
      <div class="i-amphtml-story-subscription-overflow">
        <div class="i-amphtml-story-subscription-container">
          <div class="i-amphtml-story-subscription-header">
            <div class="i-amphtml-story-subscription-logo"></div>
          </div>
          <div class="i-amphtml-story-subscription-content"></div>
        </div>
      </div>`;
};

/**
 * Story subscription notification type template.
 * @param {!Element} element
 * @return {!Element}
 */
const getNotificationTemplate = (element) => {
  return htmlFor(element)`
      <div class="i-amphtml-story-subscription-overflow">
        <div class="i-amphtml-story-subscription-container">
          <div class="i-amphtml-story-subscription-content">
            <span class="i-amphtml-story-subscription-close-button" role="button">
              &times;
            </span>
          </div>
        </div>
      </div>`;
};

/**
 * The <amp-story-subscription> custom element.
 */
export class AmpStorySubscription extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.containerEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private @const {} */
    this.subscriptionService_ = null;

    // /** @private @const {} */
    // this.contentEl_ = null;
  }

  /** @override */
  buildCallback() {
    // Defaults to blocking paywall.
    if (!this.element.hasAttribute('type')) {
      this.element.setAttribute('type', Type.BLOCKING);
    }

    // TODO: should take custom parameters and build the dialog element and
    // inserts it into the DOM so that the amp-subscription can find it and
    // inserts it into the dialog wrapper for rendering.

    const drawerEl = this.renderDrawerEl_();

    this.containerEl_ = dev().assertElement(
      drawerEl.querySelector('.i-amphtml-story-subscription-container')
    );
    const contentEl = dev().assertElement(
      drawerEl.querySelector('.i-amphtml-story-subscription-content')
    );

    const headerEl = drawerEl.querySelector(
      '.i-amphtml-story-subscription-header'
    );
    headerEl.appendChild(document.createTextNode('$0.50/week'));
    // this.containerEl_.appendChild(headerEl);

    copyChildren(this.element, contentEl);
    // removeChildren(this.element);

    Services.subscriptionsServiceForDoc(this.element).then(
      (subscriptionService) => {
        this.subscriptionService_ = subscriptionService;
        // this.subscriptionService_.getDialog().setContent(this.containerEl_);
        // this.dialog_ = this.subscriptionService_.getDialog();
        // this.subscriptionService_.getGrantStatus().then((granted) => {
        //   this.granted_ = granted;
        // });
      }
    );

    // this.element.appendChild(drawerEl);
    // setTimeout(() => {
    //   console.log('after time out!');
    // const dialogEl = dev().assertElement(
    //   this.win.document.body.querySelector('amp-subscriptions-dialog')
    // );
    // dialogEl.appendChild(drawerEl);
    // dialogEl.removeAttribute('hidden');
    // }, 1000);

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
      StateProperty.SUBSCRIPTION_STATE,
      (paywallEnabled) => {
        console.log(
          'receive signal that subscription state changed to: ' + paywallEnabled
        );
        this.onSubscriptionStateChange_(paywallEnabled);
      }
    );

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      (currentPageIndex) => {
        this.onCurrentPageIndexChange_(currentPageIndex);
      },
      true /** callToInitialize */
    );

    this.element.addEventListener('click', (event) => this.onClick_(event));

    // this.switchSubState_();
  }

  switchSubState_() {
    setTimeout(() => {
      console.log('manually switch the sub state!');
      this.subscriptionService_.resolveEntitlement(
        new Entitlement({
          source: 'local',
          raw: 'raw',
          granted: true,
          grantReason: GrantReason.SUBSCRIBER,
          dataObject: {
            test: 'a1',
          },
        })
      );
      this.subscriptionService_.resetPlatforms();
      // this.storeService_.dispatch(Action.TOGGLE_SUBSCRIPTION, false);
    }, 10000);
  }

  /**
   * Reacts to subscription state updates, and shows/hides the paywall UI accordingly.
   * @param {boolean} paywallEnabled
   * @private
   */
  onSubscriptionStateChange_(paywallEnabled) {
    if (this.getType_() === Type.BLOCKING) {
      this.toggle_(paywallEnabled);
    }
  }

  /**
   * Reacts to story active page index update, and maybe display the
   * "notification" story-access.
   * @param {number} currentPageIndex
   */
  onCurrentPageIndexChange_(currentPageIndex) {
    if (this.getType_() === Type.NOTIFICATION) {
      // Only show the notification if on the first page of the story.
      // Note: this can be overriden by an amp-access attribute that might
      // show/hide the notification based on the user's authorizations.
      this.toggle_(currentPageIndex === 0);
    }
  }

  /**
   * Handles click events and maybe closes the paywall.
   * @param {!Event} event
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  onClick_(event) {
    const el = dev().assertElement(event.target);

    if (el.classList.contains('i-amphtml-story-subscription-close-button')) {
      return this.toggle_(false);
    }

    // Closes the menu if click happened outside of the main container.
    if (!closest(el, (el) => el === this.containerEl_, this.element)) {
      // this.storeService_.dispatch(Action.TOGGLE_SUBSCRIPTION, false);
    }
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
      // Don't need to opne since SubscriptionService already opens the dialog when activiated.
      if (!show) {
        this.subscriptionService_.getDialog().close();
      }

      // const dialogEl = dev().assertElement(
      //   this.win.document.body.querySelector('amp-subscriptions-dialog')
      // );
      // dialogEl.setAttribute('display', 'none !important');
    });
  }

  /**
   * Returns the element's type.
   * @return {string}
   * @private
   */
  getType_() {
    return this.element.getAttribute('type').toLowerCase();
  }

  /**
   * Renders and returns an empty drawer element element that will contain the
   * publisher provided DOM, depending on the type of <amp-story-subscription>.
   * Blocking template gets a header containing the publisher's logo, and
   * notification template gets a "dismiss" button.
   * @return {!Element|undefined}
   * @private
   */
  renderDrawerEl_() {
    switch (this.getType_()) {
      case Type.BLOCKING:
        const drawerEl = getBlockingTemplate(this.element);

        // const logoSrc = getStoryAttributeSrc(
        //   this.element,
        //   'publisher-logo-src',
        //   /* warn */ true
        // );

        // if (logoSrc) {
        //   const logoEl = dev().assertElement(
        //     drawerEl.querySelector('.i-amphtml-story-subscription-logo')
        //   );
        //   setImportantStyles(logoEl, {'background-image': `url(${logoSrc})`});
        // }

        return drawerEl;
        break;
      case Type.NOTIFICATION:
        return getNotificationTemplate(this.element);
        break;
      default:
        user().error(
          TAG,
          'Unknown "type" attribute, expected one of: ' +
            'blocking, notification.'
        );
    }
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscription, CSS);
});
