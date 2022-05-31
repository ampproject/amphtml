import {PageConfig as PageConfigInterface} from '#third_party/subscriptions-project/config';

export class ServiceAdapter {
  /**
   * @param {./amp-subscriptions.SubscriptionService} subscriptionService
   */
  constructor(subscriptionService) {
    this.subscriptionService_ = subscriptionService;
  }

  /**
   * Returns the analytics service for subscriptions.
   * @return {!./analytics.SubscriptionAnalytics}
   */
  getAnalytics() {
    return this.subscriptionService_.getAnalytics();
  }

  /**
   * Returns the singleton Dialog instance
   * @return {!./dialog.Dialog}
   */
  getDialog() {
    return this.subscriptionService_.getDialog();
  }

  /**
   * Returns the encrypted document key for the specified service.
   * @param {string} platformKey
   * @return {?string}
   */
  getEncryptedDocumentKey(platformKey) {
    return this.subscriptionService_.getEncryptedDocumentKey(platformKey);
  }

  /**
   * Returns the page config.
   * @return {!PageConfigInterface}
   */
  getPageConfig() {
    return this.subscriptionService_.getPageConfig();
  }

  /**
   * Returns the reader ID for the specified service.
   * @param {string} platformKey
   * @return {!Promise<string>}
   */
  getReaderId(platformKey) {
    return this.subscriptionService_.getReaderId(platformKey);
  }

  /**
   * gets Score factors for all platforms
   * @return {!Promise<!JsonObject>}
   */
  getScoreFactorStates() {
    return this.subscriptionService_.getScoreFactorStates();
  }

  /**
   * Delegates actions to local platform.
   * @param {string} action
   * @param {?string} sourceId
   * @return {!Promise<boolean>}
   */
  delegateActionToLocal(action, sourceId) {
    return this.delegateActionToService(action, 'local', sourceId);
  }

  /**
   * Delegates actions to a given service.
   * @param {string} action
   * @param {string} platformKey
   * @param {?string} sourceId
   * @return {!Promise<boolean>}
   */
  delegateActionToService(action, platformKey, sourceId) {
    return this.subscriptionService_.delegateActionToService(
      action,
      platformKey,
      sourceId
    );
  }

  /**
   * Delegate UI decoration to another service.
   * @param {!Element} element
   * @param {string} platformKey
   * @param {string} action
   * @param {?JsonObject} options
   */
  decorateServiceAction(element, platformKey, action, options) {
    this.subscriptionService_.decorateServiceAction(
      element,
      platformKey,
      action,
      options
    );
  }

  /**
   * Reauthorize platforms
   */
  resetPlatforms() {
    this.subscriptionService_.resetPlatforms();
  }

  /**
   * Returns login platform based on platform selection
   *
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.subscriptionService_.selectPlatformForLogin();
  }

  /**
   * Loads metering state.
   * @return {!Promise<?./metering-store.MeteringStateDef>}
   */
  loadMeteringState() {
    if (!this.subscriptionService_.metering_) {
      return Promise.resolve(null);
    }

    return this.subscriptionService_.metering_.loadMeteringState();
  }

  /**
   * Saves metering state.
   * @param {!./metering-store.MeteringStateDef} meteringState
   * @return {!Promise}
   */
  saveMeteringState(meteringState) {
    if (!this.subscriptionService_.metering_) {
      return Promise.resolve();
    }

    return this.subscriptionService_.metering_.saveMeteringState(meteringState);
  }

  /**
   * Remembers metering entitlements were fetched
   * with the current metering state.
   *
   * This helps avoid redundant fetches.
   */
  rememberMeteringEntitlementsWereFetched() {
    if (!this.subscriptionService_.metering_) {
      return;
    }

    this.subscriptionService_.metering_.entitlementsWereFetchedWithCurrentMeteringState = true;
  }
}
