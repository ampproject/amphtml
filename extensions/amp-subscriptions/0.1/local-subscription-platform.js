import {LocalSubscriptionIframePlatform} from './local-subscription-platform-iframe';
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
  /* Return the correxct platform based on the config */
  if (platformConfig['type'] === 'iframe') {
    return new LocalSubscriptionIframePlatform(
      ampdoc,
      platformConfig,
      serviceAdapter
    );
  }
  return new LocalSubscriptionRemotePlatform(
    ampdoc,
    platformConfig,
    serviceAdapter
  );
}
