import {userAssert} from '#utils/log';

import {LocalSubscriptionBasePlatform} from './local-subscription-platform-base';

/**
 * Implments the null local subscriptions platform with stubbed auth urls which
 * allows for systems that only use another service eg amp-subscriptions-google
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

    const configOpts = Object.keys(this.serviceConfig_);
    userAssert(
      configOpts.length == 2 &&
        this.serviceConfig_['type'] &&
        this.serviceConfig_['serviceId'],
      'Only serviceId and type allowed when type is "none"'
    );
  }

  /** @override */
  getEntitlements() {
    return Promise.resolve(null);
  }
}
