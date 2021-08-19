import {once} from '#core/types/function';
import {Crypto} from '#service/crypto-impl';
import timerImpl from './timer-impl';
import ampdocImpl from './ampdoc-impl';
import urlImpl from './url-impl';
import {
  GlobalVariableSource,
  UrlReplacements,
} from '#service/url-replacements-impl';
import extensionsImpl from './extensions-impl';

/**
 * @param {string} objectName
 * @return {!Object}
 */
function passthrough(objectName) {
  return new Proxy(
    {},
    {
      get(target, name) {
        try {
          throw new Error(
            `[universal] Attempted to use property ${objectName}(...).${name} on unimplemented service.`
          );
        } catch (e) {
          console./*OK*/ warn(e.stack);
        }
        return () => {};
      },
    }
  );
}

const unavailable = once(() => Promise.resolve(null));

export const Services = {
  ampdoc: () => ampdocImpl,
  timerFor: () => timerImpl,
  urlForDoc: () => urlImpl,
  extensionsFor: () => extensionsImpl,

  // Same implementations as core, but with injected dependencies or a forced
  // global window.
  urlReplacementsForDoc: once(
    () => new UrlReplacements(ampdocImpl, new GlobalVariableSource(ampdocImpl))
  ),
  cryptoFor: once(() => new Crypto(self)),

  // Passthrough placeholders for services that aren't yet known to be required
  // for the supported codepaths.
  viewerPromiseForDoc: once(() =>
    Promise.resolve(passthrough('viewerPromiseForDoc'))
  ),
  viewportForDoc: once(() => passthrough('viewportForDoc')),
  formSubmitForDoc: once(() => passthrough('formSubmitForDoc')),
  preconnectFor: once(() => passthrough('preconnectFor')),
  // eslint-disable-next-line local/no-forbidden-terms
  storageForDoc: () => once(() => passthrough('storageForDoc')),
  xhrFor: () => once(() => passthrough('xhrFor')),

  // These can be null since they're optional.
  // For now, we assume that their interoperability is unavailable.
  geoForDocOrNull: unavailable,
  consentPolicyServiceForDocOrNull: unavailable,
};
