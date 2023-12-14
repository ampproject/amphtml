import {closestAncestorElementBySelector} from '#core/dom/query';

import {dev, userAssert} from '#utils/log';

import {Actions} from './actions';
import {Action} from './analytics';
import {LocalSubscriptionPlatformRenderer} from './local-subscription-platform-renderer';
import {UrlBuilder} from './url-builder';

/**
 * Surrogate property added to click events marking them as handled by the
 * amp-subscriptions extension.
 */
const CLICK_HANDLED_EVENT_PROPERTY = '_AMP_SUBSCRIPTIONS_CLICK_HANDLED';

/**
 * This implements the methods to interact with various subscription platforms.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionBasePlatform {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    /** @protected @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.rootNode_ = ampdoc.getRootNode();

    /** @protected {!JsonObject} */
    this.serviceConfig_ = platformConfig;

    /** @private @const {boolean} */
    this.pingbackAllEntitlements_ =
      !!this.serviceConfig_['pingbackAllEntitlements'];

    /** @protected @const {!./service-adapter.ServiceAdapter} */
    this.serviceAdapter_ = serviceAdapter;

    /** @protected @const {!UrlBuilder} */
    this.urlBuilder_ = new UrlBuilder(
      this.ampdoc_,
      this.serviceAdapter_.getReaderId('local')
    );

    /** @protected @const {!./analytics.SubscriptionAnalytics} */
    this.subscriptionAnalytics_ = serviceAdapter.getAnalytics();

    userAssert(
      this.serviceConfig_['actions'],
      'Actions have not been defined in the service config'
    );

    /** @private @const {!Actions} */
    this.actions_ = new Actions(
      this.ampdoc_,
      this.urlBuilder_,
      this.subscriptionAnalytics_,
      this.validateActionMap(this.serviceConfig_['actions'])
    );

    /** @private @const {!LocalSubscriptionPlatformRenderer}*/
    this.renderer_ = new LocalSubscriptionPlatformRenderer(
      this.ampdoc_,
      serviceAdapter.getDialog(),
      this.serviceAdapter_
    );
  }

  /**
   * @override
   */
  getPlatformKey() {
    return 'local';
  }

  /**
   * Validates the action map
   * @param {!JsonObject<string, string>} actionMap
   * @return {!JsonObject<string, string>}
   */
  validateActionMap(actionMap) {
    userAssert(
      actionMap[Action.LOGIN],
      'Action "login" is not present in action map'
    );
    userAssert(
      actionMap[Action.SUBSCRIBE],
      'Action "subscribe" is not present in action map'
    );
    return actionMap;
  }

  /**
   * Add event listener for the subscriptions action
   * @protected
   */
  initializeListeners_() {
    const handleClickOncePerEvent = (e) => {
      if (e[CLICK_HANDLED_EVENT_PROPERTY]) {
        return;
      }
      e[CLICK_HANDLED_EVENT_PROPERTY] = true;

      const element = closestAncestorElementBySelector(
        dev().assertElement(e.target),
        '[subscriptions-action]'
      );
      this.handleClick_(element);
    };
    this.rootNode_.addEventListener('click', handleClickOncePerEvent);

    // If the root node has a `body` property, listen to events on that too,
    // to fix an iOS shadow DOM bug (https://github.com/ampproject/amphtml/issues/25754).
    if (this.rootNode_.body) {
      this.rootNode_.body.addEventListener('click', handleClickOncePerEvent);
    }
  }

  /**
   * Handle click on subscription-action
   * @private
   * @param {Node} element
   */
  handleClick_(element) {
    if (element) {
      const action = element.getAttribute('subscriptions-action');
      const serviceAttr = element.getAttribute('subscriptions-service');
      if (serviceAttr == 'local') {
        this.executeAction(action, element.id);
      } else if ((serviceAttr || 'auto') == 'auto') {
        if (action == Action.LOGIN) {
          // The "login" action is somewhat special b/c viewers can
          // enhance this action, e.g. to provide save/link feature.
          const platform = this.serviceAdapter_.selectPlatformForLogin();
          this.serviceAdapter_.delegateActionToService(
            action,
            platform.getPlatformKey(),
            element.id
          );
        } else {
          this.executeAction(action, element.id);
        }
      } else if (serviceAttr) {
        this.serviceAdapter_.delegateActionToService(
          action,
          serviceAttr,
          element.id
        );
      }
    }
  }

  /** @override */
  activate(entitlement) {
    // Note all platforms are resolved at this stage
    // Get the factor states of each platform and
    // add them to the renderState object
    this.createRenderState_(entitlement).then((renderState) => {
      this.renderer_.render(renderState);
    });
  }

  /**
   * Factored out for testability
   * @param {./entitlement.Entitlement} entitlement
   * @return {!Promise<!JsonObject>}
   * @private
   */
  createRenderState_(entitlement) {
    const renderState = entitlement.json();
    return this.serviceAdapter_
      .getScoreFactorStates()
      .then((scoresValues) => {
        renderState['factors'] = scoresValues;
        return this.urlBuilder_.setAuthResponse(renderState);
      })
      .then(() => {
        return this.actions_.build();
      })
      .then(() => renderState);
  }

  /** @override */
  reset() {
    this.renderer_.reset();
  }

  /** @override */
  executeAction(action) {
    const actionExecution = this.actions_.execute(action);
    return actionExecution.then((result) => {
      if (result) {
        this.serviceAdapter_.resetPlatforms();
      }
      return !!result;
    });
  }

  /** @override */
  isPrerenderSafe() {
    // Local platform can never be allowed to prerender in a viewer
    return false;
  }

  /** @override */
  getSupportedScoreFactor(unusedFactor) {
    return 0;
  }

  /** @override */
  getBaseScore() {
    return this.serviceConfig_['baseScore'] || 0;
  }

  /**
   * @override
   * @return {!Promise<?./entitlement.Entitlement>}
   */
  getEntitlements() {}

  /**
   * @override
   */
  pingback(unusedEntitlement) {}

  /**
   * @override
   * @return {boolean}
   */
  pingbackReturnsAllEntitlements() {
    return this.pingbackAllEntitlements_;
  }

  /** @override */
  isPingbackEnabled() {
    return false;
  }

  /** @override */
  decorateUI(unusedNode, unusedAction, unusedOptions) {}
}
