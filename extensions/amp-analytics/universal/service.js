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
function empty(objectName) {
  return new Proxy(Object.create(null), {
    get(target, name) {
      // Special case to allow us to print access of methods of Services
      // resolved from a promise, instead of merely erroring-out during an
      // implicit `.then()`.
      if (name === 'then') {
        return undefined;
      }
      try {
        throw new Error(
          `[universal] Attempted to use property ${objectName}(...).${name} on unimplemented service.`
        );
      } catch (e) {
        console./*OK*/ warn(e.stack);
      }
      return () => {};
    },
  });
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
    Promise.resolve(empty('viewerPromiseForDoc'))
  ),
  viewportForDoc: once(() => empty('viewportForDoc')),
  formSubmitForDoc: once(() => empty('formSubmitForDoc')),
  preconnectFor: once(() => empty('preconnectFor')),
  // eslint-disable-next-line local/no-forbidden-terms
  storageForDoc: () => once(() => empty('storageForDoc')),
  xhrFor: () => once(() => empty('xhrFor')),

  // These can be null since they're optional.
  // For now, we assume that their interoperability is unavailable.
  geoForDocOrNull: unavailable,
  consentPolicyServiceForDocOrNull: unavailable,
};
