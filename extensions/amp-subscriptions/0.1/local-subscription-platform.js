import {LocalSubscriptionIframePlatform} from './local-subscription-platform-iframe';
import {LocalSubscriptionNullPlatform} from './local-subscription-platform-null';
import {LocalSubscriptionRemotePlatform} from './local-subscription-platform-remote';

/**
 * Local subscription platform factory method.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} platformConfig
 * @param {!./service-adapter.ServiceAdapter} serviceAdapter
 * @return {!./subscription-platform.SubscriptionPlatform}
 */
export function localSubscriptionPlatformFactory(
  ampdoc,
  platformConfig,
  serviceAdapter
) {
  // Detct and render non-standard platforms.
  switch (platformConfig['type']) {
    case 'iframe':
      return new LocalSubscriptionIframePlatform(
        ampdoc,
        platformConfig,
        serviceAdapter
      );
    case 'none':
      return new LocalSubscriptionNullPlatform(
        ampdoc,
        platformConfig,
        serviceAdapter
      );
    default:
      return new LocalSubscriptionRemotePlatform(
        ampdoc,
        platformConfig,
        serviceAdapter
      );
  }
}
