import {LocalSubscriptionBasePlatform} from './local-subscription-platform-base';

/**
 * Implments the remotel local subscriptions platform with stubbed auth urls which
 * allows for systems that only use another non-local sertvice eg amp-subscriptions-google
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionNullPlatform extends LocalSubscriptionBasePlatform {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);

    // Nothing to do here since this is a no-op stub
  }

  /** @override */
  getEntitlements() {
    return Promise.resolve(null);
  }
}
