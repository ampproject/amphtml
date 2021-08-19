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

const unavailable = once(() => Promise.resolve(null));

const definedServices = {
  // Same implementations as core, but with injected dependencies or a forced
  // global window.
  cryptoFor: once(() => new Crypto(self)),
  urlReplacementsForDoc: once(
    () => new UrlReplacements(ampdocImpl, new GlobalVariableSource(ampdocImpl))
  ),

  // These are our own implementations. They may be incomplete.
  ampdoc: () => ampdocImpl,
  extensionsFor: () => extensionsImpl,
  timerFor: () => timerImpl,
  urlForDoc: () => urlImpl,

  // These can be null since they're optional.
  // For now, we assume that their interoperability is unavailable.
  consentPolicyServiceForDocOrNull: unavailable,
  geoForDocOrNull: unavailable,
};

// Export as proxy that creates empty placeholders for undefined services.
// eslint-disable-next-line local/no-export-side-effect
export const Services = new Proxy(definedServices, {
  get(target, name) {
    if (!target[name]) {
      target[name] = once(() => empty(name));
    }
    return target[name];
  },
});

/**
 * @param {string} objectName
 * @return {!Object}
 */
function empty(objectName) {
  return new Proxy(Object.create(null), {
    get(unusedTarget, name) {
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
