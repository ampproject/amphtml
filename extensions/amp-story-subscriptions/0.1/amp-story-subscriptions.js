import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-subscriptions-0.1.css';
import {
  Action,
  StateProperty,
  SubscriptionsState,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-subscriptions';

export class AmpStorySubscriptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
    this.subscriptionService_ = null;
  }

  /** @override */
  buildCallback() {
    // Create a paywall dialog element that have required attributes to be able to be
    // rendered by amp-subscriptions.
    // TODO(#37285): complete the rest of paywall dialog UI based on the publisher-provided attributes.
    const dialogEl = (
      <div subscriptions-dialog subscriptions-display="NOT granted"></div>
    );
    this.element.appendChild(dialogEl);

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.subscriptionsServiceForDoc(this.element),
    ]).then(([storeService, subscriptionService]) => {
      this.storeService_ = storeService;
      this.subscriptionService_ = subscriptionService;

      // Get grant status immediately to set up the initial subscriptions state.
      this.getGrantStatusAndUpdateState_();
      // When the user finishes any of the actions, e.g. log in or subscribe, new entitlements would be
      // re-fetched and this callback would be executed. Update states based on new entitlements.
      this.subscriptionService_.addOnEntitlementResolvedCallback(() =>
        this.getGrantStatusAndUpdateState_()
      );

      this.initializeListeners_();
    });
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStorySubscriptions, CSS);
});
