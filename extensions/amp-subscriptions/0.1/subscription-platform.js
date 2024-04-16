/**
 * This interface is intended to be implemented by Subscription platforms to
 * provide method of getting entitlements.
 *
 * @interface
 */
export class SubscriptionPlatform {
  /**
   * Returns the platform key.
   * @return {string}
   */
  getPlatformKey() {}

  /**
   * Requests entitlement for a subscription platform.
   * @return {!Promise<?./entitlement.Entitlement>}
   */
  getEntitlements() {}

  /**
   * Activates the subscription platform and hands over the control for
   * rendering.
   * @param {!./entitlement.Entitlement} unusedEntitlement
   * @param {?./entitlement.Entitlement} unusedGrantEntitlement
   * @param {function()=} unusedContinueAuthorizationFlow Usually this is undefined. When it's defined,
   *   that means (1) the authorization flow is blocked and (2) the subscription platform receiving
   *   this callback is responsible for unblocking the flow. Once the flow is unblocked, the
   *   platform should execute the `unusedContinueAuthorizationFlow` method to continue the flow.
   */
  activate(
    unusedEntitlement,
    unusedGrantEntitlement,
    unusedContinueAuthorizationFlow
  ) {}

  /**
   * Reset the platform and renderer.
   * This should clear dialogs and toasts originating
   * from the platform.
   */
  reset() {}

  /**
   * True if this platform can fetch entitlement safely in pre-render
   * without leaking information to the publisher or a 3rd party
   * @return {boolean}
   */
  isPrerenderSafe() {}

  /**
   * Returns if pingback is enabled for this platform.
   * @return {boolean}
   */
  isPingbackEnabled() {}

  /**
   * True if pingback returns all entitlments
   * @return {boolean}
   */
  pingbackReturnsAllEntitlements() {}

  /**
   * Performs the pingback to the subscription platform.
   * @param {./entitlement.Entitlement|Array<./entitlement.Entitlement>} unusedEntitlement
   * @return {!Promise|undefined}
   */
  pingback(unusedEntitlement) {}

  /**
   * Tells if the platform supports a score factor
   * @param {string} unusedFactor
   * @return {number}
   */
  getSupportedScoreFactor(unusedFactor) {}

  /**
   * Executes action for the local platform.
   * @param {string} unusedAction
   * @param {?string} unusedSourceId
   * @return {!Promise<boolean>}
   */
  executeAction(unusedAction, unusedSourceId) {}

  /**
   * Returns the base score configured for the platform.
   * @return {number}
   */
  getBaseScore() {}

  /**
   * Decorate the DomNode according to your platform
   * @param {!Element} unusedElement
   * @param {string} unusedAction
   * @param {?JsonObject} unusedOptions
   */
  decorateUI(unusedElement, unusedAction, unusedOptions) {}
}
